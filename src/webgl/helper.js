
import WebGLPostProcessingPass from './PostProcessingPass';

/**
 * Shader types, either `FRAGMENT_SHADER` or `VERTEX_SHADER`
 * @enum {number}
 */
export const ShaderType = {
  FRAGMENT_SHADER: 0x8B30,
  VERTEX_SHADER: 0x8B31
};

/**
 * Uniform names used in the default shaders.
 * @const
 * @type {Object.<string,string>}
 */
export const DefaultUniform = {
  PROJECTION_MATRIX: 'u_projectionMatrix',
  OFFSET_SCALE_MATRIX: 'u_offsetScaleMatrix',
  OFFSET_ROTATION_MATRIX: 'u_offsetRotateMatrix'
};

/**
 * Attribute names used in the default shaders.
 * @const
 * @type {Object.<string,string>}
 */
export const DefaultAttrib = {
  POSITION: 'a_position',
  TEX_COORD: 'a_texCoord',
  OPACITY: 'a_opacity',
  ROTATE_WITH_VIEW: 'a_rotateWithView',
  OFFSETS: 'a_offsets'
};

class Helper extends ol.Disposable {
  /**
   * @param {Options=} opt_options Options.
   */
  constructor(opt_options) {
    super();
    const options = opt_options || {};

    /**
     * @private
     * @type {HTMLCanvasElement}
     */
    this.canvas_ = document.createElement('canvas');
    this.canvas_.style.position = 'absolute';


    /**
     * @private
     * @type {WebGLRenderingContext}
     */
    this.gl_ = ol.webgl.getContext(this.canvas_);
    const gl = this.getGL();

    /**
     * @private
     * @type {!Object<string, BufferCacheEntry>}
     */
    this.bufferCache_ = {};

    /**
     * @private
     * @type {!Array<WebGLShader>}
     */
    this.shaderCache_ = [];

    /**
     * @private
     * @type {!Array<WebGLProgram>}
     */
    this.programCache_ = [];

    /**
     * @private
     * @type {WebGLProgram}
     */
    this.currentProgram_ = null;

    /**
     * @type {boolean}
     */
    this.hasOESElementIndexUint = ol.array.includes(ol.WEBGL_EXTENSIONS, 'OES_element_index_uint');

    // use the OES_element_index_uint extension if available
    if (this.hasOESElementIndexUint) {
      gl.getExtension('OES_element_index_uint');
    }

    ol.events.listen(this.canvas_, ol.webgl.ContextEventType.LOST,
      this.handleWebGLContextLost, this);
    ol.events.listen(this.canvas_, ol.webgl.ContextEventType.RESTORED,
      this.handleWebGLContextRestored, this);

    /**
     * @private
     * @type {import("../transform.js").Transform}
     */
    this.projectionMatrix_ = ol.transform.create();

    /**
     * @private
     * @type {import("../transform.js").Transform}
     */
    this.offsetRotateMatrix_ = ol.transform.create();

    /**
     * @private
     * @type {import("../transform.js").Transform}
     */
    this.offsetScaleMatrix_ = ol.transform.create();

    /**
     * @private
     * @type {Array<number>}
     */
    this.tmpMat4_ = ol.vec.Mat4.create();

    /**
     * @private
     * @type {Object.<string, WebGLUniformLocation>}
     */
    this.uniformLocations_ = {};

    /**
     * @private
     * @type {Object.<string, number>}
     */
    this.attribLocations_ = {};

    /**
     * Holds info about custom uniforms used in the post processing pass.
     * If the uniform is a texture, the WebGL Texture object will be stored here.
     * @type {Array<UniformInternalDescription>}
     * @private
     */
    this.uniforms_ = [];
    options.uniforms && Object.keys(options.uniforms).forEach(function(name) {
      this.uniforms_.push({
        name: name,
        value: options.uniforms[name]
      });
    }.bind(this));

    /**
     * An array of PostProcessingPass objects is kept in this variable, built from the steps provided in the
     * options. If no post process was given, a default one is used (so as not to have to make an exception to
     * the frame buffer logic).
     * @type {Array<WebGLPostProcessingPass>}
     * @private
     */
    this.postProcessPasses_ = options.postProcesses ? options.postProcesses.map(function(options) {
      return new WebGLPostProcessingPass({
        webGlContext: gl,
        scaleRatio: options.scaleRatio,
        vertexShader: options.vertexShader,
        fragmentShader: options.fragmentShader,
        uniforms: options.uniforms
      });
    }) : [new WebGLPostProcessingPass({webGlContext: gl})];

    /**
     * @type {string|null}
     * @private
     */
    this.shaderCompileErrors_ = null;
  }

  /**
   * Just bind the buffer if it's in the cache. Otherwise create
   * the WebGL buffer, bind it, populate it, and add an entry to
   * the cache.
   * TODO: improve this, the logic is unclear: we want A/ to bind a buffer and B/ to flush data in it
   * @param {number} target Target.
   * @param {import("./Buffer").default} buf Buffer.
   * @api
   */
  bindBuffer(target, buf) {
    const gl = this.getGL();
    const arr = buf.getArray();
    const bufferKey = ol.getUid(buf);
    let bufferCache = this.bufferCache_[bufferKey];
    if (!bufferCache) {
      const buffer = gl.createBuffer();
      bufferCache = this.bufferCache_[bufferKey] = {
        buf: buf,
        buffer: buffer
      };
    }
    gl.bindBuffer(target, bufferCache.buffer);
    let /** @type {ArrayBufferView} */ arrayBuffer;
    if (target == ol.webgl.ARRAY_BUFFER) {
      arrayBuffer = new Float32Array(arr);
    } else if (target == ol.webgl.ELEMENT_ARRAY_BUFFER) {
      arrayBuffer = this.hasOESElementIndexUint ?
        new Uint32Array(arr) : new Uint16Array(arr);
    }
    gl.bufferData(target, arrayBuffer, buf.getUsage());
  }

  /**
   * @param {import("./Buffer.js").default} buf Buffer.
   */
  deleteBuffer(buf) {
    const gl = this.getGL();
    const bufferKey = ol.getUid(buf);
    const bufferCacheEntry = this.bufferCache_[bufferKey];
    if (!gl.isContextLost()) {
      gl.deleteBuffer(bufferCacheEntry.buffer);
    }
    delete this.bufferCache_[bufferKey];
  }

  /**
   * @inheritDoc
   */
  disposeInternal() {
    ol.events.unlistenAll(this.canvas_);
    const gl = this.getGL();
    if (!gl.isContextLost()) {
      for (const key in this.bufferCache_) {
        gl.deleteBuffer(this.bufferCache_[key].buffer);
      }
      for (const key in this.programCache_) {
        gl.deleteProgram(this.programCache_[key]);
      }
      for (const key in this.shaderCache_) {
        gl.deleteShader(this.shaderCache_[key]);
      }
    }
  }

  /**
   * Clear the buffer & set the viewport to draw.
   * Post process passes will be initialized here, the first one being bound as a render target for
   * subsequent draw calls.
   * @param {import("../PluggableMap.js").FrameState} frameState current frame state
   * @api
   */
  prepareDraw(frameState) {
    const gl = this.getGL();
    const canvas = this.getCanvas();
    const size = frameState.size;
    const pixelRatio = frameState.pixelRatio;

    canvas.width = size[0] * pixelRatio;
    canvas.height = size[1] * pixelRatio;
    canvas.style.width = size[0] + 'px';
    canvas.style.height = size[1] + 'px';

    gl.useProgram(this.currentProgram_);

    // loop backwards in post processes list
    for (let i = this.postProcessPasses_.length - 1; i >= 0; i--) {
      this.postProcessPasses_[i].init(frameState);
    }

    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    this.applyFrameState(frameState);
    this.applyUniforms(frameState);
  }

  /**
   * Execute a draw call based on the currently bound program, texture, buffers, attributes.
   * @param {number} start Start index.
   * @param {number} end End index.
   * @api
   */
  drawElements(start, end) {
    const gl = this.getGL();
    const elementType = this.hasOESElementIndexUint ?
      gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
    const elementSize = this.hasOESElementIndexUint ? 4 : 2;

    const numItems = end - start;
    const offsetInBytes = start * elementSize;
    gl.drawElements(gl.TRIANGLES, numItems, elementType, offsetInBytes);
  }

  /**
   * Apply the successive post process passes which will eventually render to the actual canvas.
   * @param {import("../PluggableMap.js").FrameState} frameState current frame state
   * @api
   */
  finalizeDraw(frameState) {
    // apply post processes using the next one as target
    for (let i = 0; i < this.postProcessPasses_.length; i++) {
      this.postProcessPasses_[i].apply(frameState, this.postProcessPasses_[i + 1] || null);
    }
  }

  /**
   * @return {HTMLCanvasElement} Canvas.
   * @api
   */
  getCanvas() {
    return this.canvas_;
  }

  /**
   * Get the WebGL rendering context
   * @return {WebGLRenderingContext} The rendering context.
   * @api
   */
  getGL() {
    return this.gl_;
  }

  /**
   * Sets the default matrix uniforms for a given frame state. This is called internally in `prepareDraw`.
   * @param {import("../PluggableMap.js").FrameState} frameState Frame state.
   * @private
   */
  applyFrameState(frameState) {
    const size = frameState.size;
    const rotation = frameState.viewState.rotation;
    const resolution = frameState.viewState.resolution;
    const center = frameState.viewState.center;

    // set the "uniform" values (coordinates 0,0 are the center of the view)
    const projectionMatrix = ol.transform.reset(this.projectionMatrix_);
    ol.transform.scale(projectionMatrix, 2 / (resolution * size[0]), 2 / (resolution * size[1]));
    ol.transform.rotate(projectionMatrix, -rotation);
    ol.transform.translate(projectionMatrix, -center[0], -center[1]);

    const offsetScaleMatrix = ol.transform.reset(this.offsetScaleMatrix_);
    ol.transform.scale(offsetScaleMatrix, 2 / size[0], 2 / size[1]);

    const offsetRotateMatrix = ol.transform.reset(this.offsetRotateMatrix_);
    if (rotation !== 0) {
      ol.transform.rotate(offsetRotateMatrix, -rotation);
    }

    this.setUniformMatrixValue(DefaultUniform.PROJECTION_MATRIX, ol.vec.Mat4.fromTransform(this.tmpMat4_, projectionMatrix));
    this.setUniformMatrixValue(DefaultUniform.OFFSET_SCALE_MATRIX, ol.vec.Mat4.fromTransform(this.tmpMat4_, offsetScaleMatrix));
    this.setUniformMatrixValue(DefaultUniform.OFFSET_ROTATION_MATRIX, ol.vec.Mat4.fromTransform(this.tmpMat4_, offsetRotateMatrix));
  }

  /**
   * Sets the custom uniforms based on what was given in the constructor. This is called internally in `prepareDraw`.
   * @param {import("../PluggableMap.js").FrameState} frameState Frame state.
   * @private
   */
  applyUniforms(frameState) {
    const gl = this.getGL();

    let value;
    let textureSlot = 0;
    this.uniforms_.forEach(function(uniform) {
      value = typeof uniform.value === 'function' ? uniform.value(frameState) : uniform.value;

      // apply value based on type
      if (value instanceof HTMLCanvasElement || value instanceof ImageData) {
        // create a texture & put data
        if (!uniform.texture) {
          uniform.texture = gl.createTexture();
        }
        gl.activeTexture(gl[`TEXTURE${textureSlot}`]);
        gl.bindTexture(gl.TEXTURE_2D, uniform.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        if (value instanceof ImageData) {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, value.width, value.height, 0,
            gl.UNSIGNED_BYTE, new Uint8Array(value.data));
        } else {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, value);
        }

        // fill texture slots by increasing index
        gl.uniform1i(this.getUniformLocation(uniform.name), textureSlot++);

      } else if (Array.isArray(value)) {
        switch (value.length) {
          case 2:
            gl.uniform2f(this.getUniformLocation(uniform.name), value[0], value[1]);
            return;
          case 3:
            gl.uniform3f(this.getUniformLocation(uniform.name), value[0], value[1], value[2]);
            return;
          case 4:
            gl.uniform4f(this.getUniformLocation(uniform.name), value[0], value[1], value[2], value[3]);
            return;
          default:
            return;
        }
      } else if (typeof value === 'number') {
        gl.uniform1f(this.getUniformLocation(uniform.name), value);
      }
    }.bind(this));
  }

  /**
   * Use a program.  If the program is already in use, this will return `false`.
   * @param {WebGLProgram} program Program.
   * @return {boolean} Changed.
   * @api
   */
  useProgram(program) {
    if (program == this.currentProgram_) {
      return false;
    } else {
      const gl = this.getGL();
      gl.useProgram(program);
      this.currentProgram_ = program;
      this.uniformLocations_ = {};
      this.attribLocations_ = {};
      return true;
    }
  }

  /**
   * Will attempt to compile a vertex or fragment shader based on source
   * On error, the shader will be returned but
   * `gl.getShaderParameter(shader, gl.COMPILE_STATUS)` will return `true`
   * Use `gl.getShaderInfoLog(shader)` to have details
   * @param {string} source Shader source
   * @param {ShaderType} type VERTEX_SHADER or FRAGMENT_SHADER
   * @return {WebGLShader} Shader object
   */
  compileShader(source, type) {
    const gl = this.getGL();
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    this.shaderCache_.push(shader);
    return shader;
  }

  /**
   * Create a program for a vertex and fragment shader. The shaders compilation may have failed:
   * use `WebGLHelper.getShaderCompileErrors()`to have details if any.
   * @param {string} fragmentShaderSource Fragment shader source.
   * @param {string} vertexShaderSource Vertex shader source.
   * @return {WebGLProgram} Program
   * @api
   */
  getProgram(fragmentShaderSource, vertexShaderSource) {
    const gl = this.getGL();

    const fragmentShader = this.compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    const vertexShader = this.compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    this.shaderCompileErrors_ = null;

    if (gl.getShaderInfoLog(fragmentShader)) {
      this.shaderCompileErrors_ =
        `Fragment shader compilation failed:\n${gl.getShaderInfoLog(fragmentShader)}`;
    }
    if (gl.getShaderInfoLog(vertexShader)) {
      this.shaderCompileErrors_ = (this.shaderCompileErrors_ || '') +
        `Vertex shader compilation failed:\n${gl.getShaderInfoLog(vertexShader)}`;
    }

    const program = gl.createProgram();
    gl.attachShader(program, fragmentShader);
    gl.attachShader(program, vertexShader);
    gl.linkProgram(program);
    this.programCache_.push(program);
    return program;
  }

  /**
   * Will return the last shader compilation errors. If no error happened, will return null;
   * @return {string|null} Errors description, or null if last compilation was successful
   * @api
   */
  getShaderCompileErrors() {
    return this.shaderCompileErrors_;
  }

  /**
   * Will get the location from the shader or the cache
   * @param {string} name Uniform name
   * @return {WebGLUniformLocation} uniformLocation
   * @api
   */
  getUniformLocation(name) {
    if (this.uniformLocations_[name] === undefined) {
      this.uniformLocations_[name] = this.getGL().getUniformLocation(this.currentProgram_, name);
    }
    return this.uniformLocations_[name];
  }

  /**
   * Will get the location from the shader or the cache
   * @param {string} name Attribute name
   * @return {number} attribLocation
   * @api
   */
  getAttributeLocation(name) {
    if (this.attribLocations_[name] === undefined) {
      this.attribLocations_[name] = this.getGL().getAttribLocation(this.currentProgram_, name);
    }
    return this.attribLocations_[name];
  }

  /**
   * Give a value for a standard float uniform
   * @param {string} uniform Uniform name
   * @param {number} value Value
   * @api
   */
  setUniformFloatValue(uniform, value) {
    this.getGL().uniform1f(this.getUniformLocation(uniform), value);
  }

  /**
   * Give a value for a standard matrix4 uniform
   * @param {string} uniform Uniform name
   * @param {Array<number>} value Matrix value
   * @api
   */
  setUniformMatrixValue(uniform, value) {
    this.getGL().uniformMatrix4fv(this.getUniformLocation(uniform), false, value);
  }

  /**
   * Will set the currently bound buffer to an attribute of the shader program
   * @param {string} attribName Attribute name
   * @param {number} size Number of components per attributes
   * @param {number} type UNSIGNED_INT, UNSIGNED_BYTE, UNSIGNED_SHORT or FLOAT
   * @param {number} stride Stride in bytes (0 means attribs are packed)
   * @param {number} offset Offset in bytes
   * @api
   */
  enableAttributeArray(attribName, size, type, stride, offset) {
    const location = this.getAttributeLocation(attribName);
    // the attribute has not been found in the shaders; do not enable it
    if (location < 0) {
      return;
    }
    this.getGL().enableVertexAttribArray(location);
    this.getGL().vertexAttribPointer(location, size, type,
      false, stride, offset);
  }

  /**
   * WebGL context was lost
   * @private
   */
  handleWebGLContextLost() {
    ol.obj.clear(this.bufferCache_);
    ol.obj.clear(this.shaderCache_);
    ol.obj.clear(this.programCache_);
    this.currentProgram_ = null;
  }

  /**
   * WebGL context was restored
   * @private
   */
  handleWebGLContextRestored() {
  }

  // TODO: shutdown program

  /**
   * TODO: these are not used and should be reworked
   * @param {number=} opt_wrapS wrapS.
   * @param {number=} opt_wrapT wrapT.
   * @return {WebGLTexture} The texture.
   */
  createTextureInternal(opt_wrapS, opt_wrapT) {
    const gl = this.getGL();
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    if (opt_wrapS !== undefined) {
      gl.texParameteri(
        ol.webgl.TEXTURE_2D, ol.webgl.TEXTURE_WRAP_S, opt_wrapS);
    }
    if (opt_wrapT !== undefined) {
      gl.texParameteri(
        ol.webgl.TEXTURE_2D, ol.webgl.TEXTURE_WRAP_T, opt_wrapT);
    }

    return texture;
  }

  /**
   * TODO: these are not used and should be reworked
   * @param {number} width Width.
   * @param {number} height Height.
   * @param {number=} opt_wrapS wrapS.
   * @param {number=} opt_wrapT wrapT.
   * @return {WebGLTexture} The texture.
   */
  createEmptyTexture(width, height, opt_wrapS, opt_wrapT) {
    const gl = this.getGL();
    const texture = this.createTextureInternal(opt_wrapS, opt_wrapT);
    gl.texImage2D(gl.ol.webgl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    return texture;
  }


  /**
   * TODO: these are not used and should be reworked
   * @param {HTMLCanvasElement|HTMLImageElement|HTMLVideoElement} image Image.
   * @param {number=} opt_wrapS wrapS.
   * @param {number=} opt_wrapT wrapT.
   * @return {WebGLTexture} The texture.
   */
  createTexture(image, opt_wrapS, opt_wrapT) {
    const gl = this.getGL();
    const texture = this.createTextureInternal(opt_wrapS, opt_wrapT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    return texture;
  }
}

export default Helper;
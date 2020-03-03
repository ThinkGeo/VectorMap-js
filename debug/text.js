
// };

const fragmentShader = 'precision mediump float;' +
  'varying vec2 v_texCoord;' +
  'varying float v_opacity;' +
  '' +
  'uniform float u_opacity;' +
  'uniform sampler2D u_image;' +
  '' +
  'void main(void) {' +
  '  gl_FragColor = texture2D(u_image, v_texCoord);' +

  '}';

const vertexShader =
  'varying vec2 v_texCoord;' +
  'varying float v_opacity;' +
  '' +
  'attribute vec2 a_position;' +
  'attribute vec2 a_texCoord;' +
  'attribute vec2 a_offsets;' +
  'attribute float a_opacity;' +
  'attribute float a_rotateWithView;' +
  '' +
  'uniform mat4 u_projectionMatrix;' +
  'uniform float u_zIndex;' +
  'uniform mat4 u_offsetScaleMatrix;' +
  'uniform mat4 u_offsetRotateMatrix;' +
  '' + 'void main(void) {' +
  '  mat4 offsetMatrix = u_offsetScaleMatrix;' +
  '  if (a_rotateWithView == 1.0) {' +
  '    offsetMatrix = u_offsetScaleMatrix * u_offsetRotateMatrix;' +
  '  }' +
  '  vec4 offsets = offsetMatrix * vec4(a_offsets, 0.0, 0.0);' +
  '  gl_Position = u_projectionMatrix * vec4(a_position, u_zIndex, 1.0) + offsets;' +
  '  v_texCoord = a_texCoord;' +
  '  v_opacity = a_opacity;' +
  '}';

var app = {};
app.texturesId = 0;
app.projectionMatrix = [1, 0, 0, 1, 0, 0];
app.offsetScaleMatrix = [1, 0, 0, 1, 0, 0];
app.offsetRotateMatrix = [1, 0, 0, 1, 0, 0];
function draw(t) {
  var gl = app.gl;
  if (gl === undefined) {
    var canvas = document.getElementById("map");

    canvas.width = 1130;
    canvas.height = 200;
    app.size = [1130, 200];
    app.resolution = 19567.87924100512;
    app.center = [6887893.4928338025, 4070118.882129065];
    app.screenXY = [5009377.085697311, 5009377.085697311];
    gl = canvas.getContext("experimental-webgl", {
      antialias: true,//值表明是否开启抗锯齿
      depth: true,//值表明绘制缓冲区包含一个深度至少为16位的缓冲区。
      failIfMajorPerformanceCaveat: true,//表明在一个系统性能低的环境是否创建该上下文的
      preserveDrawingBuffer: false,//指示浏览器在运行WebGL上下文时使用相应的GPU电源配置。 可能值如下:"default":自动选择，默认值。 "high-performance": 高性能模式。"low-power": 节能模式。
      stencil: true//表明绘制缓冲区包含一个深度至少为8位的模版缓冲区boolean值
    });
    gl.activeTexture(ol.webgl.TEXTURE0); //用来激活指定的纹理单元。 https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/activeTexture
    gl.blendFuncSeparate(
      ol.webgl.SRC_ALPHA, ol.webgl.ONE_MINUS_SRC_ALPHA,
      ol.webgl.ONE, ol.webgl.ONE_MINUS_SRC_ALPHA);//https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFuncSeparate

    gl.disable(ol.webgl.CULL_FACE);// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace
    gl.disable(ol.webgl.DEPTH_TEST);//通过 enable/disable 来打开/关闭深度测试。 也可以使用 getParameter 来查询深度测试。LEQUAL https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL_API/Constants
    gl.disable(ol.webgl.SCISSOR_TEST);//Passed to enable/disable to turn on/off the scissor test. Can also be used with getParameter to query the scissor test. https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL_API/Constants
    gl.disable(ol.webgl.STENCIL_TEST);//assed to enable/disable to turn on/off the stencil test. Can also be used with getParameter to query the stencil test. 
    gl.enable(ol.webgl.BLEND);// Passed to enable/disable to turn on/off blending. Can also be used with getParameter to find the current blending method.

    app.gl = gl;

    gl.getExtension('OES_element_index_uint');// adds support for gl.UNSIGNED_INT types to WebGLRenderingContext.drawElements().
  }

  gl.bindFramebuffer(ol.webgl.FRAMEBUFFER, null);// binds a given WebGLFramebuffer to a target. 
  gl.clearColor(0, 0, 0, 0);// specifies the color values used when clearing color buffers.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);// COLOR_BUFFER_BIT,DEPTH_BUFFER_BIT,STENCIL_BUFFER_BIT, clears buffers to preset values. https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clear

  gl.viewport(0, 0, app.size[0],  app.size[1]);//

  gl.enable(gl.CULL_FACE);// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace
  gl.enable(gl.DEPTH_TEST);// 通过 enable/disable 来打开/关闭深度测试。
  gl.disable(gl.BLEND);//Passed to enable/disable to turn on/off blending
  gl.depthMask(true);// sets whether writing into the depth buffer is enabled or disabled.
  // Clear the canvas AND the depth buffer.

  var textCanvas = app.textCanvas;
  if (textCanvas === undefined) {
    textCanvas = makeTextCanvas("Hello!", 100, 18);
    app.textCanvas = textCanvas
  }

  var webGLData = createWebGLData(textCanvas,t);

  var images = webGLData.images;
  var image, texture;
  var textures = [];
  var cachedTextures = app.textures;
  if (cachedTextures === undefined) {
    cachedTextures = {};
    app.textures = cachedTextures;
  }

  for (var i = 0, ii = images.length; i < ii; i++) {
    image = images[i];
    if (image) {
      var cacheTexture = cachedTextures[image["cacheId"]];
      if (cacheTexture === undefined) {
        cacheTexture = createTexture(gl, image);
        app.texturesId++;
        cachedTextures[app.texturesId] = cacheTexture;
        image["cacheId"] = app.texturesId;
      }
      if (cacheTexture) {
        textures.push(cacheTexture);
      }
    }
  }

  bindBuffer(gl, gl.ARRAY_BUFFER, webGLData.verticesBuffer, false);
  bindBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, webGLData.indicesBuffer, false);

  var program = app.program;
  var locations = app.locations;

  if (program === undefined) {
    program = initShaderProgram(gl, vertexShader, fragmentShader);
    app.program = program;
    locations = createLocaiton(gl, program);
    app.locations = locations;
  }

  gl.enable(gl.BLEND);
  //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
   gl.depthMask(false);

  if (app.currentProgram !== program) {
    gl.useProgram(program);
    app.currentProgram = program;
  }

  gl.enableVertexAttribArray(locations.a_position);
  gl.vertexAttribPointer(locations.a_position, 2, 5126, false, 32, 0);

  gl.enableVertexAttribArray(locations.a_offsets);
  gl.vertexAttribPointer(locations.a_offsets, 2, 5126, false, 32, 8);

  gl.enableVertexAttribArray(locations.a_texCoord);
  gl.vertexAttribPointer(locations.a_texCoord, 2, 5126, false, 32, 16);

  gl.enableVertexAttribArray(locations.a_opacity);
  gl.vertexAttribPointer(locations.a_opacity, 1, 5126, false, 32, 24);

  gl.enableVertexAttribArray(locations.a_rotateWithView);
  gl.vertexAttribPointer(locations.a_rotateWithView, 1, 5126, false, 32, 28);


  var resolution = app.resolution;
  var size = app.size;
  var center = app.center;
  var screenXY = app.screenXY;
  var projectionMatrix = ol.transform.reset(app.projectionMatrix);
  ol.transform.scale(projectionMatrix, 2 / (resolution * size[0]), 2 / (resolution * size[1]));
  ol.transform.rotate(projectionMatrix, -0);
  ol.transform.translate(projectionMatrix, -(center[0] - screenXY[0]), -(center[1] - screenXY[1]));

  var offsetScaleMatrix = [0.0017699115044247787, 0, 0, 0.01, 0, 0];

  var offsetScaleMatrix = ol.transform.reset(app.offsetScaleMatrix);
  ol.transform.scale(offsetScaleMatrix, 2 / size[0], 2 / size[1]);

  var offsetRotateMatrix = ol.transform.reset(app.offsetRotateMatrix);

  var tmpMat4_ = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  var opacity = 1;
  gl.uniformMatrix4fv(locations.u_projectionMatrix, false,
    fromTransform(tmpMat4_, projectionMatrix));
  gl.uniformMatrix4fv(locations.u_offsetScaleMatrix, false,
    fromTransform(tmpMat4_, offsetScaleMatrix));
  gl.uniformMatrix4fv(locations.u_offsetRotateMatrix, false,
    fromTransform(tmpMat4_, offsetRotateMatrix));
  gl.uniform1f(locations.u_opacity, opacity);

  
  var i, ii, start;
  var groupIndices = [];
  groupIndices.push(webGLData.indicesBuffer.length);
  for (i = 0, ii = textures.length, start = 0; i < ii; ++i) {
    gl.bindTexture(gl.TEXTURE_2D, textures[i]);
    gl.uniform1f(locations.u_zIndex, 0);

    var end = groupIndices[i];
    var elementSize = 4;
    var numItems = end - start;
    var offsetInBytes = start * elementSize;
    gl.drawElements(gl.TRIANGLES, numItems, gl.UNSIGNED_INT, offsetInBytes);
    start = end;
  }
  gl.blendFuncSeparate(
    ol.webgl.SRC_ALPHA, ol.webgl.ONE_MINUS_SRC_ALPHA,
    ol.webgl.ONE, ol.webgl.ONE_MINUS_SRC_ALPHA);

  gl.disableVertexAttribArray(locations.a_position);
  gl.disableVertexAttribArray(locations.a_offsets);
  gl.disableVertexAttribArray(locations.a_texCoord);
  gl.disableVertexAttribArray(locations.a_opacity);
  gl.disableVertexAttribArray(locations.a_rotateWithView);

}

function update(){

  for(var i=0;i<1;i++)
  {
    draw(i);
  }

  requestAnimationFrame(update);

}
requestAnimationFrame(update);


function fromTransform(mat4, transform) {
  mat4[0] = transform[0];
  mat4[1] = transform[1];
  mat4[4] = transform[2];
  mat4[5] = transform[3];
  mat4[12] = transform[4];
  mat4[13] = transform[5];
  return mat4;
}
function createLocaiton(gl, program) {
  var u_projectionMatrix = gl.getUniformLocation(
    program, 'u_projectionMatrix');

  var u_offsetScaleMatrix = gl.getUniformLocation(
    program, 'u_offsetScaleMatrix');
  var u_offsetRotateMatrix = gl.getUniformLocation(
    program, 'u_offsetRotateMatrix');
  var u_opacity = gl.getUniformLocation(
    program, 'u_opacity');
  var u_image = gl.getUniformLocation(
    program, 'u_image');
  var a_position = gl.getAttribLocation(
    program, 'a_position');
  var a_texCoord = gl.getAttribLocation(
    program, 'a_texCoord');
  var a_offsets = gl.getAttribLocation(
    program, 'a_offsets');
  var a_opacity = gl.getAttribLocation(
    program, 'a_opacity');
  var a_rotateWithView = gl.getAttribLocation(
    program, 'a_rotateWithView');
  var u_zIndex = gl.getUniformLocation(
    program, 'u_zIndex');

  return {
    u_projectionMatrix,
    u_offsetScaleMatrix,
    u_offsetRotateMatrix,
    u_opacity,
    u_image,
    a_position,
    a_texCoord,
    a_offsets,
    a_opacity,
    a_rotateWithView,
    u_zIndex
  }
}

function bindBuffer(gl, target, arr, shouldBeCached) {
  var buffer = gl.createBuffer();
  gl.bindBuffer(target, buffer);
  var arrayBuffer;
  if (target === gl.ARRAY_BUFFER) {
    arrayBuffer = new Float32Array(arr);
  } else if (target === gl.ELEMENT_ARRAY_BUFFER) {
    arrayBuffer = new Uint32Array(arr);
  }
  gl.bufferData(target, arrayBuffer, 35044);
}

function createTexture(gl, image) {
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);



  return texture;
}

function createWebGLData(image,t) {
  var indices = [];
  var vertices = [];

  var images = [];
  images.push(image);

  var anchorX = 0;
  var anchorY = 0;
  var height = image.height;
  var imageHeight = image.height;
  var imageWidth = image.width;
  var opacity = 1;
  var originX = 0;
  var originY = 0;
  var rotateWithView = 0;
  var rotation = -0;
  var scale = 1;
  var width = image.width;
  var cos = Math.cos(rotation);
  var sin = Math.sin(rotation);

  var numIndices = indices.length;
  var numVertices = vertices.length;


  var x, y, n, offsetX, offsetY;
  //======================
  for(var t=0; t<10;t++)
  {
    for (var i = -3; i < 2; i++) {
      for (var j = -2; j < 0; j++) {
  
        x = 1000000 * i+t*20000;
        y = j * 1000000+t*20000;
  
        n = numVertices / 8;
  
        // bottom-left corner
        offsetX = -scale * anchorX;
        offsetY = -scale * (height - anchorY);
  
        vertices[numVertices++] = x;
        vertices[numVertices++] = y;
        vertices[numVertices++] = offsetX * cos - offsetY * sin;
        vertices[numVertices++] = offsetX * sin + offsetY * cos;
        vertices[numVertices++] = originX / imageWidth;
        vertices[numVertices++] = (originY + height) / imageHeight;
        vertices[numVertices++] = opacity;
        vertices[numVertices++] = rotateWithView;
  
        // bottom-right corner
        offsetX = scale * (width - anchorX);
        offsetY = -scale * (height - anchorY);
        vertices[numVertices++] = x;
        vertices[numVertices++] = y;
        vertices[numVertices++] = offsetX * cos - offsetY * sin;
        vertices[numVertices++] = offsetX * sin + offsetY * cos;
        vertices[numVertices++] = (originX + width) / imageWidth;
        vertices[numVertices++] = (originY + height) / imageHeight;
        vertices[numVertices++] = opacity;
        vertices[numVertices++] = rotateWithView;
  
        // top-right corner
        offsetX = scale * (width - anchorX);
        offsetY = scale * anchorY;
        vertices[numVertices++] = x;
        vertices[numVertices++] = y;
        vertices[numVertices++] = offsetX * cos - offsetY * sin;
        vertices[numVertices++] = offsetX * sin + offsetY * cos;
        vertices[numVertices++] = (originX + width) / imageWidth;
        vertices[numVertices++] = originY / imageHeight;
        vertices[numVertices++] = opacity;
        vertices[numVertices++] = rotateWithView;
  
        // top-left corner
        offsetX = -scale * anchorX;
        offsetY = scale * anchorY;
        vertices[numVertices++] = x;
        vertices[numVertices++] = y;
        vertices[numVertices++] = offsetX * cos - offsetY * sin;
        vertices[numVertices++] = offsetX * sin + offsetY * cos;
        vertices[numVertices++] = originX / imageWidth;
        vertices[numVertices++] = originY / imageHeight;
        vertices[numVertices++] = opacity;
        vertices[numVertices++] = rotateWithView;
  
        indices[numIndices++] = n;
        indices[numIndices++] = n + 1;
        indices[numIndices++] = n + 2;
        indices[numIndices++] = n;
        indices[numIndices++] = n + 2;
        indices[numIndices++] = n + 3;
  
      }
    }
  }
 



  return {
    images,
    verticesBuffer: vertices,
    indicesBuffer: indices
  }

}


function initShaderProgram(gl, vsSource, fsSource) {
  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, loadShader(gl, gl.FRAGMENT_SHADER, fsSource));
  gl.attachShader(shaderProgram, loadShader(gl, gl.VERTEX_SHADER, vsSource));
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}


function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);



  return shader;
}


// Puts text in center of canvas.
function makeTextCanvas(text, width, height) {
  var textCtx = document.createElement("canvas").getContext("2d");
  textCtx.canvas.width = width;
  textCtx.canvas.height = height;
  textCtx.font = "20px monospace";
  textCtx.textAlign = "center";
  textCtx.textBaseline = "middle";
  textCtx.fillStyle = "black";
  textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
  textCtx.fillText(text, width / 2, height / 2);
  return textCtx.canvas;
}
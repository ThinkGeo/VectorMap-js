import WebGLHelper, {DefaultAttrib} from '../webgl/Helper';

const VERTEX_SHADER = `
  precision mediump float;
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  attribute float a_rotateWithView;
  attribute vec2 a_offsets;
  attribute float a_opacity;
  
  uniform mat4 u_projectionMatrix;
  uniform mat4 u_offsetScaleMatrix;
  uniform mat4 u_offsetRotateMatrix;
  
  varying vec2 v_texCoord;
  varying float v_opacity;
  
  void main(void) {
    mat4 offsetMatrix = u_offsetScaleMatrix;
    if (a_rotateWithView == 1.0) {
      offsetMatrix = u_offsetScaleMatrix * u_offsetRotateMatrix;
    }
    vec4 offsets = offsetMatrix * vec4(a_offsets, 0.0, 0.0);
    gl_Position = u_projectionMatrix * vec4(a_position, 0.0, 1.0) + offsets;
    v_texCoord = a_texCoord;
    v_opacity = a_opacity;
  }`;

const FRAGMENT_SHADER = `
  precision mediump float;
  
  varying vec2 v_texCoord;
  varying float v_opacity;
  
  void main(void) {
    gl_FragColor.rgb = vec3(1.0, 1.0, 1.0);
    float alpha = v_opacity;
    if (alpha == 0.0) {
      discard;
    }
    gl_FragColor.a = alpha;
  }`;

class GeoPointsLayerRenderer extends ol.renderer.webgl.Layer {

  /**
   * @param {import("../../layer/Vector.js").default} vectorLayer Vector layer.
   * @param {Options=} [opt_options] Options.
   */
  constructor(mapRenderer, layer, opt_options) {
    super(mapRenderer, layer);

    const options = opt_options || {};

    this.helper_ = new WebGLHelper({
      postProcesses: options.postProcesses,
      uniforms: options.uniforms
    });

    this.sourceRevision_ = -1;

    this.verticesBuffer_ = new ol.webgl.Buffer([], ol.webgl.DYNAMIC_DRAW);
    this.indicesBuffer_ = new ol.webgl.Buffer([], ol.webgl.DYNAMIC_DRAW);

    this.program_ = this.helper_.getProgram(
      options.fragmentShader || FRAGMENT_SHADER,
      options.vertexShader || VERTEX_SHADER
    );

    this.helper_.useProgram(this.program_);

    this.sizeCallback_ = options.sizeCallback || function() {
      return 1;
    };
    this.coordCallback_ = options.coordCallback || function(feature, index) {
      const geom = /** @type {import("../../geom/Point").default} */ (feature.getGeometry());
      return geom.getCoordinates()[index];
    };
    this.opacityCallback_ = options.opacityCallback || function() {
      return 1;
    };
    this.texCoordCallback_ = options.texCoordCallback || function(feature, index) {
      return index < 2 ? 0 : 1;
    };
    this.rotateWithViewCallback_ = options.rotateWithViewCallback || function() {
      return false;
    };
  }

  /**
   * @inheritDoc
   */
  disposeInternal() {
    super.disposeInternal();
  }

  /**
   * @inheritDoc
   */
  composeFrame(frameState, layerState) {
    this.helper_.drawElements(0, this.indicesBuffer_.getArray().length);
    this.helper_.finalizeDraw(frameState);
    const canvas = this.helper_.getCanvas();
    const opacity = layerState.opacity;
    if (opacity !== canvas.style.opacity) {
      canvas.style.opacity = opacity;
    }

    // add canvas
    var childCanvas = frameState.context.canvas_;
    this.insertAfter(canvas, childCanvas);

    return canvas;
  }

  /**
   * @inheritDoc
   */
  prepareFrame(frameState) {
    const vectorLayer = /** @type {import("../../layer/Vector.js").default} */ (this.getLayer());
    const vectorSource = /** @type {import("../../source/Vector.js").default} */ (vectorLayer.getSource());

    this.helper_.prepareDraw(frameState);

    if (this.sourceRevision_ < vectorSource.getRevision()) {
      this.sourceRevision_ = vectorSource.getRevision();

      const viewState = frameState.viewState;
      const projection = viewState.projection;
      const resolution = viewState.resolution;

      // loop on features to fill the buffer
      vectorSource.loadFeatures([-Infinity, -Infinity, Infinity, Infinity], resolution, projection);
      vectorSource.forEachFeature((feature) => {
        if (!feature.getGeometry() || feature.getGeometry().getType() !== ol.geom.GeometryType.POINT) {
          return;
        }
        const x = this.coordCallback_(feature, 0);
        const y = this.coordCallback_(feature, 1);
        const u0 = this.texCoordCallback_(feature, 0);
        const v0 = this.texCoordCallback_(feature, 1);
        const u1 = this.texCoordCallback_(feature, 2);
        const v1 = this.texCoordCallback_(feature, 3);
        const size = this.sizeCallback_(feature);
        const opacity = this.opacityCallback_(feature);
        const rotateWithView = this.rotateWithViewCallback_(feature) ? 1 : 0;
        const stride = 8;
        const baseIndex = this.verticesBuffer_.getArray().length / stride;

        this.verticesBuffer_.getArray().push(
          x, y, -size / 2, -size / 2, u0, v0, opacity, rotateWithView,
          x, y, +size / 2, -size / 2, u1, v0, opacity, rotateWithView,
          x, y, +size / 2, +size / 2, u1, v1, opacity, rotateWithView,
          x, y, -size / 2, +size / 2, u0, v1, opacity, rotateWithView
        );
        this.indicesBuffer_.getArray().push(
          baseIndex, baseIndex + 1, baseIndex + 3,
          baseIndex + 1, baseIndex + 2, baseIndex + 3
        );
      });
    }

    // write new data
    this.helper_.bindBuffer(ol.webgl.ARRAY_BUFFER, this.verticesBuffer_);
    this.helper_.bindBuffer(ol.webgl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer_);

    const bytesPerFloat = Float32Array.BYTES_PER_ELEMENT;
    this.helper_.enableAttributeArray(DefaultAttrib.POSITION, 2, ol.webgl.FLOAT, bytesPerFloat * 8, 0);
    this.helper_.enableAttributeArray(DefaultAttrib.OFFSETS, 2, ol.webgl.FLOAT, bytesPerFloat * 8, bytesPerFloat * 2);
    this.helper_.enableAttributeArray(DefaultAttrib.TEX_COORD, 2, ol.webgl.FLOAT, bytesPerFloat * 8, bytesPerFloat * 4);
    this.helper_.enableAttributeArray(DefaultAttrib.OPACITY, 1, ol.webgl.FLOAT, bytesPerFloat * 8, bytesPerFloat * 6);
    this.helper_.enableAttributeArray(DefaultAttrib.ROTATE_WITH_VIEW, 1, ol.webgl.FLOAT, bytesPerFloat * 8, bytesPerFloat * 7);

    return true;
  }

  /**
   * Will return the last shader compilation errors. If no error happened, will return null;
   * @return {string|null} Errors, or null if last compilation was successful
   * @api
   */
  getShaderCompileErrors() {
    return this.helper_.getShaderCompileErrors();
  }

  insertAfter(newElement, targetElement){
    var parent = targetElement.parentNode;
    if( parent.lastChild == targetElement ){
        parent.appendChild( newElment );
    }else{
        parent.insertBefore( newElement, targetElement.nextSibling );
    }
  }
} 

GeoPointsLayerRenderer['handles'] = function(type, layer) {
  return type === ol.renderer.Type.WEBGL && layer.getType() === ol.LayerType.GEOPOINTS;;
}

GeoPointsLayerRenderer['create'] = function(mapRenderer, layer) {
  return layer.createRenderer_(mapRenderer);
}

export default GeoPointsLayerRenderer;
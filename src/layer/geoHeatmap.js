import GeoPointsLayerRenderer from '../renderer/geoPointsLayer';

export class GeoHeatmap extends ol.layer.Vector {
  constructor(opt_options) {  
    var options = opt_options ? opt_options : {};

    var baseOptions = ol.obj.assign({}, options);

    delete baseOptions.gradient;
    delete baseOptions.radius;
    delete baseOptions.blur;
    delete baseOptions.shadow;
    delete baseOptions.weight;
    super(baseOptions);

    /**
     * @private
     * @type {Uint8ClampedArray}
     */
    this.gradient_ = null;

    /**
     * @private
     * @type {number}
     */
    this.shadow_ = options.shadow !== undefined ? options.shadow : 250;

    /**
     * @private
     * @type {string|undefined}
     */
    this.circleImage_ = undefined;

    /**
     * @private
     * @type {Array.<Array.<ol.style.Style>>}
     */
    this.styleCache_ = null;

    ol.events.listen(this,
        ol.Object.getChangeEventType(Property.GRADIENT),
        this.handleGradientChanged_, this);

    this.setGradient(options.gradient ?
        options.gradient : DEFAULT_GRADIENT);

    this.setBlur(options.blur !== undefined ? options.blur : 15);

    this.setRadius(options.radius !== undefined ? options.radius : 8);

    var weight = options.weight ? options.weight : 'weight';

    if (typeof weight === 'string') {
      this.weightFunction_ = function (feature) {
            return feature.get(weight);
        };
    } else {
      this.weightFunction_ = weight;
    }

    // For performance reasons, don't sort the features before rendering.
    // The render order is not relevant for a heatmap representation.
    this.setRenderOrder(null);

    ol.LayerType["GEOPOINTS"] = "GEOPOINTS";
    this.type = ol.LayerType.GEOPOINTS;    
    ol.plugins.register(ol.PluginType.LAYER_RENDERER, GeoPointsLayerRenderer);
  }

  setBlur(blur) {
    this.set(Property.BLUR, blur);
  }

  setGradient(colors) {
    this.set(Property.GRADIENT, colors);
  }

  setRadius(radius) {
    this.set(Property.RADIUS, radius);
  }

  handleGradientChanged_() {
    this.gradient_ = this.createGradient_(this.getGradient());
  }

  getGradient() {
    return this.get(Property.GRADIENT);
  }  

  createGradient_(colors) {
    var width = 1;
    var height = 256;
    var context = ol.dom.createCanvasContext2D(width, height);

    var gradient = context.createLinearGradient(0, 0, width, height);
    var step = 1 / (colors.length - 1);
    for (let i = 0, ii = colors.length; i < ii; ++i) {
        gradient.addColorStop(i * step, colors[i]);
    }

    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    return context.canvas;
  }

  createRenderer_(mapRenderer) {
    return new GeoPointsLayerRenderer(mapRenderer, this, {
      vertexShader: `
        precision mediump float;
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        attribute float a_rotateWithView;
        attribute vec2 a_offsets;
        attribute float a_opacity;
        
        uniform mat4 u_projectionMatrix;
        uniform mat4 u_offsetScaleMatrix;
        uniform mat4 u_offsetRotateMatrix;
        uniform float u_size;
        
        varying vec2 v_texCoord;
        varying float v_opacity;
        
        void main(void) {
          mat4 offsetMatrix = u_offsetScaleMatrix;
          if (a_rotateWithView == 1.0) {
            offsetMatrix = u_offsetScaleMatrix * u_offsetRotateMatrix;
          }
          vec4 offsets = offsetMatrix * vec4(a_offsets, 0.0, 0.0);
          gl_Position = u_projectionMatrix * vec4(a_position, 0.0, 1.0) + offsets * u_size;
          v_texCoord = a_texCoord;
          v_opacity = a_opacity;
        }`,
      fragmentShader: `
        precision mediump float;
        uniform float u_resolution;
        uniform float u_blurSlope;
        
        varying vec2 v_texCoord;
        varying float v_opacity;
        
        void main(void) {
          vec2 texCoord = v_texCoord * 2.0 - vec2(1.0, 1.0);
          float sqRadius = texCoord.x * texCoord.x + texCoord.y * texCoord.y;
          float value = (1.0 - sqrt(sqRadius)) * u_blurSlope;
          float alpha = smoothstep(0.0, 1.0, value) * v_opacity;
          gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
        }`,
      uniforms: {
        u_size: function() {
          return (this.get(Property.RADIUS) + this.get(Property.BLUR)) * 2;
        }.bind(this),
        u_blurSlope: function() {
          return this.get(Property.RADIUS) / Math.max(1, this.get(Property.BLUR));
        }.bind(this),
        u_resolution: function(frameState) {
          return frameState.viewState.resolution;
        }
      },
      postProcesses: [
        {
          fragmentShader: `
            precision mediump float;
            uniform sampler2D u_image;
            uniform sampler2D u_gradientTexture;
            varying vec2 v_texCoord;
            varying vec2 v_screenCoord;
            void main() {
              vec4 color = texture2D(u_image, v_texCoord);
              gl_FragColor.a = color.a;
              gl_FragColor.rgb = texture2D(u_gradientTexture, vec2(0.5, color.a)).rgb;
              gl_FragColor.rgb *= gl_FragColor.a;
            }`,
          uniforms: {
            u_gradientTexture: this.gradient_
          }
        }
      ],
      opacityCallback: function(feature) {
        return this.weightFunction_(feature);
      }.bind(this)
    });
  }
}

/**
 * @const
 * @type {Array.<string>}
 */
const DEFAULT_GRADIENT = ['#00f', '#0ff', '#0f0', '#ff0', '#f00'];

/**
 * @enum {string}
 * @private
 */
const Property = {
  BLUR: 'blur',
  GRADIENT: 'gradient',
  RADIUS: 'radius'
};


export class GeoTextReplay extends ((<any>ol).render.webgl.TextReplay as { new(tolerance: number, maxExtent: any, declutterTree: any) }) {
  constructor(tolerance, maxExtent, declutterTree){
    super(tolerance, maxExtent, declutterTree);
  } 
  
  public finish(context){
    var gl = context.getGL();        
    this.groupIndices.push(this.indices.length);
    this.hitDetectionGroupIndices = this.groupIndices;

    // create, bind, and populate the vertices buffer
    this.verticesBuffer = new (<any>ol).webgl.Buffer(this.vertices);

    // create, bind, and populate the indices buffer
    this.indicesBuffer = new (<any>ol).webgl.Buffer(this.indices);

    // create textures
    /** @type {Object.<string, WebGLTexture>} */
    this.textures_ = [];
    
    this.createTextures(this.textures_, this.images_, this.texturePerImage, gl);

    this.state_ = {
        strokeColor: null,
        lineCap: undefined,
        lineDash: null,
        lineDashOffset: undefined,
        lineJoin: undefined,
        lineWidth: 0,
        miterLimit: undefined,
        fillColor: null,
        font: undefined,
        scale: undefined
    };
    this.text_ = '';
    this.textAlign_ = undefined;
    this.textBaseline_ = undefined;
    this.offsetX_ = undefined;
    this.offsetY_ = undefined;
    this.images_ = [];
  }


}
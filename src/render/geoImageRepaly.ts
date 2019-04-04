export class GeoImageReplay extends ((<any>ol).render.webgl.ImageReplay as { new(tolerance: number, maxExtent: any, declutterTree: any) }) {
  constructor(tolerance, maxExtent, declutterTree){
    super(tolerance, maxExtent, declutterTree);
  } 
  
  public finish(context){
    var gl = context.getGL();

    this.groupIndices.push(this.indices.length);
    this.hitDetectionGroupIndices.push(this.indices.length);

    // create, bind, and populate the vertices buffer
    this.verticesBuffer = new (<any>ol).webgl.Buffer(this.vertices);

    // create, bind, and populate the indices buffer
    this.indicesBuffer = new (<any>ol).webgl.Buffer(this.indices);

    // create textures
    this.textures_ = [];

    this.createTextures(this.textures_, this.images_, this.texturePerImage, gl);

    this.createTextures(this.hitDetectionTextures_, this.hitDetectionImages_,
        this.texturePerImage, gl);

    this.images_ = [];
    this.hitDetectionImages_ = [];
  }

  public setImageStyle(imageStyle) {
    var anchor = imageStyle.getAnchor();
    var image = imageStyle.getImage(1);
    var imageSize = imageStyle.getImageSize();
    var hitDetectionImage = imageStyle.getHitDetectionImage(1);
    var opacity = imageStyle.getOpacity();
    var origin = imageStyle.getOrigin();
    var rotateWithView = imageStyle.getRotateWithView();
    var rotation = imageStyle.getRotation();
    var size = imageStyle.getSize();
    var scale = imageStyle.getScale();
    
    this.image = image;
    this.anchorX = anchor[0];
    this.anchorY = anchor[1];
    this.height = size[1];
    this.imageHeight = imageSize[1];
    this.imageWidth = imageSize[0];
    this.opacity = opacity;
    this.originX = origin[0];
    this.originY = origin[1];
    this.rotation = rotation;
    this.rotateWithView = rotateWithView;
    this.scale = scale;
    this.width = size[0];
  }
}
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

  public drawPoint(options) {
    var offset = 0;
    var end = 2;
    var stride = 2;
    var flatCoordinates = options.flatCoordinates;
    var image = options.image;
    this.originX = options.originX;
    this.originY = options.originY;
    this.imageWidth = options.imageWidth;
    this.imageHeight = options.imageHeight;
    this.opacity = options.opacity;
    this.width = options.width;
    this.height = options.height;
    this.rotation = options.rotation;
    this.rotateWithView = 1;
    this.scale = options.scale;
    this.anchorX = options.anchorX;
    this.anchorY = options.anchorY;
    var currentImage;
    if (this.images_.length === 0) {
        this.images_.push(image);
    }
    else {
        currentImage = this.images_[this.images_.length - 1];
        if ((<any>ol).getUid(currentImage) != (<any>ol).getUid(image)) {
            this.groupIndices.push(this.indices.length);
            this.images_.push(image);
        }
    }
    // if (this.hitDetectionImages_.length === 0) {
    //     this.hitDetectionImages_.push(hitDetectionImage);
    // } else {
    //     currentImage =
    //         this.hitDetectionImages_[this.hitDetectionImages_.length - 1];
    //     if (ol.getUid(currentImage) != ol.getUid(hitDetectionImage)) {
    //         this.hitDetectionGroupIndices.push(this.indices.length);
    //         this.hitDetectionImages_.push(hitDetectionImage);
    //     }
    // }
    this.drawCoordinates(flatCoordinates, offset, end, stride);
  }
}
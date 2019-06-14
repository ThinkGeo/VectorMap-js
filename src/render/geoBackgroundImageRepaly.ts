import { fragment, vertex } from './geoBackgroundImageReplay/defaultshader';
import { Locations } from './geoBackgroundImageReplay/defaultshader/Locations';

export class GeoBackgroundImageReplay extends ((<any>ol).render.webgl.ImageReplay as { new(tolerance: number, maxExtent: any, declutterTree: any) }) {
  constructor(tolerance, maxExtent, declutterTree){
    super(tolerance, maxExtent, declutterTree);
    this.projectionTexCoordMatrix_ = (<any>ol).transform.create();
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
    
    var currentImage;
    if (this.images_.length === 0) {
        this.images_.push(image);
    } else {
        currentImage = this.images_[this.images_.length - 1];
        if (ol.getUid(currentImage) != ol.getUid(image)) {
            this.groupIndices.push(this.indices.length);
            this.images_.push(image);
        }
    }

    if (this.hitDetectionImages_.length === 0) {
        this.hitDetectionImages_.push(hitDetectionImage);
    } else {
        currentImage =
            this.hitDetectionImages_[this.hitDetectionImages_.length - 1];
        if (ol.getUid(currentImage) != ol.getUid(hitDetectionImage)) {
            this.hitDetectionGroupIndices.push(this.indices.length);
            this.hitDetectionImages_.push(hitDetectionImage);
        }
    }

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

  public replay(context, center, resolution, rotation, size, pixelRatio, opacity, skippedFeaturesHash,
    featureCallback, oneByOne, opt_hitExtent, screenXY) {

    var gl = context.getGL();
   
    context.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer, false);
    context.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer, false);

    var locations = this.setUpProgram(gl, context, size, pixelRatio);
        
    // set the "uniform" values
    var projectionMatrix = (<any>ol).transform.reset(this.projectionMatrix_);
    (<any>ol).transform.scale(projectionMatrix, 2 / (resolution * size[0]), 2 / (resolution * size[1]));
    (<any>ol).transform.rotate(projectionMatrix, -rotation);

    // set the "uniform" values for texCoord
    var projectionTexCoordMatrix = (<any>ol).transform.reset(this.projectionTexCoordMatrix_);
    (<any>ol).transform.scale(projectionTexCoordMatrix, 1 / (resolution * this.imageWidth), 1 / (resolution * this.imageHeight));
    
    if(!screenXY){
        (<any>ol).transform.translate(projectionMatrix, -(center[0] - this.origin[0]), -(center[1] - this.origin[1]));
    }else{
        (<any>ol).transform.translate(projectionMatrix, -(center[0] - screenXY[0]), -(center[1] - screenXY[1]));
    }

    var offsetScaleMatrix = (<any>ol).transform.reset(this.offsetScaleMatrix_);
    (<any>ol).transform.scale(offsetScaleMatrix, 2 / size[0], 2 / size[1]);

    var offsetRotateMatrix = (<any>ol).transform.reset(this.offsetRotateMatrix_);
    if (rotation !== 0) {
        (<any>ol).transform.rotate(offsetRotateMatrix, -rotation);
    }

    gl.uniformMatrix4fv(locations.u_projectionMatrix, false,
        (<any>ol).vec.Mat4.fromTransform(this.tmpMat4_, projectionMatrix));
    gl.uniformMatrix4fv(locations.u_projectionTexCoordMatrix, false,
        (<any>ol).vec.Mat4.fromTransform(this.tmpMat4_, projectionTexCoordMatrix));
    gl.uniformMatrix4fv(locations.u_offsetScaleMatrix, false,
        (<any>ol).vec.Mat4.fromTransform(this.tmpMat4_, offsetScaleMatrix));
    gl.uniformMatrix4fv(locations.u_offsetRotateMatrix, false,
        (<any>ol).vec.Mat4.fromTransform(this.tmpMat4_, offsetRotateMatrix));
    gl.uniform1f(locations.u_opacity, opacity);             
    this.u_zIndex = locations.u_zIndex;

    // draw!
    var result;
    if (featureCallback === undefined) { 
        this.drawReplay(gl, context, skippedFeaturesHash, false);
    } else {
        // draw feature by feature for the hit-detection
        result = this.drawHitDetectionReplay(gl, context, skippedFeaturesHash,
        featureCallback, oneByOne, opt_hitExtent);
    }

    // disable the vertex attrib arrays
    this.shutDownProgram(gl, locations);    
  
    return result;
  } 

  public setUpProgram(gl, context, size, pixelRatio) {
    // get the program
    var fragmentShader, vertexShader;
    fragmentShader = fragment;
    vertexShader = vertex;
    var program = context.getProgram(fragmentShader, vertexShader);

    // get the locations
    var locations;
    if (!this.defaultLocations_) {
        locations = new Locations(gl, program);
        this.defaultLocations_ = locations;
    } else {
        locations = this.defaultLocations_;
    }

    context.useProgram(program);

    // enable the vertex attrib arrays
    gl.enableVertexAttribArray(locations.a_position);
    gl.vertexAttribPointer(locations.a_position, 2, (<any>ol).webgl.FLOAT,
        false, 8, 0);

    return locations;
  }

  public createTextures(textures, images, texturePerImage, gl) {
    var texture, image, uid, i;
    var ii = images.length;
    for (i = 0; i < ii; ++i) {
        image = images[i];

        uid = (<any>ol).getUid(image).toString();
        if (uid in texturePerImage) {
            texture = texturePerImage[uid];
        } else {
            if (!this.isPowerOfTwo(image.width) || !this.isPowerOfTwo(image.height)) {
                // Scale up the texture to the next highest power of two dimensions.
                var canvas = document.createElement("canvas");
                canvas.width = this.nextHighestPowerOfTwo(image.width);
                canvas.height = this.nextHighestPowerOfTwo(image.height);
                var ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0, image.width, image.height);
                image = canvas;
                this.imageHeight = image.height;
                this.imageWidth = image.width;
            }
            
            texture = (<any>ol).webgl.Context.createTexture(
                gl, image, gl.REPEAT, gl.REPEAT, gl.NEAREST);
            texturePerImage[uid] = texture;
        }
        textures[i] = texture;
    }
  }

  public drawReplay(gl, context, skippedFeaturesHash, hitDetection) {
    var textures = hitDetection ? this.getHitDetectionTextures() : this.getTextures();
    var groupIndices = hitDetection ? this.hitDetectionGroupIndices : this.groupIndices;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    if (!(<any>ol).obj.isEmpty(skippedFeaturesHash)) {
        this.drawReplaySkipping(
            gl, context, skippedFeaturesHash, textures, groupIndices);
    } else {
        var i, ii, start;
        for (i = 0, ii = textures.length, start = 0; i < ii; ++i) {
            gl.bindTexture((<any>ol).webgl.TEXTURE_2D, textures[i]);
            // gl.uniform1f(this.u_zIndex, 1);
            var end = groupIndices[i];
            this.drawElements(gl, context, start, end);
            start = end;
        }
    }

    gl.blendFuncSeparate(
        (<any>ol).webgl.SRC_ALPHA, (<any>ol).webgl.ONE_MINUS_SRC_ALPHA,
        (<any>ol).webgl.ONE, (<any>ol).webgl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.BLEND);
  }

  public isPowerOfTwo(x) {
    return (x & (x - 1)) == 0;
  }
 
  public nextHighestPowerOfTwo(x) {
    --x;
    for (var i = 1; i < 32; i <<= 1) {
        x = x | x >> i;
    }
    return x + 1;
  }
}
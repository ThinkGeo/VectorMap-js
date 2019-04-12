export class GeoImageReplay extends ((<any>ol).render.webgl.ImageReplay as { new(tolerance: number, maxExtent: any, declutterTree: any) }) {
  constructor(tolerance, maxExtent, declutterTree){
    super(tolerance, maxExtent, declutterTree);
  } 
  
  public finish(context, textureCache){
    var gl = context.getGL();

    this.groupIndices.push(this.indices.length);
    this.hitDetectionGroupIndices.push(this.indices.length);

    // create, bind, and populate the vertices buffer
    this.verticesBuffer = new (<any>ol).webgl.Buffer(this.vertices);

    // create, bind, and populate the indices buffer
    this.indicesBuffer = new (<any>ol).webgl.Buffer(this.indices);

    // create textures
    this.textures_ = [];

    this.createTextures(this.textures_, this.images_, textureCache, gl);

    this.createTextures(this.hitDetectionTextures_, this.hitDetectionImages_,
        this.texturePerImage, gl);

    this.images_ = [];
    this.hitDetectionImages_ = [];
  }

  public createTextures = function (textures, images, textureCache, gl) {
    var texture, image, uid, i, textureCacheEntry;
    var ii = images.length;
    for (i = 0; i < ii; ++i) {
        image = images[i];

        uid = (<any>ol).getUid(image).toString();
        if (textureCache.containsKey(uid)) {
            textureCacheEntry = textureCache.get(uid);
            texture = textureCacheEntry.texture;
        } else {
            texture = (<any>ol).webgl.Context.createTexture(
                gl, image, (<any>ol).webgl.CLAMP_TO_EDGE, (<any>ol).webgl.CLAMP_TO_EDGE, this.label? gl.NEAREST: gl.LINEAR);
            textureCache.set(uid, {
                texture
            });
        }
        textures[i] = texture;
    }
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

  public replay(context, viewRotation, skippedFeaturesHash, screenXY){
    this.viewRotation_ = viewRotation;
    this.webglReplay_(context, 
        skippedFeaturesHash, undefined, undefined, screenXY);
  }

  public webglReplay_(context, skippedFeaturesHash, featureCallback, opt_hitExtent, screenXY) {
    var frameState = context.frameState;
    var layerState = context.layerState;
    var viewState = frameState.viewState;
    var center = viewState.center;
    var size = frameState.size;
    var pixelRatio = frameState.pixelRatio;
    var resolution = viewState.resolution;
    var opacity = layerState.opacity;
    var rotation = viewState.rotation;
    var oneByOne = undefined;

    var gl = context.getGL();
    var tmpStencil, tmpStencilFunc, tmpStencilMaskVal, tmpStencilRef, tmpStencilMask,
        tmpStencilOpFail, tmpStencilOpPass, tmpStencilOpZFail;
   
    if (this.lineStringReplay) {
        tmpStencil = gl.isEnabled(gl.STENCIL_TEST);
        tmpStencilFunc = gl.getParameter(gl.STENCIL_FUNC);
        tmpStencilMaskVal = gl.getParameter(gl.STENCIL_VALUE_MASK);
        tmpStencilRef = gl.getParameter(gl.STENCIL_REF);
        tmpStencilMask = gl.getParameter(gl.STENCIL_WRITEMASK);
        tmpStencilOpFail = gl.getParameter(gl.STENCIL_FAIL);
        tmpStencilOpPass = gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);
        tmpStencilOpZFail = gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);

        gl.enable(gl.STENCIL_TEST);
        gl.clear(gl.STENCIL_BUFFER_BIT);
        gl.stencilMask(255);
        gl.stencilFunc(gl.ALWAYS, 1, 255);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);

        // this.lineStringReplay.replay(context,
        //     center, resolution, rotation, size, pixelRatio,
        //     opacity, skippedFeaturesHash,
        //     featureCallback, oneByOne, opt_hitExtent);

        // gl.stencilMask(0);
        // gl.stencilFunc(context.NOTEQUAL, 1, 255);
    }

    context.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer, false);
    context.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer, false);

    var locations = this.setUpProgram(gl, context, size, pixelRatio);
        
    // set the "uniform" values
    var projectionMatrix = (<any>ol).transform.reset(this.projectionMatrix_);
    (<any>ol).transform.scale(projectionMatrix, 2 / (resolution * size[0]), 2 / (resolution * size[1]));
    (<any>ol).transform.rotate(projectionMatrix, -rotation);
    (<any>ol).transform.translate(projectionMatrix, -(center[0] - screenXY[0]), -(center[1] - screenXY[1]));

    var offsetScaleMatrix = (<any>ol).transform.reset(this.offsetScaleMatrix_);
    (<any>ol).transform.scale(offsetScaleMatrix, 2/ size[0], 2/ size[1]);

    var offsetRotateMatrix = (<any>ol).transform.reset(this.offsetRotateMatrix_);
    if (rotation !== 0) {
        (<any>ol).transform.rotate(offsetRotateMatrix, -rotation);
    }

    gl.uniformMatrix4fv(locations.u_projectionMatrix, false,
        (<any>ol).vec.Mat4.fromTransform(this.tmpMat4_, projectionMatrix));
    gl.uniformMatrix4fv(locations.u_offsetScaleMatrix, false,
        (<any>ol).vec.Mat4.fromTransform(this.tmpMat4_, offsetScaleMatrix));
    gl.uniformMatrix4fv(locations.u_offsetRotateMatrix, false,
        (<any>ol).vec.Mat4.fromTransform(this.tmpMat4_, offsetRotateMatrix));
    gl.uniform1f(locations.u_opacity, opacity);             

    // FIXME replace this temp solution with text calculation in worker
    this.u_color = locations.u_color;

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
    
    if (this.lineStringReplay) {
        if (!tmpStencil) {
            gl.disable(gl.STENCIL_TEST);
        }
        gl.clear(gl.STENCIL_BUFFER_BIT);
        gl.stencilFunc(/** @type {number} */ (tmpStencilFunc),
            /** @type {number} */ (tmpStencilRef), /** @type {number} */ (tmpStencilMaskVal));
        gl.stencilMask(/** @type {number} */ (tmpStencilMask));
        gl.stencilOp(/** @type {number} */ (tmpStencilOpFail),
            /** @type {number} */ (tmpStencilOpZFail), /** @type {number} */ (tmpStencilOpPass));
        // gl.stencilMask(0);
    }
    return result;
  }

  public renderDeclutter_(declutterGroup, feature){
    if(declutterGroup && declutterGroup.length > 5){
      var groupCount = declutterGroup[4];
      if (groupCount == 1 || groupCount == declutterGroup.length - 5) {
          var box = {
              minX: /** @type {number} */ (declutterGroup[0]),
              minY: /** @type {number} */ (declutterGroup[1]),
              maxX: /** @type {number} */ (declutterGroup[2]),
              maxY: /** @type {number} */ (declutterGroup[3]),
              value: feature
          };

          if(!this.declutterTree.collides(box)){
              this.declutterTree.insert(box);
              for (var j = 5, jj = declutterGroup.length; j < jj; ++j) {
                  var declutter = declutterGroup[j];
                  var options = declutter[0];
                  var this$1 = declutter[1];
                  this$1.tmpOptions.push(options);
              }
          }
          declutterGroup.length = 5;
          (<any>ol.extent).createOrUpdateEmpty(declutterGroup);
      }
    }
  }

  public drawLineStringImage(geometry, feature, frameState, declutterGroup) {
    var offset = 0;
    var stride = 2;
    var resolution = frameState.currentResolution;
    var lineStringCoordinates = geometry.getFlatCoordinates();
    var end = lineStringCoordinates.length;
    var pathLength = (<any>ol.geom).flat.length.lineString(lineStringCoordinates, offset, end, stride, resolution);
    let width = this.width; 

    if (width * 4 <= pathLength) {  
        this.extent = (<any>ol.extent).createOrUpdateEmpty();         
        var pixelDistance = 100;
        var centerPoint = pathLength / 2;
        var pointArray = [];
        pointArray.push(centerPoint);

        if(frameState.currentResolution < 1){
            this.findCenterPoints(0, centerPoint, pixelDistance, pointArray);
            this.findCenterPoints(centerPoint, pathLength, pixelDistance, pointArray);
        }

        for (var len = 0; len < pointArray.length; len++) {
            let tempDeclutterGroup;
            if (declutterGroup) {
                // tempDeclutterGroup = featureCallback ? null : declutterGroup.slice(0);
                tempDeclutterGroup = declutterGroup.slice(0);
            }                          

            var startM = pointArray[len] - width / 2;                    
            let parts = (<any>ol.geom).flat.textpath.imagelineString(lineStringCoordinates, offset, end, 2, width, startM, resolution);
            
            if(parts){
                for(let i = 0; i < parts.length; i++){
                    var part = parts[i];
                    this.anchorX = part[2];
                    this.rotation = part[3];
                    this.replayImage_(frameState, declutterGroup, [part[0], part[1]], this.scale);
                    this.renderDeclutter_(declutterGroup, feature);
                }   
            }
        }
    }
  }

  public findCenterPoints(start, end, pixelDistance, pointArray){
    var distance = (end - start) / 2;
    if(distance > pixelDistance){
        var center = (end + start) / 2;
        pointArray.push(center);
        this.findCenterPoints(start, center, pixelDistance, pointArray);
        this.findCenterPoints(center, end, pixelDistance, pointArray);
    }
  }

  public replayImage_(frameState, declutterGroup, flatCoordinates, scale){
    var box = [];
    var screenXY = this.screenXY;
    var pixelCoordinate = (<any>ol).transform.apply(frameState.coordinateToPixelTransform, [flatCoordinates[0] - this.origin[0] + screenXY[0], flatCoordinates[1] - this.origin[1] + screenXY[1]]);
    var canvas = frameState.context.canvas_;
    var rotation = this.rotation;            

    var offsetX = -scale * (this.anchorX);
    var offsetY = -scale * (this.height - this.anchorY);
    box[0] = pixelCoordinate[0] + offsetX;
    box[3] = pixelCoordinate[1] - offsetY;

    offsetX = scale * (this.width - this.anchorX);
    offsetY = scale * this.anchorY;        
    box[2] = pixelCoordinate[0] + offsetX;
    box[1] = pixelCoordinate[1] - offsetY;

    var intersects = box[0] <= canvas.width && box[2] >= 0 && box[1] <= canvas.height && box[3] >= 0;
    if(declutterGroup){    
        if(!intersects && declutterGroup[4] == 1){
            return;
        }                
        (<any>ol).extent.extend(declutterGroup, box);
        
        var declutterArgs = [{
            flatCoordinates,
            rotation,
            scale,
            width: this.width,
            height: this.height,
            anchorX: this.anchorX,
            anchorY: this.anchorY,
            label: this.label,
            image: this.image,
            imageHeight: this.imageHeight,
            imageWidth: this.imageWidth,
            opacity: this.opacity,
            originX: this.originX,
            originY: this.originY
        }, this];
        declutterGroup.push(declutterArgs);
    }
  }
}
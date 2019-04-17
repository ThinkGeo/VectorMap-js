

import TextReplay from "ol/render/webgl/TextReplay"
import { getUid } from 'ol/util';
import Buffer from "ol/webgl/Buffer"
import {compose,reset , scale, rotate,apply,translate} from 'ol/transform.js';
import {CLAMP_TO_EDGE, FLOAT, TEXTURE_2D} from 'ol/webgl.js';

import { createOrUpdateEmpty,extend} from 'ol/extent';
import {create,fromTransform}  from "ol/vec/mat4"


import {createTexture} from "../../ol/webgl/Context"


export class GeoTextReplay extends TextReplay {
  constructor(tolerance, maxExtent, declutterTree){
    super(tolerance, maxExtent, declutterTree);
    this.declutterTree = declutterTree;
    this.startIndicesStyle = [];
    this.zCoordinates = [];
    this.indices =[];
    this.texturePerImage = {};
  } 
  
   finish(context){
    var gl = context.getGL();        
    this.groupIndices.push(this.indices.length);
    this.hitDetectionGroupIndices = this.groupIndices;

    // create, bind, and populate the vertices buffer
    this.verticesBuffer = new Buffer(this.vertices);

    // create, bind, and populate the indices buffer
    this.indicesBuffer = new Buffer(this.indices);

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

   replay(context, viewRotation, skippedFeaturesHash, screenXY){
    this.viewRotation_ = viewRotation;
    this.webglReplay_(context, 
        skippedFeaturesHash, undefined, undefined, screenXY);
  }

   webglReplay_(context, skippedFeaturesHash, featureCallback, opt_hitExtent, screenXY) {
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
    var projectionMatrix =reset(this.projectionMatrix_);
    scale(projectionMatrix, 2 / (resolution * size[0]), 2 / (resolution * size[1]));
    rotate(projectionMatrix, -rotation);
    translate(projectionMatrix, -(center[0] - screenXY[0]), -(center[1] - screenXY[1]));

    var offsetScaleMatrix =reset(this.offsetScaleMatrix_);
   scale(offsetScaleMatrix, 2/ size[0], 2/ size[1]);

    var offsetRotateMatrix = reset(this.offsetRotateMatrix_);
    if (rotation !== 0) {
      rotate(offsetRotateMatrix, -rotation);
    }

    gl.uniformMatrix4fv(locations.u_projectionMatrix, false,
      fromTransform(this.tmpMat4_, projectionMatrix));
    gl.uniformMatrix4fv(locations.u_offsetScaleMatrix, false,
      fromTransform(this.tmpMat4_, offsetScaleMatrix));
    gl.uniformMatrix4fv(locations.u_offsetRotateMatrix, false,
       fromTransform(this.tmpMat4_, offsetRotateMatrix));
    gl.uniform1f(locations.u_opacity, opacity);             

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

   renderDeclutter_(declutterGroup, feature){
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
          createOrUpdateEmpty(declutterGroup);
      }
    }
  }

   drawLineStringText(geometry, feature, frameState, declutterGroup) {
    var offset = 0;
    var stride = 2;
    var resolution = frameState.currentResolution;
    var text = this.text_;
    var maxAngle = this.maxAngle_;
    var lineStringCoordinates = geometry.getFlatCoordinates();
    var end = lineStringCoordinates.length;
    var pathLength = ol.geom.flat.length.lineString(lineStringCoordinates, offset, end, stride, resolution);
    let textLength = this.getTextSize_([text])[0];
    if(this.label){
      
        pathLength = textLength
    }

    if (textLength * 1.2 <= pathLength) {  
        let declutterGroups = [];
        this.extent =createOrUpdateEmpty();          
        var pixelDistance = 200;
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

            var startM = (pointArray[len] - textLength / 2);                    
            let parts = ol.geom.flat.textpath.lineString(lineStringCoordinates, offset, end, 2, text, this, startM, 
                    maxAngle, resolution);
            
            if(parts){
                for(let i = 0; i < parts.length; i++){
                    var part = parts[i];
                    var lines = part[4];
                    var textSize = this.getTextSize_([lines]);
                    this.width = textSize[0];
                    this.height = textSize[1];

                    this.replayCharImage_(frameState, tempDeclutterGroup, part);
                }   
                var canvas = frameState.context.canvas_;
                var intersects = tempDeclutterGroup[0] <= canvas.width && tempDeclutterGroup[2] >= 0 && tempDeclutterGroup[1] <= canvas.height && tempDeclutterGroup[3] >= 0;
                
                if(declutterGroup){    
                    if(!intersects && declutterGroup[4] == 1){
                        continue;
                    }          
                    declutterGroups.push(tempDeclutterGroup);
                }
            }
        }

        for (let d = 0; d < declutterGroups.length; d++) {
            let targetDeclutterGroup = declutterGroups[d];
            if (targetDeclutterGroup && targetDeclutterGroup.length > 5) {
                let targetExtent = [targetDeclutterGroup[0], targetDeclutterGroup[1], targetDeclutterGroup[2], targetDeclutterGroup[3]];
                // if (targetExtent[0] > tilePixelExtent[0] && targetExtent[1] > tilePixelExtent[3] && targetExtent[2] < tilePixelExtent[2] && targetExtent[3] < tilePixelExtent[1]) {
                this.renderDeclutter_(targetDeclutterGroup, feature);
                // }
            }
        }
    }
  }

   findCenterPoints(start, end, pixelDistance, pointArray){
    var distance = (end - start) / 2;
    if(distance > pixelDistance){
        var center = (end + start) / 2;
        pointArray.push(center);
        this.findCenterPoints(start, center, pixelDistance, pointArray);
        this.findCenterPoints(center, end, pixelDistance, pointArray);
    }
  }

   replayImage_(frameState, declutterGroup, flatCoordinates, scale){
    var box = [];
    var screenXY = this.screenXY;
    var pixelCoordinate = apply(frameState.coordinateToPixelTransform, [flatCoordinates[0] - this.origin[0] + screenXY[0], flatCoordinates[1] - this.origin[1] + screenXY[1]]);
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
    extend(declutterGroup, box);
        
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

   drawText(options) {
    var this$1 = this;
    var text = options.text;
    var label = options.label;
    if (text || label) {
        var offset = 0;
        var end = 2;
        var stride = 2;    
        
        // this.startIndices.push(this.indices.length);
        var flatCoordinates = options.flatCoordinates;
        if(label){  
            var image = label;
            this.originX = options.originX;
            this.originY = options.originY;
            this.width = options.width;
            this.height = options.height;
            // this.width = width + lineWidth;
            this.imageHeight = image.height;
            this.imageWidth = image.width;
            this.anchorX = options.anchorX;
            this.anchorY = options.anchorY;
            this.rotation = options.rotation;
            this.scale = options.scale;
            this.opacity = options.opacity;
            var currentImage;
           
            if (this.images_.length === 0) {
                this.images_.push(image);
            } else {
                currentImage = this.images_[this.images_.length - 1];
                if (getUid(currentImage) != getUid(image)) {
                    this.groupIndices.push(this.indices.length);
                    this.images_.push(image);
                }
            }
            
            this.drawText_(flatCoordinates, offset, end, stride);
        }else{
            // this.scale = 1;
           
            var glyphAtlas = options.currAtlas;
            var j, jj, currX, currY, charArr, charInfo;
            var anchorX = options.anchorX;
            var anchorY = options.anchorY;          
            var lineWidth = (this.state_.lineWidth / 2) * this.state_.scale * window.devicePixelRatio;
            this$1.rotation = options.rotation;
            currX = 0;
            currY = 0;
            charArr = text.split('');
            // return;
            for (j = 0, jj = charArr.length; j < jj; ++j) {
                charInfo = glyphAtlas.atlas.getInfo(charArr[j]);
    
                if (charInfo) {
                    var image = charInfo.image;    
                    this$1.anchorX = anchorX - currX;
                    this$1.anchorY = anchorY - currY;
                    this$1.originX = j === 0 ? charInfo.offsetX - lineWidth : charInfo.offsetX;
                    this$1.originY = charInfo.offsetY - 1;
                    this$1.height = glyphAtlas.height;
                    this$1.width = j === 0 || j === charArr.length - 1 ?
                        glyphAtlas.width[charArr[j]] + lineWidth : glyphAtlas.width[charArr[j]];
                    this$1.imageHeight = image.height;
                    this$1.imageWidth = image.width;
                    this$1.rotateWithView = 1;
                    if (this$1.images_.length === 0) {
                        this$1.images_.push(image);
                    } else {
                        var currentImage = this$1.images_[this$1.images_.length - 1];
                        if (getUid(currentImage) != getUid(image)) {
                            this$1.groupIndices.push(this$1.indices.length);
                            this$1.images_.push(image);
                        }
                    }
                    this$1.scale_ = 1 / window.devicePixelRatio;
                    this$1.drawText_(flatCoordinates, offset, end, stride);
                }
                currX += this$1.width;
            }
        }
    }
  }
  createTextures  (textures, images, texturePerImage, gl) {
    var texture, image, uid, i;
    var ii = images.length;
    for (i = 0; i < ii; ++i) {
        image = images[i];

        uid = ol.getUid(image).toString();
        if (uid in texturePerImage) {
            texture = texturePerImage[uid];
        } else {
            texture = createTexture(
                gl, image, CLAMP_TO_EDGE, CLAMP_TO_EDGE, this.label? gl.NEAREST: gl.LINEAR);
            texturePerImage[uid] = texture;
        }
        textures[i] = texture;
    }
};
}
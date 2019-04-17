
import {FLOAT} from "ol/webgl"
import {isEmpty} from "ol/obj"
import LineStringReplay from "ol/render/webgl/LineStringReplay"
import {create,fromTransform}  from "ol/vec/mat4"
import {compose,reset , scale, rotate,apply} from 'ol/transform.js';

import {translate} from 'ol/geom/flat/transform';
import {translate as olTranslate} from 'ol/transform';

import {asArray} from "ol/color";
import {equals} from "ol/array";
import { fragment, vertex } from './geoLineStringReplay/defaultshader';
import { Locations } from './geoLineStringReplay/defaultshader/Locations';
import {DEFAULT_LINECAP, DEFAULT_LINEDASH, DEFAULT_LINEDASHOFFSET,
    DEFAULT_LINEJOIN, DEFAULT_LINEWIDTH, DEFAULT_MITERLIMIT, DEFAULT_STROKESTYLE,
    triangleIsCounterClockwise} from 'ol/render/webgl.js';

export class GeoLineStringReplay extends LineStringReplay  {
    constructor(tolerance, maxExtent){
        super(tolerance, maxExtent);
        this.zCoordinates = [];
      } 
      
       replay(context, viewRotation, skippedFeaturesHash, screenXY){
        this.viewRotation_ = viewRotation;
        this.webglReplay_(context, 
            skippedFeaturesHash, undefined, undefined, screenXY);
      }
    

      drawLineString (lineStringGeometry, feature, strokeStyle, options) {
        var flatCoordinates = lineStringGeometry.getFlatCoordinates();
        function bearing(seg){
            var firstPoint = [seg.x1,seg.y1];
            var secondPoint = [seg.x2,seg.y2];
            var angle = Math.atan2((secondPoint[1] - firstPoint[1]),(secondPoint[0] - firstPoint[0]));
            angle = angle?angle:angle+0.0001;
            return angle;
        }
        function getSegmentFromPixel(coordPixel){
            var segments = [];
            var seg = null;
            var ps = null;
            var pt = null;
            for( var i = 0; i < coordPixel.length-1; i ++ ){
                ps = coordPixel[i];
                pt = coordPixel[ i+1];
                seg = {
                    x1:ps[0],
                    y1:ps[1],
                    x2:pt[0],
                    y2:pt[1]
                }
                var length = Math.sqrt(Math.pow((seg.x2 - seg.x1), 2) + Math.pow((seg.y2 - seg.y1), 2));
                var angle = bearing( seg );
                seg.pixelLength = length;
                seg.pixelAngle = angle;
                // seg.startToEndLength = length;
                segments.push( seg );
            }
            return segments;
        }
        function getPixelFromCoord ( coordLLs ){
            var coordPxs = [];
            var pts = [];
            var pxs = null;
            for( var i = 0; i < coordLLs.length; i++ ) {
                pts = coordLLs[i];
                pxs =apply(options.frameState.coordinateToPixelTransform,
                pts.slice(0, 2));
                coordPxs.push( pxs );
            }
            return coordPxs;
        }
        function getNeedPixelFromLine( seg,chaLength,lastSeg ) {
            var segLen = seg.pixelLength;
            if (lastSeg) {
                var numTemp = Math.floor(lastSeg.pixelLength / chaLength);
                if(lastSeg.residueLength){
                    var startLength=chaLength-lastSeg.residueLength;
                    
                }else{
                    var startLength =chaLength-(lastSeg.pixelLength - numTemp * chaLength);
                    
                }
                var num =(segLen - startLength) / chaLength ;
                var x = seg.x1 + (seg.x2 - seg.x1) * startLength / segLen;
                var y = seg.y1 + (seg.y2 - seg.y1) * startLength / segLen;
                seg.pixelLength = segLen - startLength
                
            } else {
                startLength = 0;
                var x = seg.x1;
                var y = seg.y1;
                var num =segLen / chaLength;
            }
        
            var xOper = true;
            var yOper = false;
            var xCha = seg.x2 - x;
            var yCha = seg.y2 - y;
            var xAver = xCha / num;
            var yAver = yCha / num;
            var pixelArr = [];
        
            var xOrig = x;
            var yOrin = y;
            var xEnd = seg.x2;
            var yEnd = seg.y2;
        
            for (var i = 0; i < num; i++) {
                x = xAver * i + xOrig;
                y = yAver * i + yOrin;
                pixelArr.push(x);
                pixelArr.push(y);
            }
            return pixelArr;
        
        }
        function myCreateSegDirection(coordPxs,chaLength){
            var coordArr=[];
            for(var i=0;i<coordPxs.length;i+=2){
                var coord=[coordPxs[i],coordPxs[i+1]];
                coordArr.push(coord);
            }
            coordArr = getPixelFromCoord(coordArr);
            var segments =getSegmentFromPixel( coordArr );
            var tempLength = {
                pixelLength:0,
                x1:0,
                y1:0,
                x2:0,
                y2:0
            };
            var nowSeg = null;
            var nowLengthFlag = true;
            var findPixelArr = [];
            for( var i = 0; i < segments.length; i++ ) {
                nowSeg = segments[i];
                if( nowSeg.pixelLength < chaLength ) {
                    if(nowLengthFlag){
                        
                    }
                    nowLengthFlag=false;
                    tempLength.pixelLength += nowSeg.pixelLength;
                }
                else {
                //   nowLengthFlag = true;
                    var splitPixelArr = getNeedPixelFromLine( segments[i],chaLength ,segments[i - 1]);
                    findPixelArr = findPixelArr.concat( splitPixelArr );
                }
                if(tempLength.pixelLength > chaLength) {
                    tempLength.x2=segments[i].x2;
                    tempLength.y2=segments[i].y2;
                    tempLength.x1=segments[i].x1;
                    tempLength.y1=segments[i].y1;
                    var residueLength=tempLength.pixelLength-chaLength
                    var lastSeg={
                        residueLength:residueLength
                    }
                    var splitPixelArr = getNeedPixelFromLine( tempLength,chaLength,lastSeg);
                    findPixelArr = findPixelArr.concat( splitPixelArr );
                    tempLength.pixelLength=0;
                }
            }
            return findPixelArr;
        }
        function getLineStruct(ptStart, ptEnd, radius){
            var angle = getRotation(ptEnd, ptStart) - Math.PI/2;
            var start = getPointByAngle(ptStart, radius, angle);
            var end  = getPointByAngle(ptEnd, radius, angle);
            var angle_ = getRotation(ptEnd, ptStart) + Math.PI/2;
            var start_ = getPointByAngle(ptStart, radius, angle_);
            var end_  = getPointByAngle(ptEnd, radius, angle_);
            var arr=start.concat(start_,end,end);
            
            return arr
        }
        function getRotation(pt, ptCenter){
            var dx = pt[0] - ptCenter[0];
            var dy = pt[1] - ptCenter[1];			
            var dis = Math.sqrt(dx * dx + dy * dy);	
            if(dis == 0){ 
                return 0;
            }
            var q;
            if(dy > 0){    
                q = Math.acos(dx / dis);
            }else{        
                q = Math.PI * 2 - Math.acos(dx / dis);
            } 
            return q;
        }
        function getPointByAngle(ptCenter, radius, angle){
            var x = ptCenter[0] + radius * Math.cos(angle);
            var y = ptCenter[1] + radius * Math.sin(angle);
            return [x, y];
        }
        if(lineStringGeometry.properties_.class === 'rail' && lineStringGeometry.styleId.includes('c')){
                
            var strokeStyleWidth=strokeStyle.getWidth();
            var widthHalf =strokeStyleWidth / 2;
            var strokeStyleLineDash = strokeStyle.getLineDash();
            flatCoordinates=myCreateSegDirection(flatCoordinates,strokeStyleLineDash[1]);
            var arr=[];
            for(var i=0;i<flatCoordinates.length-2;i+=2){
                var start=[flatCoordinates[i],flatCoordinates[i+1]];
                var end =[flatCoordinates[i+2],flatCoordinates[i+3] ]
                arr=arr.concat(getLineStruct(start,end,widthHalf))
            }
            var result=[];
            for(var j=0;j<arr.length;j+=2){
                var a=arr.slice(j,j+2);
                var arrTemp=apply(options.frameState.pixelToCoordinateTransform,a );
                result.push(arrTemp[0],arrTemp[1]);
            }
            var tempCoordinates = result;
            for(var m=0;m<tempCoordinates.length;m+=4){
                var railWayChildCoord=tempCoordinates.slice(m,m+4);
                
                flatCoordinates=railWayChildCoord;
                drawLineString_.call(this, flatCoordinates);
            }
            return;
        }

        function drawLineString_(flatCoordinates){
            var stride = lineStringGeometry.getStride();
            if (this.isValid_(flatCoordinates, 0, flatCoordinates.length, stride)) {
                var clippedFlatCoordinates =translate(flatCoordinates, 0, flatCoordinates.length,
                    stride, -this.origin[0], -this.origin[1]);
                    
                if (this.state_.changed) {
                    var z_order = lineStringGeometry.properties_.layer;
                    var styleId = lineStringGeometry.styleId;
                                        
                    if(z_order == undefined){
                        z_order = 0;
                    }

                    z_order += 100;

                    if(styleId.includes('#c')){
                        z_order = 1 / (z_order + 0.5);
                    }else{
                        z_order = 1 / z_order;   
                    }

                    this.styleIndices_.push(this.indices.length);
                    this.zCoordinates.push(z_order);
                    this.state_.changed = false;
                }
                    this.startIndices.push(this.indices.length);
                    this.startIndicesFeature.push(feature);
                    this.drawCoordinates_(
                        clippedFlatCoordinates, 0, clippedFlatCoordinates.length, stride);
                }
            }
            drawLineString_.call(this, flatCoordinates)
        }
        drawMultiLineString(multiLineStringGeometry, feature){
            var indexCount = this.indices.length;
            var ends = multiLineStringGeometry.getEnds();
            ends.unshift(0);
            var flatCoordinates = multiLineStringGeometry.getFlatCoordinates();
            var stride = multiLineStringGeometry.getStride();
            var i, ii;
            // var extent = feature.getExtent();
            if (ends.length > 1) {
                for (i = 1, ii = ends.length; i < ii; ++i) {
                    if (this.isValid_(flatCoordinates, ends[i - 1], ends[i], stride)) {
                        var lineString = translate(flatCoordinates, ends[i - 1], ends[i],
                            stride, -this.origin[0], -this.origin[1]);
                        this.drawCoordinates_(
                            lineString, 0, lineString.length, stride);
                    }
                }
            }
            
            if (this.indices.length > indexCount) {
                this.startIndices.push(indexCount);
                this.startIndicesFeature.push(feature);
                if (this.state_.changed) {
                    var z_order = multiLineStringGeometry.properties_.layer;
                    var styleId = multiLineStringGeometry.styleId;

                    // for railway
                    if(z_order == undefined){
                        z_order = 0;
                    }
                    
                    z_order += 100;

                    if(styleId.includes('#c')){
                        z_order = 1 / (z_order + 0.5);
                    }else{
                        z_order = 1 / (z_order);   
                    }

                    this.zCoordinates.push(z_order);
                    this.styleIndices_.push(indexCount);
                    this.state_.changed = false;
                }
            }else if(this.state_.changed){
                this.state_.changed = false;
                this.styles_.pop();
            }
        }
        setFillStrokeStyle(fillStyle, strokeStyle,lineStringGeometry) {
            var strokeStyleLineCap = strokeStyle.getLineCap();
            this.state_.lineCap = strokeStyleLineCap !== undefined ?
                strokeStyleLineCap : DEFAULT_LINECAP;
            var strokeStyleLineDash = strokeStyle.getLineDash();
            this.state_.lineDash = strokeStyleLineDash ?
                strokeStyleLineDash : DEFAULT_LINEDASH;
            var strokeStyleLineDashOffset = strokeStyle.getLineDashOffset();
            this.state_.lineDashOffset = strokeStyleLineDashOffset ?
                strokeStyleLineDashOffset : DEFAULT_LINEDASHOFFSET;
            var strokeStyleLineJoin = strokeStyle.getLineJoin();
            this.state_.lineJoin = strokeStyleLineJoin !== undefined ?
                strokeStyleLineJoin : DEFAULT_LINEJOIN;
            var strokeStyleColor = strokeStyle.getColor();
            // if (!(strokeStyleColor instanceof CanvasGradient) &&
            //     !(strokeStyleColor instanceof CanvasPattern)) {
            if(strokeStyleColor){
                strokeStyleColor = asArray(strokeStyleColor).map(function (c, i) {
                    return i != 3 ? c / 255 : c;
                }) || DEFAULT_STROKESTYLE;
            } else {
                strokeStyleColor = DEFAULT_STROKESTYLE;
            }
            var strokeStyleWidth = strokeStyle.getWidth();
            if( lineStringGeometry && 
                lineStringGeometry.properties_.class === 'rail' && 
                lineStringGeometry.styleId.includes('c')){
                strokeStyleWidth = strokeStyleLineDash[0];
            }
            strokeStyleWidth = strokeStyleWidth !== undefined ?
                strokeStyleWidth : DEFAULT_LINEWIDTH;
            var strokeStyleMiterLimit = strokeStyle.getMiterLimit();
            strokeStyleMiterLimit = strokeStyleMiterLimit !== undefined ?
                strokeStyleMiterLimit : DEFAULT_MITERLIMIT;
            if (!this.state_.strokeColor || !equals(this.state_.strokeColor, strokeStyleColor) ||
                this.state_.lineWidth !== strokeStyleWidth || this.state_.miterLimit !== strokeStyleMiterLimit) {
                this.state_.changed = true;
                this.state_.strokeColor = strokeStyleColor;
                this.state_.lineWidth = strokeStyleWidth;
                this.state_.miterLimit = strokeStyleMiterLimit;
                this.styles_.push([strokeStyleColor, strokeStyleWidth, strokeStyleMiterLimit]);
                
           }
        };
       drawReplay(gl, context, skippedFeaturesHash, hitDetection){
        //Save GL parameters.
        // var tmpDepthFunc = /** @type {number} */ (gl.getParameter(gl.DEPTH_FUNC));
        // var tmpDepthMask = /** @type {boolean} */ (gl.getParameter(gl.DEPTH_WRITEMASK));

        if (!hitDetection) {
            gl.enable(gl.BLEND);
            // gl.enable(gl.DEPTH_TEST);
            // gl.depthMask(true);
            // gl.depthFunc(gl.NOTEQUAL);
        }

        if (!isEmpty(skippedFeaturesHash)) {
            this.drawReplaySkipping_(gl, context, skippedFeaturesHash);
        } else {
            // Draw by style groups to minimize drawElements() calls.
            var i, start, end, nextStyle;
            end = this.startIndices[this.startIndices.length - 1];
            for (i = this.styleIndices_.length - 1; i >= 0; --i) {
                start = this.styleIndices_[i];
                nextStyle = this.styles_[i];
                gl.uniform1f(this.u_zIndex, this.zCoordinates[i]);
                this.setStrokeStyle_(gl, nextStyle[0], nextStyle[1], nextStyle[2]);
                this.drawElements(gl, context, start, end);
                end = start;
            }
        }
        if (!hitDetection) {
            gl.disable(gl.BLEND);
            // gl.disable(gl.DEPTH_TEST);
            // gl.clear(gl.DEPTH_BUFFER_BIT);
            //Restore GL parameters.
            // gl.depthMask(tmpDepthMask);
            // gl.depthFunc(tmpDepthFunc);
        }
      }

       setUpProgram  (gl, context, size, pixelRatio) {
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
        gl.enableVertexAttribArray(locations.a_lastPos);
        gl.vertexAttribPointer(locations.a_lastPos, 2,FLOAT,
            false, 28, 0);

        gl.enableVertexAttribArray(locations.a_position);
        gl.vertexAttribPointer(locations.a_position, 2, FLOAT,
            false, 28, 8);

        gl.enableVertexAttribArray(locations.a_nextPos);
        gl.vertexAttribPointer(locations.a_nextPos, 2, FLOAT,
            false, 28, 16);

        gl.enableVertexAttribArray(locations.a_direction);
        gl.vertexAttribPointer(locations.a_direction, 1, FLOAT,
            false, 28, 24);

        // Enable renderer specific uniforms.
        gl.uniform2fv(locations.u_size, size);
        gl.uniform1f(locations.u_pixelRatio, pixelRatio);

        return locations;
     };

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
            // tmpStencil = gl.isEnabled(gl.STENCIL_TEST);
            // tmpStencilFunc = gl.getParameter(gl.STENCIL_FUNC);
            // tmpStencilMaskVal = gl.getParameter(gl.STENCIL_VALUE_MASK);
            // tmpStencilRef = gl.getParameter(gl.STENCIL_REF);
            // tmpStencilMask = gl.getParameter(gl.STENCIL_WRITEMASK);
            // tmpStencilOpFail = gl.getParameter(gl.STENCIL_FAIL);
            // tmpStencilOpPass = gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);
            // tmpStencilOpZFail = gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);
    
            // gl.enable(gl.STENCIL_TEST);
            // gl.clear(gl.STENCIL_BUFFER_BIT);
            // gl.stencilMask(255);
            // gl.stencilFunc(gl.ALWAYS, 1, 255);
            // gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
    
            // this.lineStringReplay.replay(context,
            //     center, resolution, rotation, size, pixelRatio,
            //     opacity, skippedFeaturesHash,
            //     featureCallback, oneByOne, opt_hitExtent);
    
            // gl.stencilMask(0);
            // gl.stencilFunc(context.NOTEQUAL, 1, 255);
        }
    
        context.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer, true);
        context.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer, true);
    
        var locations = this.setUpProgram(gl, context, size, pixelRatio);
            
        // set the "uniform" values
        var projectionMatrix = reset(this.projectionMatrix_);
        scale(projectionMatrix, 2 / (resolution * size[0]), 2 / (resolution * size[1]));
        rotate(projectionMatrix, -rotation);
        olTranslate(projectionMatrix, -(center[0] - screenXY[0]), -(center[1] - screenXY[1]));
    
        var offsetScaleMatrix =reset(this.offsetScaleMatrix_);
       scale(offsetScaleMatrix, 2/ size[0], 2/ size[1]);
    
        var offsetRotateMatrix =reset(this.offsetRotateMatrix_);
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

}
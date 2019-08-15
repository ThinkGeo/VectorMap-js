import { fragment, vertex } from './geoPolygonReplay/defaultshader';
import { Locations } from './geoPolygonReplay/defaultshader/Locations';
import { GeoLineStringReplay } from './geoLineStringReplay';
import earcut from '../webgl/earcut';

export class GeoPolygonReplay extends ((<any>ol).render.webgl.PolygonReplay as { new(tolerance: number, maxExtent: any) }) {
  constructor(tolerance, maxExtent){
    super(tolerance, maxExtent);
    
    this.lineStringReplay = new GeoLineStringReplay(tolerance, maxExtent);
  } 

  public replay(context, center, resolution, rotation, size, pixelRatio, opacity, skippedFeaturesHash,
    featureCallback, oneByOne, opt_hitExtent, screenXY) {

    var gl = context.getGL();
    var tmpStencil, tmpStencilFunc, tmpStencilMaskVal, tmpStencilRef, tmpStencilMask,
        tmpStencilOpFail, tmpStencilOpPass, tmpStencilOpZFail;
    
    if (this.lineStringReplay && this.lineStringReplay.indicesBuffer.getArray().length) {
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

        this.lineStringReplay.replay(context,
            center, resolution, rotation, size, pixelRatio,
            opacity, skippedFeaturesHash,
            featureCallback, oneByOne, opt_hitExtent, screenXY);

        gl.stencilMask(0);
        // gl.stencilFunc(context.NOTEQUAL, 1, 255);
    }

    context.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer, true);
    context.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer, true);

    var locations = this.setUpProgram(gl, context, size, pixelRatio);
        
    // set the "uniform" values
    var projectionMatrix = (<any>ol).transform.reset(this.projectionMatrix_);
    (<any>ol).transform.scale(projectionMatrix, 2 / (resolution * size[0]), 2 / (resolution * size[1]));
    (<any>ol).transform.rotate(projectionMatrix, -rotation);
    
    if(!screenXY){
        (<any>ol).transform.translate(projectionMatrix, -(center[0] - this.origin[0]), -(center[1] - this.origin[1]));
    }else{
        (<any>ol).transform.translate(projectionMatrix, -(center[0] - screenXY[0]), -(center[1] - screenXY[1]));
    }

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
    
    if (this.lineStringReplay && this.lineStringReplay.indicesBuffer.getArray().length) {
        if (!tmpStencil) {
            gl.disable(gl.STENCIL_TEST);
        }
        gl.clear(gl.STENCIL_BUFFER_BIT);
        gl.stencilFunc(/** @type {number} */ (tmpStencilFunc),
            /** @type {number} */ (tmpStencilRef), /** @type {number} */ (tmpStencilMaskVal));
        gl.stencilMask(/** @type {number} */ (tmpStencilMask));
        gl.stencilOp(/** @type {number} */ (tmpStencilOpFail),
            /** @type {number} */ (tmpStencilOpZFail), /** @type {number} */ (tmpStencilOpPass));
        gl.stencilMask(0);
    }

    return result;
  }  

  public drawReplay(gl, context, skippedFeaturesHash, hitDetection) {
    if (!hitDetection) {
        // gl.enable(gl.BLEND);
    }

    if (!(<any>ol).obj.isEmpty(skippedFeaturesHash)) {
        this.drawReplaySkipping_(gl, context, skippedFeaturesHash);
    } else {
        //Draw by style groups to minimize drawElements() calls.
        var i, start, end, nextStyle;
        for (i = 0; i < this.styleIndices_.length; ++i) {                
            start = this.styleIndices_[i];
            end = this.styleIndices_[i + 1] || this.startIndices[this.startIndices.length - 1];
            nextStyle = this.styles_[i];
            gl.uniform1f(this.u_zIndex, this.zCoordinates[i] ? (0.1 / this.zCoordinates[i]) : 0);
            this.setFillStyle_(gl, nextStyle);
            this.drawElements(gl, context, start, end);
        }
    }
    if (!hitDetection) {
        // gl.disable(gl.BLEND);
    }
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

  public drawMultiPolygon(multiPolygonGeometry, feature) {
    var endss = multiPolygonGeometry.getEndss();
    var stride = multiPolygonGeometry.getStride();
    var currIndex = this.indices.length;
    var currLineIndex = this.lineStringReplay.getCurrentIndex();
    var flatCoordinates = multiPolygonGeometry.getFlatCoordinates();
    var i, ii, j, jj;
    var start = 0;
    for (i = 0, ii = endss.length; i < ii; ++i) {
        var ends = endss[i];
        if (ends.length > 0) {
            var outerRing = (<any>ol.geom).flat.transform.translate(flatCoordinates, start, ends[0],
                stride, -this.origin[0], -this.origin[1]);
            if (outerRing.length) {
                var holes = [];
                var holeFlatCoords;
                for (j = 1, jj = ends.length; j < jj; ++j) {
                    if (ends[j] !== ends[j - 1]) {
                        holeFlatCoords = (<any>ol.geom).flat.transform.translate(flatCoordinates, ends[j - 1],
                            ends[j], stride, -this.origin[0], -this.origin[1]);
                        holes.push(holeFlatCoords);
                    }
                }
                this.lineStringReplay.drawPolygonCoordinates(outerRing, holes, stride);
                this.drawCoordinates_(outerRing, holes, stride);
            }
        }
        start = ends[ends.length - 1];
    }
    if (this.indices.length > currIndex) {
        this.startIndices.push(currIndex);
        this.startIndicesFeature.push(feature);
        if (this.state_.changed) {
            this.styleIndices_.push(currIndex);
            this.state_.changed = false;
        }
    }
    if (this.lineStringReplay.getCurrentIndex() > currLineIndex) {
        this.lineStringReplay.setPolygonStyle(feature, currLineIndex);
    }
  }

  public drawCoordinates_(flatCoordinates, holeFlatCoordinates, stride) {
    var coords = flatCoordinates.slice(0, flatCoordinates.length - stride);
    var holeIndices = [];
    for (var i = 0; i < holeFlatCoordinates.length; i++) {
        var holeCoords = holeFlatCoordinates[i];
        holeIndices.push(coords.length / stride);
        for (var j = 0; j < holeCoords.length - stride; j++) {
            coords.push(holeCoords[j]);
        }
    }
    // vertices only hold x,y values
    var baseIndex = this.vertices.length / 2;
    if (stride === 2) {
        Array.prototype.push.apply(this.vertices, coords);
    } else {
        for (var i = 0; i < coords; i += stride) {
            this.vertices.push(coords[i], coords[i + 1]);
        }
    }
    var triangles = earcut(coords, holeIndices, stride);
    triangles = triangles.map(function (i) { return i + baseIndex; });
    Array.prototype.push.apply(this.indices, triangles);
  }

  public drawPolygon(polygonGeometry, feature) {
    var ends = polygonGeometry.getEnds();
    var stride = polygonGeometry.getStride();
    var extent = polygonGeometry.getExtent();
    
    if (ends.length > 0) {            
        var flatCoordinates = polygonGeometry.getFlatCoordinates().map(Number);     
        var index = 0;
        var outers = [];
        var outerRing = [];
        var isClockwise;
        if(!outers[index]){
            outers[index] = [];
        }

        if(ends[0] > 6) {
            outerRing = (<any>ol.geom).flat.transform.translate(flatCoordinates, 0, ends[0],
                stride, -this.origin[0], -this.origin[1], undefined, extent, true);         
            // FIXME it is also a anticlockwise, we don't judge for efficiency
            outers[index].push(outerRing);
        }else{
            outers[index].push([]);
        }
        
        var holes = [];
        var i, ii, holeFlatCoords;
        for (i = 1, ii = ends.length; i < ii; ++i) {
            if (ends[i] !== ends[i - 1] && (ends[i] - ends[i - 1] > 6)) {
                holeFlatCoords = (<any>ol.geom).flat.transform.translate(flatCoordinates, ends[i - 1],
                    ends[i], stride, -this.origin[0], -this.origin[1], undefined, extent, true);
                if(holeFlatCoords.length > 6){
                    isClockwise = (<any>ol.geom).flat.orient.linearRingIsClockwise(holeFlatCoords, 0, holeFlatCoords.length, stride);
                    if(isClockwise){
                        if(!outers[++index]){
                            outers[index] = [];
                        }
                        outers[index].push(holeFlatCoords);
                    }else{
                        outers[index].push(holeFlatCoords);
                    }
                }
            }
        }
        
        {
            this.startIndices.push(this.indices.length);
            this.startIndicesFeature.push(feature);

            if (this.state_.changed) {
                this.zCoordinates.push(feature.zCoordinate);
                this.styleIndices_.push(this.indices.length);
                this.state_.changed = false;
            }
            if(this.lineStringReplay){
                // this.lineStringReplay.setPolygonStyle(feature);
                // this.lineStringReplay.drawPolygonCoordinates(outerRing, holes, stride);
            }

            for(let j = 0; j < outers.length; j++){
                var outer = outers[j];
                this.drawCoordinates_(outer[0], outer.slice(1, outer.length), stride);
            }
        }

        {
            // if(holes.length > 0 && feature.properties_.layerName == 'building'){
            //     this.styles_.push(this.styles_[0]);
            //     this.zCoordinates.push(feature.zCoordinate);
            //     this.styleIndices_.push(this.indices.length);
            //     this.state_.changed = false;
            // }              
        }
    }
  }
}
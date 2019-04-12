import { fragment, vertex } from './geoPolygonReplay/defaultshader';
import { Locations } from './geoPolygonReplay/defaultshader/Locations';

export class GeoPolygonReplay extends ((<any>ol).render.webgl.PolygonReplay as { new(tolerance: number, maxExtent: any) }) {
  constructor(tolerance, maxExtent){
    super(tolerance, maxExtent);
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

    context.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    context.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);

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

  public drawReplay(gl, context, skippedFeaturesHash, hitDetection) {
    if (!hitDetection) {
        gl.enable(gl.BLEND);
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
            gl.uniform1f(this.u_zIndex, (0.1 / this.zCoordinates[i]));
            this.setFillStyle_(gl, nextStyle);
            this.drawElements(gl, context, start, end);
        }
    }
    if (!hitDetection) {
        gl.disable(gl.BLEND);
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
}
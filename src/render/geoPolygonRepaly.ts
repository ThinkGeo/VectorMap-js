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

    context.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer, true);
    context.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer, true);

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
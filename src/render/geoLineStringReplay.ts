import { fragment, vertex } from './geoLineStringReplay/defaultshader';
import { Locations } from './geoLineStringReplay/defaultshader/Locations';

export class GeoLineStringReplay extends ((<any>ol).render.webgl.LineStringReplay as { new(tolerance: number, maxExtent: any) }) {
    constructor(tolerance, maxExtent) {
        super(tolerance, maxExtent);
    }

    public drawReplay(gl, context, skippedFeaturesHash, hitDetection) {
        //Save GL parameters.
        // var tmpDepthFunc = /** @type {number} */ (gl.getParameter(gl.DEPTH_FUNC));
        // var tmpDepthMask = /** @type {boolean} */ (gl.getParameter(gl.DEPTH_WRITEMASK));

        if (!hitDetection) {
            // gl.enable(gl.BLEND);
            // gl.enable(gl.DEPTH_TEST);
            // gl.depthMask(true);
            // gl.depthFunc(gl.NOTEQUAL);
        }

        if (!(<any>ol).obj.isEmpty(skippedFeaturesHash)) {
            this.drawReplaySkipping_(gl, context, skippedFeaturesHash);
        } else {
            // Draw by style groups to minimize drawElements() calls.
            var i, start, end, nextStyle;
            end = this.startIndices[this.startIndices.length - 1];
            for (i = this.styleIndices_.length - 1; i >= 0; --i) {
                start = this.styleIndices_[i];
                nextStyle = this.styles_[i];
                // the u_index extent is -0.9999999 to 0.9999999.Objects with smaller values are closer to the eye.
                // when the values are equal, the object drawn first is closer to the eye.

                var uZindex =  (this.zCoordinates[i] ? 999999 - this.zCoordinates[i] : 0)/1000000;
                uZindex = parseFloat(uZindex);
                gl.uniform1f(this.u_zIndex, uZindex);
                this.setStrokeStyle_(gl, nextStyle[0], nextStyle[1], nextStyle[2]);
                this.drawElements(gl, context, start, end);
                end = start;
            }
        }
        if (!hitDetection) {
            // gl.disable(gl.BLEND);
            // gl.disable(gl.DEPTH_TEST);
            // gl.clear(gl.DEPTH_BUFFER_BIT);
            //Restore GL parameters.
            // gl.depthMask(tmpDepthMask);
            // gl.depthFunc(tmpDepthFunc);
        }
    }

    public setUpProgram = function (gl, context, size, pixelRatio) {
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
        gl.vertexAttribPointer(locations.a_lastPos, 2, (<any>ol).webgl.FLOAT,
            false, 28, 0);

        gl.enableVertexAttribArray(locations.a_position);
        gl.vertexAttribPointer(locations.a_position, 2, (<any>ol).webgl.FLOAT,
            false, 28, 8);

        gl.enableVertexAttribArray(locations.a_nextPos);
        gl.vertexAttribPointer(locations.a_nextPos, 2, (<any>ol).webgl.FLOAT,
            false, 28, 16);

        gl.enableVertexAttribArray(locations.a_direction);
        gl.vertexAttribPointer(locations.a_direction, 1, (<any>ol).webgl.FLOAT,
            false, 28, 24);

        // Enable renderer specific uniforms.
        gl.uniform2fv(locations.u_size, size);
        gl.uniform1f(locations.u_pixelRatio, pixelRatio);

        return locations;
    };

    public replay(context, center, resolution, rotation, size, pixelRatio, opacity, skippedFeaturesHash,
        featureCallback, oneByOne, opt_hitExtent, screenXY) {

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
        var projectionMatrix = (<any>ol).transform.reset(this.projectionMatrix_);
        (<any>ol).transform.scale(projectionMatrix, 2 / (resolution * size[0]), 2 / (resolution * size[1]));
        (<any>ol).transform.rotate(projectionMatrix, -rotation);

        if (!screenXY) {
            (<any>ol).transform.translate(projectionMatrix, -(center[0] - this.origin[0]), -(center[1] - this.origin[1]));
        } else {
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

        if (this.lineStringReplay) {
            if (!tmpStencil) {
                gl.disable(gl.STENCIL_TEST);
            }
            gl.clear(gl.STENCIL_BUFFER_BIT);
            gl.stencilFunc(/** @type {number} */(tmpStencilFunc),
            /** @type {number} */(tmpStencilRef), /** @type {number} */(tmpStencilMaskVal));
            gl.stencilMask(/** @type {number} */(tmpStencilMask));
            gl.stencilOp(/** @type {number} */(tmpStencilOpFail),
            /** @type {number} */(tmpStencilOpZFail), /** @type {number} */(tmpStencilOpPass));
            // gl.stencilMask(0);
        }

        return result;
    }
}
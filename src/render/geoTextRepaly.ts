import { fragment, vertex } from './geoTextureReplay/defaultshader';
import { Locations } from './geoTextureReplay/defaultshader/Locations';
import { lineString as textpathLineString } from '../geom/flat/textpath.js';
import { lineStringWithLabel as textpathLineStringWithLabel } from '../geom/flat/textpath.js';
import { lineString as lengthLineString } from '../geom/flat/length.js';
import { imagelineString as textpathImageLineString } from '../geom/flat/textpath.js';


export class GeoTextReplay extends ((<any>ol).render.webgl.TextReplay as { new(tolerance: number, maxExtent: any, declutterTree: any) }) {
    constructor(tolerance, maxExtent, declutterTree) {
        super(tolerance, maxExtent, declutterTree);
        this.startIndicesFeatures_ = [];
        this.startIndicesStyles_ = [];
        this.widths_ = {};
        this.heights_ = {};
        this.measureSpan;
    }

    public finish(context) {
        var gl = context.getGL();
        this.groupIndices.push(this.indices.length);
        this.hitDetectionGroupIndices = this.groupIndices;

        // create, bind, and populate the vertices buffer
        this.verticesBuffer = new (<any>ol).webgl.Buffer(this.vertices);

        // create, bind, and populate the indices buffer
        this.indicesBuffer = new (<any>ol).webgl.Buffer(this.indices);

        // create textures
        /** @type {Object.<string, WebGLTexture>} */
        this.textures_ = [];

        for (var uid in this.texturePerImage) {
            gl.deleteTexture(this.texturePerImage[uid]);
        }
        this.texturePerImage = {};

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

    public replay(context, center, resolution, rotation, size, pixelRatio, opacity, skippedFeaturesHash,
        featureCallback, oneByOne, opt_hitExtent, screenXY) {
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

    public declutterRepeat_(context, screenXY) {
        var startIndicesFeatures_ = this.startIndicesFeatures_;
        var startIndicesStyles_ = this.startIndicesStyles_;
        var frameState = context.frameState;
        var pixelRatio = frameState.pixelRatio;
        this.screenXY = screenXY;
        this.startIndicesFeature = [];
        // haven't used currently.
        this.startIndicesStyle = [];
        this.previousTextStyle=undefined;

        for (var i = 0; i < startIndicesFeatures_.length; i++) {
            var feature = startIndicesFeatures_[i];
            var style = startIndicesStyles_[i];
            var declutterGroup = style.declutterGroup_;
            var geometry = feature.getGeometry();

            var type = geometry.getType();
            // var resolution = feature.resolution;
            var flatCoordinates = geometry.getFlatCoordinates();
            // var end = 2;

            if (!style) {
                continue;
            }

            // TODO as the new logic for MultiLineString, we need to refine the loginc for MULTI_POLYGON
            if (type === 'LineString') {
                this.setTextStyle(style);

                if (style.label) {
                    this.drawLineStringTextWithLabel(geometry, feature, frameState, declutterGroup, style.label);
                }
                else {
                    this.drawLineStringText(geometry, feature, frameState, declutterGroup);
                }
            }
            else if (type == 'MultiLineString') {
                this.setTextStyle(style);
                var properties = feature.getProperties()
                delete properties['geometry'];

                if (style.label) {
                    var ends = geometry.getEnds();

                    for (var k = 0; k < ends.length; k++) {
                        var lineFlatCoordinates = flatCoordinates.slice(ends[k - 1] || 0, ends[k]);

                        var newFeature = new (<any>ol).render.Feature('LineString', lineFlatCoordinates, [lineFlatCoordinates.length], properties, feature.id_);
                        this.drawLineStringTextWithLabel(newFeature.getGeometry(), newFeature, frameState, declutterGroup, style.label);

                        // var geom = new ol.geom.LineString();
                        // geom.setFlatCoordinates("XY", lineFlatCoordinates);
                        // var newFeature = new ol.Feature(geom);
                        // newFeature.setProperties(properties);
                        // newFeature['zCoordinate'] = feature.zCoordinate;
                        // newFeature['styleId'] = feature.styleId;

                        // this.setTextStyle(style);
                        // this.drawLineStringTextWithLabel(geom, newFeature, frameState, declutterGroup, style.label);
                    }
                }
                else {
                    // new logic
                    var ends = geometry.getEnds();

                    for (var k = 0; k < ends.length; k++) {
                        var lineFlatCoordinates = flatCoordinates.slice(ends[k - 1] || 0, ends[k]);

                        var newFeature = new (<any>ol).render.Feature('LineString', lineFlatCoordinates, [lineFlatCoordinates.length], properties, feature.id_);
                        this.drawLineStringText(newFeature.getGeometry(), newFeature, frameState, declutterGroup);

                        // var geom = new ol.geom.LineString();
                        // geom.setFlatCoordinates("XY", lineFlatCoordinates);
                        // var newFeature = new ol.Feature(geom);
                        // newFeature.setProperties(properties); 
                        // newFeature['zCoordinate'] = feature.zCoordinate;
                        // newFeature['styleId'] = feature.styleId;

                        // this.setTextStyle(style);
                        // this.drawLineStringText(geom, newFeature, frameState, declutterGroup);
                    }
                }
            } else {
                if (style.label) {
                    this.setTextStyleForLabel(style);

                    var flatCoordinates = style.labelPosition;
                    var end = flatCoordinates.length;
                    this.label = style.label;
                    var lineWidth = (this.state_.lineWidth / 2) * this.state_.scale;
                    this.width = this.label.width
                    this.height = this.label.height;
                    this.originX = 0;
                    this.originY = 0;
                    this.anchorX = Math.ceil(this.width * (this.textPlacements[0] + 0.5) - this.offsetX_);
                    this.anchorY = Math.ceil(this.height * (this.textPlacements[1] + this.textBaseline_) - this.offsetY_);
                    this.replayImage_(frameState, declutterGroup, flatCoordinates, this.state_.scale / pixelRatio, end, feature);
                    this.renderDeclutterLabel_(declutterGroup, feature);
                } else {
                    this.setTextStyle(style);
                    this.label = style.label;
                    this.drawLineStringText(geometry, feature, frameState, declutterGroup);
                }
            }
        }
    }

    public renderDeclutter_(declutterGroup, feature) {
        if (declutterGroup && declutterGroup.length > 5) {
            var groupCount = declutterGroup[4];
            if (groupCount == 1 || groupCount == declutterGroup.length - 5) {
                var box = {
                    minX: /** @type {number} */ (declutterGroup[0]),
                    minY: /** @type {number} */ (declutterGroup[1]),
                    maxX: /** @type {number} */ (declutterGroup[2]),
                    maxY: /** @type {number} */ (declutterGroup[3]),
                    value: feature
                };
                if (!this.declutterTree.collides(box)) {
                    this.declutterTree.insert(box);
                    var scaleed = false;

                    if (window.devicePixelRatio === 1) {
                        window.devicePixelRatio = this.improvePixelRatio = 2
                        scaleed = true;
                    }

                    this.currAtlas_ = this.getAtlas_(this.state_);

                    for (var j = 5, jj = declutterGroup.length; j < jj; ++j) {
                        var declutter = declutterGroup[j];
                        var options = declutter[0];
                        var this$1 = declutter[1];
                        this$1.getText_([options.text]);
                        options.currAtlas = this.currAtlas_;
                        this$1.tmpOptions.push(options);
                    }
                    if (this.improvePixelRatio !== undefined) {
                        window.devicePixelRatio = 1;
                    }

                }
                declutterGroup.length = 5;
                (<any>ol.extent).createOrUpdateEmpty(declutterGroup);
            }
        }
    }

    public drawReplay(gl, context, skippedFeaturesHash, hitDetection) {
        var textures = hitDetection ? this.getHitDetectionTextures() : this.getTextures();
        var groupIndices = hitDetection ? this.hitDetectionGroupIndices : this.groupIndices;
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        if (!(<any>ol).obj.isEmpty(skippedFeaturesHash)) {
            this.drawReplaySkipping(
                gl, context, skippedFeaturesHash, textures, groupIndices);
        } else {
            var i, ii, start;
            for (i = 0, ii = textures.length, start = 0; i < ii; ++i) {
                gl.bindTexture((<any>ol).webgl.TEXTURE_2D, textures[i]);
                var uZindex = (this.zCoordinates[i] ? 9999999 - this.zCoordinates[i] : 0) / 10000000;
                uZindex = parseFloat(uZindex);

                gl.uniform1f(this.u_zIndex, uZindex);

                var end = groupIndices[i];
                this.drawElements(gl, context, start, end);
                start = end;
            }
        }

        gl.blendFuncSeparate(
            (<any>ol).webgl.SRC_ALPHA, (<any>ol).webgl.ONE_MINUS_SRC_ALPHA,
            (<any>ol).webgl.ONE, (<any>ol).webgl.ONE_MINUS_SRC_ALPHA);
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
            false, 32, 0);

        gl.enableVertexAttribArray(locations.a_offsets);
        gl.vertexAttribPointer(locations.a_offsets, 2, (<any>ol).webgl.FLOAT,
            false, 32, 8);

        gl.enableVertexAttribArray(locations.a_texCoord);
        gl.vertexAttribPointer(locations.a_texCoord, 2, (<any>ol).webgl.FLOAT,
            false, 32, 16);

        gl.enableVertexAttribArray(locations.a_opacity);
        gl.vertexAttribPointer(locations.a_opacity, 1, (<any>ol).webgl.FLOAT,
            false, 32, 24);

        gl.enableVertexAttribArray(locations.a_rotateWithView);
        gl.vertexAttribPointer(locations.a_rotateWithView, 1, (<any>ol).webgl.FLOAT,
            false, 32, 28);

        return locations;
    }

    public renderDeclutterLabel_(declutterGroup, feature) {
        if (declutterGroup && declutterGroup.length > 5) {
            var groupCount = declutterGroup[4];
            if (groupCount == 1 || groupCount == declutterGroup.length - 5) {
                var box = {
                    minX: /** @type {number} */ (declutterGroup[0]),
                    minY: /** @type {number} */ (declutterGroup[1]),
                    maxX: /** @type {number} */ (declutterGroup[2]),
                    maxY: /** @type {number} */ (declutterGroup[3]),
                    value: feature
                };

                if (!this.declutterTree.collides(box)) {
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

    public drawLineStringText(geometry, feature, frameState, declutterGroup) {
        var offset = 0;
        var stride = 2;
        var resolution = frameState.viewState.resolution;
        var text = this.text_;
        var maxAngle = this.maxAngle_;
        var intervalDistance = this.intervalDistance_;
        var spacing = this.spacing_;

        var lineStringCoordinates = geometry.getFlatCoordinates();
        var end = lineStringCoordinates.length;
        var pathLength = lengthLineString(lineStringCoordinates, offset, end, stride, resolution);

        let textLength = this.measure(text);

        if (textLength + intervalDistance <= pathLength) {
            let declutterGroups = [];
            this.extent = (<any>ol.extent).createOrUpdateEmpty();

            var centerPoint = pathLength / 2;
            var pointArray = [];

            pointArray.push(centerPoint);

            // For the logic of drawing duplicate road names, remove the resolution limit
            if (resolution < 1) {
                this.findCenterPoints(0, centerPoint, textLength, intervalDistance, pointArray);
                this.findCenterPoints(centerPoint, pathLength, textLength, intervalDistance, pointArray);
            }

            this.height = this.measureTextHeight();

            for (var len = 0; len < pointArray.length; len++) {
                let tempDeclutterGroup;
                if (declutterGroup) {
                    // tempDeclutterGroup = featureCallback ? null : declutterGroup.slice(0);
                    tempDeclutterGroup = declutterGroup.slice(0);
                }

                var startM = (pointArray[len] - textLength / 2);
                let parts = textpathLineString(lineStringCoordinates, offset, end, 2, text, this, startM,
                    maxAngle, resolution, this.height / 2);

                if (parts) {
                    for (let i = 0; i < parts.length; i++) {
                        var part = parts[i];
                        var lines = part[4];
                        this.width = part[5];
                        this.replayCharImage_(frameState, tempDeclutterGroup, part, feature);
                    }
                    var size = frameState.size;
                    var intersects = tempDeclutterGroup[0] <= size[0] && tempDeclutterGroup[2] >= 0 && tempDeclutterGroup[1] <= size[1] && tempDeclutterGroup[3] >= 0;

                    if (declutterGroup) {
                        if (!intersects && declutterGroup[4] == 1) {
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

    public drawLineStringTextWithLabel(geometry, feature, frameState, declutterGroup, label) {
        var offset = 0;
        var stride = 2;
        var resolution = frameState.viewState.resolution;
        var text = this.text_;
        var maxAngle = this.maxAngle_;
        var intervalDistance = this.intervalDistance_;
        var pixelRatio = frameState.pixelRatio;
        var spacing = this.spacing_;

        var lineStringCoordinates = geometry.getFlatCoordinates();
        var end = lineStringCoordinates.length;
        var pathLength = lengthLineString(lineStringCoordinates, offset, end, stride, resolution);
        let textLength = label.width;

        if (textLength <= pathLength * 1.2) {
            this.extent = (<any>ol.extent).createOrUpdateEmpty();

            var centerPoint = pathLength / 2;
            var pointArray = [];

            pointArray.push(centerPoint);

            if (resolution < 1) {
                this.findCenterPoints(0, centerPoint, textLength, intervalDistance, pointArray);
                this.findCenterPoints(centerPoint, pathLength, textLength, intervalDistance, pointArray);
            }

            this.height = label.height;
            for (var len = 0; len < pointArray.length; len++) {
                let tempDeclutterGroup;
                if (declutterGroup) {
                    tempDeclutterGroup = declutterGroup.slice(0);
                }
                var startM = pointArray[len];
                let parts = textpathLineString(lineStringCoordinates, offset, end, 2, '.', this, startM,
                    maxAngle, resolution);

                if (parts) {
                    this.label = label;
                    this.width = this.label.width
                    this.height = this.label.height;
                    this.originX = 0;
                    this.originY = 0;
                    this.anchorX = Math.ceil(this.width * (this.textPlacements[0] + 0.5) - this.offsetX_);
                    this.anchorY = Math.ceil(this.height * (this.textPlacements[1] + this.textBaseline_) - this.offsetY_);

                    for (let i = 0; i < parts.length; i++) {
                        var part = parts[i];
                        const pointX = part[0];
                        const pointY = part[1]
                        this.replayImage_(frameState, declutterGroup, [pointX, pointY], this.state_.scale / pixelRatio, 2, feature);
                        this.renderDeclutterLabel_(declutterGroup, feature);
                    }
                }
            }
        }
    }

    public replayCharImage_(frameState, declutterGroup, part, feature) {
        var scale = this.scale;
        var coordinateToPixelTransform = frameState.coordinateToPixelTransform;
        var x = part[0];
        var y = part[1];
        var rotation = part[3];
        var text = part[4];
        var cos = Math.cos(rotation);
        var sin = Math.sin(rotation);
        var anchorX = part[2];
        var anchorY = Math.ceil(this.height * this.textBaseline_ - this.offsetY_);
        var width = this.width;
        var height = this.height;
        var bottomLeft = [];
        var bottomRight = [];
        var topLeft = [];
        var topRight = [];
        var offsetX, offsetY, pixelCoordinate;
        var center = frameState.viewState.center;

        if (!this.screenXY) {
            pixelCoordinate = (<any>ol).transform.apply(coordinateToPixelTransform,
                [x - this.origin[0] + center[0], y - this.origin[1] + center[1]]);
        } else {
            pixelCoordinate = (<any>ol).transform.apply(coordinateToPixelTransform,
                [x - this.origin[0] + this.screenXY[0], y - this.origin[1] + this.screenXY[1]]);
        }
        x = pixelCoordinate[0];
        y = pixelCoordinate[1];

        // bottom-left corner
        offsetX = -scale * anchorX;
        offsetY = -scale * (height - anchorY);
        bottomLeft[0] = x + (offsetX * cos - offsetY * sin);
        bottomLeft[1] = y + (offsetX * sin + offsetY * cos);

        // bottom-right corner
        offsetX = scale * (width - anchorX);
        offsetY = -scale * (height - anchorY);
        bottomRight[0] = x + (offsetX * cos - offsetY * sin);
        bottomRight[1] = y + (offsetX * sin + offsetY * cos);

        // top-right corner
        offsetX = scale * (width - anchorX);
        offsetY = scale * anchorY;
        topRight[0] = x + (offsetX * cos - offsetY * sin);
        topRight[1] = y + (offsetX * sin + offsetY * cos);

        // top-left corner
        offsetX = -scale * anchorX;
        offsetY = scale * anchorY;
        topLeft[0] = x + (offsetX * cos - offsetY * sin);
        topLeft[1] = y + (offsetX * sin + offsetY * cos);

        (<any>ol).extent.extendCoordinate(declutterGroup, bottomLeft);
        (<any>ol).extent.extendCoordinate(declutterGroup, bottomRight);
        (<any>ol).extent.extendCoordinate(declutterGroup, topRight);
        (<any>ol).extent.extendCoordinate(declutterGroup, topLeft);

        var declutterArgs = [{
            anchorX,
            anchorY,
            rotation,
            flatCoordinates: [part[0], part[1]],
            text,
            feature
        }, this];
        declutterGroup.push(declutterArgs);
    }

    public setTextStyle(textStyle) {
        var state = this.state_;
        state.scale = textStyle.getScale() || 1;
        if (this.previousTextStyle !== undefined) {
            if (this.previousTextStyle.uid === textStyle.uid) {
                this.text_ = /** @type {string} */ (textStyle.getText());

                return;
            }
        }

        var textFillStyle = textStyle.getFill();
        var textStrokeStyle = textStyle.getStroke();
        if (!textStyle || !textStyle.getText() || (!textFillStyle && !textStrokeStyle)) {
            this.text_ = '';
            debugger;
        } else {
            if (!textFillStyle) {
                state.fillColor = null;
            } else {
                var textFillStyleColor = textFillStyle.getColor();
                state.fillColor = ol.colorlike.asColorLike(textFillStyleColor ?
                    textFillStyleColor : (<any>ol.render).webgl.defaultFillStyle);
            }
            if (!textStrokeStyle) {
                state.strokeColor = null;
                state.lineWidth = 0;
            } else {
                var textStrokeStyleColor = textStrokeStyle.getColor();
                state.strokeColor = ol.colorlike.asColorLike(textStrokeStyleColor ?
                    textStrokeStyleColor : (<any>ol.render).webgl.defaultStrokeStyle);
                state.lineWidth = textStrokeStyle.getWidth() || (<any>ol.render).webgl.defaultLineWidth;
                state.lineCap = textStrokeStyle.getLineCap() || (<any>ol.render).webgl.defaultLineCap;
                state.lineDashOffset = textStrokeStyle.getLineDashOffset() || (<any>ol.render).webgl.defaultLineDashOffset;
                state.lineJoin = textStrokeStyle.getLineJoin() || (<any>ol.render).webgl.defaultLineJoin;
                state.miterLimit = textStrokeStyle.getMiterLimit() || (<any>ol.render).webgl.defaultMiterLimit;
                var lineDash = textStrokeStyle.getLineDash();
                state.lineDash = lineDash ? lineDash.slice() : (<any>ol.render).webgl.defaultLineDash;
            }
            state.font = textStyle.getFont() || (<any>ol.render).webgl.defaultFont;
           

            let scale = state.scale * window.devicePixelRatio;


            this.text_ = /** @type {string} */ (textStyle.getText());
            var textAlign = (<any>ol.render).replay.TEXT_ALIGN[textStyle.getTextAlign()];
            var textBaseline = (<any>ol.render).replay.TEXT_ALIGN[textStyle.getTextBaseline()];
            this.textAlign_ = textAlign === undefined ?
                (<any>ol.render).webgl.defaultTextAlign : textAlign;
            this.textBaseline_ = textBaseline === undefined ?
                (<any>ol.render).webgl.defaultTextBaseline : textBaseline;
            this.offsetX_ = (textStyle.getOffsetX() || 0) * scale;
            this.offsetY_ = (textStyle.getOffsetY() || 0) * scale;
            this.rotateWithView = !!textStyle.getRotateWithView();
            this.rotation = textStyle.getRotation() || 0;
            this.maxAngle_ = textStyle.getMaxAngle();
            this.intervalDistance_ = textStyle["intervalDistance"] || 0;
            this.spacing_ = (textStyle["spacing"] || 0) * scale;

            this.textPlacements = [0, 0]
            if (textStyle["placements"] == "upper") {
                this.textPlacements = [0, 0.5];
            }
            if (textStyle["placements"] == "lower") {
                this.textPlacements = [0, -0.5];
            }
            if (textStyle["placements"] == "left") {
                this.textPlacements = [0.5, 0];
            }
            if (textStyle["placements"] == "right") {
                this.textPlacements = [-0.5, 0];
            }
        }
        this.previousTextStyle = textStyle;
    }

    public setTextStyleForLabel(textStyle) {
        var state = this.state_;
        var textStrokeStyle = textStyle.getStroke();

        if (!textStrokeStyle) {
            state.strokeColor = null;
            state.lineWidth = 0;
        } else {
            state.lineWidth = textStrokeStyle.getWidth() || (<any>ol.render).webgl.defaultLineWidth;
        }
        state.scale = textStyle.getScale() || 1;

        let scale = state.scale * window.devicePixelRatio;


        var textBaseline = (<any>ol.render).replay.TEXT_ALIGN[textStyle.getTextBaseline()];
        this.textBaseline_ = textBaseline === undefined ?
            (<any>ol.render).webgl.defaultTextBaseline : textBaseline;

        this.offsetX_ = (textStyle.getOffsetX() || 0) * scale;
        this.offsetY_ = (textStyle.getOffsetY() || 0) * scale;

        this.rotateWithView = !!textStyle.getRotateWithView();
        this.rotation = textStyle.getRotation() || 0;

        this.spacing_ = (textStyle["spacing"] || 0) * scale;

        this.textPlacements = [0, 0]
        if (textStyle["placements"] == "upper") {
            this.textPlacements = [0, 0.5];
        }
        if (textStyle["placements"] == "lower") {
            this.textPlacements = [0, -0.5];
        }
        if (textStyle["placements"] == "left") {
            this.textPlacements = [0.5, 0];
        }
        if (textStyle["placements"] == "right") {
            this.textPlacements = [-0.5, 0];
        }
    }

    public getText_(lines) {
        var self = this;
        var glyphAtlas = this.currAtlas_;
        //Split every line to an array of chars, sum up their width, and select the longest.
        lines.map(function (str) {
            var i, ii;
            for (i = 0, ii = str.length; i < ii; ++i) {
                var curr = str[i];
                if (!glyphAtlas.width[curr]) {
                    self.addCharToAtlas_(curr);
                }
            }
        })
    }

    public measure(text) {
        var width = this.measureCache(text]);

        if (!width) {
            var state = this.state_;
            var mCtx = this.measureCanvas_.getContext('2d');

            var widths = this.widths_[this.state_.font];
            if (widths === undefined) {
                widths = this.widths_[this.state_.font] = {};
            }

            if (state.font != mCtx.font) {
                mCtx.font = state.font;
            }
            var sum = 0;
            //sum = mCtx.measureText(text).width * state.scale;

            var i, ii;
            for (i = 0, ii = text.length; i < ii; ++i) {
                var curr = text[i];
                sum += Math.ceil((mCtx.measureText(curr).width) * state.scale);
            }

            width = widths[text] = sum;
        }

        return width;
    }

    public measureCache(text) {
        var width;
        var widths = this.widths_[this.state_.font];
        if (widths !== undefined) {
            width = widths[text];
        }
        return width;

        // var width;
        // if (this.widths_[this.state_.font] !== undefined) {
        //     width = this.widths_[this.state_.font][text];
        // }
        // return width;
    }

    public measureTextHeight() {
        var state = this.state_;
        var heights = this.heights_[state.font];
        if (!heights) {
            this.heights_[state.font] = heights = {};
        }
        var height = heights[state.font];
        if (!height) {
            var font = state.font;
            if (!this.measureSpan) {
                this.measureSpan = document.createElement('span');
                this.measureSpan.textContent = 'M';
                this.measureSpan.style.margin = this.measureSpan.style.padding = '0 !important';
                this.measureSpan.style.position = 'absolute !important';
                this.measureSpan.style.left = '-99999px !important';
            }
            this.measureSpan.style.font = font;
            document.body.appendChild(this.measureSpan);
            height = heights[font] = this.measureSpan.offsetHeight;
            document.body.removeChild(this.measureSpan);

            // var mCtx = this.measureCanvas_.getContext('2d');
            // if (state.font != mCtx.font) {
            //     mCtx.font = state.font;
            // }
            // height = Math.ceil((mCtx.measureText('M').width * 1.5 +
            //     state.lineWidth / 2) * state.scale);
            // heights[state.font] = height;
        }

        return height;
    }

    public findCenterPoints(start, end, textLength, pixelDistance, pointArray) {
        var distance = (end - start) / 2;
        if (distance > pixelDistance + textLength) {
            var center = (end + start) / 2;
            pointArray.push(center);
            this.findCenterPoints(start, center, textLength, pixelDistance, pointArray);
            this.findCenterPoints(center, end, textLength, pixelDistance, pointArray);
        }
    }

    public replayImage_(frameState, declutterGroup, flatCoordinates, scale, end, feature) {
        var box = [];
        var screenXY = this.screenXY;
        var rotation = this.rotation;
        var center = frameState.viewState.center;

        var pixelCoordinate;
        if (!screenXY) {
            pixelCoordinate = (<any>ol).transform.apply(frameState.coordinateToPixelTransform, [flatCoordinates[0] - this.origin[0] + center[0], flatCoordinates[1] - this.origin[1] + center[1]]);
        } else {
            pixelCoordinate = (<any>ol).transform.apply(frameState.coordinateToPixelTransform, [flatCoordinates[0] - this.origin[0] + screenXY[0], flatCoordinates[1] - this.origin[1] + screenXY[1]]);
        }
        var x = pixelCoordinate[0];
        var y = pixelCoordinate[1];


        var offsetX = -scale * (this.anchorX);
        var offsetY = -scale * (this.height - this.anchorY);
        box[0] = x + offsetX;
        box[3] = y - offsetY;

        offsetX = scale * (this.width - this.anchorX);
        offsetY = scale * this.anchorY;
        box[2] = x + offsetX;
        box[1] = y - offsetY;

        var size = frameState.size;
        var intersects = box[0] <= size[0] && box[2] >= 0 && box[1] <= size[1] && box[3] >= 0;
        if (declutterGroup) {
            if (!intersects && declutterGroup[4] == 1) {
                return;
            }

            box[0] -= this.spacing_;
            box[1] -= this.spacing_;
            box[2] += this.spacing_;
            box[3] += this.spacing_;
            (<any>ol).extent.extend(declutterGroup, box);

            var declutterArgs = [{
                flatCoordinates,
                end,
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
                originY: this.originY,
                feature
            }, this];
            declutterGroup.push(declutterArgs);
        }
    }

    public drawText(options) {
        var this$1 = this;
        var text = options.text;
        var label = options.label;
        if (text || label) {
            var offset = 0;
            var end = options.end || 2;
            var stride = 2;
            this.startIndicesFeature.push(options.feature);
            this.startIndices.push(this.indices.length);
            this.zCoordinates.push(options.feature.zCoordinate);
            var flatCoordinates = options.flatCoordinates;
            if (label) {
                var image = label;
                image['NEAREST'] = true;
                this.originX = options.originX;
                this.originY = options.originY;
                this.width = options.width;
                this.height = options.height;
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
                    if ((<any>ol).getUid(currentImage) != (<any>ol).getUid(image)) {
                        this.groupIndices.push(this.indices.length);
                        this.images_.push(image);
                    }
                }

                this.drawText_(flatCoordinates, offset, end, stride);
            } else {
                var devicePixelRatio = window.devicePixelRatio;

                if (this.improvePixelRatio !== undefined) {
                    devicePixelRatio = this.improvePixelRatio;
                }

                var glyphAtlas = options.currAtlas;
                var j, jj, currX, currY, charArr, charInfo;
                var anchorX = options.anchorX * devicePixelRatio;
                var anchorY = options.anchorY * devicePixelRatio;
                var lineWidth = (this.state_.lineWidth / 2) * this.state_.scale;
                this$1.rotation = options.rotation;
                currX = 0;
                currY = 0;
                charArr = text.split('');

                for (j = 0, jj = charArr.length; j < jj; ++j) {
                    charInfo = glyphAtlas.atlas.getInfo(charArr[j]);

                    if (charInfo) {
                        var image = charInfo.image;
                        this$1.anchorX = anchorX - currX;
                        this$1.anchorY = anchorY - currY;
                        this$1.originX = (j === 0 ? charInfo.offsetX - lineWidth : charInfo.offsetX) * devicePixelRatio;
                        this$1.originY = (charInfo.offsetY - 1) * devicePixelRatio;
                        this$1.height = glyphAtlas.height * devicePixelRatio;
                        this$1.width = (j === 0 || j === charArr.length - 1 ?
                            glyphAtlas.width[charArr[j]] + lineWidth : glyphAtlas.width[charArr[j]]) * devicePixelRatio;
                        this$1.imageHeight = image.height;
                        this$1.imageWidth = image.width;
                        this$1.rotateWithView = 1;
                        if (this$1.images_.length === 0) {
                            this$1.images_.push(image);
                        } else {
                            var currentImage = this$1.images_[this$1.images_.length - 1];
                            if ((<any>ol).getUid(currentImage) != (<any>ol).getUid(image)) {
                                this$1.groupIndices.push(this$1.indices.length);
                                this$1.images_.push(image);
                            }
                        }
                        this$1.scale_ = 1 / devicePixelRatio;
                        this$1.drawText_(flatCoordinates, offset, end, stride);
                    }
                    currX += this$1.width;
                }
            }
        }
    }
}
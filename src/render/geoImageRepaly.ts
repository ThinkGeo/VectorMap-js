import { fragment, vertex } from './geoTextureReplay/defaultshader';
import { Locations } from './geoTextureReplay/defaultshader/Locations';
import { imagelineString as textpathImageLineString } from '../geom/flat/textpath.js';
import { lineString as lengthLineString } from '../geom/flat/length.js';

export class GeoImageReplay extends ((<any>ol).render.webgl.ImageReplay as { new(tolerance: number, maxExtent: any, declutterTree: any) }) {
    constructor(tolerance, maxExtent, declutterTree) {
        super(tolerance, maxExtent, declutterTree);
        this.startIndicesFeatures_ = [];
        this.startIndicesStyles_ = [];
    }

    public finish(context) {
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

        this.hitDetectionImage = hitDetectionImage;
        this.image = image;
        this.anchorX = anchor[0] - (imageStyle["offsetX"] || 0);
        this.anchorY = anchor[1] - (imageStyle["offsetY"] || 0);
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
        this.allowOverlapping = imageStyle["allowOverlapping"];
    }

    public drawPoint(options) {
        var offset = 0;
        var end = 2;
        var stride = 2;
        var flatCoordinates = options.flatCoordinates;
        var image = options.image;
        var hitDetectionImage = options.hitDetectionImage;
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
        this.startIndices.push(this.indices.length);
        this.startIndicesFeature.push(options.feature);
        this.zCoordinates.push(options.feature.zCoordinate);
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

        if (this.hitDetectionImages_.length === 0) {
            this.hitDetectionImages_.push(hitDetectionImage);
        } else {
            currentImage =
                this.hitDetectionImages_[this.hitDetectionImages_.length - 1];
            if ((<any>ol).getUid(currentImage) != (<any>ol).getUid(hitDetectionImage)) {
                this.hitDetectionGroupIndices.push(this.indices.length);
                this.hitDetectionImages_.push(hitDetectionImage);
            }
        }
        this.drawCoordinates(flatCoordinates, offset, end, stride);
    }

    public declutterRepeat_(context, screenXY) {
        var startIndicesFeatures_ = this.startIndicesFeatures_;
        var startIndicesStyles_ = this.startIndicesStyles_;
        var frameState = context.frameState;
        var pixelRatio = frameState.pixelRatio;
        this.screenXY = screenXY;

        for (var i = 0; i < startIndicesFeatures_.length; i++) {
            var feature = startIndicesFeatures_[i];
            var style = startIndicesStyles_[i];
            var declutterGroup = style.declutterGroup_;
            var geometry = feature.getGeometry();
            var type = geometry.getType();

            if (!style) {
                continue;
            }

            this.setImageStyle(style);

            if (type == 'LineString') {
                this.drawLineStringImage(geometry, feature, frameState, declutterGroup);
            } else if (type == 'MultiLineString') {
                var ends = geometry.getEnds();
                var flatCoordinates = geometry.getFlatCoordinates();
                for (var k = 0; k < ends.length; k++) {
                    var lineFlatCoordinates = flatCoordinates.slice(ends[k - 1] || 0, ends[k]);
                    var newFeature = new (<any>ol).render.Feature('LineString', lineFlatCoordinates, [lineFlatCoordinates.length], feature.properties_, feature.id_);

                    this.drawLineStringImage(newFeature.getGeometry(), newFeature, frameState, declutterGroup);
                }
            } else {
                this.replayImage_(frameState, declutterGroup, geometry.getFlatCoordinates(), style.scale_, feature);
                this.renderDeclutter_(declutterGroup, feature);
            }
        }
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
            gl.stencilFunc(/** @type {number} */(tmpStencilFunc),
            /** @type {number} */(tmpStencilRef), /** @type {number} */(tmpStencilMaskVal));
            gl.stencilMask(/** @type {number} */(tmpStencilMask));
            gl.stencilOp(/** @type {number} */(tmpStencilOpFail),
            /** @type {number} */(tmpStencilOpZFail), /** @type {number} */(tmpStencilOpPass));
            // gl.stencilMask(0);
        }
        return result;
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

                if (!this.declutterTree.collides(box)||this.allowOverlapping) {
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
                var uZindex =  (this.zCoordinates[i] ? 9999999 - this.zCoordinates[i] : 0)/10000000;
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

    public drawLineStringImage(geometry, feature, frameState, declutterGroup) {
        var offset = 0;
        var stride = 2;
        var resolution = frameState.currentResolution;
        var lineStringCoordinates = geometry.getFlatCoordinates();
        var end = lineStringCoordinates.length;
        var pathLength = lengthLineString(lineStringCoordinates, offset, end, stride, resolution);
        let width = this.width;

        if (width * 4 <= pathLength) {
            this.extent = (<any>ol.extent).createOrUpdateEmpty();
            var pixelDistance = 100;
            var centerPoint = pathLength / 2;
            var pointArray = [];
            pointArray.push(centerPoint);

            this.findCenterPoints(0, centerPoint, pixelDistance, pointArray);
            this.findCenterPoints(centerPoint, pathLength, pixelDistance, pointArray);

            for (var len = 0; len < pointArray.length; len++) {
                let tempDeclutterGroup;
                if (declutterGroup) {
                    // tempDeclutterGroup = featureCallback ? null : declutterGroup.slice(0);
                    tempDeclutterGroup = declutterGroup.slice(0);
                }

                var startM = pointArray[len] - width / 2;
                let parts = textpathImageLineString(lineStringCoordinates, offset, end, 2, width, startM, resolution);

                if (parts) {
                    for (let i = 0; i < parts.length; i++) {
                        var part = parts[i];
                        this.anchorX = part[2];
                        this.rotation = part[3];
                        this.replayImage_(frameState, declutterGroup, [part[0], part[1]], this.scale, feature);
                        this.renderDeclutter_(declutterGroup, feature);
                    }
                }
            }
        }
    }

    public findCenterPoints(start, end, pixelDistance, pointArray) {
        var distance = (end - start) / 2;
        if (distance > pixelDistance) {
            var center = (end + start) / 2;
            pointArray.push(center);
            this.findCenterPoints(start, center, pixelDistance, pointArray);
            this.findCenterPoints(center, end, pixelDistance, pointArray);
        }
    }

    public replayImage_(frameState, declutterGroup, flatCoordinates, scale, feature) {
        var box = [];
        var pixelCoordinate;
        var rotation = this.rotation;
        var center = frameState.viewState.center;

        if (!this.screenXY) {
            pixelCoordinate = (<any>ol).transform.apply(frameState.coordinateToPixelTransform, [flatCoordinates[0] - this.origin[0] + center[0], flatCoordinates[1] - this.origin[1] + center[1]]);
        } else {
            pixelCoordinate = (<any>ol).transform.apply(frameState.coordinateToPixelTransform, [flatCoordinates[0] - this.origin[0] + this.screenXY[0], flatCoordinates[1] - this.origin[1] + this.screenXY[1]]);
        }

        var offsetX = -scale * (this.anchorX);
        var offsetY = -scale * (this.height - this.anchorY);
        box[0] = pixelCoordinate[0] + offsetX;
        box[3] = pixelCoordinate[1] - offsetY;

        offsetX = scale * (this.width - this.anchorX);
        offsetY = scale * this.anchorY;
        box[2] = pixelCoordinate[0] + offsetX;
        box[1] = pixelCoordinate[1] - offsetY;

        var size = frameState.size;
        var intersects = box[0] <= size[0] && box[2] >= 0 && box[1] <= size[1] && box[3] >= 0;
        if (declutterGroup) {
            if (!intersects && declutterGroup[4] == 1) {
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
                originY: this.originY,
                hitDetectionImage: this.hitDetectionImage,
                feature
            }, this];
            declutterGroup.push(declutterArgs);
        }
    }
}
import CanvasTextReplay from "./TextReplay";
import LRUCache from '../../ol/structs/LRUCache';
import GeometryType from '../../ol/geom/GeometryType.js';
import { isEmpty } from '../../ol/obj';
import { transform2D } from '../../ol/geom/flat/transform';
import { setFromArray } from '../../ol/transform';
import { getUid } from '../../ol/util.js';
import { intersects, createOrUpdateEmpty, extendCoordinate, createOrUpdate, extend, createEmpty } from '../../ol/extent';
import { equals } from '../../ol/array';
import CanvasInstruction from '../../ol/render/canvas/Instruction.js';
import { lineStringLength } from '../../ol/geom/flat/length.js';
import { drawTextOnPath } from '../../ol/geom/flat/textpath.js';
import { matchingChunk } from '../../ol/geom/flat/straightchunk';
import { TEXT_ALIGN } from '../../ol/render/replay.js';
import { drawImage, defaultPadding, measureTextWidth, measureTextHeight, defaultTextAlign, defaultLineCap, defaultLineDashOffset, defaultLineDash, defaultLineJoin, defaultFillStyle, checkFont, defaultFont, defaultLineWidth, defaultMiterLimit, defaultStrokeStyle, defaultTextBaseline } from '../../ol/render/canvas.js';
import { asColorLike } from '../../ol/colorlike.js';
import {
    create as createTransform,
    compose as composeTransform,
    apply as applyTransform,
    setFromArray as transformSetFromArray
} from '../../ol/transform.js';

const tmpExtent = createEmpty();
const tmpTransform = createTransform();

class GeoCanvasTextReplay extends CanvasTextReplay {
    constructor(tolerance, maxExtent, resolution, pixelRatio, overlaps, declutterTree) {
        super(tolerance, maxExtent, resolution, pixelRatio, overlaps, declutterTree);
        this.labelInfoCache = new LRUCache();
        this.charWidths = {};
    }

    replay_(context, transform, skippedFeaturesHash, instructions, snapToPixel, featureCallback, opt_hitExtent) {
        /** @type {Array<number>} */

        let pixelExten;
        pixelExten = transform2D(this.maxExtent, 0, this.maxExtent.length, 2, transform, this["pixelExten"]);

        let pixelCoordinates;
        if (this.pixelCoordinates_ && equals(transform, this.renderedTransform_)) {
            pixelCoordinates = this.pixelCoordinates_;
        } else {
            if (!this.pixelCoordinates_) {
                this.pixelCoordinates_ = [];
            }
            pixelCoordinates = transform2D(
                this.coordinates, 0, this.coordinates.length, 2,
                transform, this.pixelCoordinates_);
            transformSetFromArray(this.renderedTransform_, transform);
        }

        let quickZoom = false;
        if (context["quickZoom"] !== undefined) {
            quickZoom = context["quickZoom"];
        }

        const skipFeatures = !isEmpty(skippedFeaturesHash);
        let i = 0; // instruction index
        const ii = instructions.length; // end of instructions
        let d = 0; // data index
        let dd; // end of per-instruction data
        let anchorX, anchorY, prevX, prevY, roundX, roundY, declutterGroup, image;
        let pendingFill = 0;
        let pendingStroke = 0;
        let lastFillInstruction = null;
        let lastStrokeInstruction = null;
        const coordinateCache = this.coordinateCache_;
        const viewRotation = this.viewRotation_;

        const state = /** @type {import("../../render.js").State} */ ({
            context: context,
            pixelRatio: this.pixelRatio,
            resolution: this.resolution,
            rotation: viewRotation
        });

        // When the batch size gets too big, performance decreases. 200 is a good
        // balance between batch size and number of fill/stroke instructions.
        const batchSize = this.instructions != instructions || this.overlaps ? 0 : 200;

        var currentResolution = context["currentResolution"];

        let /** @type {import("../../Feature.js").default|import("../Feature.js").default} */ feature;
        let x, y;
        while (i < ii) {
            const instruction = instructions[i];
            const type = /** @type {CanvasInstruction} */ (instruction[0]);
            switch (type) {
                case CanvasInstruction.BEGIN_GEOMETRY:
                    feature = /** @type {import("../../Feature.js").default|import("../Feature.js").default} */ (instruction[1]);
                    if ((skipFeatures &&
                        skippedFeaturesHash[getUid(feature).toString()]) ||
                        !feature.getGeometry()) {
                        i = /** @type {number} */ (instruction[2]);
                    } else if (opt_hitExtent !== undefined && !intersects(
                        opt_hitExtent, feature.getGeometry().getExtent())) {
                        i = /** @type {number} */ (instruction[2]) + 1;
                    } else {
                        ++i;
                    }
                    break;
                case CanvasInstruction.BEGIN_PATH:
                    if (pendingFill > batchSize) {
                        this.fill_(context);
                        pendingFill = 0;
                    }
                    if (pendingStroke > batchSize) {
                        context.stroke();
                        pendingStroke = 0;
                    }
                    if (!pendingFill && !pendingStroke) {
                        context.beginPath();
                        prevX = prevY = NaN;
                    }
                    ++i;
                    break;
                case CanvasInstruction.CIRCLE:
                    d = /** @type {number} */ (instruction[1]);
                    const x1 = pixelCoordinates[d];
                    const y1 = pixelCoordinates[d + 1];
                    const x2 = pixelCoordinates[d + 2];
                    const y2 = pixelCoordinates[d + 3];
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const r = Math.sqrt(dx * dx + dy * dy);
                    context.moveTo(x1 + r, y1);
                    context.arc(x1, y1, r, 0, 2 * Math.PI, true);
                    ++i;
                    break;
                case CanvasInstruction.CLOSE_PATH:
                    context.closePath();
                    ++i;
                    break;
                case CanvasInstruction.CUSTOM:
                    d = /** @type {number} */ (instruction[1]);
                    dd = instruction[2];
                    const geometry = /** @type {import("../../geom/SimpleGeometry.js").default} */ (instruction[3]);
                    const renderer = instruction[4];
                    const fn = instruction.length == 6 ? instruction[5] : undefined;
                    state.geometry = geometry;
                    state.feature = feature;
                    if (!(i in coordinateCache)) {
                        coordinateCache[i] = [];
                    }
                    const coords = coordinateCache[i];
                    if (fn) {
                        fn(pixelCoordinates, d, dd, 2, coords);
                    } else {
                        coords[0] = pixelCoordinates[d];
                        coords[1] = pixelCoordinates[d + 1];
                        coords.length = 2;
                    }
                    renderer(coords, state);
                    ++i;
                    break;
                case CanvasInstruction.DRAW_IMAGE:
                    d = /** @type {number} */ (instruction[1]);
                    dd = /** @type {number} */ (instruction[2]);
                    image = /** @type {HTMLCanvasElement|HTMLVideoElement|HTMLImageElement} */
                        (instruction[3]);
                    // Remaining arguments in DRAW_IMAGE are in alphabetical order
                    anchorX = /** @type {number} */ (instruction[4]);
                    anchorY = /** @type {number} */ (instruction[5]);
                    declutterGroup = featureCallback ? null : /** @type {import("../canvas.js").DeclutterGroup} */ (instruction[6]);
                    const height = /** @type {number} */ (instruction[7]);
                    const opacity = /** @type {number} */ (instruction[8]);
                    const originX = /** @type {number} */ (instruction[9]);
                    const originY = /** @type {number} */ (instruction[10]);
                    const rotateWithView = /** @type {boolean} */ (instruction[11]);
                    let rotation = /** @type {number} */ (instruction[12]);
                    const scale = /** @type {number} */ (instruction[13]);
                    const width = /** @type {number} */ (instruction[14]);

                    let padding, backgroundFill, backgroundStroke;
                    if (instruction.length > 16) {
                        padding = /** @type {Array<number>} */ (instruction[15]);
                        backgroundFill = /** @type {boolean} */ (instruction[16]);
                        backgroundStroke = /** @type {boolean} */ (instruction[17]);
                    } else {
                        padding = defaultPadding;
                        backgroundFill = backgroundStroke = false;
                    }

                    if (rotateWithView) {
                        rotation += viewRotation;
                    }
                    for (; d < dd; d += 2) {
                        this.replayImage_(context,
                            pixelCoordinates[d], pixelCoordinates[d + 1], image, anchorX, anchorY,
                            declutterGroup, height, opacity, originX, originY, rotation, scale,
                            true, width, padding,
                            backgroundFill ? /** @type {Array<*>} */ (lastFillInstruction) : null,
                            backgroundStroke ? /** @type {Array<*>} */ (lastStrokeInstruction) : null);
                    }
                    this.renderDeclutter_(declutterGroup, feature);
                    ++i;
                    break;
                case CanvasInstruction.DRAW_CHARS:
                    if (!quickZoom) {
                        const begin = /** @type {number} */ (instruction[1]);
                        const end = /** @type {number} */ (instruction[2]);
                        const baseline = /** @type {number} */ (instruction[3]);
                        declutterGroup = featureCallback ? null : /** @type {import("../canvas.js").DeclutterGroup} */ (instruction[4]);
                        const overflow = /** @type {number} */ (instruction[5]);
                        const fillKey = /** @type {string} */ (instruction[6]);
                        const maxAngle = /** @type {number} */ (instruction[7]);
                        const measure = /** @type {function(string):number} */ (instruction[8]);
                        const offsetY = /** @type {number} */ (instruction[9]);
                        const strokeKey = /** @type {string} */ (instruction[10]);
                        const strokeWidth = /** @type {number} */ (instruction[11]);
                        const text = /** @type {string} */ (instruction[12]);
                        const textKey = /** @type {string} */ (instruction[13]);
                        const textScale = /** @type {number} */ (instruction[14]);
                        const textSpacing = instruction[15];

                        // For skip the ignored label.
                        const ignored = instruction[16];
                        const displayedTextLength = instruction[17];

                        if (!ignored) {
                            const declutterGroups = [];
                            const pathLength = lineStringLength(pixelCoordinates, begin, end, 2);
                            let textLength = undefined;
                            if (displayedTextLength) {
                                textLength = displayedTextLength;
                            }
                            else {
                                textLength = measure(text);
                                instruction[17] = textLength;
                            }

                            if (overflow || textLength <= pathLength) {
                                // The original logical is create label image --> declutterGroup --> draw label image to context
                                // The newest logical is  create label info and create image instruction --> declutterGroup --> create label image --> draw label image to context
                                let labelInstructions = [];
                                let labelIndex = 0;

                                if (currentResolution < 1.2) {
                                    var distance = (textSpacing / currentResolution * 1.194328566955879) * window.devicePixelRatio;
                                    while (distance >= textSpacing * 2) {
                                        distance = distance / 2;
                                    }
                                    var tmpLength = pathLength - textLength;
                                    var centerPoint = tmpLength / 2;
                                    var leftPoint = centerPoint;
                                    var rightPoint = centerPoint;

                                    var pointArray = [];
                                    pointArray.push(centerPoint);

                                    while (leftPoint > ((textLength / 2) + distance)) {
                                        leftPoint = leftPoint - distance;
                                        pointArray.push(leftPoint);
                                    }
                                    while (rightPoint < ((pathLength - textLength / 2) - distance)) {
                                        rightPoint = rightPoint + distance;
                                        pointArray.push(rightPoint);
                                    }

                                    for (var len = 0; len < pointArray.length; len++) {
                                        let tempDeclutterGroup;
                                        if (declutterGroup) {
                                            tempDeclutterGroup = featureCallback ? null : declutterGroup.slice(0);
                                        }
                                        var startM = pointArray[len];
                                        let parts = drawTextOnPath(pixelCoordinates, begin, end, 2, text, measure, startM, maxAngle);
                                        if (parts) {
                                            let c, cc, chars, label, part;
                                            if (strokeKey) {
                                                for (c = 0, cc = parts.length; c < cc; ++c) {
                                                    part = parts[c]; // x, y, anchorX, rotation, chunk
                                                    chars = /** @type {string} */ (part[4]);

                                                    let labelInfo = undefined;
                                                    if (tempDeclutterGroup) {
                                                        labelInfo = this.getImageInfo(chars, textKey, "", strokeKey);
                                                        labelInstructions[labelIndex] = {
                                                            chars: chars,
                                                            textKey: textKey,
                                                            fillKey: fillKey,
                                                            strokeKey: ""
                                                        }
                                                        labelIndex += 1;
                                                    }
                                                    else {
                                                        labelInfo = /** @type {ol.render.canvas.TextReplay} */ (this).getImage(chars, textKey, "", strokeKey);
                                                    }

                                                    anchorX = /** @type {number} */ (part[2]) + strokeWidth;
                                                    anchorY = baseline * labelInfo["height"] + (0.5 - baseline) * 2 * strokeWidth - offsetY;
                                                    this.replayImage_(context, /** @type {number} */(part[0]), /** @type {number} */(part[1]), labelInfo, anchorX, anchorY, tempDeclutterGroup, labelInfo["height"], 1, 0, 0, /** @type {number} */(part[3]), textScale, false, labelInfo["width"], defaultPadding, null, null);
                                                }
                                            }

                                            if (fillKey) {
                                                for (c = 0, cc = parts.length; c < cc; ++c) {
                                                    part = parts[c];
                                                    chars = /** @type {string} */ (part[4]);
                                                    let labelInfo = undefined;
                                                    if (tempDeclutterGroup) {
                                                        labelInfo = this.getImageInfo(chars, textKey, fillKey, "");
                                                        labelInstructions[labelIndex] = {
                                                            chars: chars,
                                                            textKey: textKey,
                                                            fillKey: fillKey,
                                                            strokeKey: ""
                                                        }
                                                        labelIndex += 1;
                                                    }
                                                    else {
                                                        labelInfo = /** @type {ol.render.canvas.TextReplay} */ (this).getImage(chars, textKey, fillKey, "");
                                                    }
                                                    anchorX = /** @type {number} */ (part[2]);
                                                    anchorY = baseline * labelInfo["height"] - offsetY;
                                                    this.replayImage_(context, /** @type {number} */(part[0]), /** @type {number} */(part[1]), labelInfo, anchorX, anchorY, tempDeclutterGroup, labelInfo["height"], 1, 0, 0, /** @type {number} */(part[3]), textScale, false, labelInfo["width"], defaultPadding, null, null);
                                                }
                                            }
                                            declutterGroups.push(tempDeclutterGroup);
                                        }
                                    }
                                }
                                else {
                                    let tempDeclutterGroup;
                                    if (declutterGroup) {
                                        tempDeclutterGroup = featureCallback ? null : declutterGroup.slice(0);
                                    }
                                    let textAlign = /** @type {ol.render.canvas.TextReplay} */ (this).textStates[textKey].textAlign;
                                    let startM = (pathLength - textLength) * TEXT_ALIGN[textAlign];
                                    let parts = drawTextOnPath(pixelCoordinates, begin, end, 2, text, measure, startM, maxAngle);
                                    if (parts) {
                                        let c, cc, chars, label, part;
                                        if (strokeKey) {
                                            for (c = 0, cc = parts.length; c < cc; ++c) {
                                                part = parts[c]; // x, y, anchorX, rotation, chunk
                                                chars = /** @type {string} */ (part[4]);

                                                let labelInfo = undefined;

                                                if (tempDeclutterGroup) {
                                                    labelInfo = this.getImageInfo(chars, textKey, "", strokeKey);
                                                    labelInstructions[labelIndex] = {
                                                        chars: chars,
                                                        textKey: textKey,
                                                        fillKey: fillKey,
                                                        strokeKey: ""
                                                    }
                                                    labelIndex += 1;

                                                }
                                                else {
                                                    labelInfo = /** @type {ol.render.canvas.TextReplay} */ (this).getImage(chars, textKey, "", strokeKey);
                                                }
                                                anchorX = /** @type {number} */ (part[2]) + strokeWidth;
                                                anchorY = baseline * labelInfo["height"] + (0.5 - baseline) * 2 * strokeWidth - offsetY;

                                                this.replayImage_(context, /** @type {number} */(part[0]), /** @type {number} */(part[1]), labelInfo, anchorX, anchorY, tempDeclutterGroup, labelInfo["height"], 1, 0, 0, /** @type {number} */(part[3]), textScale, false, labelInfo["width"], defaultPadding, null, null);
                                            }
                                        }

                                        if (fillKey) {
                                            for (c = 0, cc = parts.length; c < cc; ++c) {
                                                part = parts[c];
                                                chars = /** @type {string} */ (part[4]);
                                                let labelInfo = undefined;
                                                if (tempDeclutterGroup) {
                                                    labelInfo = this.getImageInfo(chars, textKey, fillKey, "");
                                                    labelInstructions[labelIndex] = {
                                                        chars: chars,
                                                        textKey: textKey,
                                                        fillKey: fillKey,
                                                        strokeKey: ""
                                                    }
                                                    labelIndex += 1;
                                                }
                                                else {
                                                    labelInfo = /** @type {ol.render.canvas.TextReplay} */ (this).getImage(chars, textKey, fillKey, "");
                                                }
                                                anchorX = /** @type {number} */ (part[2]);
                                                anchorY = baseline * labelInfo["height"] - offsetY;
                                                this.replayImage_(context, /** @type {number} */(part[0]), /** @type {number} */(part[1]), labelInfo, anchorX, anchorY, tempDeclutterGroup, labelInfo["height"], 1, 0, 0, /** @type {number} */(part[3]), textScale, false, labelInfo["width"], defaultPadding, null, null);
                                            }
                                        }
                                        declutterGroups.push(tempDeclutterGroup);
                                    }
                                }

                                for (let d = 0; d < declutterGroups.length; d++) {
                                    let targetDeclutterGroup = declutterGroups[d];
                                    if (targetDeclutterGroup && targetDeclutterGroup.length > 5) {
                                        // let targetExtent = [targetDeclutterGroup[0], targetDeclutterGroup[1], targetDeclutterGroup[2], targetDeclutterGroup[3]];
                                        // if (targetExtent[0] > pixelExten[0] && targetExtent[1] > pixelExten[3] && targetExtent[2] < pixelExten[2] && targetExtent[3] < pixelExten[1]) {
                                        this.renderDeclutterChar_(targetDeclutterGroup, feature);
                                        // }
                                    }
                                }
                            }
                        }
                        else {
                            instruction[16] = true;
                        }
                    }
                    ++i;
                    break;
                case CanvasInstruction.END_GEOMETRY:
                    if (featureCallback !== undefined) {
                        feature = /** @type {import("../../Feature.js").default|import("../Feature.js").default} */ (instruction[1]);
                        const result = featureCallback(feature);
                        if (result) {
                            return result;
                        }
                    }
                    ++i;
                    break;
                case CanvasInstruction.FILL:
                    if (batchSize) {
                        pendingFill++;
                    } else {
                        this.fill_(context);
                    }
                    ++i;
                    break;
                case CanvasInstruction.MOVE_TO_LINE_TO:
                    d = /** @type {number} */ (instruction[1]);
                    dd = /** @type {number} */ (instruction[2]);
                    x = pixelCoordinates[d];
                    y = pixelCoordinates[d + 1];
                    roundX = (x + 0.5) | 0;
                    roundY = (y + 0.5) | 0;
                    if (roundX !== prevX || roundY !== prevY) {
                        context.moveTo(x, y);
                        prevX = roundX;
                        prevY = roundY;
                    }
                    for (d += 2; d < dd; d += 2) {
                        x = pixelCoordinates[d];
                        y = pixelCoordinates[d + 1];
                        roundX = (x + 0.5) | 0;
                        roundY = (y + 0.5) | 0;
                        if (d == dd - 2 || roundX !== prevX || roundY !== prevY) {
                            context.lineTo(x, y);
                            prevX = roundX;
                            prevY = roundY;
                        }
                    }
                    ++i;
                    break;
                case CanvasInstruction.SET_FILL_STYLE:
                    lastFillInstruction = instruction;
                    this.alignFill_ = instruction[2];

                    if (pendingFill) {
                        this.fill_(context);
                        pendingFill = 0;
                        if (pendingStroke) {
                            context.stroke();
                            pendingStroke = 0;
                        }
                    }

                    context.fillStyle = /** @type {import("../../colorlike.js").ColorLike} */ (instruction[1]);
                    ++i;
                    break;
                case CanvasInstruction.SET_STROKE_STYLE:
                    lastStrokeInstruction = instruction;
                    if (pendingStroke) {
                        context.stroke();
                        pendingStroke = 0;
                    }
                    this.setStrokeStyle_(context, /** @type {Array<*>} */(instruction));
                    ++i;
                    break;
                case CanvasInstruction.STROKE:
                    if (batchSize) {
                        pendingStroke++;
                    } else {
                        context.stroke();
                    }
                    ++i;
                    break;
                default:
                    ++i; // consume the instruction anyway, to avoid an infinite loop
                    break;
            }
        }
        if (pendingFill) {
            this.fill_(context);
        }
        if (pendingStroke) {
            context.stroke();
        }
        return undefined;
    }

    getImageInfo(text, textKey, fillKey, strokeKey) {
        var labelInfo = {};
        labelInfo["text"] = text;
        labelInfo["textKey"] = textKey;
        labelInfo["fillKey"] = fillKey;
        labelInfo["strokeKey"] = strokeKey;
        var label;
        var key = strokeKey + textKey + text + fillKey + this.pixelRatio;

        if (!this.labelInfoCache.containsKey(key)) {
            var strokeState = strokeKey ? this.strokeStates[strokeKey] || this.textStrokeState_ : null;
            var fillState = fillKey ? this.fillStates[fillKey] || this.textFillState_ : null;
            var textState = this.textStates[textKey] || this.textState_;
            var pixelRatio = this.pixelRatio;
            var scale = textState.scale * pixelRatio;
            var align = TEXT_ALIGN[textState.textAlign || defaultTextAlign];
            var strokeWidth = strokeKey && strokeState.lineWidth ? strokeState.lineWidth : 0;

            var lines = text.split('\n');
            var numLines = lines.length;
            var widths = [];

            var width = measureTextWidths(textState.font, lines, widths);
            var lineHeight = textState.lineHeight;
            var height = lineHeight * numLines;
            var renderWidth = (width + strokeWidth);

            labelInfo["width"] = Math.ceil(renderWidth * scale);
            labelInfo["widths"] = widths;
            labelInfo["height"] = Math.ceil((height + strokeWidth) * scale);
            this.labelInfoCache.set(key, labelInfo);
            return labelInfo;
        }

        return this.labelInfoCache.get(key);
    }

    drawText(geometry, feature) {
        let fillState = this.textFillState_;
        let strokeState = this.textStrokeState_;
        let textState = this.textState_;
        let geometryType = geometry.getType();

        if (this.text_ === "" || !textState || (!fillState && !strokeState)) {
            return;
        }

        if (this.labelPosition === undefined) {
            return;
        }

        if ((geometryType === GeometryType.LINE_STRING || geometryType === GeometryType.MULTI_LINE_STRING) && !this.label) {
            let begin = this.coordinates.length;
            let geometryType = geometry.getType();
            let flatCoordinates = this.labelPosition;
            let end = 2;
            let stride = 2;
            let i, ii;
            // if (!ol.extent.intersects(this.getBufferedMaxExtent(), geometry.getExtent())) {
            //     return;
            // }
            let ends;
            // flatCoordinates = geometry.getFlatCoordinates();
            stride = geometry.getStride();
            if (geometryType === GeometryType.LINE_STRING) {
                ends = [flatCoordinates.length];
            } else if (geometryType === GeometryType.MULTI_LINE_STRING) {
                ends = geometry.getEnds();
            } else if (geometryType === GeometryType.POLYGON) {
                ends = geometry.getEnds().slice(0, 1);
            } else if (geometryType === GeometryType.MULTI_POLYGON) {
                let endss = geometry.getEndss();
                ends = [];
                for (i = 0, ii = endss.length; i < ii; ++i) {
                    ends.push(endss[i][0]);
                }
            }
            this.beginGeometry(geometry, feature);
            let textAlign = textState.textAlign;
            let flatOffset = 0;
            let flatEnd;
            for (let o = 0, oo = ends.length; o < oo; ++o) {
                if (textAlign === undefined) {
                    let range = matchingChunk(
                        textState.maxAngle, flatCoordinates, flatOffset, ends[o], stride);
                    flatOffset = range[0];
                    flatEnd = range[1];
                } else {
                    flatEnd = ends[o];
                }
                for (i = flatOffset; i < flatEnd; i += stride) {
                    this.coordinates.push(flatCoordinates[i], flatCoordinates[i + 1]);
                }
                end = this.coordinates.length;
                flatOffset = ends[o];
                this.drawChars_(begin, end, this.declutterGroup_);
                begin = end;
            }

            this.endGeometry(geometry, feature);
            return;
        }

        let begin = this.coordinates.length;
        let flatCoordinates = this.labelPosition;
        let end = 2;
        let stride = 2;
        let label = this.label;

        if (geometry.getType() === GeometryType.POLYGON) {
            stride = 3;
        }
        end = flatCoordinates.length;
        end = this.appendFlatCoordinates(flatCoordinates, 0, end, stride, false, false);
        this.beginGeometry(geometry, feature);
        if (textState.backgroundFill || textState.backgroundStroke) {
            this.setFillStrokeStyle(textState.backgroundFill, textState.backgroundStroke);
            this.updateFillStyle(this.state, this.applyFill, geometry);
            this.updateStrokeStyle(this.state, this.applyStroke);
        }
        this.drawTextImage_(label, begin, end);
        this.endGeometry(geometry, feature);
    }
    drawChars_(begin, end, declutterGroup) {
        var strokeState = this.textStrokeState_;
        var textState = this.textState_;
        var fillState = this.textFillState_;

        var strokeKey = this.strokeKey_;
        if (strokeState) {
            if (!(strokeKey in this.strokeStates)) {
                this.strokeStates[strokeKey] = /** @type {ol.CanvasStrokeState} */ ({
                    strokeStyle: strokeState.strokeStyle,
                    lineCap: strokeState.lineCap,
                    lineDashOffset: strokeState.lineDashOffset,
                    lineWidth: strokeState.lineWidth,
                    lineJoin: strokeState.lineJoin,
                    miterLimit: strokeState.miterLimit,
                    lineDash: strokeState.lineDash
                });
            }
        }
        var textKey = this.textKey_;
        if (!(this.textKey_ in this.textStates)) {
            this.textStates[this.textKey_] = /** @type {ol.CanvasTextState} */ ({
                font: textState.font,
                lineHeight: measureTextHeight(textState.font),
                textAlign: textState.textAlign || defaultTextAlign,
                scale: textState.scale
            });
        }
        var fillKey = this.fillKey_;
        if (fillState) {
            if (!(fillKey in this.fillStates)) {
                this.fillStates[fillKey] = /** @type {ol.CanvasFillState} */ ({
                    fillStyle: fillState.fillStyle
                });
            }
        }

        var pixelRatio = this.pixelRatio;
        var baseline = TEXT_ALIGN[textState.textBaseline];

        var offsetY = this.textOffsetY_ * pixelRatio;
        var text = this.text_;
        var font = textState.font;
        var textScale = textState.scale;
        var strokeWidth = strokeState ? strokeState.lineWidth * textScale / 2 : 0;
        var widths = this.widths_[font];
        if (!widths) {
            this.widths_[font] = widths = {};
        }
        var charWidths = this.charWidths[font];

        this.instructions.push([CanvasInstruction.DRAW_CHARS,
            begin, end, baseline, declutterGroup,
        textState.overflow, fillKey, textState.maxAngle,
        function (text) {
            var width = widths[text];
            if (!width) {
                // width = widths[text] = measureTextWidth(font, text);
                width = widths[text] = getEstimatedWidth(font, [text], charWidths, [], undefined);
            }
            return width * textScale * pixelRatio;
        },
            offsetY, strokeKey, strokeWidth * pixelRatio, text, textKey, 1, textState.textSpacing
        ]);
        this.hitDetectionInstructions.push([CanvasInstruction.DRAW_CHARS,
            begin, end, baseline, declutterGroup,
        textState.overflow, fillKey, textState.maxAngle,
        function (text) {
            var width = widths[text];
            if (!width) {
                // width = widths[text] = measureTextWidth(font, text);
                width = widths[text] = getEstimatedWidth(font, [text], charWidths, [], undefined);
            }
            return width * textScale;
        },
            offsetY, strokeKey, strokeWidth, text, textKey, 1 / pixelRatio, textState.textSpacing
        ]);
    };

    setTextStyle(textStyle, declutterGroup) {
        let textState, fillState, strokeState;
        if (!textStyle) {
            this.text_ = '';
        } else {
            this.declutterGroup_ = /** @type {import("../canvas.js").DeclutterGroup} */ (declutterGroup);

            const textFillStyle = textStyle.getFill();
            if (!textFillStyle) {
                fillState = this.textFillState_ = null;
            } else {
                fillState = this.textFillState_;
                if (!fillState) {
                    fillState = this.textFillState_ = /** @type {import("../canvas.js").FillState} */ ({});
                }
                fillState.fillStyle = asColorLike(
                    textFillStyle.getColor() || defaultFillStyle);
            }

            const textStrokeStyle = textStyle.getStroke();
            if (!textStrokeStyle) {
                strokeState = this.textStrokeState_ = null;
            } else {
                strokeState = this.textStrokeState_;
                if (!strokeState) {
                    strokeState = this.textStrokeState_ = /** @type {import("../canvas.js").StrokeState} */ ({});
                }
                const lineDash = textStrokeStyle.getLineDash();
                const lineDashOffset = textStrokeStyle.getLineDashOffset();
                const lineWidth = textStrokeStyle.getWidth();
                const miterLimit = textStrokeStyle.getMiterLimit();
                strokeState.lineCap = textStrokeStyle.getLineCap() || defaultLineCap;
                strokeState.lineDash = lineDash ? lineDash.slice() : defaultLineDash;
                strokeState.lineDashOffset =
                    lineDashOffset === undefined ? defaultLineDashOffset : lineDashOffset;
                strokeState.lineJoin = textStrokeStyle.getLineJoin() || defaultLineJoin;
                strokeState.lineWidth =
                    lineWidth === undefined ? defaultLineWidth : lineWidth;
                strokeState.miterLimit =
                    miterLimit === undefined ? defaultMiterLimit : miterLimit;
                strokeState.strokeStyle = asColorLike(
                    textStrokeStyle.getColor() || defaultStrokeStyle);
            }

            textState = this.textState_;
            const font = textStyle.getFont() || defaultFont;
            checkFont(font);
            const textScale = textStyle.getScale();
            textState.overflow = textStyle.getOverflow();
            textState.font = font;
            textState.maxAngle = textStyle.getMaxAngle();
            textState.placement = textStyle.getPlacement();
            textState.textAlign = textStyle.getTextAlign();
            textState.textBaseline = textStyle.getTextBaseline() || defaultTextBaseline;
            textState.backgroundFill = textStyle.getBackgroundFill();
            textState.backgroundStroke = textStyle.getBackgroundStroke();
            textState.padding = textStyle.getPadding() || defaultPadding;
            textState.scale = textScale === undefined ? 1 : textScale;
            textState.textSpacing = textStyle.textSpacing === undefined ? 400 : textStyle.textSpacing;

            const textOffsetX = textStyle.getOffsetX();
            const textOffsetY = textStyle.getOffsetY();
            const textRotateWithView = textStyle.getRotateWithView();
            const textRotation = textStyle.getRotation();
            this.text_ = textStyle.getText() || '';
            this.textOffsetX_ = textOffsetX === undefined ? 0 : textOffsetX;
            this.textOffsetY_ = textOffsetY === undefined ? 0 : textOffsetY;
            this.textRotateWithView_ = textRotateWithView === undefined ? false : textRotateWithView;
            this.textRotation_ = textRotation === undefined ? 0 : textRotation;

            this.strokeKey_ = strokeState ?
                (typeof strokeState.strokeStyle == 'string' ? strokeState.strokeStyle : getUid(strokeState.strokeStyle)) +
                strokeState.lineCap + strokeState.lineDashOffset + '|' + strokeState.lineWidth +
                strokeState.lineJoin + strokeState.miterLimit + '[' + strokeState.lineDash.join() + ']' :
                '';
            this.textKey_ = textState.font + textState.scale + (textState.textAlign || '?');
            this.fillKey_ = fillState ?
                (typeof fillState.fillStyle == 'string' ? fillState.fillStyle : ('|' + getUid(fillState.fillStyle))) :
                '';
            this.label = textStyle.label;
            this.labelPosition = textStyle.labelPosition;
            this.charWidths[textState.font] = textStyle.charWidths;
        }
    }

    renderDeclutterChar_(declutterGroup, feature) {
        if (declutterGroup && declutterGroup.length > 5) {
            var groupCount = declutterGroup[4];
            if (groupCount == 1 || groupCount == declutterGroup.length - 5) {
                /** @type {ol.RBushEntry} */
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
                        var declutterData = /** @type {Array} */ (declutterGroup[j]);
                        if (declutterData) {
                            if (declutterData.length > 11) {
                                this.replayTextBackground_(declutterData[0],
                                    declutterData[13], declutterData[14], declutterData[15], declutterData[16],
                                    declutterData[11], declutterData[12]);
                            }
                            let labelInfo = declutterData[3];
                            let labelImage = this.getImage(labelInfo["text"], labelInfo["textKey"], labelInfo["fillKey"], labelInfo["strokeKey"]);
                            declutterData[3] = labelImage;
                            drawImage.apply(undefined, declutterData);
                        }
                    }
                }
                declutterGroup.length = 5;
                createOrUpdateEmpty(declutterGroup);
            }
        }
    };


    replayImage_(
        context,
        x,
        y,
        image,
        anchorX,
        anchorY,
        declutterGroup,
        height,
        opacity,
        originX,
        originY,
        rotation,
        scale,
        snapToPixel,
        width,
        padding,
        fillInstruction,
        strokeInstruction
    ) {
        const fillStroke = fillInstruction || strokeInstruction;
        anchorX *= scale;
        anchorY *= scale;
        x -= anchorX;
        y -= anchorY;

        const w = (width + originX > image.width) ? image.width - originX : width;
        const h = (height + originY > image.height) ? image.height - originY : height;
        const boxW = padding[3] + w * scale + padding[1];
        const boxH = padding[0] + h * scale + padding[2];
        const boxX = x - padding[3];
        const boxY = y - padding[0];

        /** @type {import("../../coordinate.js").Coordinate} */
        let p1;
        /** @type {import("../../coordinate.js").Coordinate} */
        let p2;
        /** @type {import("../../coordinate.js").Coordinate} */
        let p3;
        /** @type {import("../../coordinate.js").Coordinate} */
        let p4;
        if (fillStroke || rotation !== 0) {
            p1 = [boxX, boxY];
            p2 = [boxX + boxW, boxY];
            p3 = [boxX + boxW, boxY + boxH];
            p4 = [boxX, boxY + boxH];
        }

        let transform = null;
        if (rotation !== 0) {
            const centerX = x + anchorX;
            const centerY = y + anchorY;
            transform = composeTransform(tmpTransform, centerX, centerY, 1, 1, rotation, -centerX, -centerY);

            createOrUpdateEmpty(tmpExtent);
            extendCoordinate(tmpExtent, applyTransform(tmpTransform, p1));
            extendCoordinate(tmpExtent, applyTransform(tmpTransform, p2));
            extendCoordinate(tmpExtent, applyTransform(tmpTransform, p3));
            extendCoordinate(tmpExtent, applyTransform(tmpTransform, p4));
        } else {
            createOrUpdate(boxX, boxY, boxX + boxW, boxY + boxH, tmpExtent);
        }
        const canvas = context.canvas;
        const strokePadding = strokeInstruction ? (strokeInstruction[2] * scale / 2) : 0;
        const intersects =
            tmpExtent[0] - strokePadding <= canvas.width && tmpExtent[2] + strokePadding >= 0 &&
            tmpExtent[1] - strokePadding <= canvas.height && tmpExtent[3] + strokePadding >= 0;

        if (snapToPixel) {
            x = Math.ceil(x);
            y = Math.ceil(y);
        }

        if (declutterGroup) {
            if (!intersects && declutterGroup[4] == 1) {
                return;
            }
            extend(declutterGroup, tmpExtent);
            const declutterArgs = intersects ?
                [context, transform ? transform.slice(0) : null, opacity, image, originX, originY, w, h, x, y, scale] :
                null;
            if (declutterArgs && fillStroke) {
                declutterArgs.push(fillInstruction, strokeInstruction, p1, p2, p3, p4);
            }
            declutterGroup.push(declutterArgs);
        } else if (intersects) {
            if (fillStroke) {
                this.replayTextBackground_(context, p1, p2, p3, p4,
              /** @type {Array<*>} */(fillInstruction),
              /** @type {Array<*>} */(strokeInstruction));
            }
            drawImage(context, transform, opacity, image, originX, originY, w, h, x, y, scale);
        }
    }


    getCenterAnchor(startM, endM, textLength, distance, pointArray) {
        if (endM - startM > distance) {
            var center = (endM + startM - textLength) / 2;
            pointArray.push(center);
            if (center - startM > distance * 2) {
                this.getCenterAnchor(startM, center, textLength, distance, pointArray);
            }
            if (endM - center > distance * 2) {
                this.getCenterAnchor(center, endM, textLength, distance, pointArray);
            }
        }
    }
}

export function measureTextWidths(font, lines, widths) {
    const numLines = lines.length;
    let width = 0;
    for (let i = 0; i < numLines; ++i) {
        const currentWidth = measureTextWidth(font, lines[i]);
        width = Math.max(width, currentWidth);
        widths.push(currentWidth);
    }
    return width;
}

export function getEstimatedWidth(font, lines, charWidths, widths, letterSpacing) {
    let numLines = lines.length;
    let width = 0;
    let currentWidth, i;
    for (i = 0; i < numLines; ++i) {
        currentWidth = 0;
        for (let j = 0; j < lines[i].length; j++) {
            let charWidth = charWidths[lines[i][j]];
            if (charWidth) {
                currentWidth += charWidth;
            }
            else {
                currentWidth += charWidths["W"];
            }
        }
        if (letterSpacing) {
            currentWidth = currentWidth + (lines[i].length - 1) * letterSpacing;
        }
        width = Math.max(width, currentWidth);
        widths.push(currentWidth);
    }
    return width;
}

export default GeoCanvasTextReplay
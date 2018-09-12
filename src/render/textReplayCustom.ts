import { TextLabelingStrategy } from "../style/textLabelingStrategy";
import { DetectTextLabelingStrategy } from "../style/detectTextLabelingStrategy";
import { GeoTextStyle } from "../style/geoTextStyle";

export class TextReplayCustom extends ((<any>ol.render.canvas).TextReplay as { new(tolerance: number, maxExtent: any, resolution: number, pixelRatio: number, overlaps: boolean, declutterTree: any); }) {
    labelInfoCache: any;

    constructor(tolerance: number, maxExtent: any, resolution: number, pixelRatio: number, overlaps: boolean, declutterTree: any) {
        super(tolerance, maxExtent, resolution, pixelRatio, overlaps, declutterTree);
        this.drawText = this.drawTextCustom;
        this.setTextStyle = this.setTextStyleCustom;
        this.replay_ = this.replayCustom;
        this.labelInfoCache = new (<any>ol).structs.LRUCache();
    }

    public replayCustom(context: CanvasRenderingContext2D, transform: any, skippedFeaturesHash: any, instructions: any[], featureCallback: any, opt_hitExtent: [number, number, number, number]) {
        /** @type {Array.<number>} */
        let pixelExten;

        pixelExten = (<any>ol.geom).flat.transform.transform2D(this.maxExtent, 0, this.maxExtent.length, 2, transform, this["pixelExten"]);

        let pixelCoordinates;
        if (this.pixelCoordinates_ && (<any>ol).array.equals(transform, this.renderedTransform_)) {
            pixelCoordinates = this.pixelCoordinates_;
        } else {
            if (!this.pixelCoordinates_) {
                this.pixelCoordinates_ = [];
            }
            pixelCoordinates = (<any>ol.geom).flat.transform.transform2D(this.coordinates, 0, this.coordinates.length, 2, transform, this.pixelCoordinates_); (<any>ol).transform.setFromArray(this.renderedTransform_, transform);
        }

        let quickZoom = false;
        if (context["quickZoom"] !== undefined) {
            quickZoom = context["quickZoom"];
        }

        let skipFeatures = !(<any>ol).obj.isEmpty(skippedFeaturesHash);
        let i = 0; // instruction index
        let ii = instructions.length; // end of instructions
        let d = 0; // data index
        let dd; // end of per-instruction data
        let anchorX, anchorY, prevX, prevY, roundX, roundY, declutterGroup, image;
        let pendingFill = 0;
        let pendingStroke = 0;
        let lastFillInstruction = null;
        let lastStrokeInstruction = null;
        let coordinateCache = this.coordinateCache_;
        let viewRotation = this.viewRotation_;

        let state = /** @type {olx.render.State} */ ({
            context: context,
            pixelRatio: this.pixelRatio,
            resolution: this.resolution,
            rotation: viewRotation
        });

        // When the batch size gets too big, performance decreases. 200 is a good
        // balance between batch size and number of fill/stroke instructions.
        let batchSize = this.instructions !== instructions || this.overlaps ? 0 : 200;
        var currentResolution = context["currentResolution"];
        var ratio = window.devicePixelRatio * 1.194328566955879 / currentResolution;
        
        // different label distance between desktop and mobile
        // if(!navigator.userAgent.match(/(pad|iPad|iOS|Android|iPhone)/i) && ratio >= 3){            
        //     ratio /= 2;
        // }
        
        while (i < ii) {
            let instruction = instructions[i];
            let type = /** @type {ol.render.canvas.Instruction} */ (instruction[0]);
            let /** @type {ol.Feature|ol.render.Feature} */ feature, x, y;
            switch (type) {
                case (<any>ol.render.canvas).Instruction.BEGIN_GEOMETRY:
                    feature = /** @type {ol.Feature|ol.render.Feature} */ (instruction[1]);
                    if ((skipFeatures && skippedFeaturesHash[(<any>ol).getUid(feature).toString()]) || !feature.getGeometry()) {
                        i = /** @type {number} */ (instruction[2]);
                    } else if (opt_hitExtent !== undefined && !ol.extent.intersects(opt_hitExtent, feature.getGeometry().getExtent())) {
                        i = /** @type {number} */ (instruction[2]) + 1;
                    } else {
                        ++i;
                    }
                    break;
                case (<any>ol.render.canvas).Instruction.BEGIN_PATH:
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
                case (<any>ol.render.canvas).Instruction.CIRCLE:
                    d = /** @type {number} */ (instruction[1]);
                    let x1 = pixelCoordinates[d];
                    let y1 = pixelCoordinates[d + 1];
                    let x2 = pixelCoordinates[d + 2];
                    let y2 = pixelCoordinates[d + 3];
                    let dx = x2 - x1;
                    let dy = y2 - y1;
                    let r = Math.sqrt(dx * dx + dy * dy);
                    context.moveTo(x1 + r, y1);
                    context.arc(x1, y1, r, 0, 2 * Math.PI, true);
                    ++i;
                    break;
                case (<any>ol.render.canvas).Instruction.CLOSE_PATH:
                    context.closePath();
                    ++i;
                    break;
                case (<any>ol.render.canvas).Instruction.CUSTOM:
                    d = /** @type {number} */ (instruction[1]);
                    dd = instruction[2];
                    let geometry = /** @type {ol.geom.SimpleGeometry} */ (instruction[3]);
                    let renderer = instruction[4];
                    let fn = instruction.length === 6 ? instruction[5] : undefined;
                    (<any>state).geometry = geometry;
                    (<any>state).feature = feature;
                    if (!(i in coordinateCache)) {
                        coordinateCache[i] = [];
                    }
                    let coords = coordinateCache[i];
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
                case (<any>ol.render.canvas).Instruction.DRAW_IMAGE:
                    d = /** @type {number} */ (instruction[1]);
                    dd = /** @type {number} */ (instruction[2]);
                    image =  /** @type {HTMLCanvasElement|HTMLVideoElement|Image} */ (instruction[3]);
                    // Remaining arguments in DRAW_IMAGE are in alphabetical order
                    anchorX = /** @type {number} */ (instruction[4]);
                    anchorY = /** @type {number} */ (instruction[5]);
                    declutterGroup = featureCallback ? null : /** @type {ol.DeclutterGroup} */ (instruction[6]);
                    let height = /** @type {number} */ (instruction[7]);
                    let opacity = /** @type {number} */ (instruction[8]);
                    let originX = /** @type {number} */ (instruction[9]);
                    let originY = /** @type {number} */ (instruction[10]);
                    let rotateWithView = /** @type {boolean} */ (instruction[11]);
                    let rotation = /** @type {number} */ (instruction[12]);
                    let scale = /** @type {number} */ (instruction[13]);
                    let snapToPixel = /** @type {boolean} */ (instruction[14]);
                    let width = /** @type {number} */ (instruction[15]);

                    let padding, backgroundFill, backgroundStroke;
                    if (instruction.length > 16) {
                        padding = /** @type {Array.<number>} */ (instruction[16]);
                        backgroundFill = /** @type {boolean} */ (instruction[17]);
                        backgroundStroke = /** @type {boolean} */ (instruction[18]);
                    } else {
                        padding = (<any>ol.render.canvas).defaultPadding;
                        backgroundFill = backgroundStroke = false;
                    }

                    if (rotateWithView) {
                        rotation += viewRotation;
                    }
                    for (; d < dd; d += 2) {
                        this.replayImage_(context, pixelCoordinates[d], pixelCoordinates[d + 1], image, anchorX, anchorY, declutterGroup, height, opacity, originX, originY, rotation, scale, snapToPixel, width, padding, backgroundFill ? /** @type {Array.<*>} */ (lastFillInstruction) : null, backgroundStroke ? /** @type {Array.<*>} */ (lastStrokeInstruction) : null);
                    }
                    this.renderDeclutter_(declutterGroup, feature);
                    ++i;
                    break;
                case (<any>ol.render.canvas).Instruction.DRAW_CHARS:
                    if (!quickZoom) {
                        let begin = /** @type {number} */ (instruction[1]);
                        let end = /** @type {number} */ (instruction[2]);
                        let baseline = /** @type {number} */ (instruction[3]);
                        declutterGroup = featureCallback ? null : /** @type {ol.DeclutterGroup} */ (instruction[4]);
                        let overflow = /** @type {number} */ (instruction[5]);
                        let fillKey = /** @type {string} */ (instruction[6]);
                        let maxAngle = /** @type {number} */ (instruction[7]);
                        let measure = /** @type {function(string):number} */ (instruction[8]);
                        let offsetY = /** @type {number} */ (instruction[9]);
                        let strokeKey = /** @type {string} */ (instruction[10]);
                        let strokeWidth =  /** @type {number} */ (instruction[11]);
                        let text = /** @type {string} */ (instruction[12]);
                        let textKey = /** @type {string} */ (instruction[13]);
                        let textScale = /** @type {number} */ (instruction[14]);

                        let declutterGroups = [];
                        let pathLength = (<any>ol.geom).flat.length.lineString(pixelCoordinates, begin, end, 2);
                        let textLength = measure(text);
                        if (overflow || textLength * 1.2 <= pathLength) {
                            // The original logical is create label image --> declutterGroup --> draw label image to context
                            // The newest logical is  create label info and create image instruction --> declutterGroup --> create label image --> draw label image to context

                            let labelInstructions = [];
                            let labelIndex = 0;

                            if (currentResolution < 1) {
                                var distance = 180 * ratio;
                                var tmpLength = pathLength - textLength;
                                var centerPoint = tmpLength / 2;
                                var leftPoint = centerPoint;
                                var rightPoint = centerPoint;
                                var pointArray = [];
                                pointArray.push(centerPoint);

                                while(leftPoint > ((textLength / 2) + distance)){
                                    leftPoint = leftPoint - distance;
                                    pointArray.push(leftPoint);        
                                }
                                while(rightPoint < ((pathLength - textLength / 2) - distance)){
                                    rightPoint = rightPoint + distance;                                   
                                    pointArray.push(rightPoint);                                    
                                }

                                for (var len = 0; len < pointArray.length; len++) {
                                    let tempDeclutterGroup;
                                    if (declutterGroup) {
                                        tempDeclutterGroup = featureCallback ? null : declutterGroup.slice(0);
                                    }
                                    var startM = pointArray[len];
                                    let parts = (<any>ol.geom).flat.textpath.lineString(pixelCoordinates, begin, end, 2, text, measure, startM, maxAngle);
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
                                                this.replayImage_(context, /** @type {number} */(part[0]), /** @type {number} */(part[1]), labelInfo, anchorX, anchorY, tempDeclutterGroup, labelInfo["height"], 1, 0, 0, /** @type {number} */(part[3]), textScale, false, labelInfo["width"], (<any>ol.render.canvas).defaultPadding, null, null);
                                            }
                                        }
                                        if (fillKey) {
                                            for (c = 0, cc = parts.length; c < cc; ++c) {
                                                part = parts[c]; // x, y, anchorX, rotation, chunk
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
                                                this.replayImage_(context, /** @type {number} */(part[0]), /** @type {number} */(part[1]), labelInfo, anchorX, anchorY, tempDeclutterGroup, labelInfo["height"], 1, 0, 0, /** @type {number} */(part[3]), textScale, false, labelInfo["width"], (<any>ol.render.canvas).defaultPadding, null, null);
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
                                let startM = (pathLength - textLength) * (<any>ol.render).replay.TEXT_ALIGN[textAlign];
                                let parts = (<any>ol.geom).flat.textpath.lineString(pixelCoordinates, begin, end, 2, text, measure, startM, maxAngle);
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


                                            // label = /** @type {ol.render.canvas.TextReplay} */ (this).getImage(chars, textKey, "", strokeKey);
                                            anchorX = /** @type {number} */ (part[2]) + strokeWidth;
                                            anchorY = baseline * labelInfo["height"] + (0.5 - baseline) * 2 * strokeWidth - offsetY;
                                            this.replayImage_(context, /** @type {number} */(part[0]), /** @type {number} */(part[1]), labelInfo, anchorX, anchorY, tempDeclutterGroup, labelInfo["height"], 1, 0, 0, /** @type {number} */(part[3]), textScale, false, labelInfo["width"], (<any>ol.render.canvas).defaultPadding, null, null);
                                        }
                                    }
                                    if (fillKey) {
                                        for (c = 0, cc = parts.length; c < cc; ++c) {
                                            part = parts[c]; // x, y, anchorX, rotation, chunk
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
                                            this.replayImage_(context, /** @type {number} */(part[0]), /** @type {number} */(part[1]), labelInfo, anchorX, anchorY, tempDeclutterGroup, labelInfo["height"], 1, 0, 0, /** @type {number} */(part[3]), textScale, false, labelInfo["width"], (<any>ol.render.canvas).defaultPadding, null, null);
                                        }
                                    }
                                    declutterGroups.push(tempDeclutterGroup);
                                }
                            }

                        }
                        
                        for (let d = 0; d < declutterGroups.length; d++) {
                            let targetDeclutterGroup = declutterGroups[d];
                            if (targetDeclutterGroup && targetDeclutterGroup.length > 5) {
                                let targetExtent = [targetDeclutterGroup[0], targetDeclutterGroup[1], targetDeclutterGroup[2], targetDeclutterGroup[3]];
                                // if (targetExtent[0] > pixelExten[0] && targetExtent[1] > pixelExten[3] && targetExtent[2] < pixelExten[2] && targetExtent[3] < pixelExten[1]) {
                                    this.renderDeclutterChar_(targetDeclutterGroup, feature);
                                // }
                            }
                        }
                    }
                    ++i;
                    break;
                case (<any>ol.render.canvas).Instruction.END_GEOMETRY:
                    if (featureCallback !== undefined) {
                        feature = /** @type {ol.Feature|ol.render.Feature} */ (instruction[1]);
                        let result = featureCallback(feature);
                        if (result) {
                            return result;
                        }
                    }
                    ++i;
                    break;
                case (<any>ol.render.canvas).Instruction.FILL:
                    if (batchSize) {
                        pendingFill++;
                    } else {
                        this.fill_(context);
                    }
                    ++i;
                    break;
                case (<any>ol.render.canvas).Instruction.MOVE_TO_LINE_TO:
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
                        if (d === dd - 2 || roundX !== prevX || roundY !== prevY) {
                            context.lineTo(x, y);
                            prevX = roundX;
                            prevY = roundY;
                        }
                    }
                    ++i;
                    break;
                case (<any>ol.render.canvas).Instruction.SET_FILL_STYLE:
                    lastFillInstruction = instruction;
                    this.fillOrigin_ = instruction[2];

                    if (pendingFill) {
                        this.fill_(context);
                        pendingFill = 0;
                        if (pendingStroke) {
                            context.stroke();
                            pendingStroke = 0;
                        }
                    }

                    context.fillStyle = /** @type {ol.ColorLike} */ (instruction[1]);
                    ++i;
                    break;
                case (<any>ol.render.canvas).Instruction.SET_STROKE_STYLE:
                    lastStrokeInstruction = instruction;
                    if (pendingStroke) {
                        context.stroke();
                        pendingStroke = 0;
                    }
                    this.setStrokeStyle_(context, /** @type {Array.<*>} */(instruction));
                    ++i;
                    break;
                case (<any>ol.render.canvas).Instruction.STROKE:
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

    public replayImage_(context, x, y, labelInfo,
        anchorX, anchorY, declutterGroup, height, opacity, originX, originY,
        rotation, scale, snapToPixel, width, padding, fillInstruction, strokeInstruction) {
        let fillStroke = fillInstruction || strokeInstruction;
        let localTransform = this.tmpLocalTransform_;
        anchorX *= scale;
        anchorY *= scale;
        x -= anchorX;
        y -= anchorY;
        if (snapToPixel) {
            x = Math.ceil(x);
            y = Math.ceil(y);
        }

        let w = (width + originX > labelInfo.width) ? labelInfo.width - originX : width;
        let h = (height + originY > labelInfo.height) ? labelInfo.height - originY : height;
        let box = this.tmpExtent_;
        let boxW = padding[3] + w * scale + padding[1];
        let boxH = padding[0] + h * scale + padding[2];
        let boxX = x - padding[3];
        let boxY = y - padding[0];

        /** @type {ol.Coordinate} */
        let p1;
        /** @type {ol.Coordinate} */
        let p2;
        /** @type {ol.Coordinate} */
        let p3;
        /** @type {ol.Coordinate} */
        let p4;
        if (fillStroke || rotation !== 0) {
            p1 = [boxX, boxY];
            p2 = [boxX + boxW, boxY];
            p3 = [boxX + boxW, boxY + boxH];
            p4 = [boxX, boxY + boxH];
        }

        let transform = null;
        if (rotation !== 0) {
            var centerX = x + anchorX;
            var centerY = y + anchorY;
            transform = (<any>ol).transform.compose(localTransform,
                centerX, centerY, 1, 1, rotation, -centerX, -centerY);

            (<any>ol).extent.createOrUpdateEmpty(box);
            (<any>ol).extent.extendCoordinate(box, (<any>ol).transform.apply(localTransform, p1));
            (<any>ol).extent.extendCoordinate(box, (<any>ol).transform.apply(localTransform, p2));
            (<any>ol).extent.extendCoordinate(box, (<any>ol).transform.apply(localTransform, p3));
            (<any>ol).extent.extendCoordinate(box, (<any>ol).transform.apply(localTransform, p4));
        } else {
            (<any>ol).extent.createOrUpdate(boxX, boxY, boxX + boxW, boxY + boxH, box);
        }
        var canvas = context.canvas;
        var intersects = box[0] <= canvas.width && box[2] >= 0 && box[1] <= canvas.height && box[3] >= 0;
        if (declutterGroup) {
            if (!intersects && declutterGroup[4] == 1) {
                return;
            }
            ol.extent.extend(declutterGroup, box);
            var declutterArgs = intersects ?
                [context, transform ? transform.slice(0) : null, opacity, labelInfo, originX, originY, w, h, x, y, scale] :
                null;
            if (declutterArgs && fillStroke) {
                declutterArgs.push(fillInstruction, strokeInstruction, p1, p2, p3, p4);
            }
            declutterGroup.push(declutterArgs);
        } else if (intersects) {
            if (fillStroke) {
                this.replayTextBackground_(context, p1, p2, p3, p4,
              /** @type {Array.<*>} */(fillInstruction),
              /** @type {Array.<*>} */(strokeInstruction));
            }
            (<any>ol).render.canvas.drawImage(context, transform, opacity, labelInfo, originX, originY, w, h, x, y, scale);
        }
    };

    // Get the image info, such as width, height
    public getImageInfo(text, textKey, fillKey, strokeKey) {
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
            var align = (<any>ol).render.replay.TEXT_ALIGN[textState.textAlign || (<any>ol.render.canvas).defaultTextAlign];
            var strokeWidth = strokeKey && strokeState.lineWidth ? strokeState.lineWidth : 0;

            var lines = text.split('\n');
            var numLines = lines.length;
            var widths = [];

            var width = (<any>ol).render.canvas.TextReplay.measureTextWidths(textState.font, lines, widths);
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

    getImage(text, textKey, fillKey, strokeKey) {
        var label;
        var key = strokeKey + textKey + text + fillKey + this.pixelRatio;

        var labelCache = (<any>ol).render.canvas.labelCache;
        if (!labelCache.containsKey(key)) {
            var labelInfo = this.labelInfoCache["key"];

            var strokeState = strokeKey ? this.strokeStates[strokeKey] || this.textStrokeState_ : null;
            var fillState = fillKey ? this.fillStates[fillKey] || this.textFillState_ : null;
            var textState = this.textStates[textKey] || this.textState_;
            var pixelRatio = this.pixelRatio;
            var scale = textState.scale * pixelRatio;
            var align = (<any>ol).render.replay.TEXT_ALIGN[textState.textAlign || (<any>ol).render.canvas.defaultTextAlign];
            var strokeWidth = strokeKey && strokeState.lineWidth ? strokeState.lineWidth : 0;

            var lines = text.split('\n');
            var numLines = lines.length;
            var widths = [];
            var width;
            var lineHeight;
            if (labelInfo) {
                width = labelInfo["width"];
            }
            else {
                width = (<any>ol).render.canvas.TextReplay.measureTextWidths(textState.font, lines, widths);
            }
            var lineHeight = textState["lineHeight"];


            var height = lineHeight * numLines;
            var renderWidth = (width + strokeWidth);
            var context = (<any>ol).dom.createCanvasContext2D(
                Math.ceil(renderWidth * scale),
                Math.ceil((height + strokeWidth) * scale));
            label = context.canvas;
            labelCache.set(key, label);
            if (scale != 1) {
                context.scale(scale, scale);
            }
            context.font = textState.font;
            if (strokeKey) {
                context.strokeStyle = strokeState.strokeStyle;
                context.lineWidth = strokeWidth * ((<any>ol).has.SAFARI ? scale : 1);
                context.lineCap = strokeState.lineCap;
                context.lineJoin = strokeState.lineJoin;
                context.miterLimit = strokeState.miterLimit;
                if ((<any>ol).has.CANVAS_LINE_DASH && strokeState.lineDash.length) {
                    context.setLineDash(strokeState.lineDash);
                    context.lineDashOffset = strokeState.lineDashOffset;
                }
            }
            if (fillKey) {
                context.fillStyle = fillState.fillStyle;
            }
            context.textBaseline = 'middle';
            context.textAlign = 'center';
            var leftRight = (0.5 - align);
            var x = align * label.width / scale + leftRight * strokeWidth;
            var i;
            if (strokeKey) {
                for (i = 0; i < numLines; ++i) {
                    context.strokeText(lines[i], x + leftRight * widths[i], 0.5 * (strokeWidth + lineHeight) + i * lineHeight);
                }
            }
            if (fillKey) {
                for (i = 0; i < numLines; ++i) {
                    context.fillText(lines[i], x + leftRight * widths[i], 0.5 * (strokeWidth + lineHeight) + i * lineHeight);
                }
            }
        }
        return labelCache.get(key);
    };

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
                lineHeight: (<any>ol.render.canvas).measureTextHeight(textState.font),
                textAlign: textState.textAlign || (<any>ol.render.canvas).defaultTextAlign,
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
        var baseline = (<any>ol.render).replay.TEXT_ALIGN[textState.textBaseline];

        var offsetY = this.textOffsetY_ * pixelRatio;
        var text = this.text_;
        var font = textState.font;
        var textScale = textState.scale;
        var strokeWidth = strokeState ? strokeState.lineWidth * textScale / 2 : 0;
        var widths = this.widths_[font];
        if (!widths) {
            this.widths_[font] = widths = {};
        }
        this.instructions.push([(<any>ol.render.canvas).Instruction.DRAW_CHARS,
            begin, end, baseline, declutterGroup,
        textState.overflow, fillKey, textState.maxAngle,
        function (text) {
            var width = widths[text];
            if (!width) {
                width = widths[text] = (<any>ol.render.canvas).measureTextWidth(font, text);
            }
            return width * textScale * pixelRatio;
        },
            offsetY, strokeKey, strokeWidth * pixelRatio, text, textKey, 1
        ]);
        this.hitDetectionInstructions.push([(<any>ol.render.canvas).Instruction.DRAW_CHARS,
            begin, end, baseline, declutterGroup,
        textState.overflow, fillKey, textState.maxAngle,
        function (text) {
            var width = widths[text];
            if (!width) {
                width = widths[text] = (<any>ol.render.canvas).measureTextWidth(font, text);
            }
            return width * textScale;
        },
            offsetY, strokeKey, strokeWidth, text, textKey, 1 / pixelRatio
        ]);
    };

    renderDeclutterChar_ = function (declutterGroup, feature) {
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
                    var drawImage = (<any>ol.render.canvas).drawImage;
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
                (<any>ol.extent).createOrUpdateEmpty(declutterGroup);
            }
        }
    };

    public setTextStyleCustom(textStyle: any, declutterGroup: any) {
        let textState, fillState, strokeState;
        if (!textStyle) {
            this.text_ = "";
        } else {
            this.declutterGroup_ = /** @type {ol.DeclutterGroup} */ (declutterGroup);

            let textFillStyle = textStyle.getFill();
            if (!textFillStyle) {
                fillState = this.textFillState_ = null;
            } else {
                fillState = this.textFillState_;
                if (!fillState) {
                    fillState = this.textFillState_ = /** @type {ol.CanvasFillState} */ ({});
                }
                fillState.fillStyle = ol.colorlike.asColorLike(
                    textFillStyle.getColor() || (<any>ol.render.canvas).defaultFillStyle);
            }

            let textStrokeStyle = textStyle.getStroke();
            if (!textStrokeStyle) {
                strokeState = this.textStrokeState_ = null;
            } else {
                strokeState = this.textStrokeState_;
                if (!strokeState) {
                    strokeState = this.textStrokeState_ = /** @type {ol.CanvasStrokeState} */ ({});
                }
                let lineDash = textStrokeStyle.getLineDash();
                let lineDashOffset = textStrokeStyle.getLineDashOffset();
                let lineWidth = textStrokeStyle.getWidth();
                let miterLimit = textStrokeStyle.getMiterLimit();
                strokeState.lineCap = textStrokeStyle.getLineCap() || (<any>ol.render.canvas).defaultLineCap;
                strokeState.lineDash = lineDash ? lineDash.slice() : (<any>ol.render.canvas).defaultLineDash;
                strokeState.lineDashOffset =
                    lineDashOffset === undefined ? (<any>ol.render.canvas).defaultLineDashOffset : lineDashOffset;
                strokeState.lineJoin = textStrokeStyle.getLineJoin() || (<any>ol.render.canvas).defaultLineJoin;
                strokeState.lineWidth =
                    lineWidth === undefined ? (<any>ol.render.canvas).defaultLineWidth : lineWidth;
                strokeState.miterLimit =
                    miterLimit === undefined ? (<any>ol.render.canvas).defaultMiterLimit : miterLimit;
                strokeState.strokeStyle = ol.colorlike.asColorLike(
                    textStrokeStyle.getColor() || (<any>ol.render.canvas).defaultStrokeStyle);
            }

            textState = this.textState_;
            let font = textStyle.getFont() || (<any>ol.render.canvas).defaultFont;
            (<any>ol.render.canvas).checkFont(font);
            let textScale = textStyle.getScale();
            textState.overflow = textStyle.getOverflow();
            textState.font = font;
            textState.maxAngle = textStyle.getMaxAngle();
            textState.placement = textStyle.getPlacement();
            textState.textAlign = textStyle.getTextAlign();
            textState.textBaseline = textStyle.getTextBaseline() || (<any>ol.render.canvas).defaultTextBaseline;
            textState.backgroundFill = textStyle.getBackgroundFill();
            textState.backgroundStroke = textStyle.getBackgroundStroke();
            textState.padding = textStyle.getPadding() || (<any>ol.render.canvas).defaultPadding;
            textState.scale = textScale === undefined ? 1 : textScale;

            let textOffsetX = textStyle.getOffsetX();
            let textOffsetY = textStyle.getOffsetY();
            let textRotateWithView = textStyle.getRotateWithView();
            let textRotation = textStyle.getRotation();
            this.text_ = textStyle.getText() || "";
            this.textOffsetX_ = textOffsetX === undefined ? 0 : textOffsetX;
            this.textOffsetY_ = textOffsetY === undefined ? 0 : textOffsetY;
            this.textRotateWithView_ = textRotateWithView === undefined ? false : textRotateWithView;
            this.textRotation_ = textRotation === undefined ? 0 : textRotation;

            this.strokeKey_ = strokeState ?
                (typeof strokeState.strokeStyle === "string" ? strokeState.strokeStyle : (<any>ol).getUid(strokeState.strokeStyle)) +
                strokeState.lineCap + strokeState.lineDashOffset + "|" + strokeState.lineWidth +
                strokeState.lineJoin + strokeState.miterLimit + "[" + strokeState.lineDash.join() + "]" :
                "";
            this.textKey_ = textState.font + textState.scale + (textState.textAlign || "?");
            this.fillKey_ = fillState ?
                (typeof fillState.fillStyle === "string" ? fillState.fillStyle : ("|" + (<any>ol).getUid(fillState.fillStyle))) :
                "";
            this.label = textStyle.label;
            this.labelPosition = textStyle.labelPosition;
        }
    }

    public drawTextCustom(geometry: any, feature: any) {
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

        if ((geometryType === (<any>ol.geom).GeometryType.LINE_STRING || geometryType === (<any>ol.geom).GeometryType.MULTI_LINE_STRING) && !this.label) {
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
            if (geometryType === (<any>ol.geom).GeometryType.LINE_STRING) {
                ends = [flatCoordinates.length];
            } else if (geometryType === (<any>ol.geom).GeometryType.MULTI_LINE_STRING) {
                ends = geometry.getEnds();
            } else if (geometryType === (<any>ol.geom).GeometryType.POLYGON) {
                ends = geometry.getEnds().slice(0, 1);
            } else if (geometryType === (<any>ol.geom).GeometryType.MULTI_POLYGON) {
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
                    let range = (<any>ol.geom).flat.straightchunk.lineString(
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

        // if (this.label === undefined) { return; }

        let begin = this.coordinates.length;
        let flatCoordinates = this.labelPosition;
        let end = 2;
        let stride = 2;
        let label = this.label;

        if (geometry.getType() === (<any>ol.geom).GeometryType.POLYGON) {
            stride = 3;
        }

        // let begin = this.coordinates.length;

        // let geometryType = geometry.getType();
        // let flatCoordinates = null;
        // let end = 2;
        // let stride = 2;
        // let i, ii;

        // if (textState.placement === (<any>ol.style).TextPlacement.LINE) {
        //     if (!ol.extent.intersects(this.getBufferedMaxExtent(), geometry.getExtent())) {
        //         return;
        //     }
        //     let ends;
        //     flatCoordinates = geometry.getFlatCoordinates();
        //     stride = geometry.getStride();
        //     if (geometryType === (<any>ol.geom).GeometryType.LINE_STRING) {
        //         ends = [flatCoordinates.length];
        //     } else if (geometryType === (<any>ol.geom).GeometryType.MULTI_LINE_STRING) {
        //         ends = geometry.getEnds();
        //     } else if (geometryType === (<any>ol.geom).GeometryType.POLYGON) {
        //         ends = geometry.getEnds().slice(0, 1);
        //     } else if (geometryType === (<any>ol.geom).GeometryType.MULTI_POLYGON) {
        //         let endss = geometry.getEndss();
        //         ends = [];
        //         for (i = 0, ii = endss.length; i < ii; ++i) {
        //             ends.push(endss[i][0]);
        //         }
        //     }
        //     this.beginGeometry(geometry, feature);
        //     let textAlign = textState.textAlign;
        //     let flatOffset = 0;
        //     let flatEnd;
        //     for (let o = 0, oo = ends.length; o < oo; ++o) {
        //         if (textAlign === undefined) {
        //             let range = (<any>ol.geom).flat.straightchunk.lineString(
        //                 textState.maxAngle, flatCoordinates, flatOffset, ends[o], stride);
        //             flatOffset = range[0];
        //             flatEnd = range[1];
        //         } else {
        //             flatEnd = ends[o];
        //         }
        //         for (i = flatOffset; i < flatEnd; i += stride) {
        //             this.coordinates.push(flatCoordinates[i], flatCoordinates[i + 1]);
        //         }
        //         end = this.coordinates.length;
        //         flatOffset = ends[o];
        //         this.drawChars_(begin, end, this.declutterGroup_);
        //         begin = end;
        //     }
        //     this.endGeometry(geometry, feature);

        // } else {
        //     let label = this.getImage(this.text_, this.textKey_, this.fillKey_, this.strokeKey_);
        //     let width = label.width / this.pixelRatio;
        //     let Constructor = this.BATCH_CONSTRUCTORS_CUSTOM[geometryType];
        //     let textLabelingStrategy = new Constructor();

        //     switch (geometryType) {
        //         case (<any>ol.geom).GeometryType.POINT:
        //         case (<any>ol.geom).GeometryType.MULTI_POINT:
        //             flatCoordinates = geometry.getFlatCoordinates();
        //             end = flatCoordinates.length;
        //             break;
        //         case (<any>ol.geom).GeometryType.LINE_STRING:
        //             flatCoordinates = /** @type {ol.geom.LineString} */ (geometry).getFlatMidpoint();
        //             if (!textLabelingStrategy.MarkLocation(flatCoordinates, label, this.resolution)) {
        //                 return;
        //             }
        //             break;
        //         case (<any>ol.geom).GeometryType.CIRCLE:
        //             flatCoordinates = /** @type {ol.geom.Circle} */ (geometry).getCenter();
        //             break;
        //         case (<any>ol.geom).GeometryType.MULTI_LINE_STRING:
        //             flatCoordinates = /** @type {ol.geom.MultiLineString} */ (geometry).getFlatMidpoints();
        //             end = flatCoordinates.length;
        //             break;
        //         case (<any>ol.geom).GeometryType.POLYGON:
        //             flatCoordinates = /** @type {ol.geom.Polygon} */ (geometry).getFlatInteriorPoint();
        //             if (!textState.overflow && flatCoordinates[2] / this.resolution < width) {
        //                 return;
        //             }
        //             // if (!textLabelingStrategy.MarkLocation(flatCoordinates, label, this.resolution)) {
        //             //     return;
        //             // }
        //             stride = 3;
        //             break;
        //         case (<any>ol.geom).GeometryType.MULTI_POLYGON:
        //             let interiorPoints = /** @type {ol.geom.MultiPolygon} */ (geometry).getFlatInteriorPoints();
        //             flatCoordinates = [];
        //             for (i = 0, ii = interiorPoints.length; i < ii; i += 3) {
        //                 if (textState.overflow || interiorPoints[i + 2] / this.resolution >= width) {
        //                     flatCoordinates.push(interiorPoints[i], interiorPoints[i + 1]);
        //                 }
        //             }
        //             end = flatCoordinates.length;
        //             if (end === 0) {
        //                 return;
        //             }
        //             break;
        //         default:
        //     }

        end = this.appendFlatCoordinates(flatCoordinates, 0, end, stride, false, false);
        this.beginGeometry(geometry, feature);
        if (textState.backgroundFill || textState.backgroundStroke) {
            this.setFillStrokeStyle(textState.backgroundFill, textState.backgroundStroke);
            this.updateFillStyle(this.state, this.applyFill, geometry);
            this.updateStrokeStyle(this.state, this.applyStroke);
        }
        this.drawTextImage_(label, begin, end);
        this.endGeometry(geometry, feature);
        // }
    }

    BATCH_CONSTRUCTORS_CUSTOM = {
        "Point": DetectTextLabelingStrategy,
        "MultiPoint": TextLabelingStrategy,
        "LineString": TextLabelingStrategy,
        "Circle": TextLabelingStrategy,
        "MultiLineString": TextLabelingStrategy,
        "Polygon": TextLabelingStrategy,
        "MultiPolygon": TextLabelingStrategy
    };
}
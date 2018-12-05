import GeoStyle from "./geoStyle";
import GeometryType from "ol/geom/GeometryType";
import { measureTextHeight } from "ol/render/canvas";
import { measureTextWidth } from 'ol/render/canvas';
import LRUCache from "ol/structs/LRUCache";
import { labelCache } from "ol/render/canvas";
import { getUid } from 'ol/util';
import { TEXT_ALIGN } from "ol/render/replay";
import { defaultTextAlign, defaultLineDash } from "ol/render/canvas";
import { createCanvasContext2D } from "ol/dom";
import { SAFARI, CANVAS_LINE_DASH } from "ol/has";


import { Style, Fill, Stroke, Text } from 'ol/style'
import DetectTextLabelingStrategy from "./detectTextLabelingStrategy";
import TextLabelingStrategy from "./textLabelingStrategy";

const BATCH_CONSTRUCTORS_DEFAULT = {
    "Point": TextLabelingStrategy,
    "MultiPoint": TextLabelingStrategy,
    "LineString": TextLabelingStrategy,
    "Circle": TextLabelingStrategy,
    "MultiLineString": TextLabelingStrategy,
    "Polygon": TextLabelingStrategy,
    "MultiPolygon": TextLabelingStrategy
};

const BATCH_CONSTRUCTORS_DETECT = {
    "Point": DetectTextLabelingStrategy,
    "MultiPoint": DetectTextLabelingStrategy,
    "LineString": DetectTextLabelingStrategy,
    "Circle": DetectTextLabelingStrategy,
    "MultiLineString": DetectTextLabelingStrategy,
    "Polygon": DetectTextLabelingStrategy,
    "MultiPolygon": DetectTextLabelingStrategy
};


class GeoTextStyle extends GeoStyle {
    constructor(styleJson) {
        super(styleJson);
        this.textAligns = ["left", "right", "center", "end", "start"];
        this.textBaseline = ["bottom", "top", "middle", "alphabetic", "hanging", "ideographic"];
        this.textTransforms = ["default", "uppercase", "lowercase"];
        this.labelInfos = new LRUCache(512);
        this.charWidths = {};

        if (styleJson) {
            this.align = styleJson["text-align"];
            this.baseline = styleJson["text-base-line"];
            this.dx = styleJson["text-dx"];
            this.dy = styleJson["text-dy"];
            this.font = styleJson["text-font"];
            this.fill = styleJson["text-fill"];
            this.forceHorizontalForLine = styleJson["text-force-horizontal-for-line"];
            this.haloFill = styleJson["text-halo-fill"];
            this.haloRadius = styleJson["text-halo-radius"];
            this.margin = styleJson["text-margin"];
            this.maskColor = styleJson["text-mask-color"];
            this.maskMargin = styleJson["text-mask-margin"];
            this.maskOutlineColor = styleJson["text-mask-outline-color"];
            this.maskOutlineWidth = styleJson["text-mask-outline-width"];
            this.maskType = styleJson["text-mask-type"];
            this.maxCharAngle = styleJson["text-max-char-angle"];

            this.minDistance = styleJson["text-min-distance"];
            this.minPadding = styleJson["text-min-padding"];
            this.name = styleJson["text-name"];

            this.opacity = styleJson["text-opacity"] | 1;
            this.rotateAngle = styleJson["text-rotate-angle"];
            this.placements = styleJson["text-placements"] | ["U,B,L,R"];
            this.placementType = styleJson["text-placement-type"] ? styleJson["text-placement-type"] : "default";
            this.spacing = styleJson["text-spacing"] !== undefined ? styleJson["text-spacing"] : 10;
            this.wrapBefore = styleJson["text-wrap-before"] ? true : styleJson["text-wrap-before"];
            this.wrapWidth = styleJson["text-wrap-width"];
            this.textFormat = styleJson["text-text-format"];
            this.dateFormat = styleJson["text-date-format"];
            this.numericFormat = styleJson["text-numeric-format"];
            this.textTransform = styleJson["text-letter-case"];
            this.letterSpacing = styleJson["text-letter-spacing"];

            // TODO
            this.avoidEdge = styleJson["text-avoid-edge"];
            // TODO
            this.splineType = styleJson["text-spline-type"];
            // TODO
            this.polygonLabelingLocation = styleJson["text-polygon-labeling-location"];

            if (typeof WorkerGlobalScope === "undefined") {
                let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
                for (let i = 0; i < chars.length; i++) {
                    this.charWidths[chars[i]] = measureTextWidth(this.font, chars[i]);
                }
                this.charWidths[" "] = measureTextWidth(this.font, " ");
                for (let i = 0; i <= 9; i++) {
                    this.charWidths[i] = measureTextWidth(this.font, i);
                }
                this.charWidths["lineHeight"] = measureTextHeight(this.font);
            }
        }
    }

    initializeCore() {
        if (this.fill) {
            this.fillColor = GeoStyle.toRGBAColor(this.fill, this.opacity);
        }

        if (this.haloFill) {
            this.haloFillColor = GeoStyle.toRGBAColor(this.haloFill, this.opacity);
        }

        let fill = new Fill();
        let stroke = new Stroke();
        let textStyle = new Text({
            fill: fill,
            stroke: stroke
        });

        this.style = new Style({
            text: textStyle
        });
        textStyle.charWidths = this.charWidths;

        if (this.textAligns.indexOf(this.align) >= 0) {
            textStyle.setTextAlign(this.align);
        }
        if (this.textBaseline.indexOf(this.baseline) >= 0) {
            textStyle.setTextBaseline(this.baseline);
        }
        if (this.dx) {
            textStyle.setOffsetX(this.dx);
        }
        if (this.dy) {
            textStyle.setOffsetY(this.dy);
        }
        if (this.font) {
            textStyle.setFont(this.font);
        }
        if (this.fillColor) {
            fill.setColor(this.fillColor);
        }
        if (this.haloFillColor) {
            stroke.setColor(this.haloFillColor);
        }
        if (this.haloRadius) {
            stroke.setWidth(this.haloRadius);
        }
        if (this.haloFillColor === undefined && this.haloRadius === undefined) {
            textStyle.setStroke(undefined);
        }

        if (this.rotateAngle) {
            textStyle.setRotation(this.rotateAngle);
        }
        if (this.maxCharAngle >= 0) {
            textStyle.setMaxAngle(this.maxCharAngle);
        }
        if (this.textTransforms.includes(this.textTransform)) {
        } else {
            // TODO: invalid inputs.
            this.textTransform = this.textTransforms[0];
        }
    }

    getConvertedStyleCore(feature, resolution, options) {
        let textStyles = [];
        let featureText = "";
        let featureProperties = feature.getProperties();

        if (this.name) {
            featureText = feature.get(this.name);
        }

        // A workaround for the language, remove the data update
        if ((featureText === undefined || featureText === "") && this.name.indexOf("name_") === 0) {
            featureText = feature.get("name");
        }

        if (this.numericFormat) {
            featureText = this.getTextWithNumericFormat(featureText);
        }
        if (this.dateFormat) {
            featureText = this.getTextWithDateFormat(featureText);
        }
        if (this.textFormat) {
            featureText = this.getTextWithFormat(featureText);
        }

        if (featureText === undefined || featureText === "") {
            return textStyles;
        }

        featureText = this.getTextTransform(featureText);

        this.style.getText().setText(featureText);

        if (this.setLabelPosition(featureText, feature.getGeometry(), resolution, this.style.getText(), options.strategyTree, options.frameState)) {
            var featureZindex = feature["tempTreeZindex"];
            if (featureZindex === undefined) {
                featureZindex = 0;
            }
            this.style.setZIndex(featureZindex);
            textStyles.push(this.style);
        }

        return textStyles;
    }

    setLabelPosition(text, feature, resolution, textStyle, strategyTree, frameState) {
        let flatCoordinates;

        let geometryType = feature.getType();
        if ((geometryType === GeometryType.LINE_STRING || geometryType === GeometryType.MULTI_LINE_STRING) && !this.forceHorizontalForLine) {
            flatCoordinates = feature.getFlatCoordinates();
            if (flatCoordinates === undefined) { return false; }
        }
        else {
            let labelInfo = this.getLabelInfo(text, textStyle, frameState);
            let labelWidth = labelInfo.labelWidth;
            let labelHeight = labelInfo.labelHeight;
            let scale = labelInfo.scale;
            let font = labelInfo.font;
            let strokeWidth = labelInfo.strokeWidth;
            let numLines = labelInfo.numLines;
            let lines = labelInfo.lines;
            let lineHeight = labelInfo.lineHeight;
            let renderWidth = labelInfo.renderWidth;
            let height = labelInfo.height;
            let widths = labelInfo.widths;

            let Constructor = undefined;
            if (this.placementType === "default") {
                Constructor = BATCH_CONSTRUCTORS_DEFAULT[geometryType];
            } else if (this.placementType === "detect") {
                Constructor = BATCH_CONSTRUCTORS_DETECT[geometryType];
            }

            let textLabelingStrategy = new Constructor();
            let tmpLabelWidth = labelWidth / frameState.pixelRatio;
            let tmpLabelHeight = labelHeight / frameState.pixelRatio;

            switch (geometryType) {
                case GeometryType.POINT:
                    flatCoordinates = feature.getFlatCoordinates();
                    break;
                case GeometryType.MULTI_POINT:
                    flatCoordinates = feature.getFlatCoordinates();
                    break;
                case GeometryType.LINE_STRING:
                    flatCoordinates = /** @type {ol.geom.LineString} */ (feature).getFlatMidpoint();
                    break;
                case GeometryType.CIRCLE:
                    flatCoordinates = /** @type {ol.geom.Circle} */ (feature).getCenter();
                    break;
                case GeometryType.MULTI_LINE_STRING:
                    flatCoordinates = /** @type {ol.geom.MultiLineString} */ (feature).getFlatMidpoints();
                    break;
                case GeometryType.POLYGON:
                    flatCoordinates = /** @type {ol.geom.Polygon} */ (feature).getFlatInteriorPoint();
                    if (!textStyle.overflow && flatCoordinates[2] / resolution < tmpLabelWidth) {
                        flatCoordinates = undefined;
                    }
                    break;
                case GeometryType.MULTI_POLYGON:
                    let interiorPoints = /** @type {ol.geom.MultiPolygon} */ (feature).getFlatInteriorPoints();
                    flatCoordinates = [];
                    for (let i = 0, ii = interiorPoints.length; i < ii; i += 3) {
                        if (textStyle.overflow || interiorPoints[i + 2] / resolution >= tmpLabelWidth) {
                            flatCoordinates.push(interiorPoints[i], interiorPoints[i + 1]);
                        }
                    }
                    break;
                default:
            }

            flatCoordinates = textLabelingStrategy.markLocation(flatCoordinates, tmpLabelWidth, tmpLabelHeight, resolution, geometryType, this, strategyTree, frameState);

            if (flatCoordinates === undefined) { return false; }

            if (typeof WorkerGlobalScope === "undefined") {
                var labelImage = this.getImage(textStyle, labelWidth, labelHeight, scale, font, strokeWidth, numLines, lines, lineHeight, renderWidth, height, widths, frameState.pixelRatio);

                if (labelImage === undefined) {
                    return false;
                }

                textStyle.label = labelImage;
            }
        }
        textStyle.labelPosition = flatCoordinates;

        return true;
    }

    getLabelInfo(text, textState, frameState) {
        let key = text
        if (!this.labelInfos.containsKey(key)) {
            let font = textState.getFont();
            text = this.wrapText(text, font);

            let strokeState = textState.getStroke();
            let strokeWidth = strokeState && strokeState.getWidth() ? strokeState.getWidth() : 0;
            let lines = text.split("\n");
            let numLines = lines.length;
            let textScale = textState.getScale();
            textScale = textScale === undefined ? 1 : textScale;
            let scale = textScale * frameState.pixelRatio;;
            let widths = [];
            let width = this.getEstimatedWidth(font, lines, widths, this.letterSpacing);
            let lineHeight = this.charWidths["lineHeight"];
            let tmpMaskMargin = (this.maskMargin ? this.maskMargin : "0").split(',');
            let tmpMaskHeightMargin = 0;
            let tmpMaskWidthMargin = 0;
            switch (tmpMaskMargin.length) {
                case 1:
                    tmpMaskHeightMargin = parseInt(tmpMaskMargin[0]) * 2;
                    tmpMaskWidthMargin = parseInt(tmpMaskMargin[0]) * 2;
                    break;
                case 2:
                    tmpMaskHeightMargin = parseInt(tmpMaskMargin[0]) * 2;
                    tmpMaskWidthMargin = parseInt(tmpMaskMargin[1]) * 2;
                    break;
                case 3:
                    tmpMaskHeightMargin = parseInt(tmpMaskMargin[0]) + parseInt(tmpMaskMargin[2]);
                    tmpMaskWidthMargin = parseInt(tmpMaskMargin[1]) * 2;
                    break;
                case 4:
                    tmpMaskHeightMargin = parseInt(tmpMaskMargin[0]) + parseInt(tmpMaskMargin[2]);
                    tmpMaskWidthMargin = parseInt(tmpMaskMargin[1]) + parseInt(tmpMaskMargin[3]);
                    break;
                default:
                    break;
            }

            if (this.maskType) {
                if (this.maskType.toLowerCase() === "circle") {
                    tmpMaskHeightMargin = tmpMaskHeightMargin > tmpMaskWidthMargin ? tmpMaskHeightMargin : tmpMaskWidthMargin;
                    tmpMaskWidthMargin = tmpMaskHeightMargin;
                }
            }
            let height = lineHeight * numLines + strokeWidth + tmpMaskHeightMargin;
            let renderWidth = width + strokeWidth + tmpMaskWidthMargin;
            let tmpMaskOutlineWidth = (this.maskOutlineWidth ? this.maskOutlineWidth : 0);
            let labelWidth = Math.ceil((renderWidth + tmpMaskOutlineWidth * 3) * 1.1 * scale);
            let labelHeight = Math.ceil((height + tmpMaskOutlineWidth * 3) * 1.1 * scale);

            let labelInfo = {
                labelWidth: labelWidth,
                labelHeight: labelHeight,
                scale: scale,
                font: font,
                strokeWidth: strokeWidth,
                numLines: numLines,
                lines: lines,
                lineHeight: lineHeight,
                renderWidth: renderWidth,
                height: height,
                widths: widths
            };
            this.labelInfos.set(key, labelInfo);
        }

        return this.labelInfos.get(key);
    }

    getEstimatedWidth(font, lines, widths, letterSpacing) {
        let numLines = lines.length;
        let width = 0;
        let currentWidth, i;
        for (i = 0; i < numLines; ++i) {
            currentWidth = 0;
            for (let j = 0; j < lines[i].length; j++) {
                let charWidth = this.charWidths[lines[i][j]];
                if (charWidth) {
                    currentWidth += charWidth;
                }
                else {
                    currentWidth += this.charWidths["W"];
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

    getImage(textState, labelWidth, labelHeight, scale, font, strokeWidth, numLines, lines, lineHeight, renderWidth, height, widths, pixelRatio) {
        var key = this.uid !== undefined ? this.uid : getUid(this);
        key += lines.toString();
        if (!labelCache.containsKey(key)) {
            let fillState = textState.getFill();
            let strokeState = textState.getStroke();
            let label;

            let align = TEXT_ALIGN[textState.getTextAlign() || defaultTextAlign];

            let context = createCanvasContext2D(labelWidth, labelHeight);
            label = context.canvas;
            labelCache.set(key, label);
            label.style.display = "none";
            // For letterSpacing we need app
            let body;
            if (this.letterSpacing) {
                body = document.getElementsByTagName("body")[0];
                if (body) {
                    label.style.display = "none";
                    body.appendChild(label);
                }
                label.style.letterSpacing = this.letterSpacing + "px";
                context = label.getContext("2d");
            }

            if (scale !== 1) {
                context.scale(scale, scale);
            }
            context.font = font;
            if (strokeState) {
                context.strokeStyle = strokeState.getColor();
                context.lineWidth = strokeWidth * (SAFARI ? scale : 1);
                context.lineCap = strokeState.getLineCap();
                context.lineJoin = strokeState.getLineJoin();
                context.miterLimit = strokeState.getMiterLimit();
                let lineDash = strokeState.getLineDash();
                lineDash = lineDash ? lineDash.slice() : defaultLineDash;
                if (CANVAS_LINE_DASH && lineDash.length) {
                    context.setLineDash(strokeState.getLineDash());
                    context.lineDashOffset = strokeState.getLineDashOffset();
                }
            }

            this.drawMask(context, 0, 0, renderWidth, height);

            if (this.maskType) {
                if (this.maskType.toLowerCase() === "circle") {
                    if (scale !== 1) { context.scale(scale, scale); }
                    context.font = font;
                    if (strokeState) {
                        context.strokeStyle = strokeState.getColor();
                        context.lineWidth = strokeWidth * (SAFARI ? scale : 1);
                        context.lineCap = strokeState.getLineCap();
                        context.lineJoin = strokeState.getLineJoin();
                        context.miterLimit = strokeState.getMiterLimit();
                        let lineDash = strokeState.getLineDash();
                        lineDash = lineDash ? lineDash.slice() : defaultLineDash;
                        if (CANVAS_LINE_DASH && lineDash.length) {
                            context.setLineDash(strokeState.getLineDash());
                            context.lineDashOffset = strokeState.getLineDashOffset();
                        }
                    }
                }
            }

            context.textBaseline = "middle";
            context.textAlign = "center";
            let leftRight = 0.5 - align;
            let x = align * label.width / scale + leftRight * strokeWidth;
            let i;
            let tmpMaskMargin = (this.maskMargin ? this.maskMargin : "0").split(',');
            let tmpMaskOutlineWidth = this.maskOutlineWidth ? this.maskOutlineWidth : 0;
            if (strokeState) {
                if (strokeState.getColor() !== null) {
                    context.strokeStyle = strokeState.getColor();
                    context.lineWidth = this.haloRadius ? this.haloRadius : 0;
                    for (i = 0; i < numLines; ++i) {
                        if (this.drawnMask) {
                            context.strokeText(lines[i], x + leftRight * widths[i] * 1.2 - strokeWidth * 1.2 + tmpMaskOutlineWidth * 0.5 / 1.2 - (tmpMaskMargin[3] ? parseInt(tmpMaskMargin[1]) - parseInt(tmpMaskMargin[3]) : 0) * 0.5, this.maskType.toLowerCase() === "circle" ? context.canvas.height / scale * 0.5 - (tmpMaskMargin[2] ? parseInt(tmpMaskMargin[2]) - parseInt(tmpMaskMargin[0]) : 0) : strokeWidth + (i + 1) * lineHeight * 0.5 + parseInt(tmpMaskMargin[0]) + tmpMaskOutlineWidth);
                        }
                        else {
                            context.strokeText(lines[i], x + leftRight * widths[i] * 1.2 - (tmpMaskMargin[3] ? parseInt(tmpMaskMargin[1]) - parseInt(tmpMaskMargin[3]) : 0) * 0.5, 0.5 * (strokeWidth + lineHeight) + i * lineHeight * 1.2 - + parseInt(tmpMaskMargin[0]) + (this.maskOutlineWidth ? this.maskOutlineWidth : 0));
                        }
                    }
                }
            }
            if (fillState) {
                if (fillState.getColor() !== null) {
                    context.fillStyle = fillState.getColor();
                    for (i = 0; i < numLines; ++i) {
                        if (this.drawnMask) {
                            context.fillText(lines[i], x + leftRight * widths[i] * 1.2 - strokeWidth * 1.2 + tmpMaskOutlineWidth * 0.5 / 1.2 - (tmpMaskMargin[3] ? parseInt(tmpMaskMargin[1]) - parseInt(tmpMaskMargin[3]) : 0) * 0.5, this.maskType.toLowerCase() === "circle" ? context.canvas.height / scale * 0.5 - (tmpMaskMargin[2] ? parseInt(tmpMaskMargin[2]) - parseInt(tmpMaskMargin[0]) : 0) : strokeWidth + (i + 1) * lineHeight * 0.5 + parseInt(tmpMaskMargin[0]) + tmpMaskOutlineWidth);
                        }
                        else {
                            context.fillText(lines[i], x + leftRight * widths[i] * 1.2 - (tmpMaskMargin[3] ? parseInt(tmpMaskMargin[1]) - parseInt(tmpMaskMargin[3]) : 0) * 0.5, 0.5 * (strokeWidth + lineHeight) + i * lineHeight * 1.2 + parseInt(tmpMaskMargin[0]) + (this.maskOutlineWidth ? this.maskOutlineWidth : 0));
                        }
                    }
                }
            }
            if (this.letterSpacing && body) {
                body.removeChild(label);
            }
        }

        return labelCache.get(key);
    }

    drawMask(context, x, y, width, height, pixelRatio) {
        var fill = undefined;
        var stroke = undefined;
        if (this.maskColor) {
            fill = new Fill();
            fill.setColor(GeoStyle.toRGBAColor(this.maskColor, this.opacity ? this.opacity : 1));
        }
        if (this.maskOutlineColor && this.maskOutlineWidth) {
            stroke = new Stroke();
            if (this.maskOutlineColor) {
                stroke.setColor(GeoStyle.toRGBAColor(this.maskOutlineColor, this.opacity ? this.opacity : 1));
            }
            if (this.maskOutlineWidth) {
                stroke.setWidth(this.maskOutlineWidth ? this.maskOutlineWidth : 0);
            }
        }
        if (this.maskType) {
            this.drawnMask = true;
        }
        else {
            this.drawnMask = false;
        }
        switch (this.maskType) {
            case "default":
            case "Default":
            case "rectangle":
            case "Rectangle":
                this.drawRectangle(context, x, y, width, height, fill, stroke);
                break;
            case "roundedCorners":
            case "RoundedCorners":
                this.drawRoundRectangle(context, x, y, width, height, fill, stroke);
                break;
            case "roundedEnds":
            case "RoundedEnds":
                this.drawRoundedEnds(context, x, y, width, height, fill, stroke);
                break;
            case "circle":
            case "Circle":
                this.drawCircle(context, x, y, width, height, fill, stroke, pixelRatio);
                break;
        }
    }

    drawRectangle(context, x, y, width, height, fill, stroke) {
        if (fill) {
            context.fillStyle = fill.getColor();
            context.fillRect(x + stroke.getWidth(), y + stroke.getWidth(), width + stroke.getWidth() * 2, height);
        }
        if (stroke) {
            context.lineWidth = stroke.getWidth();
            context.strokeStyle = stroke.getColor();
            context.strokeRect(x + stroke.getWidth(), y + stroke.getWidth(), width + stroke.getWidth() * 2, height);
        }
    };

    drawRoundRectangle(context, x, y, width, height, fill, stroke) {
        var radius = (width < height ? width : height) * 0.3;
        // width *= 0.9;
        // height *= 0.8;
        if (stroke) {
            x = x + (stroke.getWidth() ? stroke.getWidth() : 0);
            y = y + (stroke.getWidth() ? stroke.getWidth() : 0);
        }
        context.beginPath();
        context.moveTo(x + radius + stroke.getWidth() * 2, y);
        context.lineTo(x + width - radius + stroke.getWidth() * 2, y);
        context.quadraticCurveTo(x + width + stroke.getWidth() * 2, y, x + width + stroke.getWidth() * 2, y + radius);
        context.lineTo(x + width + stroke.getWidth() * 2, y + height - radius);
        context.quadraticCurveTo(x + width + stroke.getWidth() * 2, y + height, x + width - radius + stroke.getWidth() * 2, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath();
        if (fill) {
            context.fillStyle = fill.getColor();
            context.fill();
        }
        if (stroke) {
            context.lineWidth = stroke.getWidth();
            context.strokeStyle = stroke.getColor();
            context.stroke();
        }
    };

    drawRoundedEnds(context, x, y, width, height, fill, stroke) {
        var radius = (width < height ? width : height) * 0.2;
        // width *= 0.9;
        // height *= 0.8;
        var strokeWidth = (stroke.getWidth() ? stroke.getWidth() : 0);
        if (stroke) {
            x = x + strokeWidth;
            y = y + strokeWidth;
        }
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius + strokeWidth * 2, y);
        context.quadraticCurveTo(x + width + strokeWidth * 2, y + height * 0.5, x + width - radius + strokeWidth * 2, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height * 0.5, x + radius, y);
        context.closePath();
        if (fill) {
            context.fillStyle = fill.getColor();
            context.fill();
        }
        if (stroke) {
            context.lineWidth = stroke.getWidth();
            context.strokeStyle = stroke.getColor();
            context.stroke();
        }
    };

    drawCircle(context, x, y, width, height, fill, stroke, pixelRatio) {
        context.canvas.width = context.canvas.width > context.canvas.height ? context.canvas.width : context.canvas.height;
        context.canvas.height = context.canvas.width;
        var radius = 0;
        if (stroke) {
            radius -= stroke.getWidth();
        }
        radius += context.canvas.width * 0.5;
        context.beginPath();
        context.arc(x + context.canvas.width * 0.5, y + context.canvas.width * 0.5, radius, 0, 2 * Math.PI, false);
        context.closePath();
        if (fill) {
            context.fillStyle = fill.getColor();
            context.fill();
        }
        if (stroke) {
            context.lineWidth = stroke.getWidth() * pixelRatio;
            context.strokeStyle = stroke.getColor();
            context.stroke();
        }
    };

    getTextWithNumericFormat(featureText) {
        var tmpArguments = this.numericFormat.split(",");
        var numericFormatOptions = {};
        for (var _i = 0, tmpArguments_1 = tmpArguments; _i < tmpArguments_1.length; _i++) {
            var tmpArgument = tmpArguments_1[_i];
            var keyValuePair = tmpArgument.split(":");
            switch (keyValuePair[0].trim()) {
                case "localeMatcher":
                    numericFormatOptions.localeMatcher = keyValuePair[1].trim();
                    break;
                case "style":
                    numericFormatOptions.style = keyValuePair[1].trim();
                    break;
                case "currency":
                    numericFormatOptions.currency = keyValuePair[1].trim();
                    break;
                case "currencyDisplay":
                    numericFormatOptions.currencyDisplay = keyValuePair[1].trim();
                    break;
                case "useGrouping":
                    numericFormatOptions.useGrouping = keyValuePair[1].trim();
                    break;
                case "minimumIntegerDigits":
                    numericFormatOptions.minimumIntegerDigits = keyValuePair[1].trim();
                    break;
                case "minimumFractionDigits":
                    numericFormatOptions.minimumFractionDigits = keyValuePair[1].trim();
                    break;
                case "maximumFractionDigits":
                    numericFormatOptions.maximumFractionDigits = keyValuePair[1].trim();
                    break;
                case "minimumSignificantDigits":
                    numericFormatOptions.minimumSignificantDigits = keyValuePair[1].trim();
                    break;
                case "maximumSignificantDigits":
                    numericFormatOptions.maximumSignificantDigits = keyValuePair[1].trim();
                    break;
            }
        }
        var numeric = new Intl.NumberFormat(tmpArguments[0], numericFormatOptions);
        return numeric.format(Number(featureText));
    };

    getTextWithDateFormat(featureText) {
        return (new Date(featureText)).format(this.dateFormat);
    };

    getTextWithFormat(featureText) {
        return String.format(this.textFormat, featureText);
    };

    getTextTransform(featureText) {
        if (featureText !== undefined) {
            switch (this.textTransform) {
                case "uppercase":
                    featureText = featureText.toLocaleUpperCase();
                    break;
                case "lowercase":
                    featureText = featureText.toLocaleLowerCase();
                    break;
                default:
                    break;
            }
        }
        return featureText;
    }

    wrapText(text, font) {
        let resultText;

        if (text !== "") {
            let lines = [text];
            let widths = [];
            let width = this.getEstimatedWidth(font, lines, widths, this.letterSpacing);

            let wrapWidth = this.wrapWidth;
            let wrapCharacter = " ";
            let isWrapBefore = this.wrapBefore;

            if (wrapWidth > 0 && width > wrapWidth && text.includes(wrapCharacter)) {
                let textLines = [];
                lines = text.split(wrapCharacter);
                let wrapLines = [];
                let wrapWidthSum = 0;
                let tmpWrapWidth;

                if (isWrapBefore) {
                    for (let line of lines) {
                        let tmpLine = [line];
                        tmpWrapWidth = this.getEstimatedWidth(font, tmpLine, widths, this.letterSpacing);

                        wrapWidthSum += tmpWrapWidth;
                        if (tmpWrapWidth > wrapWidth) {
                            wrapLines = [];
                            textLines = [];
                            wrapWidthSum = 0;
                            break;
                        }

                        if (wrapLines.length > 0) {
                            if (wrapWidthSum > wrapWidth) {
                                wrapLines.push("\n");
                                textLines.push(wrapLines.join(""));
                                wrapLines = [];
                                wrapWidthSum = 0;
                            }
                        }

                        wrapLines.push(" " + line);
                    }

                    if (wrapLines.length > 0) {
                        textLines.push(wrapLines.join(""));
                    }
                } else {
                    for (let line of lines) {
                        wrapLines.push(" " + line);
                        let tmpLine = [line];
                        tmpWrapWidth = this.getEstimatedWidth(font, tmpLine, widths, this.letterSpacing);
                        wrapWidthSum += tmpWrapWidth;

                        if (wrapWidthSum > wrapWidth) {
                            wrapLines.push("\n");
                            textLines.push(wrapLines.join(""));
                            wrapLines = [];
                            wrapWidthSum = 0;
                        }
                    }

                    if (wrapLines.length > 0) { textLines.push(wrapLines.join("")); }
                }

                resultText = textLines.join("");
                if (resultText.lastIndexOf("\n") === resultText.length - 1) {
                    resultText = resultText.substr(0, resultText.length - 1);
                }
            } else {
                resultText = text;
            }
        }

        return resultText;
    }
}

export default GeoTextStyle;
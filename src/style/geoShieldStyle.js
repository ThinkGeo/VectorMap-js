import GeoStyle from "./geoStyle";
import LRUCache from "ol/structs/LRUCache";
import { Style, Fill, Stroke, Text, Icon, RegularShape, Circle } from 'ol/style'
import { measureTextWidth } from 'ol/render/canvas';
import { defaultTextAlign, defaultLineDash } from "ol/render/canvas";
import { TEXT_ALIGN } from "ol/render/replay";
import { measureTextHeight } from "ol/render/canvas";
import { SAFARI, CANVAS_LINE_DASH } from "ol/has";
import GeometryType from "ol/geom/GeometryType";
import { labelCache } from "ol/render/canvas";
import { getUid } from 'ol/util';
import { createCanvasContext2D } from "ol/dom";
import Point from "ol/geom/Point";

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

class GeoShieldStyle extends GeoStyle {
    constructor(styleJson) {
        super(styleJson)
        this.imageCache = [];
        this.labelInfos = new LRUCache(512);
        this.charWidths = {};
        this.textAligns = ["left", "right", "center", "end", "start"];

        if (styleJson) {
            this.iconType = styleJson["shield-icon-type"];
            this.iconSymbolType = styleJson["shield-icon-symbol-type"];
            this.iconSize = styleJson["shield-icon-size"] ? styleJson["shield-icon-size"] : 0;
            this.iconSrc = styleJson["shield-icon-src"];
            this.iconColor = styleJson["shield-icon-color"];
            this.iconOutlineColor = styleJson["shield-icon-outline-color"];
            this.iconOutlineWidth = styleJson["shield-icon-outline-width"] ? styleJson["shield-icon-outline-width"] : 0;

            if (this.iconSrc) {
                if (!GeoShieldStyle.poiCache[this.iconSrc]) {
                    let imageElement = document.createElement("img");
                    imageElement.src = this.iconSrc;
                    GeoShieldStyle.poiCache[this.iconSrc] = imageElement;
                }
            }

            this.name = styleJson["shield-name"];
            this.font = styleJson["shield-font"];
            this.align = styleJson["shield-align"];
            this.angle = styleJson["shield-rotate-angle"] ? styleJson["shield-rotate-angle"] : 0;

            // this.avoidEdges = styleJson["shield-avoid-edges"];
            this.dateFormat = styleJson["shield-date-format"];

            // TODO
            this.dx = styleJson["shield-dx"] ? styleJson["shield-dx"] : 0;
            this.dy = styleJson["shield-dy"] ? styleJson["shield-dy"] : 0;

            this.faceName = styleJson["shield-face-name"];

            this.fill = styleJson["shield-fill"];

            // this.forceHorizontalForLine = styleJson["shield-force-horizontal-for-line"];

            this.haloFill = styleJson["shield-halo-fill"] ? styleJson["shield-halo-fill"] : "Transparent";

            this.haloRadius = styleJson["shield-halo-radius"] ? styleJson["shield-halo-radius"] : 0;

            // using in strategy
            this.margin = styleJson["shield-margin"];

            // this.maxCharAngleDelta = styleJson["shield-max-char-angle-delta"];

            // using in strategy
            this.minDistance = styleJson["shield-min-distance"];

            // using in strategy
            this.minPadding = styleJson["shield-min-padding"];

            this.name = styleJson["shield-name"];

            this.numericFormat = styleJson["shield-numeric-format"];

            this.opacity = styleJson["shield-opacity"] | 1;

            this.orientation = styleJson["shield-orientation"];

            // using in strategy
            this.placements = styleJson["shield-placements"] ? styleJson["shield-placements"] : "UR,U,UL,B,BR,BL,L,R";

            // using in strategy
            this.placementType = styleJson["shield-placement-type"] ? styleJson["shield-placement-type"] : "default";

            this.size = styleJson["shield-size"];

            // using in strategy
            this.spacing = styleJson["shield-spacing"] !== undefined ? styleJson["shield-spacing"] : 10;

            this.textFormat = styleJson["shield-text-format"];

            this.wrap = styleJson["shield-wrap-before"] ? true : styleJson["shield-wrap-before"];

            this.wrapWidth = styleJson["shield-wrap-width"];

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
        let font;
        let size;

        this.textStyle = new Text({
            stroke: new Stroke()
        });

        if (this.textAligns.indexOf(this.align) >= 0) {
            this.textStyle.setTextAlign(this.align);
        }

        if (this.font) {
            this.textStyle.setFont(this.font ? this.font : "10px sans-serif");
        }

        if (this.fill) {
            this.textStyle.getFill().setColor(GeoStyle.toRGBAColor(this.fill, this.opacity));
        }

        if (this.haloFill) {
            this.textStyle.getStroke().setColor(GeoStyle.toRGBAColor(this.haloFill, this.opacity));
        }

        if (this.haloRadius) {
            this.textStyle.getStroke().setWidth(this.haloRadius);
        }

        if (this.orientation) {
            this.textStyle.setRotation(this.orientation);
        }

        if (this.iconColor) {
            this.convertSymbolColor = GeoStyle.toRGBAColor(this.iconColor);
        }
        if (this.iconOutlineColor) {
            this.convertSymbolOutlineColor = GeoStyle.toRGBAColor(this.iconOutlineColor);
        }

        this.style = new Style({
            text: this.textStyle
        });

        if (typeof WorkerGlobalScope === "undefined") {

            switch (this.iconType) {
                case "image":
                case "Image":
                    this.setShiledImageIcon();
                    break;
                case "symbol":
                case "Symbol":
                    this.setShieldSymbolIcon();
                    break;
            }
        }

    }

    getConvertedStyleCore(feature, resolution, options) {
        let featureText = "";
        if (this.name) {
            featureText = feature.get(this.name);
        }
        featureText = this.formatText(featureText);
        if (featureText === undefined || featureText === "") {
            return;
        }

        this.textStyle.setText(featureText);

        let labelInfo = this.getLabelInfo(featureText, options.frameState);

        let flatCoordinates = this.setLabelPosition(feature, resolution, labelInfo, options.strategyTree, options.frameState);
        if (flatCoordinates === undefined || flatCoordinates.length < 2) {
            return false;
        }
        if (typeof WorkerGlobalScope !== "undefined") {
            return true;
        }

        this.style.setGeometry(new Point(flatCoordinates, "XY"));
        let labelimage = this.getImage(labelInfo);

        this.textStyle.label = labelimage;
        this.textStyle.labelPosition = flatCoordinates;

        if (this.imageCache[featureText] === undefined) {
            this.imageCache[featureText] = [];
        }

        let featureZindex = feature["tempTreeZindex"];
        if (featureZindex === undefined) {
            featureZindex = 0;
        }
        this.style.setZIndex(featureZindex);

        return [this.style];
    }

    getLabelInfo(text, frameState) {
        let key = text;
        if (!this.labelInfos.containsKey(key)) {
            let font = this.formatFont(this.textStyle.getFont());
            text = this.wrapText(text, font);

            let fillState = this.textStyle.getFill();
            let strokeState = this.textStyle.getStroke();

            let pixelRatio = frameState.pixelRatio;
            let scale = this.textStyle.getScale();
            scale = (scale ? scale : 1) * pixelRatio;

            let align = TEXT_ALIGN[this.textStyle.getTextAlign() || defaultTextAlign];
            let strokeWidth = strokeState && strokeState.getWidth() ? strokeState.getWidth() : 0;

            let lines = text.split("\n");
            let numLines = lines.length;
            let widths = [];

            // let width = (<any>ol.render.canvas).TextReplay.measureTextWidths(font, lines, widths);
            let width = this.getEstimatedWidth(font, lines, widths);
            let renderWidth = width + strokeWidth;

            let lineHeight = this.charWidths["lineHeight"];
            let height = lineHeight * numLines;

            // if (this.dx) { this.textStyle.setOffsetX(this.dx + height / 2); }
            if (this.dx) { this.textStyle.setOffsetX(this.dx); }
            // if (this.dy) { this.textStyle.setOffsetY(this.dy + height / 2); }
            if (this.dy) { this.textStyle.setOffsetY(this.dy); }

            let labelWidth = Math.ceil(renderWidth * scale);
            let labelHeight = Math.ceil((height + strokeWidth) * scale);

            let labelInfo = {
                width: labelWidth,
                height: labelHeight,
                scale: scale,
                numLines: numLines,
                lines: lines,
                widths: widths,
                lineHeight: lineHeight,
                font: font
            };
            this.labelInfos.set(key, labelInfo);
        }
        return this.labelInfos.get(key);
    }

    setShiledImageIcon() {
        if (this.iconSrc !== undefined) {
            let poiImg = GeoShieldStyle.poiCache[this.iconSrc];
            if (poiImg.complete) {
                if (poiImg.naturalWidth !== 0) {
                    this.image = new Icon({
                        img: poiImg,
                        imgSize: [poiImg.width, poiImg.height],
                        rotation: this.angle * Math.PI / 180
                    });
                    this.style.setImage(this.image);
                }
            }
        }
    }

    setCircleIcon() {
        let fill = undefined;
        let stroke = undefined;
        let radius = this.iconSize * 0.5;

        if (this.iconColor) {
            fill = new Fill(({ color: this.convertSymbolColor }));
        }
        if (this.iconOutlineColor || this.iconOutlineWidth) {
            stroke = new Stroke(({
                color: this.convertSymbolOutlineColor,
                width: this.iconOutlineWidth
            }));
        }

        this.image = new Circle({
            fill: fill,
            stroke: stroke,
            radius: radius
        });
    }


    formatText(featureText) {
        if (this.numericFormat) {
            featureText = this.getTextWithNumericFormat(featureText);
        }
        if (this.dateFormat) {
            featureText = this.getTextWithDateFormat(featureText);
        }
        if (this.textFormat) {
            featureText = this.getTextWithFormat(featureText);
        }
        return featureText;
    }

    getTextWithNumericFormat(featureText) {
        let tmpArguments = this.numericFormat.split(",");
        let numericFormatOptions = {};
        for (let tmpArgument of tmpArguments) {
            let keyValuePair = tmpArgument.split(":");
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
        let numeric = new Intl.NumberFormat(tmpArguments[0], numericFormatOptions);

        return numeric.format(Number(featureText));
    }
    getTextWithDateFormat(featureText) {
        return new Date(featureText).format(this.dateFormat);
    }
    getTextWithFormat(featureText) {
        return String.format(featureText, this.textFormat);
    }
    getPointGeometry(feature) {
        return feature.getGeometry();
    }

    wrapText(text, font) {
        let resultText;

        if (text !== "") {
            let lines = [text];
            let widths = [];
            let width = this.getEstimatedWidth(font, lines, widths);

            let wrapWidth = this.wrapWidth;
            let wrapCharacter = " ";
            let isWrapBefore = this.wrap;

            if (wrapWidth > 0 && width > wrapWidth && text.includes(wrapCharacter)) {
                let textLines = [];
                lines = text.split(wrapCharacter);
                let wrapLines = [];
                let wrapWidthSum = 0;
                let tmpWrapWidth;

                if (isWrapBefore) {
                    for (let line of lines) {
                        let tmpLine = [line];
                        tmpWrapWidth = this.getEstimatedWidth(font, tmpLine, widths);

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
                        tmpWrapWidth = this.getEstimatedWidth(font, tmpLine, widths);

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

    formatFont(font) {
        let tmpFonts = font.split(" ");
        let formatedFont = [];

        if (tmpFonts[tmpFonts.length - 1].includes("bold") || tmpFonts[tmpFonts.length - 1].includes("italic")) {
            formatedFont.push(`${tmpFonts[tmpFonts.length - 1]} `);
            for (let i = 0; i < tmpFonts.length - 1; i++) {
                formatedFont.push(`${tmpFonts[i]} `);
            }
        } else {
            return font;
        }
        return formatedFont.join("").trim();
    }

    getEstimatedWidth(font, lines, widths) {
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
            width = Math.max(width, currentWidth);
            widths.push(currentWidth);
        }
        return width;
    }


    setShieldSymbolIcon() {
        if (this.iconSymbolType !== undefined) {

            switch (this.iconSymbolType) {
                case "circle":
                    this.setCircleIcon();
                    break;
                case "square":
                    this.setSquareIcon();
                    break;
                case "triangle":
                    this.setTriangleIcon();
                    break;
                case "cross":
                    this.setCrossIcon();
                    break;
                case "star":
                    this.setStarIcon();
                    break;
            }
            this.style.setImage(this.image);
        }
    }

    setStarIcon() {
        let fill = undefined;
        let stroke = undefined;
        let radius = this.iconSize * 0.5 * window.devicePixelRatio;

        if (this.iconColor) {
            fill = new Fill(({ color: this.convertSymbolColor }));
        }
        if (this.iconOutlineColor || this.iconOutlineWidth) {
            stroke = new Stroke(({
                color: this.convertSymbolOutlineColor,
                width: this.iconOutlineWidth
            }));
        }

        this.image = new RegularShape({
            fill: fill,
            stroke: stroke,
            points: 5,
            radius: radius,
            radius2: radius / 2.5,
            angle: this.angle
        });
    }

    setCrossIcon() {
        let fill = undefined;
        let stroke = undefined;
        let radius = this.iconSize * 0.5;

        if (this.iconColor) {
            fill = new Fill(({ color: this.convertSymbolColor }));
        }
        if (this.iconOutlineColor || this.iconOutlineWidth) {
            stroke = new Stroke(({
                color: this.convertSymbolOutlineColor,
                width: this.iconOutlineWidth
            }));
        }

        this.image = new RegularShape({
            fill: fill,
            stroke: stroke,
            points: 4,
            radius: radius,
            radius2: 0,
            angle: this.angle
        });
    }

    setTriangleIcon() {
        let fill = undefined;
        let stroke = undefined;
        let radius = this.iconSize * 0.5;

        if (this.iconColor) {
            fill = new Fill(({ color: this.convertSymbolColor }));
        }
        if (this.iconOutlineColor || this.iconOutlineWidth) {
            stroke = new Stroke(({
                color: this.convertSymbolOutlineColor,
                width: this.iconOutlineWidth
            }));
        }

        this.image = new RegularShape({
            fill: fill,
            stroke: stroke,
            points: 3,
            radius: radius,
            angle: this.angle
        });
    }

    setSquareIcon() {
        let fill = undefined;
        let stroke = undefined;
        let radius = this.iconSize * 0.5;

        if (this.iconColor) {
            fill = new Fill(({ color: this.convertSymbolColor }));
        }
        if (this.iconOutlineColor || this.iconOutlineWidth) {
            stroke = new Stroke(({
                color: this.convertSymbolOutlineColor,
                width: this.iconOutlineWidth
            }));
        }

        this.image = new RegularShape({
            fill: fill,
            stroke: stroke,
            points: 4,
            radius: radius,
            angle: Math.PI / 4 + this.angle
        });
    }

    setCircleIcon() {
        let fill = undefined;
        let stroke = undefined;
        let radius = this.iconSize * 0.5;

        if (this.iconColor) {
            fill = new Fill(({ color: this.convertSymbolColor }));
        }
        if (this.iconOutlineColor || this.iconOutlineWidth) {
            stroke = new Stroke(({
                color: this.convertSymbolOutlineColor,
                width: this.iconOutlineWidth
            }));
        }

        this.image = new Circle({
            fill: fill,
            stroke: stroke,
            radius: radius
        });
    }

    setShiledImageIcon() {
        if (this.iconSrc !== undefined) {
            let poiImg = GeoShieldStyle.poiCache[this.iconSrc];
            if (poiImg.complete) {
                if (poiImg.naturalWidth !== 0) {
                    this.image = new Icon({
                        img: poiImg,
                        imgSize: [poiImg.width, poiImg.height],
                        rotation: this.angle * Math.PI / 180
                    });
                    this.style.setImage(this.image);
                }
            }
        }
    }


    setLabelPosition(geometry, resolution, labelInfo, strategyTree, frameState) {
        let geometryType = geometry.getType();
        let flatCoordinates;
        let i, ii;

        let Constructor;
        if (this.placementType === "default") {
            Constructor = BATCH_CONSTRUCTORS_DEFAULT[geometryType];
        } else if (this.placementType === "detect") {
            Constructor = BATCH_CONSTRUCTORS_DETECT[geometryType];
        }

        let textLabelingStrategy = new Constructor();

        let width = labelInfo.width;
        let height = labelInfo.height;
        switch (geometryType) {
            case GeometryType.POINT:
            case GeometryType.MULTI_POINT:
                flatCoordinates = geometry.getFlatCoordinates();
                break;
            case GeometryType.LINE_STRING:
                flatCoordinates = /** @type {ol.geom.LineString} */ (geometry).getFlatMidpoint();
                break;
            case GeometryType.CIRCLE:
                flatCoordinates = /** @type {ol.geom.Circle} */ (geometry).getCenter();
                break;
            case GeometryType.MULTI_LINE_STRING:
                flatCoordinates = /** @type {ol.geom.MultiLineString} */ (geometry).getFlatMidpoints();
                break;
            case GeometryType.POLYGON:
                flatCoordinates = /** @type {ol.geom.Polygon} */ (geometry).getFlatInteriorPoint();
                break;
            case GeometryType.MULTI_POLYGON:
                let interiorPoints = /** @type {ol.geom.MultiPolygon} */ (geometry).getFlatInteriorPoints();
                flatCoordinates = [];
                for (i = 0, ii = interiorPoints.length; i < ii; i += 3) {
                    if (this.textStyle.overflow || interiorPoints[i + 2] / resolution >= width) {
                        flatCoordinates.push(interiorPoints[i], interiorPoints[i + 1]);
                    }
                }
                break;
            default:
        }
        flatCoordinates = textLabelingStrategy.markLocation(flatCoordinates, width, height, resolution, geometryType, this, strategyTree, frameState);

        return flatCoordinates;
    }

    getImage(labelInfo) {
        if (labelInfo.label === undefined) {
            let context = createCanvasContext2D(labelInfo.width, labelInfo.height);
            let label = context.canvas;
            if (labelInfo.scale !== 1) {
                context.scale(labelInfo.scale, labelInfo.scale);
            }

            context.font = labelInfo.font;

            let strokeState = this.textStyle.getStroke();
            let strokeWidth = strokeState && strokeState.getWidth() ? strokeState.getWidth() : 0;

            let fillState = this.textStyle.getFill();

            if (strokeState) {
                context.strokeStyle = strokeState.getColor() ? strokeState.getColor() : "Transparent";
                context.lineWidth = strokeWidth * (SAFARI ? labelInfo.scale : 1);
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
            if (fillState) {
                context.fillStyle = fillState.getColor();
            }
            context.textBaseline = "middle";
            context.textAlign = "center";
            let align = TEXT_ALIGN[this.textStyle.getTextAlign() || defaultTextAlign];
            let leftRight = (0.5 - align);
            let x = align * label.width / labelInfo.scale + leftRight * strokeWidth;
            let i;
            if (strokeState) {
                for (i = 0; i < labelInfo.numLines; ++i) {
                    context.strokeText(labelInfo.lines[i], x + leftRight * labelInfo.widths[i], 0.5 * (strokeWidth + labelInfo.lineHeight) + i * labelInfo.lineHeight);
                }
            }
            if (fillState) {
                for (i = 0; i < labelInfo.numLines; ++i) {
                    context.fillText(labelInfo.lines[i], x + leftRight * labelInfo.widths[i], 0.5 * (strokeWidth + labelInfo.lineHeight) + i * labelInfo.lineHeight);
                }
            }
            labelInfo["label"] = label;
        }
        return labelInfo["label"];
    }

}

export default GeoShieldStyle;
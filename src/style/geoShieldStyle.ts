
import { GeoStyle } from "./geoStyle";
import { GeoBrush } from "../style/geoBrush";

import { TextLabelingStrategy } from "./textLabelingStrategy";
import { DetectTextLabelingStrategy } from "./detectTextLabelingStrategy";

export class GeoShieldStyle extends GeoStyle {
    textAligns = ["left", "right", "center", "end", "start"];
    align: string;
    // avoidEdges: boolean;
    dateFormat: string;
    dx: number;
    dy: number;
    faceName: string;
    fill: string;
    forceHorizontalForLine: boolean;
    haloFill: string;
    haloRadius: number;
    margin: number;
    maxCharAngleDelta: string;
    minDistance: number;
    minPadding: number;
    name: string;
    font: string;
    numericFormat: string;
    angle: number;
    opacity: number;
    orientation: number;
    placements: string;
    placementType: string;
    polygonLabelingLocationMode: string;
    ratio: string;
    size: number;
    spacing: number;
    splineType: string;
    textFormat: string;
    wrap: string;
    wrapWidth: number;
    iconType: string;
    iconSize: number;
    iconSrc: string;
    iconColor: string;
    iconOutlineColor: string;
    iconOutlineWidth: number;
    iconSymbolType: string;

    convertSymbolColor: string;
    convertSymbolOutlineColor: string;

    textStyle: any;
    style: any;
    image: any;
    imageCache: any;
    labelInfos: any;

    charWidths: any;

    static poiCache = [];

    constructor(styleJson?: any) {
        super(styleJson);
        this.imageCache = [];
        this.labelInfos =  new (<any>ol).structs.LRUCache(512);
        this.charWidths = {};

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

            this.opacity = styleJson["shield-opacity"];

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
        }
    }

    initializeCore() {
        this.textStyle = new ol.style.Text({
            stroke: new ol.style.Stroke()
        });

        if (this.textAligns.indexOf(this.align) >= 0) {
            this.textStyle.setTextAlign(this.align);
        }

        this.textStyle.setFont(this.font ? this.font : "10px sans-serif");

        if(this.faceName){
            this.textStyle.setFont(this.faceName);
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

        this.style = new ol.style.Style({
            text: this.textStyle
        });

        let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let i = 0; i < chars.length; i++) {
            this.charWidths[chars[i]] = (<any>ol.render.canvas).measureTextWidth(this.font, chars[i]);
        }
        this.charWidths[" "] = (<any>ol.render.canvas).measureTextWidth(this.font, " ");
        for (let i = 0; i <= 9; i++) {
            this.charWidths[i] = (<any>ol.render.canvas).measureTextWidth(this.font, i);
        }

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

    getConvertedStyleCore(feature: any, resolution: number, options: any): ol.style.Style[] {
        let featureText = "";
        if (this.name) {
            featureText = feature.get(this.name);
        }
        featureText = this.formatText(featureText);
        if (featureText === undefined || featureText === "") {
            return;
        }

        this.textStyle.setText(featureText);

        let labelInfo = this.getLabelInfo(featureText);

        let flatCoordinates = this.setLabelPosition(feature.getGeometry(), resolution, labelInfo, options.strategyTree, options.frameState);
        if (flatCoordinates === undefined || flatCoordinates.length < 2) {
            return;
        }
        this.style.setGeometry(new ol.geom.Point(flatCoordinates, "XY"));

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
        this.style.zCoordinate = this.zIndex;

        return [this.style];
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
        let radius = this.iconSize * 0.5;

        if (this.iconColor) {
            fill = new ol.style.Fill(({ color: this.convertSymbolColor }));
        }
        if (this.iconOutlineColor || this.iconOutlineWidth) {
            stroke = new ol.style.Stroke(({
                color: this.convertSymbolOutlineColor,
                width: this.iconOutlineWidth
            }));
        }

        this.image = new ol.style.RegularShape({
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
            fill = new ol.style.Fill(({ color: this.convertSymbolColor }));
        }
        if (this.iconOutlineColor || this.iconOutlineWidth) {
            stroke = new ol.style.Stroke(({
                color: this.convertSymbolOutlineColor,
                width: this.iconOutlineWidth
            }));
        }

        this.image = new ol.style.RegularShape({
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
            fill = new ol.style.Fill(({ color: this.convertSymbolColor }));
        }
        if (this.iconOutlineColor || this.iconOutlineWidth) {
            stroke = new ol.style.Stroke(({
                color: this.convertSymbolOutlineColor,
                width: this.iconOutlineWidth
            }));
        }

        this.image = new ol.style.RegularShape({
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
            fill = new ol.style.Fill(({ color: this.convertSymbolColor }));
        }
        if (this.iconOutlineColor || this.iconOutlineWidth) {
            stroke = new ol.style.Stroke(({
                color: this.convertSymbolOutlineColor,
                width: this.iconOutlineWidth
            }));
        }

        this.image = new ol.style.RegularShape({
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
            fill = new ol.style.Fill(({ color: this.convertSymbolColor }));
        }
        if (this.iconOutlineColor || this.iconOutlineWidth) {
            stroke = new ol.style.Stroke(({
                color: this.convertSymbolOutlineColor,
                width: this.iconOutlineWidth
            }));
        }

        this.image = new ol.style.Circle({
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
                    this.image = new ol.style.Icon({
                        img: poiImg,
                        imgSize: [poiImg.width, poiImg.height],
                        rotation: this.angle * Math.PI / 180
                    });
                    this.style.setImage(this.image);
                }
            }
        }
    }

    getLabelInfo(text: string) {
        let key= text;
        if (!this.labelInfos.containsKey(key)) 
        {
            let font = this.formatFont(this.textStyle.getFont());
            text = this.wrapText(text, font);
    
            let fillState = this.textStyle.getFill();
            let strokeState = this.textStyle.getStroke();
    
            let pixelRatio = window.devicePixelRatio;
            let scale = this.textStyle.getScale();
            scale = (scale ? scale : 1) * pixelRatio;
    
            let align = (<any>ol.render).replay.TEXT_ALIGN[this.textStyle.getTextAlign() || (<any>ol.render.canvas).defaultTextAlign];
            let strokeWidth = strokeState && strokeState.getWidth() ? strokeState.getWidth() : 0;
    
            let lines = text.split("\n");
            let numLines = lines.length;
            let widths = [];
    
            // let width = (<any>ol.render.canvas).TextReplay.measureTextWidths(font, lines, widths);
            let width = this.getEstimatedWidth(font, lines, widths);
            let renderWidth = width + strokeWidth;
    
            let lineHeight = (<any>ol.render.canvas).measureTextHeight(font);
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
            this.labelInfos.set(key,labelInfo);
        }        
        return this.labelInfos.get(key);
    }

    setLabelPosition(geometry: any, resolution: any, labelInfo: any, strategyTree: any, frameState: olx.FrameState) {
        let geometryType = geometry.getType();
        let flatCoordinates;
        let i, ii;

        let Constructor: any;
        if (this.placementType === "default") {
            Constructor = this.BATCH_CONSTRUCTORS_DEFAULT[geometryType];
        } else if (this.placementType === "detect") {
            Constructor = this.BATCH_CONSTRUCTORS_DETECT[geometryType];
        }

        let textLabelingStrategy = new Constructor();

        let width = labelInfo.width;
        let height = labelInfo.height;
        switch (geometryType) {
            case (<any>ol.geom).GeometryType.POINT:
            case (<any>ol.geom).GeometryType.MULTI_POINT:
                flatCoordinates = geometry.getFlatCoordinates();
                break;
            case (<any>ol.geom).GeometryType.LINE_STRING:
                flatCoordinates = /** @type {ol.geom.LineString} */ (geometry).getFlatMidpoint();
                break;
            case (<any>ol.geom).GeometryType.CIRCLE:
                flatCoordinates = /** @type {ol.geom.Circle} */ (geometry).getCenter();
                break;
            case (<any>ol.geom).GeometryType.MULTI_LINE_STRING:
                flatCoordinates = /** @type {ol.geom.MultiLineString} */ (geometry).getFlatMidpoints();
                break;
            case (<any>ol.geom).GeometryType.POLYGON:
                flatCoordinates = /** @type {ol.geom.Polygon} */ (geometry).getFlatInteriorPoint();
                break;
            case (<any>ol.geom).GeometryType.MULTI_POLYGON:
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

    getImage(labelInfo: any) {
        if (labelInfo.label === undefined) {
            let context = (<any>ol).dom.createCanvasContext2D(labelInfo.width, labelInfo.height);
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
                context.lineWidth = strokeWidth * ((<any>ol.has).SAFARI ? labelInfo.scale : 1);
                context.lineCap = strokeState.getLineCap();
                context.lineJoin = strokeState.getLineJoin();
                context.miterLimit = strokeState.getMiterLimit();
                let lineDash = strokeState.getLineDash();
                lineDash = lineDash ? lineDash.slice() : (<any>ol.render.canvas).defaultLineDash;
                if ((<any>ol.has).CANVAS_LINE_DASH && lineDash.length) {
                    context.setLineDash(strokeState.getLineDash());
                    context.lineDashOffset = (<any>strokeState).getLineDashOffset();
                }
            }
            if (fillState) {
                context.fillStyle = fillState.getColor();
            }
            context.textBaseline = "middle";
            context.textAlign = "center";
            let align = (<any>ol.render).replay.TEXT_ALIGN[this.textStyle.getTextAlign() || (<any>ol.render.canvas).defaultTextAlign];
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

    formatText(featureText: string): string {
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

    public getTextWithNumericFormat(featureText: string): string {
        let tmpArguments = this.numericFormat.split(",");
        let numericFormatOptions = {};
        for (let tmpArgument of tmpArguments) {
            let keyValuePair = tmpArgument.split(":");
            switch (keyValuePair[0].trim()) {
                case "localeMatcher":
                    (<any>numericFormatOptions).localeMatcher = keyValuePair[1].trim();
                    break;
                case "style":
                    (<any>numericFormatOptions).style = keyValuePair[1].trim();
                    break;
                case "currency":
                    (<any>numericFormatOptions).currency = keyValuePair[1].trim();
                    break;
                case "currencyDisplay":
                    (<any>numericFormatOptions).currencyDisplay = keyValuePair[1].trim();
                    break;
                case "useGrouping":
                    (<any>numericFormatOptions).useGrouping = keyValuePair[1].trim();
                    break;
                case "minimumIntegerDigits":
                    (<any>numericFormatOptions).minimumIntegerDigits = keyValuePair[1].trim();
                    break;
                case "minimumFractionDigits":
                    (<any>numericFormatOptions).minimumFractionDigits = keyValuePair[1].trim();
                    break;
                case "maximumFractionDigits":
                    (<any>numericFormatOptions).maximumFractionDigits = keyValuePair[1].trim();
                    break;
                case "minimumSignificantDigits":
                    (<any>numericFormatOptions).minimumSignificantDigits = keyValuePair[1].trim();
                    break;
                case "maximumSignificantDigits":
                    (<any>numericFormatOptions).maximumSignificantDigits = keyValuePair[1].trim();
                    break;
            }
        }
        let numeric = new Intl.NumberFormat(tmpArguments[0], numericFormatOptions);

        return numeric.format(Number(featureText));
    }
    public getTextWithDateFormat(featureText: string): string {
        return (<any>(new Date(featureText))).format(this.dateFormat);
    }
    public getTextWithFormat(featureText: string): string {
        return (<any>String).format(featureText, this.textFormat);
    }

    getPointGeometry(feature: ol.Feature) {
        return feature.getGeometry();
    }

    wrapText(text: string, font: string): string {
        let resultText: string;

        if (text !== "") {
            let lines = [text];
            let widths = [];
            // let width = (<any>ol.render.canvas).TextReplay.measureTextWidths(font, lines, widths);
            let width = this.getEstimatedWidth(font, lines, widths);


            let wrapWidth = this.wrapWidth;
            let wrapCharacter = " ";
            let isWrapBefore = this.wrap;

            if (wrapWidth > 0 && width > wrapWidth && text.includes(wrapCharacter)) {
                let textLines = [];
                lines = text.split(wrapCharacter);
                let wrapLines = [];
                let wrapWidthSum = 0;
                let tmpWrapWidth: number;

                if (isWrapBefore) {
                    for (let line of lines) {
                        let tmpLine = [line];
                        // tmpWrapWidth = (<any>ol.render.canvas).TextReplay.measureTextWidths(font, tmpLine, widths);
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
                        // tmpWrapWidth = (<any>ol.render.canvas).TextReplay.measureTextWidths(font, tmpLine, widths);
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

    formatFont(font: string): string {
        let tmpFonts = font.split(" ");
        let formatedFont: string[] = [];

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

    BATCH_CONSTRUCTORS_DEFAULT = {
        Point: TextLabelingStrategy,
        MultiPoint: TextLabelingStrategy,
        LineString: TextLabelingStrategy,
        Circle: TextLabelingStrategy,
        MultiLineString: TextLabelingStrategy,
        Polygon: TextLabelingStrategy,
        MultiPolygon: TextLabelingStrategy
    };

    BATCH_CONSTRUCTORS_DETECT = {
        Point: DetectTextLabelingStrategy,
        MultiPoint: DetectTextLabelingStrategy,
        LineString: DetectTextLabelingStrategy,
        Circle: DetectTextLabelingStrategy,
        MultiLineString: DetectTextLabelingStrategy,
        Polygon: DetectTextLabelingStrategy,
        MultiPolygon: DetectTextLabelingStrategy
    };
}

import { GeoStyle } from "./geoStyle";
import { GeoBrush } from "../style/geoBrush";
import { TextLabelingStrategy } from "./textLabelingStrategy";
import { DetectTextLabelingStrategy } from "./detectTextLabelingStrategy";

export class GeoTextStyle extends GeoStyle {
    static measureCanvas = undefined;
    static measureContext = undefined;

    aligns = ["default", "left", "right", "center"];
    baselines = ["bottom", "top", "middle", "alphabetic", "hanging", "ideographic"];
    letterCases = ["default", "uppercase", "lowercase"];

    align: string;
    baseline: string;
    dateFormat: string;
    offsetX: number;
    offsetY: number;
    font: string;
    fillColor: string;
    forceHorizontalForLine: boolean;
    haloColor: string;
    haloRadius: number;
    maskColor: string;
    maskMargin: string;
    maskOutlineColor: string;
    maskOutlineWidth: number;
    maskType: string;
    maxCharAngleDelta: number;
    intervalDistance: number;
    name: string;
    numericFormat: string;
    opacity: number;
    rotationAngle: number;
    placement: string;
    spacing: number;
    content: string;
    wrapBefore: string;
    wrapWidth: number;
    letterCase: string;
    letterSpacing: number;
    basePointStyle: any;
    labelInfos: any;
    drawnMask: boolean = false;
    charWidths: any;
    style: ol.style.Style;
    state_: any;

    constructor(styleJson?: any) {
        super(styleJson);
        this.labelInfos = new (<any>ol).structs.LRUCache(512);
        this.charWidths = {};

        if (styleJson) {
            // drawing label canvas property
            // // add into textStyle
            this.font = styleJson["text-font"];
            this.fillColor = styleJson["text-fill-color"];
            this.haloColor = styleJson["text-halo-color"];
            this.haloRadius = styleJson["text-halo-radius"];

            // // keep in self.
            this.name = styleJson["text-name"];
            this.dateFormat = styleJson["text-date-format"];
            this.numericFormat = styleJson["text-numeric-format"];
            this.content = styleJson["text-content"];
            this.letterCase = styleJson["text-letter-case"];

            this.letterSpacing = styleJson["text-letter-spacing"] || 0;
            this.wrapWidth = styleJson["text-wrap-width"] || 0;
            this.wrapBefore = styleJson["text-wrap-before"] || false; // internal property
            this.align = styleJson["text-align"] || "center";

            this.maskType = styleJson["text-mask-type"];
            this.maskMargin = styleJson["text-mask-margin"];
            this.maskColor = styleJson["text-mask-color"];
            this.maskOutlineColor = styleJson["text-mask-outline-color"];
            this.maskOutlineWidth = styleJson["text-mask-outline-width"];



            // renamed
            // // add into textStyle
            this.offsetX = styleJson["text-offset-x"];
            this.offsetY = styleJson["text-offset-y"];
            this.baseline = styleJson["text-baseline"] || "top";

            this.forceHorizontalForLine = styleJson["text-force-horizontal-for-line"];
            this.intervalDistance = styleJson["text-interval-distance"];
            this.spacing = styleJson["text-spacing"] || 10;
            this.rotationAngle = styleJson["text-rotation-angle"];
            this.maxCharAngleDelta = styleJson["text-max-char-angle-delta"];
            this.opacity = styleJson["text-opacity"];
            this.basePointStyle = styleJson["text-base-point-style"];
            this.placement = styleJson["text-placement"] || "B";

            // TODO
            this.lineSpacing = 0;

            let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            for (let i = 0; i < chars.length; i++) {
                this.charWidths[chars[i]] = (<any>ol.render.canvas).measureTextWidth(this.font, chars[i]);
            }
            this.charWidths[" "] = (<any>ol.render.canvas).measureTextWidth(this.font, " ");
            for (let i = 0; i <= 9; i++) {
                this.charWidths[i] = (<any>ol.render.canvas).measureTextWidth(this.font, i);
            }
        }
    }

    initializeCore() {
        if (this.fillColor) {
            this.fillColor = GeoStyle.toRGBAColor(this.fillColor, this.opacity);
        }
        if (this.haloColor) {
            this.haloColor = GeoStyle.toRGBAColor(this.haloColor, this.opacity);
        }

        let fill = new ol.style.Fill();
        let stroke = new ol.style.Stroke();
        let textStyle = new ol.style.Text({
            fill: fill,
            stroke: stroke
        });

        this.style = new ol.style.Style({
            text: textStyle
        });

        if (this.font) {
            textStyle.setFont(this.font);
        }
        if (this.fillColor) {
            fill.setColor(this.fillColor);
        }

        if (!this.haloRadius || this.haloColor === undefined) {
            textStyle.setStroke(undefined);
        }
        else {
            stroke.setColor(this.haloColor);
            stroke.setWidth(this.haloRadius);
        }
        if (this.aligns.indexOf(this.align) >= 0) {
            textStyle.setTextAlign(this.align);
        }
        if (this.baselines.indexOf(this.baseline) >= 0) {
            textStyle.setTextBaseline(this.baseline);
        }
        if (this.offsetX) {
            textStyle.setOffsetX(this.offsetX);
        }
        if (this.offsetY) {
            textStyle.setOffsetY(this.offsetY);
        }

        if (this.letterCases.includes(this.letterCase)) {
        } else {
            // invalid input, default
            this.letterCase = this.letterCases[0];
        }


        if (this.offsetX) {
            textStyle.setOffsetX(this.offsetX);
        }
        if (this.offsetY) {
            textStyle.setOffsetY(this.offsetY);
        }
        if (this.rotationAngle) {
            textStyle.setRotation(this.rotationAngle);
        }
        if (this.maxCharAngleDelta >= 0) {
            (<any>textStyle).setMaxAngle(this.maxCharAngleDelta);
        }
    }

    getConvertedStyleCore(feature: any, resolution: number, options: any): ol.style.Style[] {
        let textStyles = [];
        let featureText = "";

        if (this.name) {
            featureText = feature.get(this.name);
        }

        // A workaround for the language, remove it after data update
        if ((featureText === undefined || featureText === "") && (this.name && this.name.indexOf("name_") === 0)) {
            featureText = feature.get("name");
        }

        if (this.numericFormat) {
            featureText = this.getTextWithNumericFormat(featureText);
        }
        if (this.dateFormat) {
            featureText = this.getTextWithDateFormat(featureText);
        }
        if (this.content) {
            featureText = this.getTextWithContent(featureText);
        }

        if (featureText === undefined || featureText === "") {
            return textStyles;
        }

        featureText = this.getTextWithLetterCase(featureText);

        this.style.getText().setText(featureText);

        this.style['zCoordinate'] = this.zIndex;
        this.style.getText()["placements"] = this.placement;

        if (this.setLabelPosition(featureText, feature.getGeometry(), resolution, this.style.getText(), options.strategyTree, options.frameState)) {
            let featureZindex = feature["tempTreeZindex"];
            if (featureZindex === undefined) {
                featureZindex = 0;
            }
            this.style.setZIndex(featureZindex);

            textStyles.push(this.style);
        }

        return textStyles;
    }

    setLabelPosition(text: string, geometry: any, resolution: any, textState: ol.style.Text, strategyTree: any, frameState: olx.FrameState): boolean {
        let flatCoordinates;

        let geometryType = geometry.getType();
        if ((geometryType === (<any>ol.geom).GeometryType.LINE_STRING || geometryType === (<any>ol.geom).GeometryType.MULTI_LINE_STRING) && !this.forceHorizontalForLine) {
            let geometryType = geometry.getType();
            flatCoordinates = geometry.getFlatCoordinates();
            if (flatCoordinates === undefined) { return false; }
        } else {
            let labelInfo = this.getLabelInfo(text, textState);

            let canvasWidth = labelInfo.labelWidth;
            let canvasHeight = labelInfo.labelHeight;
            let tmpLabelWidth = canvasWidth;
            let tmpLabelHeight = canvasHeight;

            switch (geometryType) {
                case (<any>ol.geom).GeometryType.POINT:
                    flatCoordinates = geometry.getFlatCoordinates();
                    break;
                case (<any>ol.geom).GeometryType.MULTI_POINT:
                    flatCoordinates = geometry.getCenter();
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
                    if (flatCoordinates[2] / resolution < tmpLabelWidth) {
                        flatCoordinates = undefined;
                    }
                    break;
                case (<any>ol.geom).GeometryType.MULTI_POLYGON:
                    let interiorPoints = /** @type {ol.geom.MultiPolygon} */ (geometry).getFlatInteriorPoints();
                    // flatCoordinates = interiorPoints;
                    flatCoordinates = [];
                    for (let i = 0, ii = interiorPoints.length; i < ii; i += 3) {
                        if (interiorPoints[i + 2] / resolution >= tmpLabelWidth) {
                            flatCoordinates.push(interiorPoints[i], interiorPoints[i + 1]);
                        }
                    }
                    if (!flatCoordinates.length) {
                        return;
                    }
                    break;
                default:
            }

            // let textLabelingStrategy = new TextLabelingStrategy();
            // flatCoordinates = textLabelingStrategy.markLocation(flatCoordinates, tmpLabelWidth, tmpLabelHeight, resolution, geometryType, this, strategyTree, frameState);

            if (flatCoordinates === undefined) { return false; }

            var labelImage = this.getImage(text, textState, labelInfo);

            if (labelImage === undefined) {
                return;
            }

            (<any>textState).label = labelImage;
        }
        (<any>textState).labelPosition = flatCoordinates;

        return true;
    }

    getLabelInfo(text: string, textStyle: ol.style.Text) {
        var key = text + this.uid;
        if (!this.labelInfos.containsKey(key)) {
            // gets drawing font.
            let font = textStyle.getFont();

            // gets storke width.
            let strokeStyle = textStyle.getStroke();
            let strokeWidth = strokeStyle ? strokeStyle.getWidth() : 0;

            // gets letterSpacing.
            let letterSpacing = this.letterSpacing;

            // gets line spacing.
            let lineSpacing = this.lineSpacing;

            // gets the wrap width, warp the line which has wrap character and the width is bigger than wrap width.
            let wrapWidth = this.wrapWidth;

            // TODO whether to keep it or not, currently is keep it but with out implement.
            let wrapBefore = this.wrapBefore;

            // default wrap character.
            let wrapCharacter = " ";

            // warps text and measure width.
            let linesInfo = this.getWrapedTextAndWidths(text, font, strokeWidth, letterSpacing, lineSpacing, wrapWidth, wrapCharacter, wrapBefore);
            // gets height of one line
            let lineHeight = this.getTextHeight(font, strokeWidth);

            let linesWidths = linesInfo.widths;
            let textWidth = linesInfo.maxWidth;


            let textHeight = lineHeight;
            if (linesInfo.lines.length >= 2) {
                textHeight += (linesInfo.lines.length - 1) * (lineHeight + lineSpacing);
            }

            let labelWidth = Math.ceil((textWidth));
            let labelHeight = Math.ceil((textHeight);

            let labelInfo = {
                labelWidth: labelWidth,
                labelHeight: labelHeight,
                linesInfo: linesInfo,
                lineHeight: lineHeight,
                strokeWidth: strokeWidth,
                lineSpacing: lineSpacing
            };
            this.labelInfos.set(key, labelInfo);
        }

        return this.labelInfos.get(key);
    }
    getWrapedTextAndWidths(text, font, strokeWidth, letterSpacing, lineSpacing, wrapWidth, wrapCharacter, wrapBefore): string {
        let resultLines = [];
        let resultLineWidths = [];
        let maxWidth = 0;

        if (text !== "") {
            let lines = text.split('\n');
            let widths = [];
            let width = this.measureLinesWidths(lines, font, strokeWidth, letterSpacing, widths);

            if (wrapWidth > 0 && text.includes(wrapCharacter)) {
                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i];
                    let lineWidth = widths[i];
                    if (lineWidth > wrapWidth && line.includes(wrapCharacter)) {
                        let tempLineWidths = [];
                        let tempLines = this.warpLine(line, wrapWidth, font, strokeWidth, letterSpacing, wrapCharacter, tempLineWidths);

                        for (let j = 0; j < tempLines.length; j++) {
                            resultLines.push(tempLines[j]);
                            resultLineWidths.push(tempLineWidths[j]);
                            if (tempLineWidths[j] > maxWidth) {
                                maxWidth = tempLineWidths[j];
                            }
                        }
                    }
                    else {
                        resultLines.push(line);
                        resultLineWidths.push(lineWidth);
                        if (lineWidth > maxWidth) {
                            maxWidth = lineWidth;
                        }
                    }
                }
            }
            else {
                resultLines = lines;
                resultLineWidths = widths;
                maxWidth = width;
            }

        }

        return {
            lines: resultLines,
            widths: resultLineWidths,
            maxWidth: maxWidth
        };
    }
    measureLinesWidths(lines, font, strokeWidth, letterSpacing, widths) {
        let tempContext = GeoTextStyle.getMeasureContext(letterSpacing);
        tempContext.font = font;
        tempContext.lineWidth = strokeWidth;
        tempContext.lineJoin = "round";

        let maxWidth = 0;
        for (var i = 0; i < lines.length; i++) {
            let line = lines[i];
            let lineWidth = Math.ceil(tempContext.measureText(line).width - letterSpacing + strokeWidth);
            widths.push(lineWidth);
            if (lineWidth > maxWidth) {
                maxWidth = lineWidth;
            }
        }
        return maxWidth;
    }
    warpLine(line, wrapWidth, font, strokeWidth, letterSpacing, wrapCharacter, lineWidths) {
        let lines = [];

        let words = line.split(wrapCharacter);
        let tempContext = GeoTextStyle.getMeasureContext(letterSpacing);
        tempContext.font = font;
        tempContext.lineWidth = strokeWidth;
        tempContext.lineJoin = "round";
        if (words.length === 1) {
            let testLine = words[0];
            let testWidth = Math.ceil(tempContext.measureText(testLine).width - letterSpacing + strokeWidth);
            lines.push(words[0]);
            lineWidths.push(testWidth);
        }
        else {
            let measureLine = words[0];
            let measureWidth = Math.ceil(tempContext.measureText(measureLine).width - letterSpacing + strokeWidth);

            let testLine;
            let testWidth;
            for (let n = 1; n < words.length; n++) {
                testLine = measureLine + " " + words[n];
                testWidth = Math.ceil(tempContext.measureText(testLine).width - letterSpacing + strokeWidth);
                if (testWidth > wrapWidth) {
                    lines.push(measureLine);
                    lineWidths.push(measureWidth);

                    measureLine = words[n];
                    measureWidth = Math.ceil(tempContext.measureText(measureLine).width - letterSpacing + strokeWidth);
                }
                else {
                    measureLine = testLine;
                    measureWidth = testWidth;
                }
                if (n == words.length - 1) {
                    lines.push(measureLine);
                    lineWidths.push(measureWidth);
                }
            }
        }
        return lines;
    }

    getTextHeight(font, strokeWidth) {
        let lineHeight = (<any>ol.render.canvas).measureTextHeight(font);
        return lineHeight + strokeWidth;
    }

    getImage(text: any, textStyle: ol.style.Text, labelInfo: any) {
        var labelCache = (<any>ol).render.canvas.labelCache;
        var key = (<any>ol).getUid(this);
        key += text;
        if (!labelCache.containsKey(key)) {
            let strokeStyle = textStyle.getStroke();
            let fillStyle = textStyle.getFill();

            let canvasHeight = labelInfo.labelHeight;
            let canvasWidth = labelInfo.labelWidth;
            let lineHeight = labelInfo.lineHeight;
            let letterSpacing = this.letterSpacing;
            var lineSpacing = this.lineSpacing;
            let align = this.align;

            let strokeWidth = strokeStyle ? strokeStyle.getWidth() : 0;

            let canvas = GeoTextStyle.createCanvas(canvasWidth, canvasHeight);
            labelCache.set(key, canvas);

            // For letterSpacing we need app
            let body;
            if (letterSpacing) {
                body = document.getElementsByTagName("body")[0];
                if (body) {
                    canvas.style.display = "none";
                    body.appendChild(canvas);
                }
                canvas.style.letterSpacing = letterSpacing + "px";
            }
            let context = canvas.getContext("2d");

            // set the property of canvas.
            context.font = textStyle.getFont();
            context.lineWidth = strokeWidth;
            context.lineJoin = "round";

            var x = 0;
            var y = -lineHeight - lineSpacing;

            var letterSpacingOffset = letterSpacing;
            var alignOffsetX = 0;
            var canvasTextAlign = "center";
            if (align == "left") {
                alignOffsetX = Math.ceil(strokeWidth / 2);
                canvasTextAlign = "left";
            }
            else if (align == "right") {
                alignOffsetX = Math.floor(canvasWidth - strokeWidth / 2 + letterSpacing);
                canvasTextAlign = "right";
            }
            else {
                alignOffsetX = Math.floor((canvasWidth) / 2 + letterSpacingOffset / 2);
            }

            var linesInfo = labelInfo.linesInfo;
            var lines = linesInfo.lines;
            for (var i = 0; i < lines.length; i++) {
                y += lineHeight + lineSpacing;
                let line = lines[i];



                context.textAlign = canvasTextAlign;
                context.textBaseline = 'middle';
                var anchorX = x + alignOffsetX;
                var anchorY = y + lineHeight / 2;
                if (strokeStyle) {
                    context.strokeStyle = strokeStyle.getColor();
                    context.strokeText(line, anchorX, anchorY);
                }

                context.fillStyle = fillStyle.getColor();
                context.fillText(line, anchorX, anchorY);
            }
            if (this.letterSpacing && body) {
                body.removeChild(label);
            }
        }

        return labelCache.get(key);
    }

    wrapText(text: string, font: string): string {
        let resultText: string;

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
                let tmpWrapWidth: number;

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

    drawMask(context: any, x: number, y: number, width: number, height: number) {
        let fill = undefined;
        let stroke = undefined;

        if (this.maskColor) {
            fill = new ol.style.Fill();
            fill.setColor(GeoStyle.toRGBAColor(this.maskColor, this.opacity ? this.opacity : 1));
        }

        if (this.maskOutlineColor && this.maskOutlineWidth) {
            stroke = new ol.style.Stroke();
            if (this.maskOutlineColor) {
                stroke.setColor(GeoStyle.toRGBAColor(this.maskOutlineColor, this.opacity ? this.opacity : 1));
            }
            if (this.maskOutlineWidth) {
                stroke.setWidth(this.maskOutlineWidth ? this.maskOutlineWidth : 0);
            }
        }

        if (this.maskType) {
            this.drawnMask = true;
        } else {
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
                this.drawCircle(context, x, y, width, height, fill, stroke);
                break;
        }
    }

    drawRectangle(context: any, x: number, y: number, width: number, height: number, fill: ol.style.Fill, stroke: ol.style.Stroke) {
        const deltaWidth = (context.canvas.width - width) / 2 - stroke.getWidth();
        const deltaHeight = (context.canvas.height - height) / 2 - stroke.getWidth();

        if (fill) {
            context.fillStyle = fill.getColor();
            context.fillRect(x + deltaWidth, y + deltaHeight, width + stroke.getWidth() * 2, height + stroke.getWidth() * 2);
        }

        if (stroke) {
            context.lineWidth = stroke.getWidth();
            context.strokeStyle = stroke.getColor();
            context.strokeRect(x + deltaWidth, y + deltaHeight, width + stroke.getWidth() * 2, height + stroke.getWidth() * 2);
        }
    }

    drawRoundRectangle(context: any, x: number, y: number, width: number, height: number, fill: ol.style.Fill, stroke: ol.style.Stroke) {
        let radius = (width < height ? width : height) * 0.3;
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
    }

    drawRoundedEnds(context: any, x: number, y: number, width: number, height: number, fill: ol.style.Fill, stroke: ol.style.Stroke) {
        let radius = (width < height ? width : height) * 0.2;
        // width *= 0.9;
        // height *= 0.8;
        let strokeWidth = (stroke.getWidth() ? stroke.getWidth() : 0);
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
    }

    drawCircle(context: any, x: number, y: number, width: number, height: number, fill: ol.style.Fill, stroke: ol.style.Stroke) {
        context.canvas.width = context.canvas.width > context.canvas.height ? context.canvas.width : context.canvas.height;
        context.canvas.height = context.canvas.width;
        let radius = 0;
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
            context.lineWidth = stroke.getWidth() * window.devicePixelRatio;
            context.strokeStyle = stroke.getColor();
            context.stroke();
        }
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
        let num = Number(featureText);
        if (num) {
            return numeric.format(num);
        }
        else {
            return featureText;
        }
    }
    public getTextWithDateFormat(featureText: string): string {
        if (Date.parse(featureText)) {
            let date = new Date(featureText);
            let fmt = this.dateFormat;
            let o = {
                "M+": date.getMonth() + 1,
                "d+": date.getDate(),
                "h+": date.getHours(),
                "m+": date.getMinutes(),
                "s+": date.getSeconds(),
                "q+": Math.floor((date.getMonth() + 3) / 3),
                "S": date.getMilliseconds()
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (let k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));

            return fmt;
        }
        else {
            return featureText;
        }
    }
    public getTextWithContent(featureText: string): string {
        // TODO format.
        return featureText;
    }
    public getTextWithLetterCase(featureText: string) {
        if (featureText !== undefined) {
            switch (this.letterCase) {
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

    static getMeasureContext(letterSpacing) {
        let tempCanvasForMeasure = GeoTextStyle.getMeasureCanvas();
        let letterSpacingStyle = letterSpacing + "px";
        if (tempCanvasForMeasure.style.letterSpacing != letterSpacingStyle) {
            tempCanvasForMeasure.style.letterSpacing = letterSpacingStyle;

            GeoTextStyle.measureContext = tempCanvasForMeasure.getContext('2d');
        }

        return GeoTextStyle.measureContext;
    }

    static getMeasureCanvas() {
        if (!GeoTextStyle.measureCanvas) {
            GeoTextStyle.measureCanvas = GeoTextStyle.createCanvas(1, 1);
            GeoTextStyle.measureCanvas.style.display = "none";
            let body = document.getElementsByTagName("body")[0];
            if (body) {
                body.appendChild(GeoTextStyle.measureCanvas);
            }
        }
        return GeoTextStyle.measureCanvas;
    }

    static createCanvas(opt_width, opt_height) {
        const canvas = (document.createElement('canvas'));
        if (opt_width) {
            canvas.width = opt_width;
        }
        if (opt_height) {
            canvas.height = opt_height;
        }

        return canvas;
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
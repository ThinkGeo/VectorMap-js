import { GeoStyle } from "./geoStyle";

export class GeoPointStyle extends GeoStyle {
    static linearGradientDictionary: { [index: string]: any } = {};
    static radialGradientDictionary: { [index: string]: any } = {};

    pointTypes = ["symbol", "image", "glyph"];
    symbolTypes = ["circle", "square", "triangle", "cross", "star"];

    glyphFontName: string;
    fillColor: string;
    linearGradient: string;
    radialGradient: string;
    glyphContent: string;
    maskColor: string;
    maskMargin: string;
    maskOutlineColor: string
    maskOutlineWidth: number;
    maskType: string
    outlineColor: string;
    outlineWidth: number;
    size: number;
    angle: number;
    offsetX: number;
    offsetY: number;
    imageURL: string;
    opacity: number;
    symbolType: string;
    transform: string;
    pointType: string;
    imageStyle: ol.style.Image;

    // static glyphCache: any = {};

    convertedGlyphOutLineColor: string;
    convertedGlyphFill: any;

    style: ol.style.Style;
    textStyle: ol.style.Text;

    constructor(styleJson?: any) {
        super(styleJson);
        if (styleJson) {
            this.outlineColor = styleJson["point-outline-color"];
            this.outlineWidth = styleJson["point-outline-width"] || 0;

            this.symbolType = styleJson["point-symbol-type"];
            this.pointType = styleJson["point-type"];
            this.size = styleJson["point-size"];

            this.maskType = styleJson["point-mask-type"];
            this.maskMargin = styleJson["point-mask-margin"];

            this.offsetX = styleJson["point-offset-x"] || 0;
            this.offsetY = styleJson["point-offset-y"] || 0;

            this.imageURL = styleJson["point-image-uri"];
            this.fillColor = styleJson["point-fill-color"];

            this.glyphFontName = styleJson["point-glyph-font-name"];
            this.glyphContent = styleJson["point-glyph-content"];

            this.angle = styleJson["point-rotation-angle"] || 0;

            this.maskColor = styleJson["point-mask-color"];
            this.maskOutlineColor = styleJson["point-mask-outline-color"];
            this.maskOutlineWidth = styleJson["point-mask-outline-width"] || 0;

            this.opacity = styleJson["point-opacity"] || 1;

            this.linearGradient = styleJson["point-linear-gradient"];
            this.radialGradient = styleJson["point-radial-gradient"];
            this.transform = styleJson["point-transform"];

            if (this.outlineColor) {
                this.convertedGlyphOutLineColor = GeoStyle.toRGBAColor(this.outlineColor, this.opacity);
            }

            if (this.fillColor) {
                this.convertedGlyphFill = GeoStyle.toRGBAColor(this.fillColor, this.opacity);
            }

            if (this.linearGradient) {
                if (GeoPointStyle.linearGradientDictionary.hasOwnProperty(this.linearGradient)) {
                    this.convertedGlyphFill = GeoPointStyle.linearGradientDictionary[this.linearGradient];
                } else {
                    this.convertedGlyphFill = GeoStyle.toOLLinearGradient(this.linearGradient, this.opacity, this.size);
                    GeoPointStyle.linearGradientDictionary[this.linearGradient] = this.convertedGlyphFill;
                }
            }

            if (this.radialGradient) {
                if (GeoPointStyle.radialGradientDictionary.hasOwnProperty(this.radialGradient)) {
                    this.convertedGlyphFill = GeoPointStyle.radialGradientDictionary[this.radialGradient];
                } else {
                    this.convertedGlyphFill = GeoStyle.toOLRadialGradient(this.radialGradient, this.opacity, this.size);
                    GeoPointStyle.radialGradientDictionary[this.radialGradient] = this.convertedGlyphFill;
                }
            }


        }
    }

    initializeCore() {
        this.style = new ol.style.Style();
        switch (this.pointType) {
            case "symbol":
                this.initSymbolStyle();
                break;
            case "image":
                this.initBitmapStyle();
                break;
            case "glyph":
                this.initGlyphStyle();
            default:
                break;
        }

        this.maskMarginList = this.getMargin(this.maskMargin);
        this.maskStrokeWidth = this.maskOutlineWidth || 0;

        if (this.pointType === "symbol") {
            this.imageStyle["offsetX"]= this.offsetX;
            this.imageStyle["offsetY"]= this.offsetY;
            this.style.setImage(this.imageStyle);
            this.drawMaskForSymbol(this.imageStyle);
        }

        if (this.pointType === "glyph") {
            if (this.glyphFontName && this.glyphContent) {
                (<any>this.textStyle).label = this.getGlyphImage(this.textStyle);
                this.style.setImage(null);
                this.style.setText(this.textStyle);
            }
        }
    }

    getConvertedStyleCore(feature: any, resolution: number, options: any): ol.style.Style[] {

        let geometryFeature = feature.getGeometry();

        if (this.textStyle) {
            this.textStyle.labelPosition = geometryFeature.getFlatCoordinates();
        }

        let featureZindex = feature["tempTreeZindex"];
        if (featureZindex === undefined) {
            featureZindex = 0;
        }
        this.style.setZIndex(featureZindex);
        this.style['zCoordinate'] = this.zIndex;

        this.styles = [];
        this.styles[0] = this.style;

        return this.styles;
    }

    getGlyphImage(textStyle: any) {
        let font = textStyle.getFont();
        let text = textStyle.getText();

        let strokeColor;
        let outlineWidth = 0;
        let textStrok = textStyle.getStroke();
        if (textStrok) {
            strokeColor = textStrok.getColor();
            outlineWidth = textStrok.getWidth();
        }

        let scale = window.devicePixelRatio;

        let labelWidth = (<any>ol.render.canvas).TextReplay.measureTextWidths(font, [text], []) + outlineWidth;
        let labelHeight = (<any>ol.render.canvas).measureTextHeight(font);
        let canvasWidth = labelWidth;
        let canvasHeight = labelHeight;
        let textAnchorX = 0;
        let textAnchorY = 0;

        let canvasSizeInfoWithMask = this.getCanvasSizeByMaskType(labelWidth, labelHeight, this.maskType, this.maskMarginList, this.maskStrokeWidth)
        canvasWidth = canvasSizeInfoWithMask[0];
        canvasHeight = canvasSizeInfoWithMask[1];
        textAnchorX = canvasSizeInfoWithMask[2];
        textAnchorY = canvasSizeInfoWithMask[3];

        let context = (<any>ol).dom.createCanvasContext2D(canvasWidth, canvasHeight);

        this.drawMask(context);

        context.font = font;
        context.textBaseline = "middle";
        context.textAlign = "center";
        if (textStrok) {
            if (strokeColor && outlineWidth > 0) {
                context.strokeStyle = strokeColor;
                context.lineWidth = outlineWidth * ((<any>ol.has).SAFARI ? scale : 1);
                context.strokeText(textStyle.text_, canvasWidth / 2, canvasHeight / 2);
            }
        }

        let textFill = textStyle.getFill();
        if (textFill) {
            let color = textFill.getColor();
            if (color) {
                context.fillStyle = color;
                context.fillText(textStyle.text_, canvasWidth / 2, canvasHeight / 2);
            }
        }

        return context.canvas;
    }

    drawMaskForSymbol(imageStyle) {
        let canvasWidth = 0;
        let canvasHeight = 0;

        let canvas = imageStyle.getImage();
        if (canvas) {
            canvasWidth = canvas.width;
            canvasHeight = canvas.height;
        }

        if (this.maskType) {
            let canvasSizeInfoWithMask = this.getCanvasSizeByMaskType(canvasWidth, canvasHeight, this.maskType, this.maskMarginList, this.maskStrokeWidth)
            canvasWidth = canvasSizeInfoWithMask[0];
            canvasHeight = canvasSizeInfoWithMask[1];

            let context = (<any>ol).dom.createCanvasContext2D(canvasWidth, canvasHeight);

            this.drawMask(context);

            this.textStyle = new ol.style.Text({
                offsetX:this.offsetX,
                offsetY:this.offsetY
            });
            this.textStyle.setText("a");
            this.textStyle.label = context.canvas;
            this.style.setText(this.textStyle);
        }
    }

    drawMask(context: any) {
        let fill = undefined;
        let stroke = undefined;

        if (this.maskColor) {
            fill = new ol.style.Fill();
            fill.setColor(GeoStyle.toRGBAColor(this.maskColor, this.opacity));
        }

        if (this.maskOutlineColor && this.maskStrokeWidth) {
            stroke = new ol.style.Stroke();
            if (this.maskOutlineColor) {
                stroke.setColor(GeoStyle.toRGBAColor(this.maskOutlineColor, this.opacity ? this.opacity : 1));
            }
            if (this.maskStrokeWidth) {
                stroke.setWidth(this.maskStrokeWidth);
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
                this.drawRectangle(context, fill, stroke);
                break;
            case "roundedCorners":
            case "RoundedCorners":
                this.drawRoundedCorners(context, fill, stroke);
                break;
            case "roundedEnds":
            case "RoundedEnds":
                this.drawRoundedEnds(context, fill, stroke);
                break;
            case "circle":
            case "Circle":
                this.drawCircle(context, fill, stroke);
                break;
        }
    }

    drawRectangle(context: any, fill: ol.style.Fill, stroke: ol.style.Stroke) {
        var x = 0;
        var y = 0;
        var width = context.canvas.width;
        var height = context.canvas.height;

        var strokeWidth = 0;
        var halfStrokeWidth = 0;
        var doubleStrokeWidth = 0;

        if (stroke) {
            strokeWidth = stroke.getWidth();
            halfStrokeWidth = strokeWidth / 2;
            doubleStrokeWidth = strokeWidth * 2;
        }

        if (fill) {
            context.fillStyle = fill.getColor();
            context.fillRect(x + strokeWidth, y + strokeWidth, width - doubleStrokeWidth, height - doubleStrokeWidth);
        }

        if (stroke) {
            context.lineWidth = strokeWidth;
            context.strokeStyle = stroke.getColor();
            context.strokeRect(x + halfStrokeWidth, y + halfStrokeWidth, width - strokeWidth, height - strokeWidth);
        }

        // context.lineWidth = 1;
        // context.strokeStyle = "#000";
        // context.strokeRect(x, y, width, height);

        // context.fillStyle = "#00ff00";
        // context.fillRect(x, y + height / 2, width, 2);
        // context.fillRect(x + (width / 2), y, 1, height);
    }
    drawRoundedCorners(context: any, fill: ol.style.Fill, stroke: ol.style.Stroke) {
        var x = 0;
        var y = 0;
        var width = context.canvas.width;
        var height = context.canvas.height;

        let radius = (width < height ? width : height) * 0.25;
        radius = radius >= 5 ? 5 : radius;

        var strokeWidth = 0;
        var halfStrokeWidth = 0;
        var doubleStrokeWidth = 0;

        if (stroke) {
            strokeWidth = stroke.getWidth();
            halfStrokeWidth = strokeWidth / 2;
            doubleStrokeWidth = strokeWidth * 2;
        }

        let upperLeft = [strokeWidth, strokeWidth];
        let upperRight = [width - strokeWidth, strokeWidth];
        let bottomLeft = [strokeWidth, height - strokeWidth];
        let bottomRight = [width - strokeWidth, height - strokeWidth];

        if (fill) {
            context.beginPath();
            context.moveTo(upperLeft[0] + radius, upperLeft[1]);
            context.lineTo(upperRight[0] - radius, upperRight[1]);
            context.arc(upperRight[0] - radius, upperRight[1] + radius, radius, 1.5 * Math.PI, 0);
            context.lineTo(upperRight[0], upperRight[1] + radius);
            context.lineTo(bottomRight[0], bottomRight[1] - radius);
            context.arc(bottomRight[0] - radius, bottomRight[1] - radius, radius, 0, 0.5 * Math.PI);
            context.lineTo(bottomRight[0] - radius, bottomRight[1]);
            context.lineTo(bottomLeft[0] + radius, bottomLeft[1]);
            context.arc(bottomLeft[0] + radius, bottomLeft[1] - radius, radius, 0.5 * Math.PI, 1 * Math.PI);
            context.lineTo(bottomLeft[0], bottomLeft[1] - radius);
            context.lineTo(upperLeft[0], upperLeft[1] + radius);
            context.arc(upperLeft[0] + radius, upperLeft[1] + radius, radius, 1 * Math.PI, 1.5 * Math.PI);
            context.closePath();
            context.fillStyle = fill.getColor();
            context.fill();
        }

        if (stroke) {
            radius += halfStrokeWidth;
            upperLeft = [halfStrokeWidth, halfStrokeWidth];
            upperRight = [width - halfStrokeWidth, halfStrokeWidth];
            bottomLeft = [halfStrokeWidth, height - halfStrokeWidth];
            bottomRight = [width - halfStrokeWidth, height - halfStrokeWidth];

            context.beginPath();
            context.moveTo(upperLeft[0] + radius, upperLeft[1]);
            context.lineTo(upperRight[0] - radius, upperRight[1]);
            context.arc(upperRight[0] - radius, upperRight[1] + radius, radius, 1.5 * Math.PI, 0);
            context.lineTo(upperRight[0], upperRight[1] + radius);
            context.lineTo(bottomRight[0], bottomRight[1] - radius);
            context.arc(bottomRight[0] - radius, bottomRight[1] - radius, radius, 0, 0.5 * Math.PI);
            context.lineTo(bottomRight[0] - radius, bottomRight[1]);
            context.lineTo(bottomLeft[0] + radius, bottomLeft[1]);
            context.arc(bottomLeft[0] + radius, bottomLeft[1] - radius, radius, 0.5 * Math.PI, 1 * Math.PI);
            context.lineTo(bottomLeft[0], bottomLeft[1] - radius);
            context.lineTo(upperLeft[0], upperLeft[1] + radius);
            context.arc(upperLeft[0] + radius, upperLeft[1] + radius, radius, 1 * Math.PI, 1.5 * Math.PI);
            context.closePath();
            context.lineWidth = stroke.getWidth();
            context.strokeStyle = stroke.getColor();
            context.stroke();
        }

        // context.lineWidth = 1;
        // context.strokeStyle = "#000";
        // context.strokeRect(0, 0, width, height);

        // context.fillStyle = "#00ff00";
        // context.fillRect(0, 0 + height / 2, width, 2);
        // context.fillRect(0 + (width / 2), 0, 1, height);
    }
    drawRoundedEnds(context: any, fill: ol.style.Fill, stroke: ol.style.Stroke) {
        var x = 0;
        var y = 0;
        var width = context.canvas.width;
        var height = context.canvas.height;

        var radius = height / 2;

        var strokeWidth = 0;
        var halfStrokeWidth = 0;
        var doubleStrokeWidth = 0;

        if (stroke) {
            strokeWidth = stroke.getWidth();
            halfStrokeWidth = strokeWidth / 2;
            doubleStrokeWidth = strokeWidth * 2;
        }

        let upperLeft = [0, 0];
        let upperRight = [width, 0];
        let bottomLeft = [0, height];
        let bottomRight = [width, height];


        if (fill) {
            var innerRadius = radius - strokeWidth;
            context.beginPath();
            context.moveTo(upperLeft[0] + radius, upperLeft[1] + strokeWidth);
            context.lineTo(upperRight[0] - radius, upperRight[1] + strokeWidth);
            context.arc(width - radius, radius, innerRadius, 1.5 * Math.PI, 0.5 * Math.PI);
            context.lineTo(bottomRight[0] - radius, bottomRight[1] - strokeWidth);
            context.lineTo(bottomLeft[0] + radius, bottomLeft[1] - strokeWidth);
            context.arc(radius, radius, innerRadius, 0.5 * Math.PI, 1.5 * Math.PI);
            context.closePath();
            context.fillStyle = fill.getColor();
            context.fill();
        }
        if (stroke) {
            var innerRadius = radius - halfStrokeWidth;
            context.beginPath();
            context.moveTo(upperLeft[0] + radius, upperLeft[1] + halfStrokeWidth);
            context.lineTo(upperRight[0] - radius, upperRight[1] + halfStrokeWidth);
            context.arc(width - radius, radius, innerRadius, 1.5 * Math.PI, 0.5 * Math.PI);
            context.lineTo(bottomRight[0] - radius, bottomRight[1] - halfStrokeWidth);
            context.lineTo(bottomLeft[0] + radius, bottomLeft[1] - halfStrokeWidth);
            context.arc(radius, radius, innerRadius, 0.5 * Math.PI, 1.5 * Math.PI);
            context.closePath();
            context.lineWidth = stroke.getWidth();
            context.strokeStyle = stroke.getColor();
            context.stroke();
        }

        // context.lineWidth = 1;
        // context.strokeStyle = "#000";
        // context.strokeRect(0, 0, width, height);

        // context.fillStyle = "#00ff00";
        // context.fillRect(0, 0 + height / 2, width, 2);
        // context.fillRect(0 + (width / 2), 0, 1, height);
    }
    drawCircle(context: any, fill: ol.style.Fill, stroke: ol.style.Stroke) {
        var x = 0;
        var y = 0;
        var width = context.canvas.width;
        var height = context.canvas.height;
        var strokeWidth = 0;
        var halfStrokeWidth = 0;
        var doubleStrokeWidth = 0;

        if (stroke) {
            strokeWidth = stroke.getWidth();
            halfStrokeWidth = strokeWidth / 2;
            doubleStrokeWidth = strokeWidth * 2;
        }

        if (fill) {
            let radius = width / 2 - strokeWidth;
            context.beginPath();
            context.arc(width / 2, width / 2, radius, 0, 2 * Math.PI);
            context.closePath();
            context.fillStyle = fill.getColor();
            context.fill();
        }

        if (stroke) {
            let radius = width / 2 - halfStrokeWidth;
            context.beginPath();
            context.arc(width / 2, width / 2, radius, 0, 2 * Math.PI);
            context.closePath();
            context.lineWidth = strokeWidth;
            context.strokeStyle = stroke.getColor();
            context.stroke();
        }

        // context.lineWidth = 1;
        // context.strokeStyle = "#000";
        // context.strokeRect(0, 0, width, height);

        // context.fillStyle = "#00ff00";
        // context.fillRect(0, 0 + height / 2, width, 2);
        // context.fillRect(0 + (width / 2), 0, 1, height);
    }


    private initSymbolStyle() {
        let radius = this.size / 2;
        switch (this.symbolType) {
            case "circle":
                this.imageStyle = new ol.style.Circle({
                    fill: this.convertedGlyphFill !== undefined ? new ol.style.Fill(({
                        color: this.convertedGlyphFill
                    })) : undefined,
                    stroke: this.convertedGlyphOutLineColor !== undefined && this.outlineWidth > 0 ? new ol.style.Stroke(({
                        color: this.convertedGlyphOutLineColor,
                        width: this.outlineWidth
                    })) : undefined,
                    radius: radius
                });
                break;
            case "square":
                this.imageStyle = new ol.style.RegularShape({
                    fill: this.convertedGlyphFill !== undefined ? new ol.style.Fill(({
                        color: this.convertedGlyphFill
                    })) : undefined,
                    stroke: this.convertedGlyphOutLineColor !== undefined && this.outlineWidth > 0 ? new ol.style.Stroke(({
                        color: this.convertedGlyphOutLineColor,
                        width: this.outlineWidth
                    })) : undefined,
                    points: 4,
                    radius: radius,
                    angle: Math.PI / 4 + this.angle
                });
                break;
            case "triangle":
                this.imageStyle = new ol.style.RegularShape({
                    fill: this.convertedGlyphFill !== undefined ? new ol.style.Fill(({
                        color: this.convertedGlyphFill
                    })) : undefined,
                    stroke: this.convertedGlyphOutLineColor !== undefined && this.outlineWidth > 0 ? new ol.style.Stroke(({
                        color: this.convertedGlyphOutLineColor,
                        width: this.outlineWidth
                    })) : undefined,
                    points: 3,
                    radius: radius,
                    angle: this.angle
                });
                break;
            case "cross":
                this.imageStyle = new ol.style.RegularShape({
                    fill: this.convertedGlyphFill !== undefined ? new ol.style.Fill(({
                        color: this.convertedGlyphFill
                    })) : undefined,
                    stroke: this.convertedGlyphOutLineColor !== undefined && this.outlineWidth > 0 ? new ol.style.Stroke(({
                        color: this.convertedGlyphOutLineColor,
                        width: this.outlineWidth
                    })) : undefined,
                    points: 4,
                    radius: radius,
                    radius2: 0,
                    angle: this.angle
                });
                break;
            case "diamond":
                break;
            case "diamond2":
                break;
            case "star":
                this.imageStyle = new ol.style.RegularShape({
                    fill: this.convertedGlyphFill !== undefined ? new ol.style.Fill(({
                        color: this.convertedGlyphFill
                    })) : undefined,
                    stroke: this.convertedGlyphOutLineColor !== undefined && this.outlineWidth > 0 ? new ol.style.Stroke(({
                        color: this.convertedGlyphOutLineColor,
                        width: this.outlineWidth
                    })) : undefined,
                    points: 5,
                    radius: radius,
                    radius2: radius / 2.5,
                    angle: this.angle
                });
                break;
            case "star2":
                break;
        }
    }

    private initBitmapStyle() {
        if (this.imageURL) {
            this.imageStyle = new ol.style.Icon(({
                opacity: this.opacity || 1,
                src: this.imageURL,
                rotation: this.angle * Math.PI / 180,
                offset: [this.offsetX, -this.offsetY]
            }));
        }
    }

    private initGlyphStyle() {
        if (this.glyphFontName) {
            this.textStyle = new ol.style.Text(({
                font: `${this.size}px ${this.glyphFontName}`,
                offsetX: this.offsetX,
                offsetY: this.offsetY,
                text: this.glyphContent,
                fill: this.convertedGlyphFill !== undefined ? new ol.style.Fill(({
                    color: this.convertedGlyphFill
                })) : undefined,
                stroke: this.convertedGlyphOutLineColor !== undefined && this.outlineWidth > 0 ? new ol.style.Stroke(({
                    color: this.convertedGlyphOutLineColor,
                    width: this.outlineWidth
                })) : undefined,
                rotation: this.angle * Math.PI / 180
            }));

            this.applyTransForm(this.textStyle);
        }
    }

    private applyTransForm(style) {
        let transformRgx = /([a-z]+)\((.*?)\)/i;
        if (this.transform && transformRgx.test(this.transform)) {
            let matchedResults = this.transform.match(transformRgx);
            let transFormType = matchedResults.length > 2 ? matchedResults[1] : "";
            let transFormValue = matchedResults.length > 2 ? matchedResults[2] : "";
            switch (transFormType) {
                case "rotate":
                    // style.getImage() && style.getImage().setRotation(parseInt(transFormValue));
                    style.setRotation(parseInt(transFormValue));
                    break;
                case "scale":
                    let scale = parseInt(transFormValue.split(",")[0]);
                    // style.getImage() && style.getImage().setScale(scale);
                    style.setScale(scale);
                    break;
                case "translate":
                    let offsets = transFormValue.split(",");
                    style.setOffsetX(parseInt(offsets[0]));
                    style.setOffsetY(parseInt(offsets[1]));
                    break;
                default:
                    throw "not support " + this.transform;
            }
        }
    }


    // method
    getCanvasSizeByMaskType(canvasWidth, canvasHeight, maskType, maskMarginList, maskStrokeWidth) {
        var textAnchorX = 0;
        var textAnchorY = 0;
        if (maskType) {
            canvasHeight += maskMarginList[0];
            textAnchorY += maskMarginList[0];

            canvasWidth += maskMarginList[1];

            canvasHeight += maskMarginList[2];

            canvasWidth += maskMarginList[3];
            textAnchorX += maskMarginList[3];

            switch (this.maskType) {
                case "default":
                case "Default":
                case "rectangle":
                case "Rectangle":
                    canvasWidth += maskStrokeWidth * 2;
                    canvasHeight += maskStrokeWidth * 2;
                    textAnchorX += maskStrokeWidth;
                    textAnchorY += maskStrokeWidth;
                    break;
                case "roundedCorners":
                case "RoundedCorners":
                    let radius = Math.min(canvasWidth, canvasHeight) * 0.25;
                    radius = radius >= 5 ? 5 : radius;

                    let addedValue = (radius + maskStrokeWidth);
                    let doubAddedValue = addedValue * 2;
                    canvasWidth += doubAddedValue;
                    canvasHeight += doubAddedValue;
                    textAnchorX += addedValue;
                    textAnchorY += addedValue;
                    break;
                case "roundedEnds":
                case "RoundedEnds":
                    canvasHeight += maskStrokeWidth * 2;
                    let radius = canvasHeight / 2;
                    canvasWidth += radius * 2;
                    textAnchorX += radius;
                    textAnchorY += maskStrokeWidth;
                    break;
                case "circle":
                case "Circle":
                    var halfCanvasWidth = canvasWidth / 2;
                    var halfCanvasHeight = canvasHeight / 2;
                    let radius = Math.sqrt(Math.pow(halfCanvasWidth, 2) + Math.pow(halfCanvasHeight, 2));
                    radius = Math.ceil(radius);
                    canvasWidth = radius * 2 + maskStrokeWidth * 2;
                    canvasHeight = canvasWidth;

                    textAnchorX += radius - halfCanvasWidth + maskStrokeWidth;
                    textAnchorY += radius - halfCanvasHeight + maskStrokeWidth;

                    break;
            }
        }

        return [canvasWidth, canvasHeight, textAnchorX, textAnchorY];
    }

    getMargin(marginString) {
        let result = [0, 0, 0, 0];
        if (marginString) {
            let tmpMaskMargin = marginString.split(',');
            switch (tmpMaskMargin.length) {
                case 1:
                    var value = parseInt(tmpMaskMargin[0]);
                    result = [value, value, value, value];
                    break;
                case 2:
                    var height = parseInt(tmpMaskMargin[0]);
                    var width = parseInt(tmpMaskMargin[1]);
                    result = [height, width, height, width];
                    break;
                case 3:
                    var top = parseInt(tmpMaskMargin[0]);
                    var right = parseInt(tmpMaskMargin[1]);
                    var bottom = parseInt(tmpMaskMargin[2]);
                    var left = right;
                    result = [top, right, bottom, left];
                    break;
                default:
                    var top = parseInt(tmpMaskMargin[0]);
                    var right = parseInt(tmpMaskMargin[1]);
                    var bottom = parseInt(tmpMaskMargin[2]);
                    var left = parseInt(tmpMaskMargin[3]);
                    result = [top, right, bottom, left];
                    break;
            }
        }

        return result;
    }
}
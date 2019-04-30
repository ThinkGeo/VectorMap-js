import { GeoStyle } from "./geoStyle";

export class GeoPointStyle extends GeoStyle {
    static linearGradientDictionary: { [index: string]: any } = {};
    static radialGradientDictionary: { [index: string]: any } = {};

    brushOptions: any;

    brushType: string;
    glyph: string;
    fill: string;
    linearGradient: string;
    radialGradient: string;
    glyphName: string;
    glyphMaskColor: string;
    glyphMaskMargin: string;
    glyphMaskOutlineColor: string
    glyphMaskOutlineWidth: number;
    glyphMaskType: string
    outlineColor: string;
    outlineWidth: number;
    size: number;
    angle: number;
    dx: number;
    dy: number;
    pointFile: string;
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
            this.glyph = styleJson["point-glyph"];
            this.linearGradient = styleJson["point-linear-gradient"];
            this.radialGradient = styleJson["point-radial-gradient"];
            this.fill = styleJson["point-fill"];
            this.glyphName = styleJson["point-glyph-name"];
            this.glyphMaskColor = styleJson["point-glyph-mask-color"];
            this.glyphMaskMargin = styleJson["point-glyph-mask-margin"];
            this.glyphMaskOutlineColor = styleJson["point-glyph-mask-outline-color"];
            this.glyphMaskOutlineWidth = styleJson["point-glyph-mask-outline-width"];
            this.glyphMaskType = styleJson["point-glyph-mask-type"];
            this.outlineColor = styleJson["point-outline-color"];
            this.outlineWidth = styleJson["point-outline-width"];
            this.size = styleJson["point-size"];
            this.angle = styleJson["point-rotate-angle"] ? styleJson["point-rotate-angle"] : 0;
            this.dx = styleJson["point-dx"];
            this.dy = styleJson["point-dy"];
            this.pointFile = styleJson["point-file"];
            this.opacity = styleJson["point-opacity"];
            this.symbolType = styleJson["point-symbol-type"];
            this.transform = styleJson["point-transform"];
            this.pointType = styleJson["point-type"];

            if (this.outlineColor) {
                this.convertedGlyphOutLineColor = GeoStyle.toRGBAColor(this.outlineColor, this.opacity);
            }

            if (this.fill) {
                this.convertedGlyphFill = GeoStyle.toRGBAColor(this.fill, this.opacity);
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

        if (this.pointType === "glyph") {
            if (this.glyph && this.glyphName) {
                (<any>this.textStyle).label = this.getGlyphImage(this.textStyle);
                this.style.setImage(null);
                this.style.setText(this.textStyle);
            }
        }
        else {
            this.style.setImage(this.imageStyle);
        }
    }

    getConvertedStyleCore(feature: any, resolution: number, options: any): ol.style.Style[] {

        let geometryFeature = feature.getGeometry();
        if (this.pointType === "glyph") {
            if (this.glyph && this.glyphName) {
                (<any>this.textStyle).labelPosition = geometryFeature.getFlatCoordinates();
            }
        }

        let featureZindex = feature["tempTreeZindex"];
        if (featureZindex === undefined) {
            featureZindex = 0;
        }
        this.style.setZIndex(featureZindex);

        this.styles = [];
        this.styles[0] = this.style;

        return this.styles;
    }

    getGlyphImage(textState: any) {
        let font = textState.font_;
        let strokeColor;
        let outlineWidth = 0;
        let textStrok = textState.getStroke();
        if (textStrok) {
            strokeColor = textStrok.getColor();
            outlineWidth = textStrok.getWidth();
        }

        let scale = window.devicePixelRatio;

        // here
        let width = (<any>ol.render.canvas).TextReplay.measureTextWidths(font, [textState.text_], []) + outlineWidth * 2;
        let height = (<any>ol.render.canvas).measureTextHeight(font) + outlineWidth * 2;

        let tmpMaskMargin = (this.glyphMaskMargin ? this.glyphMaskMargin : "0").split(',');
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
        let tmpMaskOutlineWidth = (this.glyphMaskOutlineWidth ? this.glyphMaskOutlineWidth : 0) * 2;

        let renderWidth = width + tmpMaskWidthMargin;
        let renderHeight = height + tmpMaskWidthMargin;

        let canvasWidth = width + tmpMaskWidthMargin + tmpMaskOutlineWidth;
        let canvasHeight = height + tmpMaskHeightMargin + tmpMaskOutlineWidth;

        let context = (<any>ol).dom.createCanvasContext2D(canvasWidth * scale, canvasHeight * scale);

        if (scale !== 1) { context.scale(scale, scale); }

        this.drawMask(context, 0, 0, renderWidth, renderHeight);

        context.font = font;
        context.textBaseline = "middle";
        context.textAlign = "center";
        if (textStrok) {
            if (strokeColor && outlineWidth > 0) {
                context.strokeStyle = strokeColor;
                context.lineWidth = outlineWidth * ((<any>ol.has).SAFARI ? scale : 1);
                context.strokeText(textState.text_, canvasWidth / 2, canvasHeight / 2);
            }
        }

        let textFill = textState.getFill();
        if (textFill) {
            let color = textFill.getColor();
            if (color) {
                context.fillStyle = color;
                context.fillText(textState.text_, canvasWidth / 2, canvasHeight / 2);
            }
        }

        return context.canvas;
    }

    drawMask(context: any, x: number, y: number, width: number, height: number) {
        let fill = undefined;
        let stroke = undefined;

        if (this.glyphMaskColor) {
            fill = new ol.style.Fill();
            fill.setColor(GeoStyle.toRGBAColor(this.glyphMaskColor, this.opacity ? this.opacity : 1));
        }

        if (this.glyphMaskOutlineColor && this.glyphMaskOutlineWidth) {
            stroke = new ol.style.Stroke();
            if (this.glyphMaskOutlineColor) {
                stroke.setColor(GeoStyle.toRGBAColor(this.glyphMaskOutlineColor, this.opacity ? this.opacity : 1));
            }
            if (this.glyphMaskOutlineWidth) {
                stroke.setWidth(this.glyphMaskOutlineWidth ? this.glyphMaskOutlineWidth : 0);
            }
        }


        switch (this.glyphMaskType) {
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
        if (fill) {
            context.fillStyle = fill.getColor();
            context.fillRect(x, y, width, height);
        }

        if (stroke) {
            context.lineWidth = stroke.getWidth();
            context.strokeStyle = stroke.getColor();
            context.strokeRect(x + stroke.getWidth(), y + stroke.getWidth(), width, height);
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
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
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
        if (stroke) {
            x = x + (stroke.getWidth() ? stroke.getWidth() : 0);
            y = y + (stroke.getWidth() ? stroke.getWidth() : 0);
        }

        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y + height * 0.5, x + width - radius, y + height);
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
        let radius = (width < height ? width : height) * 0.5
        // width *= 0.9;
        // height *= 0.8;
        if (stroke) {
            x = x + (stroke.getWidth() ? stroke.getWidth() : 0);
            y = y + (stroke.getWidth() ? stroke.getWidth() : 0);
        }

        context.beginPath();
        context.arc(x + width * 0.5, y + height * 0.5, radius, 0, 2 * Math.PI, false);
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
        if (this.pointFile) {
            this.imageStyle = new ol.style.Icon(({
                opacity: this.opacity || 1,
                src: this.pointFile,
                rotation: this.angle * Math.PI / 180,
                offset: [this.dx, -this.dy]
            }));
        }
    }

    private initGlyphStyle() {
        if (this.glyph) {
            this.textStyle = new ol.style.Text(({
                font: `${this.size}px ${this.glyph}`,
                offsetX: this.dx,
                offsetY: this.dy,
                text: this.glyphName,
                fill: this.convertedGlyphFill !== undefined ? new ol.style.Fill(({
                    color: this.convertedGlyphFill
                })) : undefined,
                stroke: this.convertedGlyphOutLineColor !== undefined && this.outlineWidth > 0 ? new ol.style.Stroke(({
                    color: this.convertedGlyphOutLineColor,
                    width: this.outlineWidth
                })) : undefined,
                rotation: this.angle * Math.PI / 180
            }));
        }
    }

    private applyTransForm(style: ol.style.Style) {
        let transformRgx = /([a-z]+)\((.*?)\)/i;
        if (this.transform && transformRgx.test(this.transform)) {
            let matchedResults = this.transform.match(transformRgx);
            let transFormType = matchedResults.length > 2 ? matchedResults[1] : "";
            let transFormValue = matchedResults.length > 2 ? matchedResults[2] : "";
            switch (transFormType) {
                case "rotate":
                    style.getImage() && style.getImage().setRotation(parseInt(transFormValue));
                    style.getText() && style.getText().setRotation(parseInt(transFormValue));
                    break;
                case "scale":
                    let scale = parseInt(transFormValue.split(",")[0]);
                    style.getImage() && style.getImage().setScale(scale);
                    style.getText() && style.getText().setScale(scale);
                    break;
                case "translate":
                default:
                    throw "not support " + this.transform;
            }
        }
    }
}
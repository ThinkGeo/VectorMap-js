import { GeoStyle } from "./geoStyle";
import { GeoBrush } from "./geoBrush";
import { GeoBrushType } from "./geoBrushType";

export class GeoAreaStyle extends GeoStyle {
    compounds = ['apply-all', 'apply-first'];
    defaultCompund = 'apply-first';

    offsetX: number;
    offsetY: number;
    fillColor: string;
    geometryTransform: string;
    opacity: number;
    outlineColor: string;
    outlineDashArray: any;
    outlineWidth: number;
    linearGradient: string;
    radialGradient: string;
    fillImageURI: string;
    shadowColor: string;

    brushOptions: any;
    geoBrush: string;
    convertedOutlineColor: string;
    convertedOutlineDashArray: number[];
    convertedShadowColor: string;
    geometryTransformValue: any;
    shadowTranslate: string;
    offsetTranslateValueByResolution: any;

    style: ol.style.Style;

    constructor(styleJson?: any) {
        super(styleJson);
        if (styleJson) {
            this.compound = styleJson["filter-apply-mode"];

            this.outlineColor = styleJson["polygon-outline-color"];
            this.outlineWidth = styleJson["polygon-outline-width"];
            this.outlineDashArray = styleJson["polygon-outline-dasharray"];
            this.fillColor = styleJson["polygon-fill-color"];
            this.offsetX = styleJson["polygon-offset-x"];
            this.offsetY = styleJson["polygon-offset-y"];
            this.opacity = styleJson["polygon-opacity"] || 1;
            this.linearGradient = styleJson["polygon-linear-gradient"];
            this.radialGradient = styleJson["polygon-radial-gradient"];
            this.shadowStyleJson = styleJson["polygon-shadow"];
            this.geometryTransform = styleJson["polygon-geometry-transform"];
            this.fillImageURI = styleJson["polygon-fill-image-uri"];
            this.fillGlyphFontName = styleJson["polygon-fill-glyph-font-name"];
            this.fillGlyphContent = styleJson["polygon-fill-glyph-content"];
            this.isShadow = false;
        }
        if (!this.compounds.includes(this.compound)) {
            this.compound = this.defaultCompund;
        }
    }

    initializeCore() {
        this.style = new ol.style.Style();

        if (this.fillColor) {
            this.convertedFillColor = GeoStyle.blendColorAndOpacity(this.fillColor, this.opacity);
            var fillStyle = new ol.style.Fill({
                color: this.convertedFillColor
            })
            this.style.setFill(fillStyle);
        }

        if (this.geometryTransform) {
            this.geometryTransformValue = this.getTransformValues(this.geometryTransform);
        }

        // stroke to handle outlineColor, outlineDashArray, outlineOpacity and outlineWidth
        if (this.outlineColor || this.outlineDashArray || this.outlineWidth) {
            if (this.outlineColor) {
                this.convertedOutlineColor = GeoStyle.blendColorAndOpacity(this.outlineColor, this.opacity);
            }
            if (this.outlineDashArray) {
                this.convertedOutlineDashArray = this.outlineDashArray.split(",");
            }

            let newStroke = new ol.style.Stroke();

            newStroke.setColor(this.convertedOutlineColor);
            newStroke.setLineDash(this.convertedOutlineDashArray);
            newStroke.setWidth(this.outlineWidth);
            this.style.setStroke(newStroke);
        }

        if (this.shadowStyleJson) {
            this.shadowStyle = new GeoAreaStyle(this.shadowStyleJson);
            this.shadowStyle["isShadow"] = true;
        }

        this.offsetTranslateValueByResolution = {};
    }
    getConvertedStyleCore(feature: any, resolution: number, options): ol.style.Style[] {
        let length = 0;
        let styles = [];
        let cloneGeometry = feature.getGeometry().clone();
        if (this.shadowStyle && !this.isShadow) {
            if (this.shadowStyle) {
                let shadowOLStyle = this.shadowStyle.getStyles(feature, resolution, options);
                if (shadowOLStyle) {
                    for (let index = 0; index < shadowOLStyle.length; index++) {
                        const element = shadowOLStyle[index];
                        element['zCoordinate'] = options.zCoordinate - 0.5;
                    }
                }
                Array.prototype.push.apply(styles, shadowOLStyle);
            }
        }
        if (this.fillColor || (this.outlineColor && this.outlineWidth) || this.linearGradient || this.radialGradient) {
            if (this.geometryTransform) {
                this.transformGeometry(cloneGeometry);
            }
            if (this.offsetX || this.offsetY) {
                let offsetTranslateValue = this.offsetTranslateValueByResolution[resolution];
                if (offsetTranslateValue === undefined) {
                    let tmpResolution = Math.round(resolution * 100000000) / 100000000;
                    this.shadowTranslate = (`translate(${(this.offsetX ? this.offsetX : 0) * tmpResolution},${(this.offsetY ? -this.offsetY : 0) * tmpResolution})`);
                    offsetTranslateValue = this.getTransformValues(this.shadowTranslate);
                    this.offsetTranslateValueByResolution[resolution] = offsetTranslateValue;
                }
                cloneGeometry.translate(+offsetTranslateValue[0].trim(), +offsetTranslateValue[1].trim());
            }
            this.style.setGeometry(cloneGeometry);
            this.style['zCoordinate'] = options.zCoordinate
            styles.push(this.style);
        }


        return styles;
    }

    getTransformValues(transform: string): any {
        // get transform values which look like transform(value1, value2)
        let start = transform.indexOf("(");
        let end = transform.indexOf(")");
        let valueString = transform.substring(start + 1, end);

        let values = [];
        if (valueString.includes(",")) {
            values = valueString.split(",");
        } else {
            values.push(valueString);
        }

        return values;
    }

    transformGeometry(geometry) {

        if (this.geometryTransform.indexOf("translate") === 0) {
            geometry.translate(+this.geometryTransformValue[0].trim(), +this.geometryTransformValue[1].trim());
        }
        else if (this.geometryTransform.indexOf("scale") === 0) {
            geometry.scale(+this.geometryTransformValue[0].trim(), +this.geometryTransformValue[1].trim());
        }
        else if (this.geometryTransform.indexOf("rotate") === 0) {
            let center = ol.extent.getCenter(cloneGeometry.getExtent());
            let angle = +this.geometryTransformValue[0].trim() * Math.PI / 180;
            geometry.rotate(angle, center);
        }
        // TODO:
        // else if (this.geometryTransform.indexOf("skew") === 0) {
        //     this.skewGeometry(geometry, +this.geometryTransformValue[0].trim(), +this.geometryTransformValue[1].trim());
        // }

        return geometry;
    }


}
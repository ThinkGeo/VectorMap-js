import { GeoStyle } from "./geoStyle";
import { GeoBrush } from "./geoBrush";
import { GeoBrushType } from "./geoBrushType";

export class GeoAreaStyle extends GeoStyle {

    static areaStyle = new ol.style.Style({
        fill: new ol.style.Fill({}),
        stroke: new ol.style.Stroke({})
    });

    static areaShadowStyle = new ol.style.Style({
        fill: new ol.style.Fill({}),
    });

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
            this.outlineColor = styleJson["polygon-outline-color"];
            this.outlineWidth = styleJson["polygon-outline-width"];
            this.outlineDashArray = styleJson["polygon-outline-dasharray"];
            this.fillColor = styleJson["polygon-fill-color"];
            this.offsetX = styleJson["polygon-offset-x"];
            this.offsetY = styleJson["polygon-offset-y"];
            this.opacity = styleJson["polygon-opacity"];
            this.linearGradient = styleJson["polygon-linear-gradient"];
            this.radialGradient = styleJson["polygon-radial-gradient"];
            this.shadowStyleJson = styleJson["polygon-shadow"];
            this.geometryTransform = styleJson["polygon-geometry-transform"];
            this.fillImageURI = styleJson["polygon-fill-image-uri"];
            this.fillGlyphFontName = styleJson["polygon-fill-glyph-font-name"];
            this.fillGlyphContent = styleJson["polygon-fill-glyph-content"];
        }
    }

    initializeCore() {

        this.style = new ol.style.Style();

        if (this.fillColor) {
            this.convertedFillColor = GeoStyle.toRGBAColor(this.fillColor, this.opacity);
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
                this.convertedOutlineColor = GeoStyle.toRGBAColor(this.outlineColor, this.opacity);
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
        }

        this.offsetTranslateValueByResolution = {};
    }
    getConvertedStyleCore(feature: any, resolution: number, options): ol.style.Style[] {
        let length = 0;
        let styles = [];
        let cloneGeometry = feature.getGeometry().clone();
        if (this.shadowStyle) {
            if (this.shadowStyle) {
                let shadowOLStyle = this.shadowStyle.getStyles(feature, resolution, options);
                if(shadowOLStyle)
                {
                    for (let index = 0; index < shadowOLStyle.length; index++) {
                        const element = shadowOLStyle[index];
                        element['zCoordinate'] = this.zIndex - 0.5;
                    }
                }
                Array.prototype.push.apply(styles, shadowOLStyle);
            }
        }
        if (this.fillColor || (this.outlineColor && this.outlineWidth) || this.linearGradient || this.radialGradient) {
            if (this.geometryTransform) {
                this.transformGeometry(cloneGeometry, resolution);
            }
            if (this.offsetX || this.offsetY) {
                let offsetTranslateValue = this.offsetTranslateValueByResolution[resolution];
                if (offsetTranslateValue === undefined) {
                    let tmpResolution = Math.round(resolution * 100000000) / 100000000;
                    this.shadowTranslate = (`translate(${(this.offsetX ? this.offsetX : 0) * tmpResolution},${(this.offsetY ? this.offsetY : 0) * tmpResolution})`);
                    offsetTranslateValue = this.getTransformValues(this.shadowTranslate);
                    this.offsetTranslateValueByResolution[resolution] = offsetTranslateValue;
                }
                cloneGeometry.translate(+offsetTranslateValue[0].trim(), +offsetTranslateValue[1].trim());
            }
            this.style.setGeometry(cloneGeometry);
            this.style['zCoordinate'] = this.zIndex;
            styles.push(this.style);

            // if (this.fillImageURI) {
            //     GeoAreaStyle.areaStyle.setImage(new ol.style.Icon({
            //         crossOrigin: 'anonymous',
            //         src: this.fillImageURI
            //     }));
            // }
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

    transformGeometry(geometry, resolution) {

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
        // else if (this.geometryTransform.indexOf("skew") === 0) {
        //     this.skewGeometry(geometry, +this.geometryTransformValue[0].trim(), +this.geometryTransformValue[1].trim());
        // }

        return geometry;
    }


}
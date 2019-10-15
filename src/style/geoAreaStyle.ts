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

    brushType: string;
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
    shadowDx: number;
    shadowDy: number;

    brushOptions: any;
    geoBrush: string;
    convertedOutlineColor: string;
    convertedOutlineDashArray: number[];
    convertedShadowColor: string;
    geometryTransformValue: any;
    shadowTranslate: string;
    shadowTranslateValueByResolution: any;

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
            this.shadow = styleJson["polygon-shadow"];
            this.geometryTransform = styleJson["polygon-geometry-transform"];
            this.fillImageURI = styleJson["polygon-fill-image-uri"];
            this.fillGlyphFontName = styleJson["polygon-fill-glyph-font-name"];
            this.fillGlyphContent = styleJson["polygon-fill-glyph-content"];
        }
    }

    initializeCore() {
        if (this.fillColor) {
            this.convertedFillColor = GeoStyle.toRGBAColor(this.fillColor, this.opacity);
        }



        if (this.geometryTransform) {
            this.geometryTransformValue = this.getTransformValues(this.geometryTransform);
        }

        if (this.outlineColor) {
            this.convertedOutlineColor = GeoStyle.toRGBAColor(this.outlineColor, this.opacity);
        }
        if (this.outlineDashArray) {
            this.convertedOutlineDashArray = this.outlineDashArray.split(",");
        }

        this.shadowTranslateValueByResolution = {};
    }
    getConvertedStyleCore(feature: any, resolution: number, options): ol.style.Style[] {
        let length = 0;
        this.styles = [];
        if (this.fillColor || (this.outlineColor && this.outlineWidth) || this.linearGradient || this.radialGradient) {
            if (this.geometryTransform) {
                feature.flatCoordinates_ = this.GetTransformedCoordinates(feature, resolution);
                var dx = this.geometryTransformValue[0].trim() * resolution;
                var dy = this.geometryTransformValue[1].trim() * resolution;
                var newExtent_ = (<any>ol.geom).flat.transform.translate(feature.extent_, 0, feature.extent_.length, 2, -dx, -dy);
                feature.extent_ = newExtent_;
            }

            if (this.shadowDx || this.shadowDy) {
                let shadowTranslateValue = this.shadowTranslateValueByResolution[resolution];
                if (shadowTranslateValue === undefined) {
                    let tmpResolution = Math.round(resolution * 100000000) / 100000000;
                    this.shadowTranslate = (`translate(${(this.shadowDx ? this.shadowDx : 0) * tmpResolution},${(this.shadowDy ? this.shadowDy : 0) * tmpResolution})`);
                    shadowTranslateValue = this.getTransformValues(this.shadowTranslate);
                    this.shadowTranslateValueByResolution[resolution] = shadowTranslateValue;
                }

                let tmpFlatCoordinates = feature.getGeometry().getFlatCoordinates();
                let newFlatCoordinates = (<any>ol.geom).flat.transform.translate(tmpFlatCoordinates, 0, tmpFlatCoordinates.length, 2, +shadowTranslateValue[0].trim(), +shadowTranslateValue[1].trim(), undefined);

                let tmpCoordinates: ol.Coordinate[][] = [[]];
                let index = 0;
                for (let i = 0; i < newFlatCoordinates.length; i += 2) {
                    tmpCoordinates[index] || (tmpCoordinates[index] = []);
                    tmpCoordinates[index].push([newFlatCoordinates[i], newFlatCoordinates[i + 1]]);
                    if (tmpCoordinates[index].length > 3 && tmpCoordinates[index][0][0] === newFlatCoordinates[i] && tmpCoordinates[index][0][1] === newFlatCoordinates[i + 1]) {
                        index++;
                    }
                }
                let geometry = new ol.geom.Polygon(tmpCoordinates, "XY");
                geometry['ends_'] = feature.ends_;
                var newExtent_ = (<any>ol.geom).flat.transform.translate(feature.extent_, 0, feature.extent_.length, 2, +shadowTranslateValue[0].trim(), +shadowTranslateValue[1].trim());
                geometry['extent_'] = newExtent_;
                GeoAreaStyle.areaShadowStyle.getFill().setColor(this.convertedShadowColor);
                GeoAreaStyle.areaShadowStyle.setGeometry(geometry);
                GeoAreaStyle.areaShadowStyle['zCoordinate'] = this.zIndex - 0.5;
                this.styles[length++] = GeoAreaStyle.areaShadowStyle;
            }

            if (this.convertedFillColor) {
                GeoAreaStyle.areaStyle.getFill().setColor(this.convertedFillColor);
            }

            // stroke to handle outlineColor, outlineDashArray, outlineOpacity and outlineWidth
            if (this.outlineColor || this.outlineDashArray || this.outlineWidth) {
                let newStroke = new ol.style.Stroke();
                newStroke.setColor(this.convertedOutlineColor);
                newStroke.setLineDash(this.convertedOutlineDashArray);
                newStroke.setWidth(this.outlineWidth);
                GeoAreaStyle.areaStyle.setStroke(newStroke);
            }
            else {
                GeoAreaStyle.areaStyle.setStroke(undefined);
            }
 
            GeoAreaStyle.areaStyle.setGeometry(feature.getGeometry());
            GeoAreaStyle.areaStyle['zCoordinate'] = this.zIndex;
            this.styles[length++] = GeoAreaStyle.areaStyle;


            if (this.brushType === 'texture' && this.fillImageURI) {

                GeoAreaStyle.areaStyle.setImage(new ol.style.Icon({
                    crossOrigin: 'anonymous',
                    src: this.fillImageURI
                }));

                // function test(resolve, reject): Promise<void> {
                // let xhr = new XMLHttpRequest();
                // xhr.open("GET", this.textureFile, true);
                // xhr.responseType = "blob";
                // xhr.onload = function (event: any) {
                //     if (!xhr.status || xhr.status >= 200 && xhr.status < 300) {
                //         debugger
                //         var test = window.URL.createObjectURL(xhr.response);
                //         console.log(1);

                //         // resolve(this.styles);
                //         return this.styles;
                //     }
                // }.bind(this);
                // xhr.onerror = function () {
                // }.bind(this);
                // xhr.send();
                // }
            }
        }

        return this.styles;
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

    GetTransformedCoordinates(feature, resolution) {
        let tmpFlatCoordinates = feature.getGeometry().getFlatCoordinates();
        let tmpCoordinates: ol.Coordinate[][] = [[]];
        let index = 0;
        for (let i = 0; i < tmpFlatCoordinates.length; i += 2) {
            tmpCoordinates[index] || (tmpCoordinates[index] = []);
            tmpCoordinates[index].push([tmpFlatCoordinates[i], tmpFlatCoordinates[i + 1]]);
            if (tmpCoordinates[index].length > 3 && tmpCoordinates[index][0][0] === tmpFlatCoordinates[i] && tmpCoordinates[index][0][1] === tmpFlatCoordinates[i + 1]) {
                index++;
            }
        }
        let geometry = new ol.geom.Polygon(tmpCoordinates, "XY");

        if (this.geometryTransform.indexOf("translate") === 0) {
            geometry.translate(+this.geometryTransformValue[0].trim() * resolution, +this.geometryTransformValue[1].trim() * resolution);
        }
        else if (this.geometryTransform.indexOf("scale") === 0) {
            geometry.scale(+this.geometryTransformValue[0].trim(), +this.geometryTransformValue[1].trim());
        }
        else if (this.geometryTransform.indexOf("rotate") === 0) {
            let center = ol.extent.getCenter(geometry.getExtent());
            let angle = +this.geometryTransformValue[0].trim() * Math.PI / 180;
            geometry.rotate(angle, center);
        }
        else if (this.geometryTransform.indexOf("skew") === 0) {
            this.skewGeometry(geometry, +this.geometryTransformValue[0].trim(), +this.geometryTransformValue[1].trim());
        }

        return (<any>geometry).flatCoordinates;
    }


}
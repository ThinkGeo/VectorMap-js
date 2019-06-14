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
    rotateAngle: number;
    dx: number;
    dy: number;
    fill: string;
    foregroundFill: string;
    gamma: string;
    geometryTransform: string;
    hatchStyle: string;
    opacity: number;
    outlineColor: string;
    outlineDashArray: any;
    outlineOpacity: number;
    outlineWidth: number;
    linearGradient: string;
    radialGradient: string;
    textureFile: string;
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
            this.brushType = styleJson["polygon-brush-type"];
            this.rotateAngle = styleJson["polygon-rotate-angle"];
            this.dx = styleJson["polygon-dx"];
            this.dy = styleJson["polygon-dy"];
            this.fill = styleJson["polygon-fill"];
            this.foregroundFill = styleJson["polygon-foreground-fill"];
            this.gamma = styleJson["polygon-gamma"] ? styleJson["polygon-gamma"] : true;
            this.geometryTransform = styleJson["polygon-geometry-transform"];
            this.hatchStyle = styleJson["polygon-hatch-style"];
            this.opacity = styleJson["polygon-opacity"];
            this.outlineColor = styleJson["polygon-outline-color"];
            this.outlineDashArray = styleJson["polygon-outline-dasharray"];
            this.outlineOpacity = styleJson["polygon-outline-opacity"];
            this.outlineWidth = styleJson["polygon-outline-width"];
            this.linearGradient = styleJson["polygon-linear-gradient"];
            this.radialGradient = styleJson["polygon-radial-gradient"];
            this.textureFile = styleJson["polygon-texture-file"];
            this.shadowColor = styleJson["polygon-shadow-color"];
            this.shadowDx = styleJson["polygon-shadow-dx"];
            this.shadowDy = styleJson["polygon-shadow-dy"];
        }
    }

    initializeCore() {
        this.brushType = this.brushType || "solid";
        this.brushOptions = {
            fillColor: this.fill,
            fillOpacity: this.opacity,
            linearGradient: this.linearGradient,
            radialGradient: this.radialGradient,
            textureFile: this.textureFile,
            foregroundFill: this.foregroundFill,
            hatchStyle: this.hatchStyle
        };

        if (this.geometryTransform) {
            this.geometryTransformValue = this.getTransformValues(this.geometryTransform);
        }

        if (this.brushType === "solid" || this.brushType === "hatch") {
            this.geoBrush = GeoBrush.createBrushByType(this.brushType, null, null, this.brushOptions);
        }

        if (this.outlineColor) {
            this.convertedOutlineColor = GeoStyle.toRGBAColor(this.outlineColor, this.outlineOpacity);
        }
        if (this.outlineDashArray) {
            this.convertedOutlineDashArray = this.outlineDashArray.split(",");
        }
        if (this.shadowColor) {
            this.convertedShadowColor = GeoStyle.toRGBAColor(this.shadowColor);
        }
        this.shadowTranslateValueByResolution = {};
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

    getConvertedStyleCore(feature: any, resolution: number, options): ol.style.Style[] {
        let length = 0;
        this.styles = [];
        if (this.fill || (this.outlineColor && this.outlineWidth) || this.linearGradient || this.radialGradient) {
            if (this.geometryTransform) {
                feature.flatCoordinates_ = this.GetTransformedCoordinates(feature, resolution);
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

                GeoAreaStyle.areaShadowStyle.getFill().setColor(this.convertedShadowColor);

                GeoAreaStyle.areaShadowStyle.setGeometry(geometry);
                this.styles[length++] = GeoAreaStyle.areaShadowStyle;
            }

            if (this.fill && this.geoBrush) {
                // this.geoBrush = GeoBrush.createBrushByType(this.brushType, feature, resolution, this.brushOptions);
                GeoAreaStyle.areaStyle.getFill().setColor(this.geoBrush);
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
            this.styles[length++] = GeoAreaStyle.areaStyle;

            if (this.gamma !== undefined && options.layer) {
                let styleGamma = this.gamma;
                options.layer.on("precompose", function (evt) {
                    evt.context.imageSmoothingEnabled = styleGamma;
                    evt.context.webkitImageSmoothingEnabled = styleGamma;
                    evt.context.mozImageSmoothingEnabled = styleGamma;
                    evt.context.msImageSmoothingEnabled = styleGamma;
                });
            }

            if(this.brushType === 'texture' && this.textureFile){
                
                GeoAreaStyle.areaStyle.setImage(new ol.style.Icon({
                    crossOrigin: 'anonymous',
                    src: this.textureFile
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
}
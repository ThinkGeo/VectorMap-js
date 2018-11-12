import GeoStyle from "./geoStyle";
import GeoBrush from "./geoBrush";
import GeoBrushType from "./geoBrushType";
import { transform } from 'ol/transform'
import { Polygon } from 'ol/geom';
import { translate } from 'ol/geom/flat/transform';

import { Style, Fill, Stroke } from 'ol/style'

class GeoAreaStyle extends GeoStyle {

    constructor(styleJson) {
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
            this.opacity = styleJson["polygon-opacity"] | 1;
            this.outlineColor = styleJson["polygon-outline-color"];
            this.outlineDashArray = styleJson["polygon-outline-dasharray"];
            this.outlineOpacity = styleJson["polygon-outline-opacity"] | 1;
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
            this.geoBrush = GeoBrush["createBrushByType"](this.brushType, null, null, this.brushOptions);
        }

        if (this.outlineColor) {
            this.convertedOutlineColor = GeoStyle["toRGBAColor"](this.outlineColor, this.outlineOpacity);
        }
        if (this.outlineDashArray) {
            this.convertedOutlineDashArray = this.outlineDashArray.split(",");
        }
        if (this.shadowColor) {
            this.convertedShadowColor = GeoStyle["toRGBAColor"](this.shadowColor);
        }
        this.shadowTranslateValueByResolution = {};
    }

    getTransformValues(transform) {
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

    GetTransformedCoordinates(feature) {
        let tmpFlatCoordinates = feature.getFlatCoordinates();
        let tmpCoordinates = [[]];
        let index = 0;
        for (let i = 0; i < tmpFlatCoordinates.length; i += 2) {
            tmpCoordinates[index] || (tmpCoordinates[index] = []);
            tmpCoordinates[index].push([tmpFlatCoordinates[i], tmpFlatCoordinates[i + 1]]);
            if (tmpCoordinates[index].length > 3 && tmpCoordinates[index][0][0] === tmpFlatCoordinates[i] && tmpCoordinates[index][0][1] === tmpFlatCoordinates[i + 1]) {
                index++;
            }
        }
        let geometry = new Polygon(tmpCoordinates, "XY");

        if (this.geometryTransform.indexOf("translate") === 0) {
            geometry.translate(+this.geometryTransformValue[0].trim(), +this.geometryTransformValue[1].trim());
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

        return geometry.flatCoordinates;
    }

    getConvertedStyleCore(feature, resolution, options) {
        let length = 0;
        this.styles = [];
        if (this.fill || (this.outlineColor && this.outlineWidth) || this.linearGradient || this.radialGradient) {
            if (this.geometryTransform) {
                feature.flatCoordinates_ = this.GetTransformedCoordinates(feature);
            }

            if (this.shadowDx || this.shadowDy) {
                let shadowTranslateValue = this.shadowTranslateValueByResolution[resolution];
                if (shadowTranslateValue === undefined) {
                    let tmpResolution = Math.round(resolution * 100000000) / 100000000;
                    this.shadowTranslate = (`translate(${(this.shadowDx ? this.shadowDx : 0) * tmpResolution},${(this.shadowDy ? this.shadowDy : 0) * tmpResolution})`);
                    shadowTranslateValue = this.getTransformValues(this.shadowTranslate);
                    this.shadowTranslateValueByResolution[resolution] = shadowTranslateValue;
                }

                let tmpFlatCoordinates = feature.getFlatCoordinates();
                let newFlatCoordinates = translate(tmpFlatCoordinates, 0, tmpFlatCoordinates.length, 2, +shadowTranslateValue[0].trim(), +shadowTranslateValue[1].trim(), undefined);

                let tmpCoordinates = [[]];
                let index = 0;
                for (let i = 0; i < newFlatCoordinates.length; i += 2) {
                    tmpCoordinates[index] || (tmpCoordinates[index] = []);
                    tmpCoordinates[index].push([newFlatCoordinates[i], newFlatCoordinates[i + 1]]);
                    if (tmpCoordinates[index].length > 3 && tmpCoordinates[index][0][0] === newFlatCoordinates[i] && tmpCoordinates[index][0][1] === newFlatCoordinates[i + 1]) {
                        index++;
                    }
                }
                let geometry = new Polygon(tmpCoordinates, "XY");

                GeoAreaStyle.areaShadowStyle.getFill().setColor(this.convertedShadowColor);

                GeoAreaStyle.areaShadowStyle.setGeometry(geometry);
                this.styles[length++] = GeoAreaStyle.areaShadowStyle;
            }

            if (this.fill) {
                if (this.brushType == "solid" && this.geoBrush) {
                    GeoAreaStyle.areaStyle.getFill().setColor(this.geoBrush);
                }
                else {
                    this.geoBrush = GeoBrush.createBrushByType(this.brushType, feature, resolution, this.brushOptions);
                }
            }

            // stroke to handle outlineColor, outlineDashArray, outlineOpacity and outlineWidth
            if (this.outlineColor || this.outlineDashArray || this.outlineWidth) {
                let newStroke = new Stroke();
                newStroke.setColor(this.convertedOutlineColor);
                newStroke.setLineDash(this.convertedOutlineDashArray);
                newStroke.setWidth(this.outlineWidth);
                GeoAreaStyle.areaStyle.setStroke(newStroke);
            }
            else {
                GeoAreaStyle.areaStyle.setStroke(undefined);
            }

            // GeoAreaStyle.areaStyle.setGeometry(feature);
            this.styles[length++] = GeoAreaStyle.areaStyle;

            // if (this.gamma !== undefined && options.layer) {
            //     let styleGamma = this.gamma;
            //     options.layer.on("precompose", function (evt) {
            //         evt.context.imageSmoothingEnabled = styleGamma;
            //         evt.context.webkitImageSmoothingEnabled = styleGamma;
            //         evt.context.mozImageSmoothingEnabled = styleGamma;
            //         evt.context.msImageSmoothingEnabled = styleGamma;
            //     });
            // }
        }

        return this.styles;
    }
}
GeoAreaStyle["areaStyle"] = new Style({
    fill: new Fill({}),
    stroke: new Stroke({})
});

GeoAreaStyle["areaShadowStyle"] = new Style({
    fill: new Fill({}),
});

export default GeoAreaStyle;
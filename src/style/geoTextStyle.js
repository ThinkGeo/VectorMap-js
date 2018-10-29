import GeoStyle from "./geoStyle";

import { Style, Fill, Stroke, Text } from 'ol/style'

class GeoTextStyle extends GeoStyle {
    constructor(styleJson) {
        super(styleJson);
        this.textAligns = ["left", "right", "center", "end", "start"];
        this.textBaseline = ["bottom", "top", "middle", "alphabetic", "hanging", "ideographic"];
        this.textTransforms = ["default", "uppercase", "lowercase"];

        if (styleJson) {
            this.align = styleJson["text-align"];
            this.baseline = styleJson["text-base-line"];
            this.dx = styleJson["text-dx"];
            this.dy = styleJson["text-dy"];
            this.font = styleJson["text-font"];
            this.fill = styleJson["text-fill"];
            this.forceHorizontalForLine = styleJson["text-force-horizontal-for-line"];
            this.haloFill = styleJson["text-halo-fill"];
            this.haloRadius = styleJson["text-halo-radius"];
            this.margin = styleJson["text-margin"];
            this.maskColor = styleJson["text-mask-color"];
            this.maskMargin = styleJson["text-mask-margin"];
            this.maskOutlineColor = styleJson["text-mask-outline-color"];
            this.maskOutlineWidth = styleJson["text-mask-outline-width"];
            this.maskType = styleJson["text-mask-type"];
            this.maxCharAngle = styleJson["text-max-char-angle"];

            this.minDistance = styleJson["text-min-distance"];
            this.minPadding = styleJson["text-min-padding"];
            this.name = styleJson["text-name"];

            this.opacity = styleJson["text-opacity"] | 1;
            this.rotateAngle = styleJson["text-rotate-angle"];
            this.placements = styleJson["text-placements"] | ["U,B,L,R"];
            this.placementType = styleJson["text-placement-type"] ? styleJson["text-placement-type"] : "default";
            this.spacing = styleJson["text-spacing"] !== undefined ? styleJson["text-spacing"] : 10;
            this.wrapBefore = styleJson["text-wrap-before"] ? true : styleJson["text-wrap-before"];
            this.wrapWidth = styleJson["text-wrap-width"];
            this.textFormat = styleJson["text-text-format"];
            this.dateFormat = styleJson["text-date-format"];
            this.numericFormat = styleJson["text-numeric-format"];
            this.textTransform = styleJson["text-letter-case"];
            this.letterSpacing = styleJson["text-letter-spacing"];

            // TODO
            this.avoidEdge = styleJson["text-avoid-edge"];
            // TODO
            this.splineType = styleJson["text-spline-type"];
            // TODO
            this.polygonLabelingLocation = styleJson["text-polygon-labeling-location"];


        }
    }

    initializeCore() {
        if (this.fill) {
            this.fillColor = GeoStyle.toRGBAColor(this.fill, this.opacity);
        }

        if (this.haloFill) {
            this.haloFillColor = GeoStyle.toRGBAColor(this.haloFill, this.opacity);
        }

        let fill = new Fill();
        let stroke = new Stroke();
        let textStyle = new Text({
            fill: fill,
            stroke: stroke
        });

        this.style = new Style({
            text: textStyle
        });

        if (this.textAligns.indexOf(this.align) >= 0) {
            textStyle.setTextAlign(this.align);
        }
        if (this.textBaseline.indexOf(this.baseline) >= 0) {
            textStyle.setTextBaseline(this.baseline);
        }
        if (this.dx) {
            textStyle.setOffsetX(this.dx);
        }
        if (this.dy) {
            textStyle.setOffsetY(this.dy);
        }
        if (this.font) {
            textStyle.setFont(this.font);
        }
        if (this.fillColor) {
            fill.setColor(this.fillColor);
        }
        if (this.haloFillColor) {
            stroke.setColor(this.haloFillColor);
        }
        if (this.haloRadius) {
            stroke.setWidth(this.haloRadius);
        }
        if (this.haloFillColor === undefined && this.haloRadius === undefined) {
            textStyle.setStroke(undefined);
        }

        if (this.rotateAngle) {
            textStyle.setRotation(this.rotateAngle);
        }
        if (this.maxCharAngle >= 0) {
            textStyle.setMaxAngle(this.maxCharAngle);
        }
        if (this.textTransforms.includes(this.textTransform)) {
        } else {
            // TODO: invalid inputs.
            this.textTransform = this.textTransforms[0];
        }

        if (this.placementType) {
            textStyle.setPlacement(this.placementType);
        }
    }

    getConvertedStyleCore(feature, resolution, options) {
        let textStyles = [];
        let featureText = "";
        let featureProperties = feature.getProperties();

        if (this.name) {
            featureText = feature.get(this.name);
        }

        // A workaround for the language, remove the data update
        if ((featureText === undefined || featureText === "") && this.name.indexOf("name_") === 0) {
            featureText = feature.get("name");
        }

        if (this.numericFormat) {
            featureText = this.getTextWithNumericFormat(featureText);
        }
        if (this.dateFormat) {
            featureText = this.getTextWithDateFormat(featureText);
        }
        if (this.textFormat) {
            featureText = this.getTextWithFormat(featureText);
        }

        if (featureText === undefined || featureText === "") {
            return textStyles;
        }

        featureText = this.getTextTransform(featureText);

        this.style.getText().setText(featureText);
        let featureZindex = feature["tempTreeZindex"];
        if (featureZindex === undefined) {
            featureZindex = 0;
        }
        this.style.setZIndex(featureZindex);

        textStyles.push(this.style);

        return textStyles;
    }

    getTextTransform(featureText) {
        if (featureText !== undefined) {
            switch (this.textTransform) {
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
}
export default GeoTextStyle;
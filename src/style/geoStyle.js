import { getUid } from 'ol/util'
class GeoStyle {

    constructor(styleJson) {
        this.styles = [];
        if (styleJson) {
            this.styleJson = styleJson;
            this.id = styleJson["id"];
            // this.uid = getUid(this);
            this.visible = styleJson["visible"] === undefined ? true : styleJson["visible"];
        }
    }
    initialize() {
        if (!this.initialized) {
            this.initializeCore();
            this.initialized = true;
        }
    }

    initializeCore() {
    }

    getStyles(feature, resolution, options) {
        let results = [];
        if (this.visible) {
            results = this.getConvertedStyle(feature, resolution, options);
        }
        return results;
    }

    getConvertedStyle(feature, resolution, options) {
        this.initialize();
        return this.getConvertedStyleCore(feature, resolution, options);
    }

    getConvertedStyleCore(feature, resolution, options) {
        return [];
    }


    static toRGBAColor(color, opacity = 1) {
        if (color.indexOf("#") === 0) {
            let array = [];
            let r;
            let g;
            let b;
            let a;
            if (color.length === 4) {
                r = +("0x" + color.substr(1, 1) + color.substr(1, 1));
                g = +("0x" + color.substr(2, 1) + color.substr(2, 1));
                b = +("0x" + color.substr(3, 1) + color.substr(3, 1));
                a = opacity;
            } else {
                r = +("0x" + color.substr(1, 2));
                g = +("0x" + color.substr(3, 2));
                b = +("0x" + color.substr(5, 2));
                a = opacity;
            }
            array = [r, g, b, a];
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                return "rgba(" + array.join(",") + ")";
            } else {
                return "rgba(0,0,0,0)";
            }
        }
        if (color.indexOf("rgb(") === 0) {
            color = color.replace("rgb(", "rgba(");
            color = color.substring(0, color.length - 1) + "," + opacity + ")";
        }
        if (color.indexOf("argb(") === 0) {
            color = color.replace("argb(", "").replace(")", "");
            let array = color.split(",");
            let a = array.shift();
            array.push(a);
            color = "rgba(" + array.join(",") + ")";
        }

        return color;
    }
}

export default GeoStyle;


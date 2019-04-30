export class GeoStyle {
    public id: string;
    public uid:any;
    public visible: true;
    public styles: any[];

    public initialized: boolean;

    constructor(styleJson?: object) {
        this.styles = [];
        if (styleJson) {
            this.id = styleJson["id"];
            this.uid= (<any>ol).getUid(this);
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

    getStyles(feature: ol.Feature, resolution: number, options: any): ol.style.Style[] {
        let results = [];
        if (this.visible) {
            results = this.getConvertedStyle(feature, resolution, options);
        }
        return results;
    }

    getConvertedStyle(feature: ol.Feature, resolution: number, options: any): ol.style.Style[] {
        this.initialize();
        return this.getConvertedStyleCore(feature, resolution, options);
    }

    getConvertedStyleCore(feature: ol.Feature, resolution: number, options: any): ol.style.Style[] {
        return [];
    }

    skewGeometry(geometry: any, xDeg: number, yDeg: number) {
        let center = ol.extent.getCenter(geometry.getExtent());

        for (let i = 0; i < geometry.flatCoordinates.length; i += 2) {
            let x = geometry.flatCoordinates[i];
            let y = geometry.flatCoordinates[i + 1];
            let rx = this.skewX(x, y, center[0], center[1], xDeg);
            let ry = this.skewY(x, y, center[0], center[1], yDeg);
            geometry.flatCoordinates[i] = rx;
            geometry.flatCoordinates[i + 1] = ry;
        }
    }

    skewX(x: number, y: number, cx: number, cy: number, xDeg: number): number {
        let rx = x;

        if (xDeg !== 0) {
            let xResolution = Math.tan(1.0 * xDeg * Math.PI / 180);
            let distance;

            if (x > cx) {
                if (y > cy) {
                    distance = xResolution * Math.abs(y - cy);
                } else {
                    distance = 0 - xResolution * Math.abs(y - cy);
                }
            }
            else {
                if (y > cy) {
                    distance = xResolution * Math.abs(y - cy);
                } else {
                    distance = 0 - xResolution * Math.abs(y - cy);
                }
            }

            rx += Math.round(distance);
        }

        return rx;
    }

    skewY(x: number, y: number, cx: number, cy: number, yDeg: number): number {
        let ry = y;

        if (yDeg !== 0) {
            let yResolution = Math.tan(1.0 * yDeg * Math.PI / 180);
            let distance;

            if (y > cy) {
                if (x > cx) {
                    distance = yResolution * Math.abs(x - cx);
                } else {
                    distance = 0 - yResolution * Math.abs(x - cx);
                }
            } else {
                if (x > cx) {
                    distance = yResolution * Math.abs(x - cx);
                } else {
                    distance = 0 - yResolution * Math.abs(x - cx);
                }
            }

            ry += Math.round(distance);
        }

        return ry;
    }

    static toRGBAColor(color, opacity = 1): string {
        if (color.indexOf("#") === 0) {
            let array: number[];
            let r: number;
            let g: number;
            let b: number;
            let a: number;
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

    static toOLLinearGradient(color, opacity = 1, size) {
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        context.rect(0, 0, size, size);

        let grd = context.createLinearGradient(0, 0, size, size);
        let colorStops = color.split(",");
        for (let colorStop of colorStops) {
            colorStop = colorStop.trim();
            let tmpColorStop = colorStop.substr(1, colorStop.length - 2);
            let cs = tmpColorStop.split(":");
            grd.addColorStop(Number(cs[0].trim()), this.toRGBAColor(cs[1].trim(), opacity));
        }

        return grd;
    }

    static toOLRadialGradient(color, opacity = 1, size) {
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        context.rect(0, 0, size, size);

        let grd = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        let colorStops = color.split(",");
        for (let colorStop of colorStops) {
            colorStop = colorStop.trim();
            let tmpColorStop = colorStop.substr(1, colorStop.length - 2);
            let cs = tmpColorStop.split(":");
            grd.addColorStop(Number(cs[0].trim()), this.toRGBAColor(cs[1].trim(), opacity));
        }

        return grd;
    }
}

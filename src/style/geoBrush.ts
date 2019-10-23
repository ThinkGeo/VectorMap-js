import { BrushTypeOptions } from "./brushTypeOptions";
import { GeoStyle } from "./geoStyle";

export class GeoBrush {
    static geoBrushFunctions = {
        solid: GeoBrush.createGeoSolidBrush,
        radialgradient: GeoBrush.createRadialGradientColor,
        lineargradient: GeoBrush.createLinearGradientColor,
        hatch: GeoBrush.createPatternColor,
        texture: GeoBrush.createImageCanvasPattern
    };

    static geoPatternFunctions = {
        Cross: GeoBrush.getCrossPattern,
        Horizontal: GeoBrush.getHorizontalPattern,
        Vertical: GeoBrush.getVerticalPattern,
        ForwardDiagonal: GeoBrush.getForwardDiagonalPattern,
        BackwardDiagonal: GeoBrush.getBackwardDiagonalPattern,
        LargeGrid: GeoBrush.getLargeGridPattern,
        DiagonalCross: GeoBrush.getDiagonalCrossPattern,
        Percent05: GeoBrush.getPercent05Pattern,
        Percent10: GeoBrush.getPercent10Pattern,
        Percent20: GeoBrush.getPercent20Pattern,
        Percent25: GeoBrush.getPercent25Pattern,
        Percent30: GeoBrush.getPercent30Pattern,
        Percent40: GeoBrush.getPercent40Pattern,
        Percent50: GeoBrush.getPercent50Pattern,
        Percent60: GeoBrush.getPercent60Pattern,
        Percent70: GeoBrush.getPercent70Pattern,
        Percent75: GeoBrush.getPercent75Pattern,
        Percent80: GeoBrush.getPercent80Pattern,
        Percent90: GeoBrush.getPercent90Pattern,
    };

    static createBrushByType(brushType: any, feature: any, resolution: number, brushTypeOptions?: BrushTypeOptions) {
        let geoBrushFunction = this.geoBrushFunctions[brushType];
        if (typeof geoBrushFunction === "function") {
            return geoBrushFunction(feature, resolution, brushTypeOptions);
        } else {
            return null;
        }
    }

    static registerGeoBrushFunction(key: string, geoBrushFunction: any) {
        this.geoBrushFunctions[key] = geoBrushFunction;
    }

    static createGeoSolidBrush(feature: any, resolution: number, geoBrushOptions: BrushTypeOptions) {
        if (geoBrushOptions.fillColor) {
            return GeoStyle.blendColorAndOpacity(geoBrushOptions.fillColor, geoBrushOptions.fillOpacity);
        }
    }

    static createRadialGradientColor(feature: any, resolution: number, geoBrushOptions: BrushTypeOptions) {
        let extent = feature.getExtent();

        // TODO: try to create it when creating the GeoStyle.
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");

        // TODO: check if there is a difference by srid.
        let width = ol.extent.getWidth(extent) / resolution * ol.has.DEVICE_PIXEL_RATIO;
        let height = ol.extent.getHeight(extent) / resolution * ol.has.DEVICE_PIXEL_RATIO;
        // TODO: the (x0,y0) is the center of feature extent, optimize it
        let x0 = width / 2;
        let y0 = height / 2;
        let r1 = x0;
        let grd = context.createRadialGradient(x0, y0, 0, x0, y0, r1);

        let gradientColors = geoBrushOptions.radialGradient.split(",");
        for (let gradientColor of gradientColors) {
            gradientColor = gradientColor.trim();
            let colorStop = gradientColor.substr(1, gradientColor.length - 2);
            let cs = colorStop.split(":");
            grd.addColorStop(Number(cs[0].trim()), GeoStyle.blendColorAndOpacity(cs[1].trim(), geoBrushOptions.fillOpacity));
        }

        return grd;
    }

    static createLinearGradientColor(feature: any, resolution: number, geoBrushOptions: BrushTypeOptions) {
        let extent = feature.getExtent();
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        // TODO: the direction Angle by x0,y0,x1,y1. this.directionAngle
        let grd = context.createLinearGradient(0, 0, ol.extent.getWidth(extent) / resolution * ol.has.DEVICE_PIXEL_RATIO, ol.extent.getHeight(extent) / resolution * ol.has.DEVICE_PIXEL_RATIO);

        let gradientColors = geoBrushOptions.linearGradient.split(",");
        for (let gradientColor of gradientColors) {
            gradientColor = gradientColor.trim();
            let colorStop = gradientColor.substr(1, gradientColor.length - 2);
            let cs = colorStop.split(":");
            grd.addColorStop(Number(cs[0].trim()), GeoStyle.blendColorAndOpacity(cs[1].trim(), geoBrushOptions.fillOpacity));
        }

        return grd;
    }

    static createImageCanvasPattern(feature: any, resolution: number, geoBrushOptions: BrushTypeOptions) {
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        let imageElement = document.createElement("img");
        imageElement.src = geoBrushOptions.textureFile;
        return context.createPattern(imageElement, "repeat");
    }

    static createPatternColor(feature: any, resolution: number, geoBrushOptions: BrushTypeOptions) {
        let createPatternFunction = GeoBrush.geoPatternFunctions[geoBrushOptions.hatchStyle];
        if (typeof createPatternFunction === "function") {
            return createPatternFunction(geoBrushOptions.fillColor, geoBrushOptions.foregroundFill);
        }
        else {
            return GeoStyle.blendColorAndOpacity(
                geoBrushOptions.fillColor,
                geoBrushOptions.fillOpacity
            );
        }
    }

    static getCrossPattern(fill: string, foregroundFill: string) {
        let size = 6;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;


        let canvas = document.createElement("canvas");
        canvas.width = size * 2 * ratio;
        canvas.height = size * 2 * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // horizon line
        context.fillStyle = foregroundFill;
        context.fillRect(0, canvas.height / 2, canvas.width, 1);

        // vertical line
        context.fillRect(canvas.width / 2, 0, 1, canvas.height);

        return context.createPattern(canvas, "repeat");
    }

    static getHorizontalPattern(fill: string, foregroundFill: string) {
        let size = 6;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;

        let canvas = document.createElement("canvas");
        canvas.width = size * 2 * ratio;
        canvas.height = size * 2 * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // horizon line
        context.fillStyle = foregroundFill;
        context.fillRect(0, canvas.height / 2, canvas.width, 1);

        return context.createPattern(canvas, "repeat");
    }

    static getVerticalPattern(fill: string, foregroundFill: string) {
        let size = 6;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;

        let canvas = document.createElement("canvas");
        canvas.width = size * 2 * ratio;
        canvas.height = size * 2 * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // vertical line
        context.fillStyle = foregroundFill;
        context.fillRect(canvas.width / 2, 0, 1, canvas.height);

        return context.createPattern(canvas, "repeat");
    }

    static getForwardDiagonalPattern(fill: string, foregroundFill: string) {
        let size = 6;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;

        let canvas = document.createElement("canvas");
        canvas.width = size * 2 * ratio;
        canvas.height = size * 2 * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // vertical line
        context.strokeStyle = foregroundFill;
        context.moveTo(0, 0);
        context.lineTo(canvas.width, canvas.height);
        context.stroke();

        // context.fillStyle = foregroundFill;
        // context.moveTo(-1, -1);
        // context.lineTo(1, -1);
        // context.lineTo(canvas.width + 1, canvas.height);
        // context.lineTo(canvas.width + 1, canvas.height + 1);
        // context.lineTo(canvas.width, canvas.height + 1);
        // context.lineTo(-1, 0);
        // context.lineTo(-1, -1);
        // context.closePath();
        // context.fill();

        return context.createPattern(canvas, "repeat");
    }

    static getBackwardDiagonalPattern(fill: string, foregroundFill: string) {
        let size = 6;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;

        let canvas = document.createElement("canvas");
        canvas.width = size * 2 * ratio;
        canvas.height = size * 2 * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // vertical line
        context.strokeStyle = foregroundFill;
        context.moveTo(canvas.width, 0);
        context.lineTo(0, canvas.height);
        context.stroke();

        return context.createPattern(canvas, "repeat");
    }

    static getPercent05Pattern(fill: string, foregroundFill: string) {
        let size = 5;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;

        let canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.95 + 1) * ratio;
        canvas.height = size * (2 * 0.95 + 1) * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // percentage region
        context.fillStyle = foregroundFill;
        context.beginPath();
        context.moveTo(canvas.width * 0.5, canvas.height * 0.45);
        context.lineTo(canvas.width * 0.55, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.55);
        context.lineTo(canvas.width * 0.45, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.45);
        context.closePath();
        context.fill();

        return context.createPattern(canvas, "repeat");
    }

    static getPercent10Pattern(fill: string, foregroundFill: string) {
        let size = 5;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;

        let canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.9 + 1) * ratio;
        canvas.height = size * (2 * 0.9 + 1) * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // percentage region
        context.fillStyle = foregroundFill;
        context.beginPath();
        context.moveTo(canvas.width * 0.5, canvas.height * 0.4);
        context.lineTo(canvas.width * 0.6, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.6);
        context.lineTo(canvas.width * 0.4, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.4);
        context.closePath();
        context.fill();

        return context.createPattern(canvas, "repeat");
    }

    static getPercent20Pattern(fill: string, foregroundFill: string) {
        let size = 5;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;

        let canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.8 + 1) * ratio;
        canvas.height = size * (2 * 0.8 + 1) * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // percentage region
        context.fillStyle = foregroundFill;
        context.beginPath();
        context.moveTo(canvas.width * 0.5, canvas.height * 0.3);
        context.lineTo(canvas.width * 0.7, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.7);
        context.lineTo(canvas.width * 0.3, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.3);
        context.closePath();
        context.fill();

        return context.createPattern(canvas, "repeat");
    }

    static getPercent25Pattern(fill: string, foregroundFill: string) {
        let size = 5;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;

        let canvas = document.createElement("canvas");
        canvas.width = size * 0.4 * ratio;
        canvas.height = size * 0.4 * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // percentage region
        context.fillStyle = foregroundFill;
        context.strokeStyle = foregroundFill;
        context.beginPath();
        context.ellipse(
            canvas.width * 0.25,
            canvas.height * 0.25,
            0.8,
            0.8,
            0,
            0,
            2 * Math.PI
        );
        // context.stroke();
        context.fill();

        return context.createPattern(canvas, "repeat");
    }

    static getPercent30Pattern(fill: string, foregroundFill: string) {
        let size = 5;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;

        let canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.7 + 1) * ratio;
        canvas.height = size * (2 * 0.7 + 1) * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // percentage region
        context.fillStyle = foregroundFill;
        context.beginPath();
        context.moveTo(canvas.width * 0.5, canvas.height * 0.2);
        context.lineTo(canvas.width * 0.8, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.8);
        context.lineTo(canvas.width * 0.2, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.2);
        context.closePath();
        context.fill();

        return context.createPattern(canvas, "repeat");
    }

    static getPercent40Pattern(fill: string, foregroundFill: string) {
        let size = 5;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;

        let canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.4 + 1) * ratio;
        canvas.height = size * (2 * 0.4 + 1) * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // percentage region
        context.fillStyle = foregroundFill;
        context.beginPath();
        context.moveTo(canvas.width * 0.5, canvas.height * 0.1);
        context.lineTo(canvas.width * 0.9, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.9);
        context.lineTo(canvas.width * 0.1, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.1);
        context.closePath();
        context.fill();

        return context.createPattern(canvas, "repeat");
    }

    static getPercent50Pattern(fill: string, foregroundFill: string) {
        let size = 5;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;

        let canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.5 + 1) * ratio;
        canvas.height = size * (2 * 0.5 + 1) * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // percentage region
        context.fillStyle = foregroundFill;
        context.beginPath();
        context.moveTo(canvas.width * 0.5, 0);
        context.lineTo(canvas.width, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height);
        context.lineTo(0, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, 0);
        context.closePath();
        context.fill();

        return context.createPattern(canvas, "repeat");
    }

    static getPercent60Pattern(fill: string, foregroundFill: string) {
        let size = 5;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;

        let canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.4 + 1) * ratio;
        canvas.height = size * (2 * 0.4 + 1) * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // percentage region
        context.fillStyle = foregroundFill;
        context.beginPath();
        context.moveTo(canvas.width * 0.4, 0);
        context.lineTo(canvas.width * 0.6, 0);
        context.lineTo(canvas.width, canvas.height * 0.4);
        context.lineTo(canvas.width, canvas.height * 0.6);
        context.lineTo(canvas.width * 0.6, canvas.height);
        context.lineTo(canvas.width * 0.4, canvas.height);
        context.lineTo(0, canvas.height * 0.6);
        context.lineTo(0, canvas.height * 0.4);
        context.lineTo(canvas.width * 0.4, 0);
        context.closePath();
        context.fill();

        return context.createPattern(canvas, "repeat");
    }

    static getPercent70Pattern(fill: string, foregroundFill: string) {
        let size = 5;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;

        let canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.3 + 1) * ratio;
        canvas.height = size * (2 * 0.3 + 1) * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // percentage region
        context.fillStyle = foregroundFill;
        context.beginPath();
        context.moveTo(canvas.width * 0.3, 0);
        context.lineTo(canvas.width * 0.7, 0);
        context.lineTo(canvas.width, canvas.height * 0.3);
        context.lineTo(canvas.width, canvas.height * 0.7);
        context.lineTo(canvas.width * 0.7, canvas.height);
        context.lineTo(canvas.width * 0.3, canvas.height);
        context.lineTo(0, canvas.height * 0.7);
        context.lineTo(0, canvas.height * 0.3);
        context.lineTo(canvas.width * 0.3, 0);
        context.closePath();
        context.fill();

        return context.createPattern(canvas, "repeat");
    }

    static getPercent75Pattern(fill: string, foregroundFill: string) {
        let size = 5;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;

        let canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.25 + 1) * ratio;
        canvas.height = size * (2 * 0.25 + 1) * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // percentage region
        context.fillStyle = foregroundFill;
        context.beginPath();
        context.moveTo(canvas.width * 0.25, 0);
        context.lineTo(canvas.width * 0.75, 0);
        context.lineTo(canvas.width, canvas.height * 0.25);
        context.lineTo(canvas.width, canvas.height * 0.75);
        context.lineTo(canvas.width * 0.75, canvas.height);
        context.lineTo(canvas.width * 0.25, canvas.height);
        context.lineTo(0, canvas.height * 0.75);
        context.lineTo(0, canvas.height * 0.25);
        context.lineTo(canvas.width * 0.25, 0);
        context.closePath();
        context.fill();

        return context.createPattern(canvas, "repeat");
    }

    static getPercent80Pattern(fill: string, foregroundFill: string) {
        let size = 5;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;

        let canvas = document.createElement("canvas");
        canvas.width = size * 0.8 * ratio;
        canvas.height = size * 0.8 * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // percentage region
        context.fillStyle = foregroundFill;
        context.strokeStyle = foregroundFill;
        context.beginPath();
        context.ellipse(canvas.width * 0.1, canvas.height * 0.1, 0.8, 0.8, 0, 0, 2 * Math.PI);
        // context.stroke();
        context.fill();

        return context.createPattern(canvas, "repeat");
    }

    static getPercent90Pattern(fill: string, foregroundFill: string) {
        let size = 5;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;

        let canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.1 + 1) * ratio;
        canvas.height = size * (2 * 0.1 + 1) * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // percentage region
        context.fillStyle = foregroundFill;
        context.strokeStyle = foregroundFill;
        context.beginPath();
        context.ellipse(canvas.width * 0.1, canvas.height * 0.1, 0.4, 0.4, 0, 0, 2 * Math.PI);
        // context.stroke();
        context.fill();

        return context.createPattern(canvas, "repeat");
    }

    static getLargeGridPattern(fill: string, foregroundFill: string) {
        let size = 6;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;

        let canvas = document.createElement("canvas");
        canvas.width = size * 2 * ratio;
        canvas.height = size * 2 * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // grid rect
        context.strokeStyle = foregroundFill;
        context.strokeRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        return context.createPattern(canvas, "repeat");
    }

    static getDiagonalCrossPattern(fill: string, foregroundFill: string) {
        let size = 6;
        let ratio = ol.has.DEVICE_PIXEL_RATIO;

        let canvas = document.createElement("canvas");
        canvas.width = size * 2 * ratio;
        canvas.height = size * 2 * ratio;

        let context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // left to right diagonal line
        context.strokeStyle = foregroundFill;
        context.moveTo(0, 0);
        context.lineTo(canvas.width, canvas.height);
        context.stroke();

        // right to left diagonal line
        context.strokeStyle = foregroundFill;
        context.moveTo(canvas.width, 0);
        context.lineTo(0, canvas.height);
        context.stroke();

        return context.createPattern(canvas, "repeat");
    }
}
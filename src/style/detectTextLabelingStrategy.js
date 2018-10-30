import { TextLabelingStrategy } from "./textLabelingStrategy";
import { GeoTextStyle } from "./geoTextStyle";
import GeometryType from "ol/geom/GeometryType";


class DetectTextLabelingStrategy extends TextLabelingStrategy {
    constructor() {
        super();
        this.markLocationCore = this.markLocationCoreCustom;
    }

    markLocationCoreCustom(flatCoordinates, width, height, resolution, geometryType, textStyle, grid, frameState) {
        switch (geometryType) {
            case GeometryType.POINT:
            case GeometryType.MULTI_POINT:
            case GeometryType.CIRCLE:
                if (this.isOverlapping(flatCoordinates, width, height, textStyle.margin, textStyle.minDistance, textStyle.minPadding, textStyle.spacing, grid, frameState)) {
                    flatCoordinates = this.movePointLabel(flatCoordinates, width, height, resolution, textStyle, grid, frameState);
                }
                break;
            case LINE_STRING:
            case MULTI_LINE_STRING:
            case POLYGON:
            case MULTI_POLYGON:
                if (this.isOverlapping(flatCoordinates, width, height, textStyle.margin, textStyle.minDistance, textStyle.minPadding, textStyle.spacing, grid, frameState)) {
                    flatCoordinates = undefined;
                }
        }

        return flatCoordinates;
    }


    movePointLabel(flatCoordinates, width, height, resolution, textStyle, grid, frameState) {
        let gridSize = 50;
        let distance = gridSize * resolution;

        if (textStyle.placements) {
            let placements = textStyle.placements.split(",");
            for (let placement of placements) {
                let newFlatCoordinates = this.getMovedPosition(flatCoordinates, placement, distance);
                if (!this.isOverlapping(newFlatCoordinates, width, height, textStyle.margin, textStyle.minDistance, textStyle.minPadding, textStyle.spacing, grid, frameState)) {
                    return newFlatCoordinates;
                }
            }
        }

        return undefined;
    }

    getMovedPosition(flatCoordinates, placement, distance) {
        let newFlatCoordinates;

        switch (placement) {
            case "UR":
                newFlatCoordinates = this.moveToUR(flatCoordinates, distance);
                break;
            case "U":
                newFlatCoordinates = this.moveToU(flatCoordinates, distance);
                break;
            case "UL":
                newFlatCoordinates = this.moveToUL(flatCoordinates, distance);
                break;
            case "B":
                newFlatCoordinates = this.moveToB(flatCoordinates, distance);
                break;
            case "BR":
                newFlatCoordinates = this.moveToBR(flatCoordinates, distance);
                break;
            case "BL":
                newFlatCoordinates = this.moveToBL(flatCoordinates, distance);
                break;
            case "L":
                newFlatCoordinates = this.moveToL(flatCoordinates, distance);
                break;
            case "R":
                newFlatCoordinates = this.moveToR(flatCoordinates, distance);
                break;
        }

        return newFlatCoordinates;
    }
    moveToUR(flatCoordinates, distance) {
        let newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0] + distance);
        newFlatCoordinates.push(flatCoordinates[1] + distance);
        newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    }

    moveToU(flatCoordinates, distance) {
        let newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0]);
        newFlatCoordinates.push(flatCoordinates[1] + distance);
        newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    }

    moveToUL(flatCoordinates, distance) {
        let newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0] - distance);
        newFlatCoordinates.push(flatCoordinates[1] + distance);
        newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    }

    moveToBR(flatCoordinates, distance) {
        let newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0] + distance);
        newFlatCoordinates.push(flatCoordinates[1] - distance);
        newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    }

    moveToBL(flatCoordinates, distance) {
        let newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0] - distance);
        newFlatCoordinates.push(flatCoordinates[1] - distance);
        newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    }

    moveToL(flatCoordinates, distance) {
        let newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0] - distance);
        newFlatCoordinates.push(flatCoordinates[1]);
        newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    }

    moveToR(flatCoordinates, distance) {
        let newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0] + distance);
        newFlatCoordinates.push(flatCoordinates[1]);
        newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    }
}

export default DetectTextLabelingStrategy;
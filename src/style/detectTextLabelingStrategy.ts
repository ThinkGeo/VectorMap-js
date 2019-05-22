import { TextLabelingStrategy } from "./textLabelingStrategy";
import { GeoTextStyle } from "./geoTextStyle";

export class DetectTextLabelingStrategy extends TextLabelingStrategy {
    constructor() {
        super();
        this.markLocationCore = this.markLocationCoreCustom;
    }

    protected markLocationCoreCustom(flatCoordinates: any, width: number, height: number, resolution: any, geometryType: any, textStyle: GeoTextStyle, grid: any, frameState: olx.FrameState) {
        switch (geometryType) {
            case (<any>ol.geom).GeometryType.POINT:
            case (<any>ol.geom).GeometryType.MULTI_POINT:
            case (<any>ol.geom).GeometryType.CIRCLE:
                // if (!this.isOverlapping(flatCoordinates, width, height, textStyle.margin, textStyle.minDistance, textStyle.minPadding, textStyle.spacing, grid, frameState)) {
                return this.movePointLabel(flatCoordinates, width, height, resolution, textStyle, grid, frameState);
                // }
                break;
            case (<any>ol.geom).GeometryType.LINE_STRING:
            case (<any>ol.geom).GeometryType.MULTI_LINE_STRING:
            case (<any>ol.geom).GeometryType.POLYGON:
            case (<any>ol.geom).GeometryType.MULTI_POLYGON:
                if (this.isOverlapping(flatCoordinates, width, height, textStyle.margin, textStyle.minDistance, textStyle.minPadding, textStyle.spacing, grid, frameState)) {
                    return undefined;
                }
        }
    }

    movePointLabel(flatCoordinates: any, width: number, height: number, resolution: any, textStyle: GeoTextStyle, grid: any, frameState: olx.FrameState) {
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

    getMovedPosition(flatCoordinates: any, placement: string, distance: number) {
        let newFlatCoordinates: any;

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

    moveToUR(flatCoordinates: any, distance: number) {
        let newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0] + distance);
        newFlatCoordinates.push(flatCoordinates[1] + distance);
        flatCoordinates[2] && newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    }

    moveToU(flatCoordinates: any, distance: number) {
        let newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0]);
        newFlatCoordinates.push(flatCoordinates[1] + distance);
        flatCoordinates[2] && newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    }

    moveToUL(flatCoordinates: any, distance: number) {
        let newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0] - distance);
        newFlatCoordinates.push(flatCoordinates[1] + distance);
        flatCoordinates[2] && newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    }

    moveToB(flatCoordinates: any, distance: number) {
        let newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0]);
        newFlatCoordinates.push(flatCoordinates[1] - distance);
        flatCoordinates[2] && newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    }

    moveToBR(flatCoordinates: any, distance: number) {
        let newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0] + distance);
        newFlatCoordinates.push(flatCoordinates[1] - distance);
        flatCoordinates[2] && newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    }

    moveToBL(flatCoordinates: any, distance: number) {
        let newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0] - distance);
        newFlatCoordinates.push(flatCoordinates[1] - distance);
        flatCoordinates[2] && newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    }

    moveToL(flatCoordinates: any, distance: number) {
        let newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0] - distance);
        newFlatCoordinates.push(flatCoordinates[1]);
        flatCoordinates[2] && newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    }

    moveToR(flatCoordinates: any, distance: number) {
        let newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0] + distance);
        newFlatCoordinates.push(flatCoordinates[1]);
        flatCoordinates[2] && newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    }
}
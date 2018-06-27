import { GeoTextStyle } from "./geoTextStyle";
import { coordinate } from "openlayers";

export class TextLabelingStrategy {
    constructor() { }

    public markLocation(flatCoordinates: any, width: number, height: number, resolution: any, geometryType: any, textStyle: GeoTextStyle, strategyTree: any, frameState: olx.FrameState) {
        return this.markLocationCore(flatCoordinates, width, height, resolution, geometryType, textStyle, strategyTree, frameState);
    }

    protected markLocationCore(flatCoordinates: any, width: number, height: number, resolution: any, geometryType: any, textStyle: GeoTextStyle, strategyTree: any, frameState: olx.FrameState) {
        if (this.isOverlapping(flatCoordinates, width, height, textStyle.margin, textStyle.minDistance, textStyle.minPadding, textStyle.spacing, strategyTree, frameState)) {
            return undefined;
        } else {
            return flatCoordinates;
        }
    }

    public isOverlapping(flatCoordinates: any, width: number, height: number, margin: number, minDistance: number, minPadding: number, spacing: number, strategyTree: any, frameState: olx.FrameState) {
        if (flatCoordinates === undefined) { return true; }

        let distance = (margin ? margin : 0) + (minDistance ? minDistance : 0) + (minPadding ? minPadding : 0) + (spacing ? spacing : 0);

        let coordinate = [flatCoordinates[0], flatCoordinates[1]];
        let screenCoordinates = this.convertPixelFromCoordinate(coordinate, frameState);
        let minX = screenCoordinates[0] - width / 2 - distance * 0.5;
        let minY = screenCoordinates[1] - height / 2 - distance * 0.5;
        let maxX = minX + width + distance;
        let maxY = minY + height + distance;
        let box = {
            minX: minX,
            minY: minY,
            maxX: maxX,
            maxY: maxY
        }

        if (!strategyTree.collides(box)) {
            strategyTree.insert(box);
            return false;
        }
        else {
            return true;
        }
    }

    convertPixelFromCoordinate(coordinate: any, frameState: olx.FrameState) {
        if (!frameState) {
            return null;
        }

        return (<any>ol).transform.apply((<any>frameState).coordinateToPixelTransform, coordinate.slice(0, 2));
    }
}
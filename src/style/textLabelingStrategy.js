import { GeoTextStyle } from "./geoTextStyle";
import { apply as applyTransform } from "ol/transform";

export class TextLabelingStrategy {
    constructor() {
    }
    markLocation(flatCoordinates, width, height, resolution, geometryType, textStyle, strategyTree, frameState) {
        return this.markLocationCore(flatCoordinates, width, height, resolution, geometryType, textStyle, strategyTree, frameState);
    }

    markLocationCore(flatCoordinates, width, height, resolution, geometryType, textStyle, strategyTree, frameState) {
        if (this.isOverlapping(flatCoordinates, width, height, textStyle.margin, textStyle.minDistance, textStyle.minPadding, textStyle.spacing, strategyTree, frameState)) {
            return undefined;
        } else {
            return flatCoordinates;
        }
    }

    isOverlapping(flatCoordinates, width, height, margin, minDistance, minPadding, spacing, strategyTree, frameState) {
        if (flatCoordinates === undefined || flatCoordinates.length === 0) { return true; }

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

    convertPixelFromCoordinate(coordinate, frameState) {
        if (!frameState) {
            return null;
        }

        return applyTransform(frameState.coordinateToPixelTransform, coordinate.slice(0, 2));
    }
}

export default TextLabelingStrategy;
import { TilePyramid } from "./tilePyramid";

export class TileSourceCache {
    featureIndex: number;
    tilePyramids: any;

    constructor() {
        this.tilePyramids = {};
        this.featureIndex = 0;
    }

    addFeature(feature, pbfLayerName, tileCoord, extent) {
        if (this.tilePyramids[pbfLayerName] === undefined) {
            this.tilePyramids[pbfLayerName] = {};
        }
        if (this.tilePyramids[pbfLayerName][tileCoord] === undefined) {
            this.tilePyramids[pbfLayerName][tileCoord] = new TilePyramid(tileCoord, extent);
        }
        this.tilePyramids[pbfLayerName][tileCoord].add(feature, tileCoord);
    }
}
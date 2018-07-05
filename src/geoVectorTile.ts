export class GeoVectorTile extends (ol.VectorTile as { new(tileCoord: ol.TileCoord, state: ol.Tile.State, src: string, format: ol.format.Feature, tileLoadFunction: ol.TileLoadFunctionType): any; }) {

    instructs: any;

    constructor(tileCoord: ol.TileCoord, state: ol.Tile.State, src: string, format: ol.format.Feature, tileLoadFunction: ol.TileLoadFunctionType) {
        super(tileCoord, state, src, format, tileLoadFunction);
        this.disposeInternal = this.disposeInternalCustom;
    }

    public disposeInternalCustom() {
        this.features_ = null;
        this.replayGroups_ = {};
        // this.state = ol.TileState.ABORT;
        this.state = (<any>ol).TileState.IDLE;
        this.changed();
        if (this["xhr"] != undefined) {
            this["xhr"].abort();
        }

        if (this.workerId !== undefined) {
            var disposeInfo = {
                formatId: (<any>ol).getUid(this.getFormat()),
                dataMaxZoom:this.getFormat().dataMaxZoom,
                tileCoord: this.tileCoord,
                requestTileCoord: this.requestTileCoord
            }

            this.getFormat().workerManager.postMessage(this.tileCoord + (<any>ol).getUid(disposeInfo), "vectorTileDispose", disposeInfo, null, this.workerId);
        }

        (<any>ol.Tile.prototype).disposeInternal.call(this);
    }

    public onLoad(dataProjection, extent) {
        this.setProjection(dataProjection);
        this.setFeatures();
        this.setExtent(extent);
    }

    setRenderFeatureInstructs(instructs) {
        this.instructs = instructs;
    }

    getRenderFeatureInstructs(instructs) {
        return this.instructs;
    }
}
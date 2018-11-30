import VectorTile from 'ol/VectorTile';
import TileState from 'ol/TileState';

class GeoVectorTile extends VectorTile {
    constructor(tileCoord, state, src, format, tileLoadFunction) {
        super(tileCoord, state, src, format, tileLoadFunction);
    }

    load() {
        if (this.state == TileState.IDLE) {
            this.setState(TileState.LOADING);
            this.tileLoadFunction_(this, this.url_);
            this.loader_(null, NaN, null);
        }
    }
    disposeInternal() {
        this.features_ = null;
        this.replayGroups_ = {};
        this.state = TileState.ABORT;
        this.changed();
        super.disposeInternal();
    }

    getApplyTileInstrictions(zoom)
    {
        
    }

}

export default GeoVectorTile;
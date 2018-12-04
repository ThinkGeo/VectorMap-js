/**
 * @module ol/render/canvas/ReplayGroup
 */
import CanvasReplayGroup from "./ReplayGroup";
import CanvasReplay from 'ol/render/canvas/Replay.js';
import CanvasImageReplay from 'ol/render/canvas/ImageReplay.js';
import CanvasLineStringReplay from 'ol/render/canvas/LineStringReplay.js';
import CanvasPolygonReplay from 'ol/render/canvas/PolygonReplay.js';
import GeoCanvasTextReplay from './GeoTextReplay';

const BATCH_CONSTRUCTORS = {
    'Circle': CanvasPolygonReplay,
    'Default': CanvasReplay,
    'Image': CanvasImageReplay,
    'LineString': CanvasLineStringReplay,
    'Polygon': CanvasPolygonReplay,
    'Text': GeoCanvasTextReplay
};

class GeoCanvasReplayGroup extends CanvasReplayGroup {
    constructor(
        tolerance,
        maxExtent,
        resolution,
        pixelRatio,
        overlaps,
        declutterTree,
        opt_renderBuffer) {
        super(tolerance,
            maxExtent,
            resolution,
            pixelRatio,
            overlaps,
            declutterTree,
            opt_renderBuffer)
    }

    getReplay(zIndex, replayType) {
        const zIndexKey = zIndex !== undefined ? zIndex.toString() : '0';
        let replays = this.replaysByZIndex_[zIndexKey];
        if (replays === undefined) {
            replays = {};
            this.replaysByZIndex_[zIndexKey] = replays;
        }
        let replay = replays[replayType];
        if (replay === undefined) {
            const Constructor = BATCH_CONSTRUCTORS[replayType];
            replay = new Constructor(this.tolerance_, this.maxExtent_,
                this.resolution_, this.pixelRatio_, this.overlaps_, this.declutterTree_);
            replays[replayType] = replay;
        }
        return replay;
    }
}

export default GeoCanvasReplayGroup;
/**
 * @module ol/render/canvas/ReplayGroup
 */
import CanvasReplayGroup from "./ReplayGroup";
import CanvasReplay from '../../ol/render/canvas/Replay.js';
import CanvasImageReplay from '../../ol/render/canvas/ImageReplay.js';
import CanvasLineStringReplay from '../../ol/render/canvas/LineStringReplay.js';
import CanvasPolygonReplay from '../../ol/render/canvas/PolygonReplay.js';
import GeoCanvasTextReplay from './GeoTextReplay';
import CanvasInstruction from '../../ol/render/canvas/Instruction';

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
        opt_renderBuffer,
        minimalist) {
        super(tolerance,
            maxExtent,
            resolution,
            pixelRatio,
            overlaps,
            declutterTree,
            opt_renderBuffer)
        this.minimalist = minimalist;
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
            replay.minimalist = this.minimalist;

            // override the method for minimalist
            replay.beginGeometry = function (geometry, feature) {
                this.beginGeometryInstruction1_ = [CanvasInstruction.BEGIN_GEOMETRY, feature, 0];
                if (!this.minimalist) {
                    this.instructions.push(this.beginGeometryInstruction1_);
                }
                this.beginGeometryInstruction2_ = [CanvasInstruction.BEGIN_GEOMETRY, feature, 0];
                if (!this.minimalist) {
                    this.hitDetectionInstructions.push(this.beginGeometryInstruction2_);
                }
            };

            replay.endGeometry = function (geometry, feature) {
                this.beginGeometryInstruction1_[2] = this.instructions.length;
                this.beginGeometryInstruction1_ = null;
                this.beginGeometryInstruction2_[2] = this.hitDetectionInstructions.length;
                this.beginGeometryInstruction2_ = null;
                var endGeometryInstruction1_ = [CanvasInstruction.END_GEOMETRY, feature];
                var endGeometryInstruction2_ = [CanvasInstruction.END_GEOMETRY, feature];
                if (!this.minimalist) {
                    this.instructions.push(endGeometryInstruction1_);
                    this.hitDetectionInstructions.push(endGeometryInstruction2_);
                }
            };

            replays[replayType] = replay;
        }
        return replay;
    }
}

export default GeoCanvasReplayGroup;
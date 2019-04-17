

import ReplayGroup from 'ol/render/webgl/ReplayGroup';
import PolygonReplay from 'ol/render/webgl/PolygonReplay';
import Replay from 'ol/render/webgl/Replay';

import {
    compose as composeTransform,
    reset as resetTransform,
    scale as scaleTransform,
    translate as translateTransform
} from 'ol/transform.js';

import { GeoImageReplay } from './geoImageRepaly';
import { GeoTextReplay } from './geoTextRepaly';
import { GeoPolygonReplay } from './geoPolygonRepaly';
import { GeoLineStringReplay } from './geoLineStringReplay';

// import ReplayGroup from 'ol/render/webgl/ReplayGroup';
import { extendCoordinate, buffer, containsCoordinate, equals, getIntersection, getTopLeft, intersects, createEmpty } from 'ol/extent';
import ReplayType from 'ol/render/ReplayType';
import { ORDER } from 'ol/render/replay';
import { webgl } from 'ol/webgl';



class ReplayGroupCustom extends ReplayGroup {

    constructor(tolerance, maxExtent, opt_renderBuffer, declutterTree) {
        super(tolerance, maxExtent, opt_renderBuffer);
        this.getReplay = this.getReplayCustom;
        this.BATCH_CONSTRUCTORS_CUSTOM = {
            "Circle": PolygonReplay,
            "Default":Replay,
            "Image": GeoImageReplay,
            "LineString": GeoLineStringReplay,
            "Polygon": GeoPolygonReplay,
            "Text": GeoTextReplay
        };
        this.BATCH_CONSTRUCTORS_ = this.BATCH_CONSTRUCTORS_CUSTOM;
        this.replay = this.replayCustom;
        this.declutterTree = declutterTree;
        // this.forEachFeatureAtCoordinate = this.forEachFeatureAtCoordinateCustom;
    }

     forEachFeatureAtCoordinateCustom(coordinate, resolution, rotation, hitTolerance, skippedFeaturesHash, callback, declutterReplays) {
        hitTolerance = Math.round(hitTolerance);
        let contextSize = hitTolerance * 2 + 1;
        let transform = composeTransform(this.hitDetectionTransform_,
            hitTolerance + 0.5, hitTolerance + 0.5,
            1 / resolution, -1 / resolution,
            -rotation,
            -coordinate[0], -coordinate[1]);
        let context = this.hitDetectionContext_;

        if (context.canvas.width !== contextSize || context.canvas.height !== contextSize) {
            context.canvas.width = contextSize;
            context.canvas.height = contextSize;
        } else {
            context.clearRect(0, 0, contextSize, contextSize);
        }

        /**
         * @type {ol.Extent}
         */
        let hitExtent;
        if (this.renderBuffer_ !== undefined) {
            hitExtent = createEmpty();
          extendCoordinate(hitExtent, coordinate);
           buffer(hitExtent, resolution * (this.renderBuffer_ + hitTolerance), hitExtent);
        }

        let mask = ReplayGroup.getCircleArray_(hitTolerance);
        let declutteredFeatures;
        // if (this.declutterTree_) {
        //     declutteredFeatures = this.declutterTree_.all().map(function (entry) {
        //         return entry.value;
        //     });
        // }
        function hitDetectionCallback(feature) {
            let imageData = context.getImageData(0, 0, contextSize, contextSize).data;
            for (let i = 0; i < contextSize; i++) {
                for (let j = 0; j < contextSize; j++) {
                    if (mask[i][j]) {
                        if (imageData[(j * contextSize + i) * 4 + 3] > 0) {
                            let result;
                            if (!declutteredFeatures || declutteredFeatures.indexOf(feature) !== -1) {
                                result = callback(feature);
                            }
                            if (result) {
                                return result;
                            } else {
                                context.clearRect(0, 0, contextSize, contextSize);
                                return undefined;
                            }
                        }
                    }
                }
            }
        }

        return this.replayHitDetection_(context, transform, rotation,
            skippedFeaturesHash, hitDetectionCallback, hitExtent, declutterReplays);
    }
    
     replayCustom(context, viewRotation, skippedFeaturesHash, opt_replayTypes, opt_declutterReplays, screenXY ) {
        /** @type {Array.<number>} */
        let zs = Object.keys(this.replaysByZIndex_).map(Number);
        zs.sort(ol.array.numberSafeCompareFunction);
        let replayTypes = opt_replayTypes ? opt_replayTypes : ORDER;
        let i, ii, j, jj, replays, replay;
        for (i = 0, ii = zs.length; i < ii; ++i) {
            let zIndexKey = zs[i].toString();
            replays = this.replaysByZIndex_[zIndexKey];
            for (j = 0, jj = replayTypes.length; j < jj; ++j) {
                let replayType = replayTypes[j];
                replay = replays[replayType];
                if (replay !== undefined) {
                    if (opt_declutterReplays &&
                        (replayType === ReplayType.IMAGE || replayType === ReplayType.TEXT)) {
                        let declutter = opt_declutterReplays[zIndexKey];
                        replay.tmpOptions = [];
                        if (!declutter) {
                            opt_declutterReplays[zIndexKey] = [replay, screenXY];
                        } else {
                            declutter.push(replay, screenXY);
                        }
                    } else {          
                        replay.replay(context, viewRotation, skippedFeaturesHash, screenXY);
                    }
                }
            }
        }
    }
   
    getReplayCustom(zIndex, replayType) {
        // if(replayType == "LineString"){
        //     debugger;
        // }
        let zIndexKey = zIndex !== undefined ? zIndex.toString() : "0";
        let replays = this.replaysByZIndex_[zIndexKey];
        if (replays === undefined) {
            replays = {};
            this.replaysByZIndex_[zIndexKey] = replays;
        }
        let replay = replays[replayType];
        if (replay === undefined) {
            let Constructor = this.BATCH_CONSTRUCTORS_[replayType];
            replay = new Constructor(this.tolerance_, this.maxExtent_, this.declutterTree);

            replays[replayType] = replay;
        }

        return replay;
    }

    
}

export default ReplayGroupCustom;
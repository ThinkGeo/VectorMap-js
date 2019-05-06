import { GeoImageReplay } from './geoImageRepaly';
import { GeoTextReplay } from './geoTextRepaly';
import { GeoPolygonReplay } from './geoPolygonRepaly';
import { GeoLineStringReplay } from './geoLineStringReplay';


export class ReplayGroupCustom extends ((<any>ol).render.webgl.ReplayGroup as { new(tolerance: number, maxExtent: any, opt_renderBuffer: number) }) {

    constructor(tolerance: number, maxExtent: any, opt_renderBuffer: number, declutterTree: any) {
        super(tolerance, maxExtent, opt_renderBuffer);
        this.getReplay = this.getReplayCustom;
        this.BATCH_CONSTRUCTORS_ = this.BATCH_CONSTRUCTORS_CUSTOM;
        this.replay = this.replayCustom;
        this.declutterTree = declutterTree;
    }

    public forEachFeatureAtCoordinate = function (
        coordinate, context, center, resolution, rotation, size, pixelRatio,
        opacity, skippedFeaturesHash,
        callback) {

        // FIXME: change the feature(ol.render.Feature) to ol.Feature
        if(this.replaysByZIndex_[0]){
            var featureFlag = this.replaysByZIndex_[0].Polygon || this.replaysByZIndex_[0].LineString;
            var startIndicesFeature = featureFlag && featureFlag.startIndicesFeature[0];
            if(!(startIndicesFeature instanceof ol.Feature)){
                return;
            }
        }

        var gl = context.getGL();
        gl.bindFramebuffer(
            gl.FRAMEBUFFER, context.getHitDetectionFramebuffer());

        /**
         * @type {ol.Extent}
         */
        var hitExtent;
        if (this.renderBuffer_ !== undefined) {
            // build an extent around the coordinate, so that only features that
            // intersect this extent are checked
            hitExtent = ol.extent.buffer(
                (<any>ol.extent).createOrUpdateFromCoordinate(coordinate),
                resolution * this.renderBuffer_);
        }

        return this.replayHitDetection_(context,
            coordinate, resolution, rotation, (<any>ol.render).webgl.ReplayGroup.HIT_DETECTION_SIZE_,
            pixelRatio, opacity, skippedFeaturesHash,
            /**
             * @param {ol.Feature|ol.render.Feature} feature Feature.
             * @return {?} Callback result.
             */
            function (feature) {
                var imageData = new Uint8Array(4);
                gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, imageData);

                if (imageData[3] > 0) {
                    var result = callback(feature);
                    if (result) {
                        return result;
                    }
                }
            }, true, hitExtent);
    }
    
    public replayCustom(context, center, resolution, rotation, size, pixelRatio, opacity, 
        skippedFeaturesHash, opt_declutterReplays, screenXY, lineStringReplayArray) {
        /** @type {Array.<number>} */
        let zs = Object.keys(this.replaysByZIndex_).map(Number);
        zs.sort((<any>ol).array.numberSafeCompareFunction);
        let replayTypes = (<any>ol.render).replay.ORDER;
        let i, ii, j, jj, replays, replay;

        for (i = 0, ii = zs.length; i < ii; ++i) {
            let zIndexKey = zs[i].toString();
            replays = this.replaysByZIndex_[zIndexKey];
            for (j = 0, jj = replayTypes.length; j < jj; ++j) {
                let replayType = replayTypes[j];
                replay = replays[replayType];
                if (replay !== undefined) {
                    if(screenXY && !Array.isArray(screenXY)){
                        screenXY = [screenXY, replay.origin[1]];
                    }
                    
                    if (opt_declutterReplays &&
                        (replayType === (<any>ol.render).ReplayType.IMAGE || replayType === (<any>ol.render).ReplayType.TEXT)) {
                        let declutter = opt_declutterReplays[zIndexKey];
                        replay.tmpOptions = [];
                        if (!declutter) {
                            opt_declutterReplays[zIndexKey] = [replay, screenXY];
                        } else {
                            declutter.push(replay, screenXY);
                        }
                    } else if(replayType == (<any>ol.render).ReplayType.POLYGON || !lineStringReplayArray) {          
                        replay.replay(context, center, resolution, rotation, size, pixelRatio, opacity,
                            skippedFeaturesHash, undefined, false, {}, screenXY);
                    }else{
                        lineStringReplayArray.push(replay, screenXY);
                    }
                }
            }
        }
    }
   
    public getReplayCustom(zIndex: any, replayType: any) {
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

    BATCH_CONSTRUCTORS_CUSTOM = {
        "Circle": (<any>ol.render).webgl.PolygonReplay,
        "Default": (<any>ol.render).webgl.Replay,
        "Image": GeoImageReplay,
        "LineString": GeoLineStringReplay,
        "Polygon": GeoPolygonReplay,
        "Text": GeoTextReplay
    };
}
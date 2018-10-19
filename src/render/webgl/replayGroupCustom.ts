// import { TextReplayCustom } from "./textReplayCustom";

export class ReplayGroupCustom extends ((<any>ol).render.webgl.ReplayGroup as { new(tolerance: number, maxExtent: any, opt_renderBuffer: number) }) {

    constructor(tolerance: number, maxExtent: any, opt_renderBuffer: number) {
        super(tolerance, maxExtent, opt_renderBuffer);
        this.getReplay = this.getReplayCustom;
        this.BATCH_CONSTRUCTORS_ = this.BATCH_CONSTRUCTORS_CUSTOM;
        this.replay = this.replayCustom;
        // this.forEachFeatureAtCoordinate = this.forEachFeatureAtCoordinateCustom;
    }

    public forEachFeatureAtCoordinateCustom(coordinate: any, resolution: number, rotation: number, hitTolerance: number, skippedFeaturesHash: any, callback: any, declutterReplays: any) {
        hitTolerance = Math.round(hitTolerance);
        let contextSize = hitTolerance * 2 + 1;
        let transform = (<any>ol).transform.compose(this.hitDetectionTransform_,
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
            hitExtent = ol.extent.createEmpty();
            (<any>ol.extent).extendCoordinate(hitExtent, coordinate);
            ol.extent.buffer(hitExtent, resolution * (this.renderBuffer_ + hitTolerance), hitExtent);
        }

        let mask = (<any>ol.render.canvas).ReplayGroup.getCircleArray_(hitTolerance);
        let declutteredFeatures;
        // if (this.declutterTree_) {
        //     declutteredFeatures = this.declutterTree_.all().map(function (entry) {
        //         return entry.value;
        //     });
        // }

        /**
         * @param {ol.Feature|ol.render.Feature} feature Feature.
         * @return {?} Callback result.
         */
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
    
    public replayCustom(context: CanvasRenderingContext2D, transform: any, viewRotation: number, skippedFeaturesHash: any, opt_replayTypes: any, opt_declutterReplays: any) {
        /** @type {Array.<number>} */
        let zs = Object.keys(this.replaysByZIndex_).map(Number);
        zs.sort((<any>ol).array.numberSafeCompareFunction);

        // setup clipping so that the parts of over-simplified geometries are not
        // visible outside the current extent when panning
        // context.save();
        // this.clip(context, transform);

        let replayTypes = opt_replayTypes ? opt_replayTypes : (<any>ol.render).replay.ORDER;
        let i, ii, j, jj, replays, replay;
        for (i = 0, ii = zs.length; i < ii; ++i) {
            let zIndexKey = zs[i].toString();
            replays = this.replaysByZIndex_[zIndexKey];
            for (j = 0, jj = replayTypes.length; j < jj; ++j) {
                let replayType = replayTypes[j];
                replay = replays[replayType];
                if (replay !== undefined) {
                    if (opt_declutterReplays &&
                        (replayType === (<any>ol.render).ReplayType.IMAGE || replayType === (<any>ol.render).ReplayType.TEXT)) {
                        let declutter = opt_declutterReplays[zIndexKey];
                        if (!declutter) {
                            opt_declutterReplays[zIndexKey] = [replay, transform.slice(0)];
                        } else {
                            declutter.push(replay, transform.slice(0));
                        }
                    } else {
                        replay.replay(context, transform, viewRotation, skippedFeaturesHash);
                    }
                }
            }
        }

        // context.restore();
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
            replay = new Constructor(this.tolerance_, this.maxExtent_, this.opt_renderBuffer);

            replays[replayType] = replay;
        }

        return replay;
    }

    BATCH_CONSTRUCTORS_CUSTOM = {
        "Circle": (<any>ol.render).webgl.PolygonReplay,
        "Default": (<any>ol.render).webgl.Replay,
        "Image": (<any>ol.render).webgl.ImageReplay,
        "LineString": (<any>ol.render).webgl.LineStringReplay,
        "Polygon": (<any>ol.render).webgl.PolygonReplay,
        "Text": (<any>ol.render).webgl.TextReplay
    };
}
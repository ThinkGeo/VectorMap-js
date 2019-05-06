
import { ReplayGroupCustom } from "../render/replayGroupCustom";
import { VecorRenderFeature } from "./geoVector";

export class GeoVectorLayerRender extends ol.renderer.webgl.VectorLayer{
    constructor(mapRenderer, layer) {
        super(mapRenderer, layer);
        this.declutterTree_ = layer.getDeclutter() ? ol.ext.rbush(9) : null;
        this.instructionsByZoom = {};
    }

    prepareFrame(frameState, layerState, context) {
        const vectorLayer = /** @type {import("../../layer/Vector.js").default} */ (this.getLayer());
        const vectorSource = /** @type {import("../../source/Vector.js").default} */ (vectorLayer.getSource());

        this.updateLogos(frameState, vectorSource);

        const animating = frameState.viewHints[ol.ViewHint.ANIMATING];
        const interacting = frameState.viewHints[ol.ViewHint.INTERACTING];
        const updateWhileAnimating = vectorLayer.getUpdateWhileAnimating();
        const updateWhileInteracting = vectorLayer.getUpdateWhileInteracting();

        if (!this.dirty_ && (!updateWhileAnimating && animating) ||
            (!updateWhileInteracting && interacting)) {
            return true;
        }

        const frameStateExtent = frameState.extent;
        const viewState = frameState.viewState;
        const projection = viewState.projection;
        const resolution = viewState.resolution;
        const pixelRatio = frameState.pixelRatio;
        const vectorLayerRevision = vectorLayer.getRevision();
        const vectorLayerRenderBuffer = vectorLayer.getRenderBuffer();
        let vectorLayerRenderOrder = vectorLayer.getRenderOrder();

        if (vectorLayerRenderOrder === undefined) {
            vectorLayerRenderOrder = ol.renderer.vector.defaultOrder;
        }

        const extent = ol.extent.buffer(frameStateExtent,
            vectorLayerRenderBuffer * resolution);
        const projectionExtent = viewState.projection.getExtent();

        if (vectorSource.getWrapX() && viewState.projection.canWrapX() &&
            !ol.extent.containsExtent(projectionExtent, frameState.extent)) {
            // For the replay group, we need an extent that intersects the real world
            // (-180° to +180°). To support geometries in a coordinate range from -540°
            // to +540°, we add at least 1 world width on each side of the projection
            // extent. If the viewport is wider than the world, we need to add half of
            // the viewport width to make sure we cover the whole viewport.
            const worldWidth = ol.extent.getWidth(projectionExtent);
            const gutter = Math.max(ol.extent.getWidth(extent) / 2, worldWidth);
            extent[0] = projectionExtent[0] - gutter;
            extent[2] = projectionExtent[2] + gutter;
        }

        if (!this.dirty_ &&
            this.renderedResolution_ == resolution &&
            this.renderedRevision_ == vectorLayerRevision &&
            this.renderedRenderOrder_ == vectorLayerRenderOrder &&
            ol.extent.containsExtent(this.renderedExtent_, extent)) {
            // this.replayGroupChanged = false;
            return true;
        }

        if (this.replayGroup_) {
            frameState.postRenderFunctions.push(
                this.replayGroup_.getDeleteResourcesFunction(context));
        }

        // this.replayGroup_ = null;

        this.dirty_ = false;

        const replayGroup = new ReplayGroupCustom(
            ol.renderer.vector.getTolerance(resolution, pixelRatio), 
            extent, vectorLayer.getRenderBuffer(), this.declutterTree_);
        vectorSource.loadFeatures(extent, resolution, projection);
        let strategyTree = ol.ext.rbush(9);
        
        const render = function (feature, geostyle) {
            let styles;
            if (geostyle) {
                let ol4Styles = geostyle.getStyles(feature, resolution, { frameState: frameState, strategyTree: strategyTree });
                if (styles === undefined) {
                    styles = [];
                }
                Array.prototype.push.apply(styles, ol4Styles);
            }
            else {
                const styleFunction = feature.getStyleFunction() || vectorLayer.getStyleFunction();
                if (styleFunction) {
                    styles = styleFunction(feature, resolution);
                }
            }
            if (styles) {
                let squaredTolerance = ol.renderer.vector.getSquaredTolerance(resolution, pixelRatio);
                const dirty = this.renderFeature(feature, squaredTolerance, styles, replayGroup);
                this.dirty_ = this.dirty_ || dirty;
            }
        }.bind(this);

        if (vectorLayerRenderOrder) {
            const features = {};

            // Get drawing features
            vectorSource.forEachFeatureInExtent(extent,               
                function (feature) {
                    features[ol.getUid(feature)] = feature;
                });

            if (vectorSource.defaultStyle) {
                for(let featureId in features)
                {
                    render(features[featureId]);
                }
            }
            else {
                // Get drawing instructions for drawing features;
                let drawinginstructions = this.getDrawingInstructions(features, Math.round(frameState.viewState.zoom));
                for (let i = 0, ii = drawinginstructions.length; i < ii; ++i) {
                    drawinginstructions[i][0].coordinateToPixelTransform = frameState.coordinateToPixelTransform;
                    drawinginstructions[i][0].center = frameState.viewState.center;
                    drawinginstructions[i][0].resolution = resolution;
                    render(drawinginstructions[i][0], drawinginstructions[i][1]);
                }
            }
        } else {
            vectorSource.forEachFeatureInExtent(extent, render, this);
        }

        replayGroup.finish(context);

        this.renderedResolution_ = resolution;
        this.renderedRevision_ = vectorLayerRevision;
        this.renderedRenderOrder_ = vectorLayerRenderOrder;
        this.renderedExtent_ = extent;
        this.replayGroup_ = replayGroup;

        // this.replayGroupChanged = true;
        return true;
    }

    renderFeature(feature, squaredTolerance, styles, replayGroup) {
        if (!styles) {
            return false;
        }
        var loading = false;
        if (Array.isArray(styles)) {
            for (var i = 0, ii = styles.length; i < ii; ++i) {
                loading = VecorRenderFeature(
                    replayGroup, feature, styles[i], squaredTolerance,
                    this.handleStyleImageChange_, this, undefined) || loading;
            }
        } else {
            loading = VecorRenderFeature(
                replayGroup, feature, styles, squaredTolerance,
                this.handleStyleImageChange_, this, undefined);
        }
        return loading;
    }

    composeFrame(frameState, layerState, context) {
        this.layerState_ = layerState;
        var viewState = frameState.viewState;
        var replayGroup = this.replayGroup_;
        var size = frameState.size;
        var center = viewState.center;
        var resolution = viewState.resolution;
        var rotation = viewState.rotation;
        var opacity = layerState.opacity;
        var pixelRatio = frameState.pixelRatio;
        var gl = this.mapRenderer.getGL();
        var vectorSource = /** @type {ol.source.Vector} */ (this.getLayer().getSource());
        var projection = viewState.projection;
        var projectionExtent = projection.getExtent();
        var extent = frameState.extent;
        let layer = this.getLayer();
        let declutterReplays = layer.getDeclutter() ? {} : null;
        context.frameState = frameState;
        
        gl.enable(gl.DEPTH_TEST);
        
        if(declutterReplays){
            this.declutterTree_.clear();
        }

        if (replayGroup && !replayGroup.isEmpty()) {
            gl.enable(gl.SCISSOR_TEST);
            gl.scissor(0, 0, size[0] * pixelRatio, size[1] * pixelRatio);
            replayGroup.replay(context, center, resolution, rotation, size, pixelRatio, 
                opacity, layerState.managed ? frameState.skippedFeatureUids : {}, declutterReplays);
            gl.disable(gl.SCISSOR_TEST);
        }

        // wrapX
        if (vectorSource.getWrapX() && projection.canWrapX() &&
            !ol.extent.containsExtent(projectionExtent, extent)) {
            var startX = extent[0];
            var worldWidth = ol.extent.getWidth(projectionExtent);
            var world = 0;
            var offsetX;
            while (startX < projectionExtent[0]) {
                --world;
                offsetX = worldWidth * world;
                // transform = this.getTransform(frameState, offsetX);
                replayGroup.replay(context, center, resolution, rotation, size, pixelRatio, 
                    opacity, layerState.managed ? frameState.skippedFeatureUids : {}, declutterReplays, offsetX);
                // replayGroup.replay(replayContext, transform, rotation, skippedFeatureUids);
                startX += worldWidth;
            }
            world = 0;
            startX = extent[2];
            while (startX > projectionExtent[2]) {
                ++world;
                offsetX = worldWidth * world;
                // transform = this.getTransform(frameState, offsetX);
                replayGroup.replay(context, center, resolution, rotation, size, pixelRatio, 
                    opacity, layerState.managed ? frameState.skippedFeatureUids : {}, declutterReplays, offsetX);
                // replayGroup.replay(replayContext, transform, rotation, skippedFeatureUids);
                startX -= worldWidth;
            }
        }

        if (declutterReplays) {
            this.replayDeclutter(declutterReplays, context, center, resolution, rotation, size, pixelRatio,
                opacity, {}, undefined, false, {});
        }

        gl.disable(gl.DEPTH_TEST);
    }

    replayDeclutter(declutterReplays, context, center, resolution, rotation, size, pixelRatio, 
        opacity, skippedFeaturesHash, featureCallback, oneByOne, opt_hitExtent) {
        
        var zs = Object.keys(declutterReplays).map(Number).sort(ol.array.numberSafeCompareFunction);
        for (var z = 0, zz = zs.length; z < zz; ++z) {
            var replayData = declutterReplays[zs[z].toString()];
            for (var i = 0, ii = replayData.length; i < ii;) {
                var replay = replayData[i++];                
                var screenXY = replayData[i++];
                replay.declutterRepeat_(context, screenXY);
            }
        }        

        // draw
        for (var z = 0, zz = zs.length; z < zz; ++z) {
            var replayData = declutterReplays[zs[z].toString()];
            for (var i = 0, ii = replayData.length; i < ii;) {
                var replay = replayData[i++];                
                var screenXY = replayData[i++];
                var tmpOptions = replay.tmpOptions;   
                                     
                replay.indices.length = 0;
                replay.vertices.length = 0;
                replay.groupIndices.length = 0;
                
                for(var k = 0; k < tmpOptions.length; k++){
                    if(replay instanceof ol.render.webgl.TextReplay){
                        replay.drawText(tmpOptions[k]);
                    }else if(replay instanceof ol.render.webgl.ImageReplay){
                        replay.drawPoint(tmpOptions[k]);
                    }
                }
                replay.finish(context);
               
                replay.replay(context, center, resolution, rotation, size, pixelRatio, opacity,
                    skippedFeaturesHash, featureCallback, oneByOne, opt_hitExtent, screenXY);
            }
        }
    }

    getDrawingInstructions(features, zoom) {
        let drawinginstructions = [];
        let zoomedInstructions = this.getInstructionsByZoom(zoom);
        for (let i = 0; i < zoomedInstructions.length; i++) {
            let instruct = zoomedInstructions[i];
            let featureUid = instruct[0];

            if (features[featureUid]) {
                drawinginstructions.push([features[featureUid], instruct[1]]);
            }
        }
        return drawinginstructions;
    }

    getInstructionsByZoom(zoom) {
        let zoomedInstructions = this.instructionsByZoom[zoom];
        if (zoomedInstructions === undefined || !zoomedInstructions.length) {
            zoomedInstructions = this.createInstructions(zoom);
        }
        return zoomedInstructions;
    }

    createInstructions(zoom) {
        let instructs = [];
        const vectorLayer = /** @type {import("../../layer/Vector.js").default} */ (this.getLayer());
        const vectorSource = /** @type {import("../../source/Vector.js").default} */ (vectorLayer.getSource());
        if (vectorSource.loading) {
            return instructs;
        }
        const cacheTrees = vectorLayer.styleJsonCache.geoStyleGroupByZoom[Math.round(zoom)].undefined;
        let instructsCache = [];
        let features = [];
        if (cacheTrees && cacheTrees.length > 0) {
            let features = vectorSource.getFeatures();
            for (let i = 0; i < features.length; i++) {
                let feature = features[i];;

                for (let j = 0; j < cacheTrees.length; j++) {
                    let cacheTree = cacheTrees[j];
                    let treeIndex = cacheTree.treeIndex;
                    if (instructsCache[treeIndex] === undefined) {
                        instructsCache[treeIndex] = {
                            min: 10,
                            max: -10
                        };
                    }
                    let matchedNode;

                    let checkNodeMatched = function (node) {
                        let styleJsonCacheItem = node.data;
                        let matched = false;
                        if (styleJsonCacheItem.filterGroup.length > 0) {
                            for (let i = 0; i < styleJsonCacheItem.filterGroup.length; i++) {
                                let filters = styleJsonCacheItem.filterGroup[i];
                                let groupMatched = true;
                                for (let j = 0; j < filters.length; j++) {
                                    let filter = filters[j];
                                    if (!filter.matchOLFeature(feature, zoom)) {
                                        groupMatched = false;
                                        break;
                                    }
                                }
                                if (groupMatched) {
                                    matched = true;
                                    break;
                                }
                            }
                        }
                        else {
                            matched = true;
                        }

                        return matched;
                    };
                    let selectNode = function (node) {
                        matchedNode = node.data;
                    };
                    cacheTree.traverseNode(checkNodeMatched, selectNode);
                    if (matchedNode) {
                        let zindex;

                        if (cacheTree.root.data.zIndex) {
                            zindex = feature.properties_[cacheTree.root.data.zIndex];
                        }
                        if (isNaN(zindex)) {
                            zindex = 0;
                        }
                        if (instructsCache[treeIndex][zindex] === undefined) {
                            instructsCache[treeIndex][zindex] = [];
                            if (zindex < instructsCache[treeIndex]["min"]) {
                                instructsCache[treeIndex]["min"] = zindex;
                            }
                            if (zindex > instructsCache[treeIndex]["max"]) {
                                instructsCache[treeIndex]["max"] = zindex;
                            }
                        }

                        instructsCache[treeIndex][zindex].push([ol.getUid(feature).toString(), matchedNode]);
                    }
                }
            }
        }

        for (let i = 0; i < instructsCache.length; i++) {
            let instructsInOneTree = instructsCache[i];
            if (instructsInOneTree) {
                for (let j = instructsInOneTree.min, jj = instructsInOneTree.max; j <= jj; j++) {
                    let instructsInOneZIndex = instructsInOneTree[j];
                    if (instructsInOneZIndex) {
                        let childrenInstructs = [];
                        for (let h = 0; h < instructsInOneZIndex.length; h++) {
                            let instruct = instructsInOneZIndex[h];
                            if (instruct[1].geoStyle) {
                                instructs.push([instruct[0], instruct[1].geoStyle, i]);
                            }
                            if (instruct[1].childrenGeoStyles) {
                                for (let k = 0; k < instruct[1].childrenGeoStyles.length; k++) {
                                    childrenInstructs.push([instruct[0], instruct[1].childrenGeoStyles[k], i]);
                                }
                            }
                        }
                        Array.prototype.push.apply(instructs, childrenInstructs);
                    }
                }
            }
        }

        this.instructionsByZoom[zoom] = instructs;
        return instructs;
    }
}

GeoVectorLayerRender['handles'] = function(type, layer) {
    return type === ol.renderer.Type.WEBGL && layer.getType() === ol.LayerType.GEOVECTOR;;
}

GeoVectorLayerRender['create'] = function(mapRenderer, layer) {
    return new GeoVectorLayerRender(mapRenderer, layer);
}

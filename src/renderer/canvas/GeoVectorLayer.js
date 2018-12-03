import CanvasVectorLayerRenderer from "./VectorLayer";
import LayerType from 'ol/LayerType';
import { containsExtent, buffer, containsCoordinate, equals, getIntersection, getTopLeft, intersects, isEmpty, returnOrUpdate, getWidth } from 'ol/extent';
import { getUid } from 'ol/util.js';
import ViewHint from 'ol/ViewHint.js';
import EventType from 'ol/events/EventType.js';
import GeoCanvasReplayGroup from '../../render/canvas/GeoReplayGroup';
import { defaultOrder as defaultRenderOrder, getTolerance as getRenderTolerance } from 'ol/renderer/vector.js';
import rbush from 'rbush';
import CanvasLayerRenderer from './Layer';

class GeoCanvasVectorLayerRenderer extends CanvasVectorLayerRenderer {
    constructor(layer) {
        super(layer);
        this.instructionsByZoom = {};
    }

    prepareFrame(frameState, layerState) {
        const vectorLayer = /** @type {import("../../layer/Vector.js").default} */ (this.getLayer());
        const vectorSource = /** @type {import("../../source/Vector.js").default} */ (vectorLayer.getSource());

        const animating = frameState.viewHints[ViewHint.ANIMATING];
        const interacting = frameState.viewHints[ViewHint.INTERACTING];
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
            vectorLayerRenderOrder = defaultRenderOrder;
        }

        const extent = buffer(frameStateExtent,
            vectorLayerRenderBuffer * resolution);
        const projectionExtent = viewState.projection.getExtent();

        if (vectorSource.getWrapX() && viewState.projection.canWrapX() &&
            !containsExtent(projectionExtent, frameState.extent)) {
            // For the replay group, we need an extent that intersects the real world
            // (-180° to +180°). To support geometries in a coordinate range from -540°
            // to +540°, we add at least 1 world width on each side of the projection
            // extent. If the viewport is wider than the world, we need to add half of
            // the viewport width to make sure we cover the whole viewport.
            const worldWidth = getWidth(projectionExtent);
            const gutter = Math.max(getWidth(extent) / 2, worldWidth);
            extent[0] = projectionExtent[0] - gutter;
            extent[2] = projectionExtent[2] + gutter;
        }

        if (!this.dirty_ &&
            this.renderedResolution_ == resolution &&
            this.renderedRevision_ == vectorLayerRevision &&
            this.renderedRenderOrder_ == vectorLayerRenderOrder &&
            containsExtent(this.renderedExtent_, extent)) {
            this.replayGroupChanged = false;
            return true;
        }

        this.replayGroup_ = null;

        this.dirty_ = false;

        const replayGroup = new GeoCanvasReplayGroup(
            getRenderTolerance(resolution, pixelRatio), extent, resolution,
            pixelRatio, vectorSource.getOverlaps(), this.declutterTree_, vectorLayer.getRenderBuffer());
        vectorSource.loadFeatures(extent, resolution, projection);
        let strategyTree = rbush(9);
        /**
         * @param {import("../../Feature.js").default} feature Feature.
         * @this {CanvasVectorLayerRenderer}
         */
        const render = function (feature, geostyle) {
            let styles;
            if (geostyle) {
                let ol4Styles = geostyle.getStyles(feature, resolution, { frameState: frameState, strategyTree, strategyTree });
                if (styles === undefined) {
                    styles = [];
                }
                Array.prototype.push.apply(styles, ol4Styles);
            }
            if (styles) {
                const dirty = this.renderFeature(
                    feature, resolution, pixelRatio, styles, replayGroup);
                this.dirty_ = this.dirty_ || dirty;
            }
        }.bind(this);
        if (vectorLayerRenderOrder) {
            /** @type {Array<import("../../Feature.js").default>} */
            const features = {};

            // Get drawing features
            vectorSource.forEachFeatureInExtent(extent,
                /**
                 * @param {import("../../Feature.js").default} feature Feature.
                 */
                function (feature) {
                    features[getUid(feature)] = feature;
                });

            // Get drawing instructions for drawing features;
            let drawinginstructions = this.getDrawingInstructions(features, Math.round(frameState.viewState.zoom));

            for (let i = 0, ii = drawinginstructions.length; i < ii; ++i) {
                render(drawinginstructions[i][0], drawinginstructions[i][1]);
            }
        } else {
            vectorSource.forEachFeatureInExtent(extent, render);
        }
        replayGroup.finish();

        this.renderedResolution_ = resolution;
        this.renderedRevision_ = vectorLayerRevision;
        this.renderedRenderOrder_ = vectorLayerRenderOrder;
        this.renderedExtent_ = extent;
        this.replayGroup_ = replayGroup;

        this.replayGroupChanged = true;
        return true;
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
        if (zoomedInstructions === undefined) {
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

                        instructsCache[treeIndex][zindex].push([getUid(feature).toString(), matchedNode]);
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

GeoCanvasVectorLayerRenderer['handles'] = function (layer) {
    return layer.getType() === LayerType.GEOVECTOR;
};

GeoCanvasVectorLayerRenderer['create'] = function (mapRenderer, layer) {
    return new GeoCanvasVectorLayerRenderer(/** @type {import("../../layer/VectorTile.js").default} */(layer));
};

export default GeoCanvasVectorLayerRenderer

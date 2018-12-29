import { getUid } from '../../ol/util';
import CanvasVectorTileLayerRenderer from './VectorTileLayer';
import LayerType from '../../ol/LayerType';
import { containsExtent, buffer, containsCoordinate, equals, getIntersection, getTopLeft, intersects, isEmpty } from '../../ol/extent';
import ViewHint from '../../ol/ViewHint';
import TileState from '../../ol/TileState';
import { equivalent as equivalentProjection } from '../../ol/proj';
import { replayDeclutter } from '../../ol/render/canvas/ReplayGroup';
import RenderEventType from '../../ol/render/EventType';
import { createCanvasContext2D } from '../../ol/dom';
import GeoCanvasReplayGroup from '../../render/canvas/GeoReplayGroup';
import { getSquaredTolerance as getSquaredRenderTolerance, renderFeature } from '../vector';
import Units from '../../ol/proj/Units';
import VectorTileRenderType from '../../ol/layer/VectorTileRenderType';
import rbush from 'rbush';
import ReplayType from '../../ol/render/ReplayType';
import {
    compose as composeTransform,
    reset as resetTransform,
    scale as scaleTransform,
    translate as translateTransform
} from '../../ol/transform.js';
import RenderFeature from '../../ol/render/Feature';
import { listen } from '../../ol/events';
import Instruction from '../../ol/render/canvas/Instruction';
import { ORDER } from '../../ol/render/replay';
import { format } from '../../ol/coordinate';
import EventType from '../../ol/events/EventType';

const IMAGE_REPLAYS = {
    'image': [ReplayType.POLYGON, ReplayType.CIRCLE,
    ReplayType.LINE_STRING, ReplayType.IMAGE, ReplayType.TEXT],
    'hybrid': [ReplayType.POLYGON, ReplayType.LINE_STRING]
};

const VECTOR_REPLAYS = {
    'image': [ReplayType.DEFAULT],
    'hybrid': [ReplayType.IMAGE, ReplayType.TEXT, ReplayType.DEFAULT],
    'vector': ORDER
};

class GeoCanvasVectorTileLayerRenderer extends CanvasVectorTileLayerRenderer {
    constructor(layer) {
        super(layer);
    }

    prepareFrame(frameState, layerState) {
        const layer = /** @type {import("../../layer/Vector.js").default} */ (this.getLayer());
        const layerRevision = layer.getRevision();
        if (this.renderedLayerRevision_ != layerRevision) {
            this.renderedTiles.length = 0;
            const renderMode = layer.getRenderMode();
            if (!this.context && renderMode != VectorTileRenderType.VECTOR) {
                this.context = createCanvasContext2D();
            }
            if (this.context && renderMode == VectorTileRenderType.VECTOR) {
                this.context = null;
            }
        }
        this.renderedLayerRevision_ = layerRevision;
        const pixelRatio = frameState.pixelRatio;
        const size = frameState.size;
        const viewState = frameState.viewState;
        const projection = viewState.projection;
        const viewResolution = viewState.resolution;
        const viewCenter = viewState.center;

        const tileLayer = /** @type {import("../../layer/Tile.js").default} */ (this.getLayer());
        const tileSource = /** @type {import("../../source/Tile.js").default} */ (tileLayer.getSource());
        const sourceRevision = tileSource.getRevision();
        const tileGrid = tileSource.getTileGridForProjection(projection);
        const z = tileGrid.getZForResolution(viewResolution, this.zDirection);
        const tileResolution = tileGrid.getResolution(z);
        let oversampling = Math.round(viewResolution / tileResolution) || 1;
        let extent = frameState.extent;

        if (layerState.extent !== undefined) {
            extent = getIntersection(extent, layerState.extent);
        }
        if (isEmpty(extent)) {
            // Return false to prevent the rendering of the layer.
            return false;
        }

        const tileRange = tileGrid.getTileRangeForExtentAndZ(extent, z);
        const imageExtent = tileGrid.getTileRangeExtent(z, tileRange);

        const tilePixelRatio = tileSource.getTilePixelRatio(pixelRatio);

        /**
         * @type {Object<number, Object<string, import("../../Tile.js").default>>}
         */
        const tilesToDrawByZ = {};
        tilesToDrawByZ[z] = {};

        const findLoadedTiles = this.createLoadedTileFinder(
            tileSource, projection, tilesToDrawByZ, tileLayer);

        const hints = frameState.viewHints;
        const animatingOrInteracting = hints[ViewHint.ANIMATING] || hints[ViewHint.INTERACTING];

        const tmpExtent = this.tmpExtent;
        const tmpTileRange = this.tmpTileRange_;
        this.newTiles_ = false;
        let tile, x, y;
        for (x = tileRange.minX; x <= tileRange.maxX; ++x) {
            for (y = tileRange.minY; y <= tileRange.maxY; ++y) {
                if (Date.now() - frameState.time > 16 && animatingOrInteracting) {
                    continue;
                }
                tile = this.getTile(z, x, y, pixelRatio, projection, frameState);

                // for cancel.
                tile.tileRange = tileRange;

                if (this.isTileToDraw_(tile)) {
                    const uid = getUid(this);
                    if (tile.getState() == TileState.LOADED) {
                        tilesToDrawByZ[z][tile.tileCoord.toString()] = tile;
                        const inTransition = tile.inTransition(uid);
                        if (!this.newTiles_ && (inTransition || this.renderedTiles.indexOf(tile) === -1)) {
                            this.newTiles_ = true;
                        }
                    }
                    if (tile.getAlpha(uid, frameState.time) === 1) {
                        // don't look for alt tiles if alpha is 1
                        continue;
                    }
                }

                const childTileRange = tileGrid.getTileCoordChildTileRange(
                    tile.tileCoord, tmpTileRange, tmpExtent);
                let covered = false;
                if (childTileRange) {
                    covered = findLoadedTiles(z + 1, childTileRange);
                }
                if (!covered) {
                    tileGrid.forEachTileCoordParentTileRange(
                        tile.tileCoord, findLoadedTiles, null, tmpTileRange, tmpExtent);
                }
            }
        }

        const renderedResolution = tileResolution * pixelRatio / tilePixelRatio * oversampling;
        if (!(this.renderedResolution && Date.now() - frameState.time > 16 && animatingOrInteracting) && (
            this.newTiles_ ||
            !(this.renderedExtent_ && containsExtent(this.renderedExtent_, extent)) ||
            this.renderedRevision != sourceRevision ||
            oversampling != this.oversampling_ ||
            !animatingOrInteracting && renderedResolution != this.renderedResolution
        )) {
            const context = this.context;
            if (context) {
                const tilePixelSize = tileSource.getTilePixelSize(z, pixelRatio, projection);
                const width = Math.round(tileRange.getWidth() * tilePixelSize[0] / oversampling);
                const height = Math.round(tileRange.getHeight() * tilePixelSize[1] / oversampling);
                const canvas = context.canvas;
                if (canvas.width != width || canvas.height != height) {
                    this.oversampling_ = oversampling;
                    canvas.width = width;
                    canvas.height = height;
                } else {
                    if (this.renderedExtent_ && !equals(imageExtent, this.renderedExtent_)) {
                        context.clearRect(0, 0, width, height);
                    }
                    oversampling = this.oversampling_;
                }
                var canvasSize = document.getElementById("canvasSize");
                if (canvasSize) {
                    canvasSize.innerHTML = width + "|" + height + "<br/>:tilePixelSize" + tilePixelSize + ",oversampling:" + oversampling + "<br/>tileRangeW:" + tileRange.getWidth() + ",tileRangeH" + tileRange.getHeight()
                }
            }

            this.renderedTiles.length = 0;
            /** @type {Array<number>} */
            const zs = Object.keys(tilesToDrawByZ).map(Number);
            zs.sort(function (a, b) {
                if (a === z) {
                    return 1;
                } else if (b === z) {
                    return -1;
                } else {
                    return a > b ? 1 : a < b ? -1 : 0;
                }
            });
            let currentResolution, currentScale, currentTilePixelSize, currentZ, i, ii;
            let tileExtent, tileGutter, tilesToDraw, w, h;
            for (i = 0, ii = zs.length; i < ii; ++i) {
                currentZ = zs[i];
                currentTilePixelSize = tileSource.getTilePixelSize(currentZ, pixelRatio, projection);
                currentResolution = tileGrid.getResolution(currentZ);
                currentScale = currentResolution / tileResolution;
                tileGutter = tilePixelRatio * tileSource.getGutterForProjection(projection);
                tilesToDraw = tilesToDrawByZ[currentZ];
                for (const tileCoordKey in tilesToDraw) {
                    tile = tilesToDraw[tileCoordKey];
                    tileExtent = tileGrid.getTileCoordExtent(tile.getTileCoord(), tmpExtent);
                    x = (tileExtent[0] - imageExtent[0]) / tileResolution * tilePixelRatio / oversampling;
                    y = (imageExtent[3] - tileExtent[3]) / tileResolution * tilePixelRatio / oversampling;
                    w = currentTilePixelSize[0] * currentScale / oversampling;
                    h = currentTilePixelSize[1] * currentScale / oversampling;

                    this.drawTileImage(tile, frameState, layerState, x, y, w, h, tileGutter, z === currentZ);
                    this.renderedTiles.push(tile);
                }
            }

            this.renderedRevision = sourceRevision;
            this.renderedResolution = tileResolution * pixelRatio / tilePixelRatio * oversampling;
            this.renderedExtent_ = imageExtent;
        }

        const scale = this.renderedResolution / viewResolution;
        const transform = composeTransform(this.imageTransform_,
            pixelRatio * size[0] / 2, pixelRatio * size[1] / 2,
            scale, scale,
            0,
            (this.renderedExtent_[0] - viewCenter[0]) / this.renderedResolution * pixelRatio,
            (viewCenter[1] - this.renderedExtent_[3]) / this.renderedResolution * pixelRatio);
        composeTransform(this.coordinateToCanvasPixelTransform,
            pixelRatio * size[0] / 2 - transform[4], pixelRatio * size[1] / 2 - transform[5],
            pixelRatio / viewResolution, -pixelRatio / viewResolution,
            0,
            -viewCenter[0], -viewCenter[1]);

        this.updateUsedTiles(frameState.usedTiles, tileSource, z, tileRange);
        this.manageTilePyramid(frameState, tileSource, tileGrid, pixelRatio,
            projection, extent, z, tileLayer.getPreload());
        this.scheduleExpireCache(frameState, tileSource);

        return this.renderedTiles.length > 0;
    }

    renderTileImage_(tile, pixelRatio, projection) {
        const layer = /** @type {import("../../layer/Vector.js").default} */ (this.getLayer());
        const replayState = tile.getReplayState(layer);
        const revision = layer.getRevision();
        const replays = IMAGE_REPLAYS[layer.getRenderMode()];
        // Add a condition: the replayGroup has been created.
        if (replays && replayState.renderedTileRevision !== revision && replayState.replayGroupCreated) {

            replayState.renderedTileRevision = revision;
            const tileCoord = tile.wrappedTileCoord;
            const z = tileCoord[0];
            const source = /** @type {import("../../source/VectorTile.js").default} */ (layer.getSource());
            const tileGrid = source.getTileGridForProjection(projection);
            const resolution = tileGrid.getResolution(z);
            const context = tile.getContext(layer);
            const size = source.getTilePixelSize(z, pixelRatio, projection);
            context.canvas.width = size[0];
            context.canvas.height = size[1];
            const tileExtent = tileGrid.getTileCoordExtent(tileCoord, this.tmpExtent);
            if (layer.background) {
                context.rect(0, 0, size[0], size[1]);
                context.fillStyle = layer.background;
                context.fill();
            }
            for (let i = 0, ii = tile.tileKeys.length; i < ii; ++i) {
                const sourceTile = tile.getTile(tile.tileKeys[i]);
                if (sourceTile.getState() != TileState.LOADED) {
                    continue;
                }
                const pixelScale = pixelRatio / resolution;
                const transform = resetTransform(this.tmpTransform_);
                scaleTransform(transform, pixelScale, -pixelScale);
                translateTransform(transform, -tileExtent[0], -tileExtent[3]);
                const replayGroup = /** @type {CanvasReplayGroup} */ (sourceTile.getReplayGroup(layer,
                    tile.tileCoord.toString()));
                replayGroup.replay(context, transform, 0, {}, true, replays);
            }
        }
    }

    getTile(z, x, y, pixelRatio, projection, frameState) {
        const tile = this.getTileSuper(z, x, y, pixelRatio, projection);
        if (tile.getState() === TileState.LOADED) {
            this.createReplayGroup_(/** @type {import("../../VectorImageTile.js").default} */(tile), pixelRatio, projection, frameState);
            if (this.context) {
                this.renderTileImage_(/** @type {import("../../VectorImageTile.js").default} */(tile), pixelRatio, projection);
            }
        }

        let drawingTile = this.getDrawingTile(tile, pixelRatio, projection, frameState);

        return drawingTile;
    }

    getTileSuper(z, x, y, pixelRatio, projection) {
        const tileLayer = /** @type {import("../../layer/Tile.js").default} */ (this.getLayer());
        const tileSource = /** @type {import("../../source/Tile.js").default} */ (tileLayer.getSource());
        let tile = tileSource.getTile(z, x, y, pixelRatio, projection);
        if (tile.getState() == TileState.ERROR) {
            if (!tileLayer.getUseInterimTilesOnError()) {
                // When useInterimTilesOnError is false, we consider the error tile as loaded.
                tile.setState(TileState.LOADED);
            } else if (tileLayer.getPreload() > 0) {
                // Preloaded tiles for lower resolutions might have finished loading.
                this.newTiles_ = true;
            }
        }
        return tile;
    }

    getDrawingTile(tile, pixelRatio, projection, frameState) {
        if (!this.isTileToDraw_(tile)) {
            tile = tile.getInterimTile();
            if (tile.getState() === TileState.LOADED) {
                this.createReplayGroup_(/** @type {import("../../VectorImageTile.js").default} */(tile), pixelRatio, projection, frameState, true);
                if (this.context) {
                    this.renderTileImage_(/** @type {import("../../VectorImageTile.js").default} */(tile), pixelRatio, projection);
                }
            }
        }
        else {
            const tileState = tile.getState();
            if (tileState == TileState.LOADED && tile.interimTile !== null) {
                tile.interimTile.dispose();
                tile.interimTile = null;
            }
        }
        return tile;
    }

    createReplayGroup_(tile, pixelRatio, projection, frameState, isInterim) {
        const layer = /** @type {import("../../layer/Vector.js").default} */ (this.getLayer());
        const revision = layer.getRevision();
        const renderOrder = /** @type {import("../../render.js").OrderFunction} */ (layer.getRenderOrder()) || null;

        const replayState = tile.getReplayState(layer);
        if (!replayState.dirty && replayState.renderedRevision == revision &&
            replayState.renderedRenderOrder == renderOrder) {
            return;
        }
        const source = /** @type {import("../../source/VectorTile.js").default} */ (layer.getSource());
        const sourceTileGrid = source.getTileGrid();
        const tileGrid = source.getTileGridForProjection(projection);
        const resolution = tileGrid.getResolution(tile.tileCoord[0]);
        const tileExtent = tile.extent;

        const zIndexKeys = {};
        for (let t = 0, tt = tile.tileKeys.length; t < tt; ++t) {
            const sourceTile = tile.getTile(tile.tileKeys[t]);
            if (sourceTile.getState() != TileState.LOADED) {
                continue;
            }

            const wrappedTileCoord = tile.wrappedTileCoord;
            const wrappedReplayGroup = sourceTile.getReplayGroup(layer, wrappedTileCoord.toString());
            if (!isInterim && wrappedReplayGroup && wrappedTileCoord.toString() === sourceTile.tileCoord.toString()) {
                sourceTile.setReplayGroup(layer, tile.tileCoord.toString(), wrappedReplayGroup);
                replayState.replayGroupCreated = true;
                tile["replayCreated"] = true;
            }
            else {
                const sourceTileCoord = sourceTile.tileCoord;
                const requestCoord = sourceTile.requestCoord;

                var sourceTileExtent = sourceTileGrid.getTileCoordExtent(requestCoord);
                var sharedExtent = getIntersection(tileExtent, sourceTileExtent);
                var bufferedExtent = equals(sourceTileExtent, sharedExtent) ? null :
                    buffer(sharedExtent, layer.getRenderBuffer() * resolution, this.tmpExtent);

                const tileProjection = sourceTile.getProjection();
                let reproject = false;

                replayState.dirty = false;
                const replayGroup = new GeoCanvasReplayGroup(0, sharedExtent, resolution,
                    pixelRatio, source.getOverlaps(), this.declutterTree_, layer.getRenderBuffer());
                let replayGroupInfo = [0, sharedExtent, resolution, pixelRatio, source.getOverlaps(), this.declutterTree_, layer.getRenderBuffer()];

                const squaredTolerance = getSquaredRenderTolerance(resolution, pixelRatio);
                let strategyTree = rbush(9);

                /**
                 * @param {import("../../Feature.js").FeatureLike} feature Feature.
                 * @this {CanvasVectorTileLayerRenderer}
                 */
                const render = function (feature, geostyle) {
                    let styles;
                    if (geostyle) {
                        let ol4Styles = geostyle.getStyles(feature, resolution, { frameState: frameState, strategyTree, strategyTree });
                        if (ol4Styles) {
                            if (styles === undefined) {
                                styles = [];
                            }
                            try {
                                Array.prototype.push.apply(styles, ol4Styles);
                            }
                            catch (exx) {
                                debugger;
                            }
                        }
                    }
                    else {
                        const styleFunction = feature.getStyleFunction() || layer.getStyleFunction();
                        if (styleFunction) {
                            styles = styleFunction(feature, resolution);
                        }
                    }

                    if (styles) {
                        const dirty = this.renderFeature(feature, squaredTolerance, styles, replayGroup);
                        this.dirty_ = this.dirty_ || dirty;
                        replayState.dirty = replayState.dirty || dirty;
                    }
                };

                var workerManager = source.getWorkerManager();
                if (workerManager) {
                    let rendererSelf = this;
                    let geoStyles = source.getGeoFormat().styleJsonCache.geoStyles;
                    let createReplayGroupCallback = function (data, methodInfo) {
                        if (!equivalentProjection(projection, tileProjection)) {
                            reproject = true;
                        }
                        let replaysByZIndex = data["replays"];
                        let featuresInfo = data["features"];
                        let mainDrawingInstructs = data["mainDrawingInstructs"];

                        let features = {};
                        for (let featureId in featuresInfo) {
                            let featureInfo = featuresInfo[featureId];
                            let feature = new RenderFeature(featureInfo.type_, featureInfo.flatCoordinates_, featureInfo.ends_, featureInfo.properties_);
                            features[featureId] = feature;
                        }

                        if (featuresInfo && mainDrawingInstructs) {
                            for (let i = 0; i < mainDrawingInstructs.length; i++) {
                                let geoStyleId = mainDrawingInstructs[i][1];
                                let geoStyle = geoStyles[geoStyleId];

                                let feature = features[mainDrawingInstructs[i][0]];
                                render.call(rendererSelf, feature, geoStyle, { strategyTree: strategyTree, frameState: frameState });
                            }
                        }

                        for (let zindex in replaysByZIndex) {
                            for (let replayType in replaysByZIndex[zindex]) {
                                let workerReplay = replaysByZIndex[zindex][replayType];
                                let replay = replayGroup.getReplay(zindex, replayType);

                                if (workerReplay["instructions"]) {
                                    for (let i = 0; i < workerReplay["instructions"].length; i++) {
                                        let instruction = workerReplay["instructions"][i];
                                        if (instruction[0] === Instruction.BEGIN_GEOMETRY || instruction[0] === Instruction.END_GEOMETRY) {
                                            let featureId = instruction[1];
                                            instruction[1] = features[featureId];
                                        }
                                    }
                                }
                                replay["instructions"] = workerReplay["instructions"];
                                replay["coordinates"] = workerReplay["coordinates"];
                            }
                        }

                        replayState.replayGroupCreated = true;
                        replayGroup.finish();
                        for (const r in replayGroup.getReplays()) {
                            zIndexKeys[r] = true;
                        }
                        sourceTile.setReplayGroup(layer, tile.tileCoord.toString(), replayGroup);

                        // For wrappedTileCoord set originalReplayGroup
                        if (!isInterim && tile.wrappedTileCoord.toString() !== tile.tileCoord.toString()) {
                            sourceTile.setReplayGroup(layer, tile.wrappedTileCoord.toString(), replayGroup);
                        }

                        tile["replayCreated"] = true;
                        sourceTile["replayCreated"] = true;
                        // The apply tile didn't enqueue, so it has no events that refresh the map.
                        listen(tile, EventType.CHANGE, frameState.tileQueue.handleTileChange, frameState.tileQueue);
                        tile.setState(TileState.LOADED);
                    }

                    if (tileProjection.getUnits() == Units.TILE_PIXELS) {
                        // projected tile extent
                        tileProjection.setWorldExtent(sourceTileExtent);
                        // tile extent in tile pixel space
                        tileProjection.setExtent(sourceTile.getExtent());
                    }

                    let tileProjectionInfo = {};
                    for (let name in tileProjection) {
                        if (typeof tileProjection[name] !== "function") {
                            tileProjectionInfo[name] = tileProjection[name];
                        }
                    }
                    let projectInfo = {};
                    for (let name in projection) {
                        if (typeof projection[name] !== "function") {
                            projectInfo[name] = projection[name];
                        }
                    }
                    let createReplayGroupMethodInfo = {
                        replayGroupInfo: replayGroupInfo,
                        formatId: getUid(source.getGeoFormat()),
                        requestCoord: requestCoord,
                        sourceTileCoord: sourceTileCoord,
                        tileProjectionInfo: tileProjectionInfo,
                        projectInfo: projectInfo,
                        squaredTolerance: squaredTolerance,
                        sourceTileExtent: sourceTileExtent,
                        bufferedExtent: bufferedExtent,
                        coordinateToPixelTransform: frameState.coordinateToPixelTransform,
                        pixelRatio: frameState.pixelRatio,
                        vectorImageTileCoord: tile.tileCoord,
                        minimalist: layer.minimalist
                    };
                    replayState.replayGroupCreated = false;
                    workerManager.postMessage(getUid(createReplayGroupCallback), "createReplayGroup", createReplayGroupMethodInfo, createReplayGroupCallback, undefined);
                }
                else {
                    if (!equivalentProjection(projection, tileProjection)) {
                        reproject = true;
                        sourceTile.setProjection(projection);
                    }
                    let renderer = this;
                    var createReplayGroupFunction = function (featuresAndInstructs) {
                        let features = undefined;
                        let instructs = undefined;
                        if (featuresAndInstructs === undefined) {
                            features = [];
                            instructs = [];
                        }
                        else {
                            features = featuresAndInstructs[0];
                            instructs = featuresAndInstructs[1];
                        }
                        var inbox = 0;
                        var out = 0;

                        if (source.defaultStyle) {
                            for (let i = 0, ii = features.length; i < ii; ++i) {
                                const feature = features[i];
                                if (reproject && !feature["projected"]) {
                                    if (tileProjection.getUnits() == Units.TILE_PIXELS) {
                                        // projected tile extent
                                        tileProjection.setWorldExtent(sourceTileExtent);
                                        // tile extent in tile pixel space
                                        tileProjection.setExtent(sourceTile.getExtent());
                                    }
                                    feature.getGeometry().transform(tileProjection, projection);
                                    feature["projected"] = true;
                                    feature.extent_ = null;
                                }
                                if (!bufferedExtent || intersects(bufferedExtent, feature.getGeometry().getExtent())) {
                                    inbox++;
                                    render.call(renderer, feature, undefined);
                                }
                                else {
                                    out++;
                                }
                            }
                        }
                        else {
                            for (let i = 0, ii = instructs.length; i < ii; ++i) {
                                const featureIndex = instructs[i][0];
                                const feature = features[featureIndex];

                                let geoStyle = instructs[i][1];

                                if (reproject && !feature["projected"]) {
                                    if (tileProjection.getUnits() == Units.TILE_PIXELS) {
                                        // projected tile extent
                                        tileProjection.setWorldExtent(sourceTileExtent);
                                        // tile extent in tile pixel space
                                        tileProjection.setExtent(sourceTile.getExtent());
                                    }
                                    feature.getGeometry().transform(tileProjection, projection);
                                    feature["projected"] = true;
                                    feature.extent_ = null;
                                }
                                if (!bufferedExtent || intersects(bufferedExtent, feature.getGeometry().getExtent())) {
                                    inbox++;
                                    render.call(renderer, feature, geoStyle);
                                }
                                else {
                                    out++;
                                }
                            }
                        }


                        replayState.replayGroupCreated = true;
                        replayGroup.finish();
                        for (const r in replayGroup.getReplays()) {
                            zIndexKeys[r] = true;
                        }
                        sourceTile.setReplayGroup(layer, tile.tileCoord.toString(), replayGroup);
                        tile["replayCreated"] = true;
                        sourceTile["replayCreated"] = true;
                    }

                    if (sourceTile.tileCoord[0] !== tile.tileCoord[0] && !source.defaultStyle) {
                        // Use current zoom level style draw the features from previous zoom level
                        let sourceTileCoordAndStyleZ = sourceTile.tileCoord.toString() + "," + tile.tileCoord[0];
                        let newFeatureAndInstructs = sourceTile.getApplyTileInstrictions(tile.tileCoord[0]);

                        if (newFeatureAndInstructs === undefined) {
                            // 
                            var hasRequested = source.registerCreateReplayGroupEvent(sourceTileCoordAndStyleZ, createReplayGroupFunction);
                            if (!hasRequested) {
                                const featuresAndInstructs = sourceTile.getFeatures();
                                let features = featuresAndInstructs[0];
                                let geoFormat = source.getGeoFormat();
                                newFeatureAndInstructs = geoFormat.getInstructions(features, { featureProjection: projection, tileCoord: tile.tileCoord });
                                sourceTile.saveApplyTileInstructions(newFeatureAndInstructs, tile.tileCoord[0]);

                                // foreach createReplayGroup Event
                                var createReplayGroupFunctions = source.getCreateReplayGroupEvent(sourceTileCoordAndStyleZ);
                                if (createReplayGroupFunctions) {
                                    for (var i = 0; i < createReplayGroupFunctions.length; i++) {
                                        createReplayGroupFunctions[i](newFeatureAndInstructs);
                                    }
                                }
                            }
                        }
                        else {
                            createReplayGroupFunction(newFeatureAndInstructs);
                        }
                    }
                    else {
                        let featuresAndInstructs = sourceTile.getFeatures();
                        createReplayGroupFunction(featuresAndInstructs);
                    }
                }
            }
        }
        replayState.renderedRevision = revision;
        replayState.renderedRenderOrder = renderOrder;
    }

    isDrawableTile_(tile) {
        const tileLayer = /** @type {import("../../layer/Tile.js").default} */ (this.getLayer());
        const tileState = tile.getState();
        const useInterimTilesOnError = tileLayer.getUseInterimTilesOnError();
        // Tile Loaded and replay has been created.
        return tileState == TileState.LOADED || tile.replayCreated || tileState == TileState.CANCEL ||
            tileState == TileState.EMPTY ||
            tileState == TileState.ERROR && !useInterimTilesOnError;
    }
    isTileToDraw_(tile) {
        const tileLayer = /** @type {import("../../layer/Tile.js").default} */ (this.getLayer());
        const tileState = tile.getState();
        const useInterimTilesOnError = tileLayer.getUseInterimTilesOnError();
        const image = tile.getImage(tileLayer)
        // Tile Loaded and replay has been created.
        return (tileState == TileState.LOADED && tile.replayCreated && image) ||
            tileState == TileState.EMPTY ||
            tileState == TileState.ERROR && !useInterimTilesOnError;
    }

    createLoadedTileFinder(source, projection, tiles, layer) {
        return (
            /**
             * @param {number} zoom Zoom level.
             * @param {import("../TileRange.js").default} tileRange Tile range.
             * @return {boolean} The tile range is fully loaded.
             */
            function (zoom, tileRange) {
                /**
                 * @param {import("../Tile.js").default} tile Tile.
                 */
                function callback(tile) {
                    if (!tiles[zoom]) {
                        tiles[zoom] = {};
                    }
                    tiles[zoom][tile.tileCoord.toString()] = tile;
                }
                return source.forEachLoadedTile(projection, zoom, tileRange, callback,layer);
            }
        );
    }
}

GeoCanvasVectorTileLayerRenderer['handles'] = function (layer) {
    return layer.getType() === LayerType.GEOVECTORTILE;
};

GeoCanvasVectorTileLayerRenderer['create'] = function (mapRenderer, layer) {
    return new GeoCanvasVectorTileLayerRenderer(/** @type {import("../../layer/VectorTile.js").default} */(layer));
};


export default GeoCanvasVectorTileLayerRenderer;
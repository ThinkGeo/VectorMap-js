import { getUid } from 'ol/util';
import TileLayer from 'ol/renderer/webgl/TileLayer';
import LayerType from 'ol/LayerType';
import { containsExtent, buffer, containsCoordinate, equals, getIntersection, getTopLeft, intersects, isEmpty } from 'ol/extent';
import ViewHint from 'ol/ViewHint';
import TileState from 'ol/TileState';
import { equivalent as equivalentProjection } from 'ol/proj';
import { replayDeclutter } from 'ol/render/webgl/ReplayGroup';
import RenderEventType from 'ol/render/EventType';
import { createCanvasContext2D } from 'ol/dom';
import ReplayGroupCustom from '../../render/webgl/ReplayGroupCustom';
import { getSquaredTolerance as getSquaredRenderTolerance, renderFeature } from '../vector';
import Units from 'ol/proj/Units';
import VectorTileRenderType from 'ol/layer/VectorTileRenderType';
import rbush from 'rbush';
import ReplayType from 'ol/render/ReplayType';
import {
    compose as composeTransform,
    reset as resetTransform,
    scale as scaleTransform,
    translate as translateTransform
} from 'ol/transform.js';
import RenderFeature from 'ol/render/Feature';
import { listen } from 'ol/events';
import Instruction from "ol/render/canvas/Instruction";
import { ORDER } from 'ol/render/replay';
import { format } from 'ol/coordinate';
import EventType from 'ol/events/EventType';

import {numberSafeCompareFunction} from "ol/array"
import ImageReplay from "ol/render/webgl/ImageReplay"
import TextReplay from "ol/render/webgl/TextReplay"

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

class GeoVectorTileLayerRender extends TileLayer {
    constructor(mapRenderer,layer) {
        super(mapRenderer,layer);
        this.renderedTiles = [];
        this.declutterTree_ = layer.getDeclutter() ? rbush(9) : null;
        this.VECTOR_REPLAYS = VECTOR_REPLAYS;
        this.composeFrame = this.composeFrameCustom;
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
            tileSource, projection, tilesToDrawByZ);

        const hints = frameState.viewHints;
        const animatingOrInteracting = hints[ViewHint.ANIMATING] || hints[ViewHint.INTERACTING];

        const tmpExtent = this.tmpExtent;
        const tmpTileRange = this.tmpTileRange_;
        let newTiles = false;
        let tile, x, y;
        let allLoaded = true;
        for (x = tileRange.minX; x <= tileRange.maxX; ++x) {
            for (y = tileRange.minY; y <= tileRange.maxY; ++y) {
                tile = tileSource.getTile(z, x, y, pixelRatio, projection);
                tile.tileRange = tileRange;
                tile.pixelRatio = pixelRatio;
                if (tile.getState() === TileState.ERROR) {
                    if (!tileLayer.getUseInterimTilesOnError()) {
                        // When useInterimTilesOnError is false, we consider the error tile as loaded.
                        tile.setState(TileState.LOADED);
                    } else if (tileLayer.getPreload() > 0) {
                        // Preloaded tiles for lower resolutions might have finished loading.
                        newTiles = true;
                    }
                }
                
                if (!this.isDrawableTile_(tile)) {
                    tile = tile.getInterimTile();
                }               

                if (this.isDrawableTile_(tile)) {
                    let uid = getUid(this);
                    if (tile.getState() === (TileState.LOADED)) {
                        tilesToDrawByZ[z][tile.tileCoord.toString()] = tile;
                        let inTransition = tile.inTransition(uid);
                        if (!newTiles && (inTransition || this.renderedTiles.indexOf(tile) === -1)) {
                            newTiles = true;
                        }
                        // continue;
                    }else if(tile.getState() ===TileState.EMPTY){
                        continue;
                    }
                    // judge the data of replayGroup for drawing
                    let sourceTile = tile.getTile(tile.tileKeys[0]);
                    let replayGroup = sourceTile && sourceTile.getReplayGroup(this.getLayer(), sourceTile.tileCoord.toString());
                    if (tile.getAlpha(uid, frameState.time) === 1 && (replayGroup && Object.keys(replayGroup.replaysByZIndex_).length > 0)) {
                        // don't look for alt tiles if alpha is 1
                        continue;
                    }
                }

                if(y <= tileRange.maxY){
                    allLoaded = false;
                }

                let childTileRange = tileGrid.getTileCoordChildTileRange(
                    tile.tileCoord, tmpTileRange, tmpExtent);
                let covered = false;
                var cacheZoom = tileSource.tileCache.zoom || 0;
                if (childTileRange) { 
                    covered = tileGrid.forEachTileCoordChildTileRange(
                        tile.tileCoord, findLoadedTiles, null, tmpTileRange, tmpExtent, cacheZoom, tileRange
                        );                    
                }

                if (!covered) {
                    tileGrid.forEachTileCoordParentTileRange(
                        tile.tileCoord, findLoadedTiles, null, tmpTileRange, tmpExtent, cacheZoom);
                }
            }
        }

        // current tile range has been all loaded
        if(allLoaded){                        
            var tileCache = tileSource.tileCache;
            var highWaterMark = 0;
            tileCache.forEach(function(tile){
                var keyZ = tile.tileCoord[0];
                if(keyZ == z){
                    highWaterMark += 1;
                }         
            });
            tileSource.tileCache.highWaterMark = tileSource.tileCache.highWaterMark > highWaterMark ?
                highWaterMark : tileSource.tileCache.highWaterMark;
            
            tileSource.tileCache.zoom = tile.tileCoord[0];
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
                    tile.transition = (z === currentZ);
                    tile.screenXY = [(tileExtent[0] + tileExtent[2]) / 2,(tileExtent[1] + tileExtent[3]) / 2];
                    // this.drawTileImage(tile, frameState, layerState, x, y, w, h, tileGutter, z === currentZ);
                    this.createReplayGroup_(tile, frameState, x, y);
                    this.renderedTiles.push(tile);
                }
            }

            this.renderedRevision = sourceRevision;
            this.renderedResolution = tileResolution * pixelRatio / tilePixelRatio * oversampling;
            this.renderedExtent_ = imageExtent;
        }

        const scale = this.renderedResolution / viewResolution;
        // const transform = composeTransform(this.imageTransform_,
        //     pixelRatio * size[0] / 2, pixelRatio * size[1] / 2,
        //     scale, scale,
        //     0,
        //     (this.renderedExtent_[0] - viewCenter[0]) / this.renderedResolution * pixelRatio,
        //     (viewCenter[1] - this.renderedExtent_[3]) / this.renderedResolution * pixelRatio);
        // composeTransform(this.coordinateToCanvasPixelTransform,
        //     pixelRatio * size[0] / 2 - transform[4], pixelRatio * size[1] / 2 - transform[5],
        //     pixelRatio / viewResolution, -pixelRatio / viewResolution,
        //     0,
        //     -viewCenter[0], -viewCenter[1]);

        this.updateUsedTiles(frameState.usedTiles, tileSource, z, tileRange);
        this.manageTilePyramid(frameState, tileSource, tileGrid, pixelRatio,
            projection, extent, z, tileLayer.getPreload());
        this.scheduleExpireCache(frameState, tileSource);

        return this.renderedTiles.length > 0;
    }
    composeFrameCustom(frameState, layerState, context) {
        let gl = context.getGL();
        gl.enable(gl.DEPTH_TEST);
        
        this.dispatchComposeEvent_(
            EventType.PRECOMPOSE, context, frameState);

        let layer = this.getLayer();
        let declutterReplays = layer.getDeclutter() ? {} : null;
        let renderMode = layer.getRenderMode();
        let replayTypes = this.VECTOR_REPLAYS[renderMode];
        let rotation = frameState.viewState.rotation;
        if (declutterReplays) {
            this.declutterTree_.clear();
        }
        let tiles = this.renderedTiles;
        context.globalAlpha = layerState.opacity;        
        context.frameState = frameState;
        context.layerState = layerState;

        for (let i = tiles.length - 1; i >= 0; --i) {
            let tile = /** @type {ol.VectorImageTile} */ (tiles[i]);
            let screenXY = tile.screenXY;
            if (tile.getState() === TileState.ABORT) {
                continue;
            }

            // let tileCoord = tile.tileCoord;            
            for (let t = 0, tt = tile.tileKeys.length; t < tt; ++t) {
                let sourceTile = tile.getTile(tile.tileKeys[t]);
                if (sourceTile.getState() === TileState.ERROR) {
                    continue;
                }

                // reuse replayGroup of source Tile to reduce the memory.
                // let replayGroup = sourceTile.getReplayGroup(layer, tileCoord.toString());
                let replayGroup = sourceTile.getReplayGroup(layer, sourceTile.tileCoord.toString());
                if (renderMode !== VectorTileRenderType.VECTOR && !replayGroup.hasReplays(replayTypes)) {
                    continue;
                } 
                
                replayGroup.replay(context, rotation, {}, replayTypes, declutterReplays, screenXY);            
                
                if(Object.keys(replayGroup.replaysByZIndex_).length){                    
                    var uid = this.ol_uid;
                    var alpha = tile.transition ? tile.getAlpha(uid, frameState.time) : 1;
                    if (alpha !== 1) {
                        frameState.animate = true;
                    } else if (tile.transition) {
                        tile.endTransition(uid);
                    }
                }
            }
        }
        
        if (declutterReplays) {
            // var hints = frameState.viewHints;
            // var animatingOrInteracting = hints[(<any>ol).ViewHint.ANIMATING] || hints[(<any>ol).ViewHint.INTERACTING];
            // delete context["quickZoom"]
            // if (animatingOrInteracting) {
            //     context["quickZoom"] = frameState["quickZoom"];
            // }
            // context["currentResolution"] = frameState["currentResolution"];
            this.replayDeclutter(declutterReplays, context, rotation);
        }
        if (rotation) {
        //     (<any>ol.render.canvas).rotateAtOffset(context, rotation,
        // /** @type {number} */(offsetX), /** @type {number} */(offsetY));
        }
        // (<any>ol).renderer.canvas.TileLayer.prototype.postCompose.apply(this, arguments);      
        
        gl.disable(gl.DEPTH_TEST);
    }
    replayDeclutter(declutterReplays, context, rotation) {
        var zs = Object.keys(declutterReplays).map(Number).sort(numberSafeCompareFunction);
        var skippedFeatureUids = {};
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
                    if(replay instanceof TextReplay){
                        replay.drawText(tmpOptions[k]);
                    }else if(replay instanceof ImageReplay){
                        replay.drawPoint(tmpOptions[k]);
                    }
                }
                replay.finish(context);
                // replay.options = tmpOptions;
               
                replay.replay(context, rotation, skippedFeatureUids, screenXY);
            }
        }
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
                this.createReplayGroup_(/** @type {import("../../VectorImageTile.js").default} */(tile), pixelRatio, projection, frameState);
                if (this.context) {
                    this.renderTileImage_(/** @type {import("../../VectorImageTile.js").default} */(tile), pixelRatio, projection);
                }
            }
        }
        return tile;
    }

    createReplayGroup_(tile, frameState, x, y) {
        const layer = /** @type {import("../../layer/Vector.js").default} */ (this.getLayer());
        let pixelRatio = frameState.pixelRatio;
        let projection = frameState.viewState.projection;
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

            const sourceTileCoord = sourceTile.tileCoord;
            const requestCoord = sourceTile.requestCoord;

            var sourceTileExtent = sourceTileGrid.getTileCoordExtent(requestCoord);
            var sharedExtent = getIntersection(tileExtent, sourceTileExtent);
            var bufferedExtent = equals(sourceTileExtent, sharedExtent) ? null :
                buffer(sharedExtent, layer.getRenderBuffer() * resolution, this.tmpExtent);

            const tileProjection = sourceTile.getProjection();
            let reproject = false;
            if (!equivalentProjection(projection, tileProjection)) {
                reproject = true;
                sourceTile.setProjection(projection);
            }
            replayState.dirty = false;
            
            var replayGroup = new ReplayGroupCustom(
                0, sharedExtent, layer.getRenderBuffer(), this.declutterTree_);
            let replayGroupInfo = [0, sharedExtent, resolution, pixelRatio, source.getOverlaps(), this.declutterTree_, layer.getRenderBuffer(),source.getGeoFormat().minimalist];

            const squaredTolerance = getSquaredRenderTolerance(resolution, pixelRatio);
            let strategyTree = rbush(9);

            /**
             * @param {import("../../Feature.js").FeatureLike} feature Feature.
             * @this {CanvasVectorTileLayerRenderer}
             */
            const render = function (feature, geoStyles, options) {
                let styles;
                if (geoStyles) {
                    if (geoStyles && geoStyles.length > 0) {
                        for (let i = 0, ii = geoStyles.length; i < ii; i++) {
                            if (geoStyles[i]) {
                                let ol4Styles = geoStyles[i].getStyles(feature, resolution, options);
                                if (styles === undefined) {
                                    styles = [];
                                }
                                console.log(ol4Styles)
                                if(!ol4Styles.length){
                                    continue;
                                }
                                Array.prototype.push.apply(styles, ol4Styles);
                            }
                        }
                    }
                }
                else {
                    let styleFunction = feature.getStyleFunction();
                    if (styleFunction) {
                        styles = styleFunction.call(/** @type {ol.Feature} */(feature), resolution);
                    } else {
                        styleFunction = layer.getStyleFunction();
                        if (styleFunction) {
                            styles = styleFunction(feature, resolution);
                        }
                    }
                }

                if (styles) {
                    let dirty = this.renderFeature(feature, squaredTolerance, styles,
                        replayGroup);
                    this.dirty_ = this.dirty_ || dirty;
                    replayState.dirty = replayState.dirty || dirty;
                }
            };
            let instructs;
            let features;
            if (sourceTile.featuresAndInstructs) {
                instructs = sourceTile.featuresAndInstructs["instructs"];
                features = sourceTile.featuresAndInstructs["features"];
            }

            // if (source.isMultithread) {
                // let render = this;
                if (tileProjection.getUnits() === Units.TILE_PIXELS) {
                    tileProjection.setWorldExtent(sourceTileExtent);
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

                let geoStyles = source.getGeoFormat().styleJsonCache.geoStyles;

                if (features && instructs) {
                    for (let i = 0; i < instructs.length; i++) {
                        let geoStyleId = instructs[i][1];
                        let geoStyle = geoStyles[geoStyleId];

                        let featureInfo = features[instructs[i][0]];
                        let feature = new Feature(featureInfo.type_, featureInfo.flatCoordinates_, featureInfo.ends_, featureInfo.properties_);

                        if (featureInfo["projected"] === undefined) {
                            if (tileProjection.getUnits() === Units.TILE_PIXELS) {
                                // projected tile extent
                                tileProjection.setWorldExtent(sourceTileExtent);
                                // tile extent in tile pixel space
                                tileProjection.setExtent(sourceTile.getExtent());
                            }
                            feature.getGeometry().transform(tileProjection, projection);
                            feature.extent_ = null;
                            featureInfo["projected"] = "";
                        }

                        feature["tempTreeZindex"] = instructs[i][2];
                        feature["styleId"] = geoStyleId;
                        renderFeature.call(this, feature, [geoStyle], { strategyTree: strategyTree, frameState: frameState });
                    }
                }
                let createReplayGroupMethodInfo = [
                    replayGroupInfo,
                    requestCoord,
                    sourceTileCoord,
                    tileProjectionInfo,
                    projectInfo,
                    squaredTolerance,
                    frameState.pixelRatio,
                    getUid(source.getGeoFormat()),
                    frameState.coordinateToPixelTransform,
                    source.getGeoFormat().maxDataZoom,
                    source["vectorTileDataCahceSize"],
                    x,
                    y,
                    frameState["pixelToCoordinateTransform"]
                    ];
                var workerManager = source.getWorkerManager();
                if (workerManager) {
                    let rendererSelf = this;
                    let geoStyles = source.getGeoFormat().styleJsonCache.geoStyles;
        
                    let createReplayGroupCallback = function (messageData) {
                        var replaysByZIndex_ = messageData["replays"];
                        var features = messageData["features"];
                        var instructs = messageData["instructs"];

                        if (features && instructs) {
                            for (let i = 0; i < instructs.length; i++) {
                                let geoStyleId = instructs[i][1];
                                let geoStyle = geoStyles[geoStyleId];

                                let featureInfo = features[instructs[i][0]];
                            
                                let feature = new RenderFeature(featureInfo.type_, featureInfo.flatCoordinates_, featureInfo.ends_, featureInfo.properties_);
                                feature["tempTreeZindex"] = instructs[i][2];
                                feature["styleId"] = geoStyleId;
                                render.call(rendererSelf, feature, [geoStyle], { strategyTree: strategyTree, frameState: frameState });
                            }
                        }
                        for (let zindex in replaysByZIndex_) {
                            for (let replayType in replaysByZIndex_[zindex]) {                                
                                // merge worker to main with replaysByZIndex_
                                let replay = replayGroup.getReplay(zindex, replayType);    
                                let workerReplay = replaysByZIndex_[zindex][replayType];
                                for(let key in workerReplay){      
                                    // if(key === 'indices' || key === 'vertices'){
                                    //     replay[key] = new Int32Array(workerReplay[key]);
                                    // }else 
                                    if(key !== 'lineStringReplay'){
                                        replay[key] = workerReplay[key];
                                    }
                                }
                                if(workerReplay['lineStringReplay']){
                                    for(let lineStringKey in workerReplay['lineStringReplay']){
                                        replay['lineStringReplay'][lineStringKey] = workerReplay['lineStringReplay'][lineStringKey];
                                    }
                                }
                            }
                        }
                        replayGroup.finish(frameState['context']);
                        replayState.renderedTileLoaded = true;
                        sourceTile.state = TileState.LOADED;
                        if (sourceTile["reuseVectorImageTile"]) {
                            for (var i = 0; i < sourceTile["reuseVectorImageTile"].length; i++) {
                                var reusedVectorImageTile = sourceTile["reuseVectorImageTile"][i];
                                delete sourceTile["reuseVectorImageTile"][i];
                                let vectorImageTileReplayState = reusedVectorImageTile.getReplayState(layer);
                                vectorImageTileReplayState.renderedRevision = revision;
                                vectorImageTileReplayState.renderedRenderOrder = renderOrder;
                                vectorImageTileReplayState.renderedTileLoaded = true;
                                reusedVectorImageTile.setState(TileState.LOADED);
                            }
                        }
                        
                        tile.setState(TileState.LOADED);
                    }
                    replayState.replayGroupCreated = false;
                    sourceTile.setReplayGroup(layer, tile.tileCoord.toString(), replayGroup);
                    workerManager.postMessage(getUid(createReplayGroupCallback), "createReplayGroup", createReplayGroupMethodInfo, createReplayGroupCallback, undefined);
                }
                if (instructs && instructs.length > 0) {
                    for (let i = 0; i < instructs.length; i++) {
                        let featureIndex = instructs[i][0];
                        let feature = features[featureIndex];
                        if (feature["projected"] === undefined) {
                            if (reproject) {
                                if (tileProjection.getUnits() === Units.TILE_PIXELS) {
                                    // projected tile extent
                                    tileProjection.setWorldExtent(sourceTileExtent);
                                    // tile extent in tile pixel space
                                    tileProjection.setExtent(sourceTile.getExtent());
                                }
                                feature.getGeometry().transform(tileProjection, projection);
                                feature.extent_ = null;
                                feature.getExtent();
                            }
                            feature["projected"] = "";
                        }
                        feature["tempTreeZindex"] = instructs[i][2];
                        renderFeature.call(this, feature, [instructs[i][1]], { strategyTree: strategyTree, frameState: frameState });
                    }
                }
                replayGroup.finish(frameState['context']);
                // for (let r in replayGroup.getReplays()) {
                //     zIndexKeys[r] = true;
                // }
                sourceTile.setReplayGroup(layer, sourceTile.tileCoord.toString(), replayGroup);
                replayState.renderedRevision = revision;
                replayState.renderedRenderOrder = renderOrder;
                replayState.renderedTileLoaded = true;
                
            
        }
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
        // Tile Loaded and replay has been created.
        return (tileState == TileState.LOADED) ||
            tileState == TileState.EMPTY ||
            tileState == TileState.ERROR && !useInterimTilesOnError;
        
    }
    renderFeature(feature, squaredTolerance, styles, replayGroup) {
        if (!styles) {
          return false;
        }
        let loading = false;
        if (Array.isArray(styles)) {
          for (let i = 0, ii = styles.length; i < ii; ++i) {
            loading = renderFeature(
              replayGroup, feature, styles[i], squaredTolerance,
              this.handleStyleImageChange_, this) || loading;
          }
        } else {
          loading = renderFeature(
            replayGroup, feature, styles, squaredTolerance,
            this.handleStyleImageChange_, this);
        }
        return loading;
      }
}

GeoVectorTileLayerRender['handles'] = function (layer) {
    return layer.getType() === LayerType.GEOVECTORTILE;
};

GeoVectorTileLayerRender['create'] = function (mapRenderer, layer) {
    return new GeoVectorTileLayerRender(mapRenderer,layer);
};import { webgl } from 'ol/webgl';



export default GeoVectorTileLayerRender;
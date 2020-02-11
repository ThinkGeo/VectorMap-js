import { ReplayGroupCustom } from "../render/replayGroupCustom";
import { VecorRenderFeature } from "./geoVector";

export class GeoVectorTileLayerRender extends ((<any>ol).renderer.webgl.TileLayer as { new(a: any, p: ol.layer.Tile): any; }) {
    constructor(mapRenderer: any, layer: ol.layer.VectorTile) {
        super(mapRenderer, layer);
        // this.zDirection = 1;
        this.renderedTiles = [];
        this.declutterTree_ = (<any>layer).getDeclutter() ? (<any>ol).ext.rbush(9) : null;
        this.VECTOR_REPLAYS = this.VECTOR_REPLAYS_CUSTOM;
        this.prepareFrame = this.prepareFrameCustom;
        this.composeFrame = this.composeFrameCustom;
    }

    VECTOR_REPLAYS_CUSTOM = {
        "image": [(<any>ol.render).ReplayType.DEFAULT],
        "hybrid": [(<any>ol.render).ReplayType.IMAGE, (<any>ol.render).ReplayType.TEXT, (<any>ol.render).ReplayType.DEFAULT],
        "vector": (<any>ol).render.replay.ORDER
    };

    public tileLayerPrepareFrameCustom(frameState: any, layerState: any) {
        let pixelRatio = frameState.pixelRatio;
        let size = frameState.size;
        let viewState = frameState.viewState;
        let projection = viewState.projection;
        let viewResolution = viewState.resolution;
        let viewCenter = viewState.center;

        let tileLayer = this.getLayer();
        let tileSource = /** @type {ol.source.Tile} */ (tileLayer.getSource());
        let sourceRevision = tileSource.getRevision();
        let tileGrid = tileSource.getTileGridForProjection(projection);
        let z = tileGrid.getZForResolution(viewResolution, this.zDirection);
        let tileResolution = tileGrid.getResolution(z);
        let oversampling = Math.round(viewResolution / tileResolution) || 1;
        let extent = frameState.extent;

        if (layerState.extent !== undefined) {
            extent = ol.extent.getIntersection(extent, layerState.extent);
        }
        if (ol.extent.isEmpty(extent)) {
            // Return false to prevent the rendering of the layer.
            return false;
        }
        let tileRange = tileGrid.getTileRangeForExtentAndZ(extent, z);

        // Adjust tile cache size according to tile Range, TODO: add a property for that
        let xOffset = (tileRange.maxX - tileRange.minX);
        let yOffset = (tileRange.maxY - tileRange.minY);
        xOffset = xOffset <= 0 ? 1 : xOffset * 2 + 3;
        yOffset = yOffset <= 0 ? 1 : yOffset * 2 + 3;
        let cacheSize = xOffset * yOffset;
        tileSource.tileCache.highWaterMark = cacheSize <= 15 ? 15 : cacheSize;

        // Adjust vectorTileData cache size according to the tile Range in data max zoom. it will pass 
        var dataTileRand = tileGrid.getTileRangeForExtentAndZ(extent, tileSource.maxDataZoom);
        var offsetX = dataTileRand.maxX - dataTileRand.minX;
        var offsetY = dataTileRand.maxY - dataTileRand.minY;

        offsetX = offsetX <= 0 ? 1 : offsetX + 3;
        offsetY = offsetY <= 0 ? 1 : offsetY + 3;
        var vectorTileDataCahceSize = offsetX * offsetY;
        tileSource["vectorTileDataCahceSize"] = vectorTileDataCahceSize;
        tileSource.getGeoFormat()["vectorTileDataCahceSize"] = vectorTileDataCahceSize;

        let imageExtent = tileGrid.getTileRangeExtent(z, tileRange);

        let tilePixelRatio = tileSource.getTilePixelRatio(pixelRatio);

        /**
         * @type {Object.<number, Object.<string, ol.Tile>>}
         */
        let tilesToDrawByZ = {};
        tilesToDrawByZ[z] = {};

        let findLoadedTiles = this.createLoadedTileFinder(
            tileSource, projection, tilesToDrawByZ, tileLayer);

        let tmpExtent = this.tmpExtent;
        let tmpTileRange = this.tmpTileRange_;
        let newTiles = false;
        let tile, x, y;
        let allLoaded = true;
        for (x = tileRange.minX; x <= tileRange.maxX; ++x) {
            for (y = tileRange.minY; y <= tileRange.maxY; ++y) {
                tile = tileSource.getTile(z, x, y, pixelRatio, projection);
                tile.tileRange = tileRange;
                tile.pixelRatio = pixelRatio;
                if (tile.getState() === (<any>ol).TileState.ERROR) {
                    if (!tileLayer.getUseInterimTilesOnError()) {
                        // When useInterimTilesOnError is false, we consider the error tile as loaded.
                        tile.setState((<any>ol).TileState.LOADED);
                    } else if (tileLayer.getPreload() > 0) {
                        // Preloaded tiles for lower resolutions might have finished loading.
                        newTiles = true;
                    }
                }

                if (!this.isDrawableTile_(tile)) {
                    tile = tile.getInterimTile();
                }

                if (this.isDrawableTile_(tile)) {
                    let uid = (<any>ol).getUid(this);
                    if (tile.getState() === (<any>ol).TileState.LOADED) {
                        tilesToDrawByZ[z][tile.tileCoord.toString()] = tile;
                        let inTransition = tile.inTransition(uid);
                        if (!newTiles && (inTransition || this.renderedTiles.indexOf(tile) === -1)) {
                            newTiles = true;
                        }
                        // continue;
                    } else if (tile.getState() === (<any>ol).TileState.EMPTY) {
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

                if (y <= tileRange.maxY) {
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
        if (allLoaded) {
            var tileCache = tileSource.tileCache;
            var highWaterMark = 0;
            tileCache.forEach(function (tile) {
                var keyZ = tile.tileCoord[0];
                if (keyZ == z) {
                    highWaterMark += 1;
                }
            });
            tileSource.tileCache.highWaterMark = tileSource.tileCache.highWaterMark > highWaterMark ?
                highWaterMark : tileSource.tileCache.highWaterMark;

            tileSource.tileCache.zoom = tile.tileCoord[0];
        }

        let renderedResolution = tileResolution * pixelRatio / tilePixelRatio * oversampling;
        let hints = frameState.viewHints;
        let animatingOrInteracting = hints[(<any>ol).ViewHint.ANIMATING] || hints[(<any>ol).ViewHint.INTERACTING];
        if (!(this.renderedResolution && Date.now() - frameState.time > 16 && animatingOrInteracting) && (
            newTiles ||
            !(this.renderedExtent_ && ol.extent.containsExtent(this.renderedExtent_, extent)) ||
            this.renderedRevision !== sourceRevision ||
            oversampling !== this.oversampling_ ||
            !animatingOrInteracting && renderedResolution !== this.renderedResolution
        )) {
            this.renderedTiles.length = 0;
            /** @type {Array.<number>} */
            let zs = Object.keys(tilesToDrawByZ).map(Number);
            zs.sort(function (a, b) {
                if (a === z) {
                    return 1;
                } else if (b === z) {
                    return -1;
                } else {
                    return a > b ? 1 : a < b ? -1 : 0;
                }
            });

            // let currentResolution, currentScale, currentTilePixelSize;
            let currentZ, i, ii;
            let tileExtent, tilesToDraw;
            for (i = 0, ii = zs.length; i < ii; ++i) {
                currentZ = zs[i];
                // currentTilePixelSize = tileSource.getTilePixelSize(currentZ, pixelRatio, projection);
                // currentResolution = tileGrid.getResolution(currentZ);
                // currentScale = currentResolution / tileResolution;
                tilesToDraw = tilesToDrawByZ[currentZ];
                for (let tileCoordKey in tilesToDraw) {
                    tile = tilesToDraw[tileCoordKey];
                    tileExtent = tileGrid.getTileCoordExtent(tile.getTileCoord(), tmpExtent);
                    x = (tileExtent[0] - imageExtent[0]) / tileResolution * tilePixelRatio / oversampling;
                    y = (imageExtent[3] - tileExtent[3]) / tileResolution * tilePixelRatio / oversampling;
                    tile.transition = (z === currentZ);
                    tile.screenXY = [(tileExtent[0] + tileExtent[2]) / 2, (tileExtent[1] + tileExtent[3]) / 2];
                    // this.drawTileImage(tile, frameState, layerState, x, y);
                    this.createReplayGroup_(tile, frameState, x, y);
                    this.renderedTiles.push(tile);
                }
            }

            this.renderedRevision = sourceRevision;
            this.renderedResolution = tileResolution * pixelRatio / tilePixelRatio * oversampling;
            this.renderedExtent_ = imageExtent;
        }

        // let scale = this.renderedResolution / viewResolution;
        // let transform = (<any>ol).transform.compose(this.imageTransform_, pixelRatio * size[0] / 2, pixelRatio * size[1] / 2, scale, scale, 0, (this.renderedExtent_[0] - viewCenter[0]) / this.renderedResolution * pixelRatio, (viewCenter[1] - this.renderedExtent_[3]) / this.renderedResolution * pixelRatio);
        // (<any>ol).transform.compose(this.coordinateToCanvasPixelTransform, pixelRatio * size[0] / 2 - transform[4], pixelRatio * size[1] / 2 - transform[5], pixelRatio / viewResolution, -pixelRatio / viewResolution, 0, -viewCenter[0], -viewCenter[1]);

        this.updateUsedTiles(frameState.usedTiles, tileSource, z, tileRange);
        this.manageTilePyramid(frameState, tileSource, tileGrid, pixelRatio, projection, extent, z, tileLayer.getPreload());
        this.scheduleExpireCache(frameState, tileSource);
        this.updateLogos(frameState, tileSource);

        return this.renderedTiles.length > 0;
    }

    public prepareFrameCustom(frameState: any, layerState: any) {
        let layer = this.getLayer();
        let layerRevision = layer.getRevision();
        if (this.renderedLayerRevision_ !== layerRevision) {
            this.renderedTiles.length = 0;
        }
        this.renderedLayerRevision_ = layerRevision;
        return this.tileLayerPrepareFrameCustom.apply(this, arguments);
    }

    public composeFrameCustom(frameState: any, layerState: any, context: any) {
        let gl = context.getGL();
        gl.enable(gl.DEPTH_TEST);

        this.dispatchComposeEvent_(
            (<any>ol.render).EventType.PRECOMPOSE, context, frameState);

        let layer = this.getLayer();
        let viewState = frameState.viewState;
        let declutterReplays = layer.getDeclutter() ? {} : null;
        let renderMode = layer.getRenderMode();
        let replayTypes = this.VECTOR_REPLAYS_CUSTOM[renderMode];
        let lineStringReplayArray = [];
        let center = viewState.center;
        let rotation = viewState.rotation;
        let resolution = viewState.resolution;
        let size = frameState.size;
        let pixelRatio = frameState.pixelRatio;
        let opacity = layerState.opacity;

        // Set background color to map
        const background = layer.background;
        const canvasBackground = gl.canvas.style.backgroundColor;
        if (background) {
            var zoom = frameState.viewState.zoom;
            var color;
            var matched = false;
            for (var bgIndex = 0; bgIndex < background.length; bgIndex++) {
                var element = background[bgIndex];
                if (element.filterGrounps) {
                    var groupMatched = false;
                    for (let grounpIndex = 0; grounpIndex < element.filterGrounps.length; grounpIndex++) {
                        var filter = element.filterGrounps[grounpIndex];
                        if (filter.matchOLFeature(null, zoom)) {
                            groupMatched = true;
                            break;
                        }
                    }
                    if (groupMatched) {
                        matched = true;
                        color = element.color;
                        break;
                    }
                }
            }
            if (matched) {
                if (color && color !== canvasBackground) {
                    gl.canvas.style.backgroundColor = color;
                }
            }
        }

        if (declutterReplays) {
            this.declutterTree_.clear();
        }
        let tiles = this.renderedTiles;
        context.globalAlpha = layerState.opacity;
        context.frameState = frameState;
        // context.layerState = layerState;

        for (let i = tiles.length - 1; i >= 0; --i) {
            let tile = /** @type {ol.VectorImageTile} */ (tiles[i]);
            let screenXY = tile.screenXY;
            if (tile.getState() === (<any>ol).TileState.ABORT) {
                continue;
            }

            // let tileCoord = tile.tileCoord;            
            for (let t = 0, tt = tile.tileKeys.length; t < tt; ++t) {
                let sourceTile = tile.getTile(tile.tileKeys[t]);
                if (sourceTile.getState() === (<any>ol).TileState.ERROR) {
                    continue;
                }

                // reuse replayGroup of source Tile to reduce the memory.
                // let replayGroup = sourceTile.getReplayGroup(layer, tileCoord.toString());
                let replayGroup_ = sourceTile.getReplayGroup(layer, sourceTile.tileCoord.toString());
                let tmpreplayGroup = sourceTile.tmpReplayGroups_ && sourceTile.tmpReplayGroups_[(<any>ol).getUid(layer) + ',' + sourceTile.tileCoord.toString()];

                let replayGroup = ((replayGroup_ && Object.keys(replayGroup_.replaysByZIndex_).length > 0) || !tmpreplayGroup) ? replayGroup_ : tmpreplayGroup;

                if (renderMode !== (<any>ol.layer).VectorTileRenderType.VECTOR && !replayGroup.hasReplays(replayTypes)) {
                    continue;
                }

                // draw polygon
                replayGroup.replay(context, center, resolution, rotation, size, pixelRatio,
                    opacity, {}, declutterReplays, screenXY, lineStringReplayArray);

                if (Object.keys(replayGroup.replaysByZIndex_).length) {
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

        // draw lineString
        for (let i = 0; i < lineStringReplayArray.length; i += 2) {
            lineStringReplayArray[i].replay(context, center, resolution, rotation, size, pixelRatio,
                opacity, {}, undefined, false, {}, lineStringReplayArray[i + 1]);
        }

        if (declutterReplays) {
            this.replayDeclutter(declutterReplays, context, center, resolution, rotation, size, pixelRatio,
                opacity, {}, undefined, false, {});
        }
        // (<any>ol).renderer.canvas.TileLayer.prototype.postCompose.apply(this, arguments);      

        gl.disable(gl.DEPTH_TEST);
    }

    public replayDeclutter(declutterReplays, context, center, resolution, rotation, size, pixelRatio,
        opacity, skippedFeaturesHash, featureCallback, oneByOne, opt_hitExtent) {

        var zs = Object.keys(declutterReplays).map(Number).sort((<any>ol).array.numberSafeCompareFunction);
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

                replay.startIndices.length = 0;
                replay.zCoordinates.length = 0;
                replay.indices.length = 0;
                replay.vertices.length = 0;
                replay.groupIndices.length = 0;

                for (var k = 0; k < tmpOptions.length; k++) {
                    if (replay instanceof (<any>ol).render.webgl.TextReplay) {
                        replay.drawText(tmpOptions[k]);
                    } else if (replay instanceof (<any>ol).render.webgl.ImageReplay) {
                        replay.drawPoint(tmpOptions[k]);
                    }
                }
                replay.finish(context);

                replay.replay(context, center, resolution, rotation, size, pixelRatio, opacity,
                    skippedFeaturesHash, featureCallback, oneByOne, opt_hitExtent, screenXY);
            }
        }
    }

    public createReplayGroup_(tile: ol.VectorTile, frameState: olx.FrameState, x, y) {
        let layer = this.getLayer();
        let pixelRatio = frameState.pixelRatio;
        let projection = frameState.viewState.projection;
        let revision = layer.getRevision();
        let renderOrder = /** @type {ol.RenderOrderFunction} */
            (layer.getRenderOrder()) || null;

        let replayState = (<any>tile).getReplayState(layer);
        if (!replayState.dirty && replayState.renderedRevision === revision &&
            replayState.renderedRenderOrder === renderOrder) {
            return;
        }

        let source = /** @type {ol.source.VectorTile} */ (layer.getSource());
        let sourceTileGrid = source.getTileGrid();
        let tileGrid = source.getTileGridForProjection(projection);
        let resolution = tileGrid.getResolution((<any>tile).tileCoord[0]);
        let tileExtent = tileGrid.getTileCoordExtent((<any>tile).wrappedTileCoord);

        // let zIndexKeys = {};
        for (let t = 0, tt = (<any>tile).tileKeys.length; t < tt; ++t) {
            let sourceTile = (<any>tile).getTile((<any>tile).tileKeys[t]);
            if (sourceTile.getState() === (<any>ol).TileState.ERROR) {
                continue;
            }
            let sourceTileCoord = sourceTile.requestTileCoord;
            let sourceTileExtent = sourceTileGrid.getTileCoordExtent(sourceTileCoord);
            let sharedExtent = ol.extent.getIntersection(tileExtent, sourceTileExtent);
            // let bufferedExtent = ol.extent.equals(sourceTileExtent, sharedExtent) ? null :
            //     ol.extent.buffer(sharedExtent, layer.getRenderBuffer() * resolution);
            let tileProjection = sourceTile.getProjection();
            let reproject = true;
            replayState.dirty = false;

            // reuse replayGroup of source Tile to reduce the memory.
            let distReplayGroup = sourceTile.getReplayGroup(layer, (<any>tile).wrappedTileCoord.toString());
            if (distReplayGroup) {
                // Check replayGroup has replays
                let replaysZindexCount = 0;
                if (distReplayGroup.replaysByZIndex_) {
                    for (var zindex in distReplayGroup.replaysByZIndex_) {
                        replaysZindexCount++;
                    }
                }

                if (source.isMultithread && replaysZindexCount === 0) {
                    // the replays did not created, it will create after web worker call back
                    if (sourceTile) {
                        if (sourceTile["reuseVectorImageTile"] === undefined) {
                            sourceTile["reuseVectorImageTile"] = [];
                        }
                        sourceTile["reuseVectorImageTile"].push(tile);
                    }
                }
                else {
                    replayState.renderedRevision = revision;
                    replayState.renderedRenderOrder = renderOrder;
                    replayState.renderedTileLoaded = true;
                }
            }
            else {
                let replayGroup = new ReplayGroupCustom(
                    0, sharedExtent, layer.getRenderBuffer(), this.declutterTree_);
                let squaredTolerance = (<any>ol).renderer.vector.getSquaredTolerance(resolution, pixelRatio);
                let strategyTree = (<any>ol).ext.rbush(9);

                /**
                 * @param {ol.Feature|ol.render.Feature} feature Feature.
                 * @this {ol.renderer.webgl.VectorTileLayer}
                 */
                let renderFeature = function (feature, geoStyles, options) {
                    let styles;

                    if (geoStyles) {
                        if (geoStyles && geoStyles.length > 0) {
                            for (let i = 0, ii = geoStyles.length; i < ii; i++) {
                                if (geoStyles[i]) {
                                    let ol4Styles = geoStyles[i].getStyles(feature, resolution, options);
                                    if (styles === undefined) {
                                        styles = [];
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

                if (source.isMultithread) {
                    // let render = this;
                    if (tileProjection.getUnits() === (<any>ol.proj).Units.TILE_PIXELS) {
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
                            let feature = new (<any>ol.render).Feature(featureInfo.type_, featureInfo.flatCoordinates_, featureInfo.ends_, featureInfo.properties_);

                            if (featureInfo["projected"] === undefined) {
                                if (tileProjection.getUnits() === (<any>ol.proj).Units.TILE_PIXELS) {
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

                    let messageData = [
                        [0, tileExtent, resolution, layer.getRenderBuffer()],
                        sourceTile.requestTileCoord,
                        sourceTile.tileCoord,
                        tileProjectionInfo,
                        projectInfo,
                        squaredTolerance,
                        window.devicePixelRatio,
                        (<any>ol).getUid(source.getGeoFormat()),
                        frameState["coordinateToPixelTransform"],
                        source.getGeoFormat().maxDataZoom,
                        source["vectorTileDataCahceSize"],
                        x,
                        y,
                        frameState["pixelToCoordinateTransform"],
                        sourceTile.tmpReplayGroups_ && !Object.keys(sourceTile.replayGroups_).length ? 'update' : undefined,
                        layer.minimalist
                    ];
                    var that_ = this;
                    let callabck = function (messageData) {
                        var replaysByZIndex_ = messageData["replays"];
                        var features = messageData["features"];
                        var instructs = messageData["instructs"];

                        if (features && instructs) {

                            for (let i = 0; i < instructs.length; i++) {
                                let geoStyleId = instructs[i][1];
                                let geoStyle = geoStyles[geoStyleId];

                                let featureInfo = features[instructs[i][0]];

                                let feature = new (<any>ol.render).Feature(featureInfo.type_, featureInfo.flatCoordinates_, featureInfo.ends_, featureInfo.properties_);
                                // let feature = new ol.Feature({
                                //     geometry: that_.getGeometryByType(featureInfo.type_, featureInfo.flatCoordinates_, 'XY')
                                // })
                                // feature.setProperties(featureInfo.properties_);
                                // feature.getGeometry()['ends_'] = featureInfo.ends_
                                // feature.getGeometry()['extent_'] = featureInfo.extent_;

                                feature["tempTreeZindex"] = instructs[i][2];
                                feature["styleId"] = geoStyleId;

                                renderFeature.call(that_, feature, [geoStyle], { strategyTree: strategyTree, zCoordinate: instructs[i][2], frameState: frameState });
                            }
                        }

                        for (let zindex in replaysByZIndex_) {
                            for (let replayType in replaysByZIndex_[zindex]) {
                                // merge worker to main with replaysByZIndex_
                                let replay = replayGroup.getReplay(zindex, replayType);
                                let workerReplay = replaysByZIndex_[zindex][replayType];
                                for (let key in workerReplay) {
                                    if (key === 'startIndicesFeature') {
                                        replay[key] = workerReplay[key].map(item => {
                                            let olFeature = new (<any>ol.render).Feature(item.type_, item.flatCoordinates_, item.ends_, item.properties_);
                                            // let olFeature = new ol.Feature({
                                            //     geometry: that_.getGeometryByType(item.type_, item.flatCoordinates_, 'XY')
                                            // });
                                            // olFeature.getGeometry()['ends_'] = item.ends_
                                            // olFeature.setProperties(item.properties_);

                                            olFeature['zCoordinate'] = item.zCoordinate;
                                            olFeature['styleId'] = item.styleId;
                                            return olFeature;
                                        })
                                    } else if (key !== 'lineStringReplay') {
                                        replay[key] = workerReplay[key];
                                    }
                                }
                                if (workerReplay['lineStringReplay']) {
                                    for (let lineStringKey in workerReplay['lineStringReplay']) {
                                        if (lineStringKey === 'startIndicesFeature') {
                                            replay['lineStringReplay'][lineStringKey] = workerReplay['lineStringReplay'][lineStringKey].map(item => {
                                                let olFeature = new (<any>ol.render).Feature(item.type_, item.flatCoordinates_, item.ends_, item.properties_);
                                                // let olFeature = new ol.Feature({
                                                //     geometry: that_.getGeometryByType(item.type_, item.flatCoordinates_, 'XY')
                                                // });
                                                //olFeature.getGeometry()['ends_'] = item.ends_
                                                //olFeature.setProperties(item.properties_);
                                                olFeature['zCoordinate'] = item.zCoordinate;
                                                olFeature['styleId'] = item.styleId;
                                                return olFeature;
                                            })
                                        } else {
                                            replay['lineStringReplay'][lineStringKey] = workerReplay['lineStringReplay'][lineStringKey];
                                        }
                                    }
                                }
                            }
                        }
                        // for (let r in replayGroup.getReplays()) {
                        //     zIndexKeys[r] = true;
                        // }     

                        replayGroup.finish(frameState['context']);
                        sourceTile.tmpReplayGroups_ = undefined;
                        replayState.renderedTileLoaded = true;
                        // sourceTile.state = (<any>ol).TileState.LOADED;
                        if (sourceTile["reuseVectorImageTile"]) {
                            for (var i = 0; i < sourceTile["reuseVectorImageTile"].length; i++) {
                                var reusedVectorImageTile = sourceTile["reuseVectorImageTile"][i];
                                delete sourceTile["reuseVectorImageTile"][i];
                                if (reusedVectorImageTile) {
                                    let vectorImageTileReplayState = reusedVectorImageTile.getReplayState(layer);
                                    vectorImageTileReplayState.renderedRevision = revision;
                                    vectorImageTileReplayState.renderedRenderOrder = renderOrder;
                                    vectorImageTileReplayState.renderedTileLoaded = true;
                                    reusedVectorImageTile.setState((<any>ol).TileState.LOADED);
                                }
                            }
                            sourceTile["reuseVectorImageTile"] = sourceTile["reuseVectorImageTile"].filter(item => item);
                        }

                        (<any>tile).setState((<any>ol).TileState.LOADED);
                    };

                    // reuse replayGroup of source Tile to reduce the memory.
                    sourceTile.setReplayGroup(layer, sourceTile.tileCoord.toString(), replayGroup);
                    source.getGeoFormat().workerManager.postMessage(sourceTile.tileCoord + (<any>ol).getUid(callabck), "createReplay", messageData, callabck, sourceTile.workerId);
                    replayState.renderedRevision = revision;
                    replayState.renderedTileLoaded = false;
                }
                else {
                    if (instructs && instructs.length > 0) {
                        for (let i = 0; i < instructs.length; i++) {
                            let featureIndex = instructs[i][0];
                            let feature = features[featureIndex];
                            if (feature["projected"] === undefined) {
                                if (reproject) {
                                    if (tileProjection.getUnits() === (<any>ol.proj).Units.TILE_PIXELS) {
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
        }
    }

    public getGeometryByType = function (type, flatCoordinates, layout) {
        var geometry;
        layout = layout || 'XY';

        var transformedCoordinates = [];
        for (let i = 0; i < flatCoordinates.length; i += 2) {
            transformedCoordinates.push([flatCoordinates[i], flatCoordinates[i + 1]]);
        }

        switch (type) {
            case 'Point': geometry = new ol.geom.Point(flatCoordinates, layout); break;
            case 'Polygon': geometry = new ol.geom.Polygon([transformedCoordinates], layout); break;
            case 'LineString': geometry = new ol.geom.LineString(transformedCoordinates, layout); break;
            case 'MultiLineString': geometry = new ol.geom.MultiLineString([transformedCoordinates], layout); break;
            default: ;
        }

        return geometry;
    }

    public renderFeature = function (feature, squaredTolerance, styles, replayGroup) {
        if (!styles) {
            return false;
        }
        var loading = false;
        replayGroup.hasDeclutterGroup = false;
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

    public isDrawableTile_ = function (tile) {
        const tileState = tile.getState();
        const useInterimTilesOnError = this.getLayer().getUseInterimTilesOnError();
        return tileState == (<any>ol).TileState.LOADED ||
            tileState == (<any>ol).TileState.EMPTY ||
            tileState == (<any>ol).TileState.ERROR && !useInterimTilesOnError;
    }

    public handleStyleImageChange_ = function (event) {
        this.renderIfReadyAndVisible();
    }

    public static handles(type: string, layer: ol.layer.Layer) {
        return type === (<any>ol).renderer.Type.WEBGL && (<any>layer).getType() === (<any>ol).LayerType.MAPSUITE_VECTORTILE;
    }

    public static create(mapRenderer: any, layer: ol.layer.Tile) {
        return new GeoVectorTileLayerRender(<any>mapRenderer, <any>layer);
    }

    public disposeInternal() {
        // (<any>ol).events.unlisten((<any>ol.render).canvas.labelCache, (<any>ol).events.EventType.CLEAR, this.handleFontsChanged_, this);
        var workerManager = this.getLayer().getSource().getGeoFormat().workerManager;
        workerManager.close();
        (<any>ol).renderer.webgl.TileLayer.prototype.disposeInternal.call(this);
    };

    public createLoadedTileFinder(source, projection, tiles, tileLayer) {
        return (
            /**
             * @param {number} zoom Zoom level.
             * @param {ol.TileRange} tileRange Tile range.
             * @return {boolean} The tile range is fully loaded.
             */
            function (zoom, tileRange) {
                function callback(tile) {
                    if (!tiles[zoom]) {
                        tiles[zoom] = {};
                    }
                    tiles[zoom][tile.tileCoord.toString()] = tile;
                }
                return source.forEachLoadedTile(projection, zoom, tileRange, callback, tileLayer);
            });
    }

    public forEachFeatureAtCoordinate(coordinate, frameState, hitTolerance, callback, thisArg) {
        var viewState = frameState.viewState;
        var context = this.mapRenderer.getContext();
        var resolution = viewState.resolution;
        var rotation = viewState.rotation;
        hitTolerance = hitTolerance == undefined ? 0 : hitTolerance;
        var layer = this.getLayer();
        /** @type {Object.<string, boolean>} */
        var features = {};
        /** @type {Array.<ol.VectorImageTile>} */
        var renderedTiles = this.renderedTiles;

        var source = /** @type {ol.source.VectorTile} */ (layer.getSource());
        var tileGrid = source.getTileGridForProjection(viewState.projection);
        var bufferedExtent, found;
        var i, ii, replayGroup;
        var tile, tileCoord, tileExtent;
        var layerState = layer.state_;

        for (i = 0, ii = renderedTiles.length; i < ii; ++i) {
            tile = renderedTiles[i];
            tileCoord = tile.wrappedTileCoord;
            tileExtent = tileGrid.getTileCoordExtent(tileCoord, this.tmpExtent);
            bufferedExtent = ol.extent.buffer(tileExtent, hitTolerance * resolution, bufferedExtent);
            if (!ol.extent.containsCoordinate(bufferedExtent, coordinate)) {
                continue;
            }
            for (var t = 0, tt = tile.tileKeys.length; t < tt; ++t) {
                var sourceTile = tile.getTile(tile.tileKeys[t]);
                if (sourceTile.getState() == (<any>ol).TileState.ERROR) {
                    continue;
                }
                replayGroup = sourceTile.getReplayGroup(layer, tileCoord.toString());
                if (!replayGroup || !layerState) {
                    continue;
                }

                found = found || replayGroup.forEachFeatureAtCoordinate(coordinate, context, viewState.center,
                    resolution, rotation, frameState.size, frameState.pixelRatio, layerState.opacity, {},
                    /**
                     * @param {ol.Feature|ol.render.Feature} feature Feature.
                     * @return {?} Callback result.
                     */
                    function (feature) {
                        var key = (<any>ol).getUid(feature).toString();
                        if (!(key in features)) {
                            features[key] = true;
                            return callback.call(thisArg, feature, layer);
                        }
                    }, null);
            }
        }
        return found;
    }
}
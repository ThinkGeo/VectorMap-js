import { GeoVectorTileSource } from "../source/geoVectorTileSource";
import { GeoVectorTile } from "../geoVectorTile";
import { GeoStyle } from "../style/geoStyle";
import { GeoMVTFormat } from "../format/geoMvt";
import { StyleJsonCache } from "../tree/styleJsonCache";
import { StyleJsonCacheItem } from "../tree/styleJsonCacheItem";
import { GeoVectorTileLayerRender } from "../render/geoVectorTilelayerRender";
import { TreeNode } from "../tree/TreeNode";
import { Tree } from "../tree/tree";
import { WorkerManager } from "../worker/workerManager";
import { VectorTileLayerThreadMode } from "../worker/vectorTileLayerThreadMode";
import drawPolygonGl from './../webgl/polygon';
import drawLineString from './../webgl/lineString';


export class VectorTileLayer extends (ol.layer.VectorTile as { new(p: olx.layer.VectorTileOptions): any; }) {
    maxDataZoom: number;
    minimalist: boolean;
    threadMode: VectorTileLayerThreadMode;
    isMultithread: boolean;
    workerManager: WorkerManager;

    constructor(styleJson: any, opt_options?: olx.layer.VectorTileOptions) {
        // default
        if (opt_options !== undefined) {
            opt_options["declutter"] = opt_options["declutter"] === undefined ? true : opt_options["declutter"];
            opt_options["minimalist"] = opt_options["minimalist"] === undefined ? true : opt_options["minimalist"];
            super(opt_options);
        } else {
            var options = {}
            options["declutter"] = true;
            options["minimalist"] = true;
            super(<any>options);
        }

        if (opt_options !== undefined) {
            // temp Emil
            var tempIsMultithread = opt_options["multithread"] === undefined ? true : opt_options["multithread"];

            this.threadMode = opt_options["threadMode"] === undefined ? true : opt_options["threadMode"];
            this.isMultithread = this.threadMode !== VectorTileLayerThreadMode.SingleThread;
            this.backgroundWorkerCount = opt_options["backgroundWorkerCount"];

            // temp Emil
            if (tempIsMultithread) {
                this.threadMode = VectorTileLayerThreadMode.Default;
                this.backgroundWorkerCount = 1;
            }


            this.minimalist = opt_options["minimalist"] === undefined ? true : opt_options["minimalist"];
            this.maxDataZoom = opt_options["maxDataZoom"] === undefined ? 14 : opt_options["maxDataZoom"];
            this.proxy = opt_options["proxy"];
            this.clientId = opt_options["clientId"];
            this.clientSecret = opt_options["clientSecret"];
            this.apiKey = opt_options["apiKey"];
        } else {
            this.isMultithread = true;
            this.minimalist = true;
            this.maxDataZoom = 14;
        }

        this.registerGeoVector();
        if (this.isStyleJsonUrl(styleJson)) {
            this.loadStyleJsonAsyn(styleJson);
        }
        else {
            this.loadStyleJson(styleJson);
        }
        this.type = (<any>ol).LayerType.MAPSUITE_VECTORTILE;

    }

    loadStyleJsonAsyn(styleJsonUrl) {
        let xhr = new XMLHttpRequest();
        // FIXME Eric
        xhr.open("GET", styleJsonUrl);

        xhr.onload = function (event: any) {
            if (!xhr.status || xhr.status >= 200 && xhr.status < 300) {
                let source;
                source = xhr.responseText;
                this.styleJson = JSON.parse(source);
                this.loadStyleJson(JSON.parse(source));
            }
        }.bind(this);
        xhr.onerror = function () {
        }.bind(this);
        xhr.send();
    }

    loadStyleJson(inputStyleJson: any) {
        var styleJson = this.styleJson = JSON.parse(JSON.stringify(inputStyleJson));
        this.version = styleJson["version"];
        this.owner = styleJson["owner"];
        this.dateTime = styleJson["dateTime"];
        this.variables = this.getVariables(styleJson["variables"]);
        this.background = styleJson["background"];

        this.replaceVariables(styleJson, this.variables);

        this.geoSources = {};
        if (styleJson["layers"] && styleJson["layers"].length > 0) {
            var layerJson = styleJson["layers"][0];
            var sourceId = layerJson["source"];

            var source = this.getGeoSource(sourceId);
            if (source) {
                this.setSource(source);
                if (this.background) {
                    let backgroundColor = GeoStyle.toRGBAColor(this.background);
                    if (backgroundColor) {
                        this["background"] = backgroundColor;
                    }
                }

                let styleJsons = styleJson["styles"];
                let styleIds = layerJson["styles"];
                let minZoom = 0;
                let maxZoom = 22;
                let layerName = source.getGeoFormat().getLayerName();

                let styleJsonCache = new StyleJsonCache();
                let styleIdIndex = 0;
                for (let styleId of styleIds) {
                    let styleJson;
                    for (let index = 0; index < styleJsons.length; index++) {
                        if (styleJsons[index].id === styleId) {
                            styleJson = styleJsons[index];
                        }
                    }
                    if (styleJson) {
                        styleJsonCache.styleJson[styleId] = styleJson;
                        let item = new StyleJsonCacheItem(styleJson, minZoom, maxZoom, layerName);

                        for (let zoom = item.minZoom; zoom <= item.maxZoom; zoom++) {
                            let treeNode = new TreeNode<StyleJsonCacheItem>(item);
                            this.createChildrenNode(treeNode, item, zoom);
                            styleJsonCache.add(zoom, item.dataLayerName, new Tree(treeNode, styleIdIndex));
                        }

                        styleIdIndex += 1;
                    }
                }
                let geoFormat = source.getGeoFormat();
                geoFormat["styleJsonCache"] = styleJsonCache;

                if (this.isMultithread) {
                    if (this.workerManager) {
                        let messageData = {
                            formatId: (<any>ol).getUid(geoFormat),
                            styleJson: styleJsonCache.styleJson,
                            geoTextStyleInfos: styleJsonCache.geoTextStyleInfo
                        };

                        for (let i = 0; i < this.workerManager.workerCount; i++) {
                            this.workerManager.postMessage((<any>ol).getUid(messageData), "initStyleJSON", messageData, undefined, i);
                        }
                    }
                }
            }
        }
    }

    getGeoSource(sourceId) {
        if (this.geoSources && this.geoSources[sourceId]) {
            return this.geoSources[sourceId];
        }

        if (this.styleJson["sources"]) {
            this.styleJson['sources'].forEach(sourceJson => {
                if (sourceId === sourceJson['id']) {
                    if (!sourceJson['urls'] && sourceJson['url']) {
                        sourceJson['urls'] = [sourceJson['url']];
                        delete sourceJson['url'];
                    }
                    sourceJson['urls'] = sourceJson['urls'].map(url => {
                        if (url.indexOf('http') === -1 && url.indexOf('https') === -1) {
                            var host = location.host;
                            var protocol = location.protocol;
                            if (url.indexOf('/') !== 0) {
                                url = protocol + '//' + host + '/' + url;
                            }
                            else if (url.indexOf('/') === 0) {
                                url = protocol + '//' + host + url;
                            }
                        }
                        // apiKey
                        if (url.indexOf('apiKey') === -1 && this.apiKey) {
                            url = url + '?apiKey=' + this.apiKey;
                        }
                        // proxy
                        if (this.proxy) {
                            url = this.proxy + encodeURIComponent(url);
                        }
                        return url;
                    })
                    this.geoSources[sourceJson["id"]] = this.createVectorTileSource(sourceJson);
                    return true;
                }
            });

            return this.geoSources[sourceId];
        }

        return false;
    }

    createVectorTileSource(sourceJson) {
        if (sourceJson["type"] === "MVT") {
            var format = this.getVectorSourceFormat();
            var source = new GeoVectorTileSource({
                tileClass: <any>GeoVectorTile,
                urls: sourceJson["urls"],
                clientId: this.clientId,
                clientSecret: this.clientSecret,
                format: format,
                projection: "EPSG:3857",
                tileGrid: this.createVectorTileGrid(),
                cacheSize: 1024,
                multithread: this.isMultithread,
                minimalist: this.minimalist,
                maxDataZoom: this.maxDataZoom
            });
            format['source'] = source;

            return source;
        }
    }

    protected getVectorSourceFormat() {
        let format = new GeoMVTFormat(undefined, { multithread: this.isMultithread, minimalist: this.minimalist });
        if (this.isMultithread) {
            if (!this.workerManager || !this.workerManager.inited) {
                this.workerManager = new WorkerManager(this.threadMode, this.backgroundWorkerCount);
                this.workerManager.initWorkers();
            }
            if (this.workerManager.inited) {
                format["workerManager"] = this.workerManager;
            }
        }
        return format;
    }

    protected createVectorTileGrid(): ol.tilegrid.TileGrid {
        return ol.tilegrid.createXYZ({ tileSize: 512, maxZoom: 22 });
    }

    getVariables(variablesJson: any) {
        let variables = {};
        for (let variablesName in variablesJson) {
            if (variablesName.indexOf(",") > 0) {
                let variableNames = variablesName.split(",");
                for (let i = 0; i < variableNames.length; i++) {
                    variables[variableNames[i]] = variablesJson[variablesName];
                }
            } else {
                variables[variablesName] = variablesJson[variablesName];
            }
        }

        return variables;
    }

    replaceVariables(styleJson: any, variables: any) {
        for (let propertyName in styleJson) {
            let property = styleJson[propertyName];
            if (typeof property === "object") {
                this.replaceVariables(property, variables);
            }
            else if (typeof property === "string") {
                let keyWordIndex = property.indexOf("@");
                if (keyWordIndex >= 0) {
                    let lines = property.split(" ");
                    if (lines.length > 1) {
                        let tempWord;
                        let results = [];
                        for (let i = 0; i < lines.length; i++) {
                            tempWord = lines[i];
                            if (tempWord.indexOf("@") === 0) {
                                tempWord = variables[tempWord];
                            }
                            results.push(tempWord);
                        }
                        styleJson[propertyName] = results.join(" ");
                    }
                    else {
                        styleJson[propertyName] = variables[lines[0]];
                    }
                }
            }
        }
    }

    createChildrenNode(currentNode: TreeNode<StyleJsonCacheItem>, item: StyleJsonCacheItem, zoom: number) {
        if (item.subStyleCacheItems && item.subStyleCacheItems.length > 0) {
            for (let i = 0, ii = item.subStyleCacheItems.length; i < ii; i++) {
                let subStyleItem = item.subStyleCacheItems[i];
                if (zoom >= subStyleItem.minZoom && zoom <= subStyleItem.maxZoom) {
                    let node = new TreeNode<StyleJsonCacheItem>(subStyleItem);
                    currentNode.children.push(node);
                    this.createChildrenNode(node, subStyleItem, zoom);
                }
            }
        }
    }

    isStyleJsonUrl(styleJson): boolean {
        if (styleJson) {
            if (typeof styleJson !== "object") {
                return true;
            }
        }
        return false;
    }

    private registerGeoVector() {
        (<any>ol).LayerType["GEOVECTORTILE"] = "GEOVECTORTILE";
        // TODO: check the plugin had been registed.
        (<any>ol).plugins.register((<any>ol).PluginType.LAYER_RENDERER, GeoVectorTileLayerRender);
        // (<any>ol.VectorTile).Event = function (type, xhr) {
        //     ol.events.Event.call(this, type);

        //     this.xhr = xhr;
        // };
        // ol.inherits((<any>ol.VectorTile), (<any>ol.events).Event);

        (<any>ol).VectorImageTile.prototype.disposeInternal = function () {
            for (let i = 0, ii = this.tileKeys.length; i < ii; ++i) {
                let sourceTileKey = this.tileKeys[i];
                let sourceTile = this.getTile(sourceTileKey);
                sourceTile.consumers--;
                if (sourceTile.consumers == 0) {
                    delete this.sourceTiles_[sourceTileKey];
                    sourceTile.dispose();
                }
            }
            this.sourceTiles_ = null;
            this.loadListenerKeys_.forEach((<any>ol).events.unlistenByKey);
            this.loadListenerKeys_.length = 0;
            if (this.interimTile) {
                this.interimTile.dispose();
            }
            this.state = (<any>ol).TileState.ABORT;
            this.changed();
            // for the disposeInternal
            this.tileKeys.length = 0;
            this.sourceTileListenerKeys_.forEach((<any>ol).events.unlistenByKey);
            this.sourceTileListenerKeys_.length = 0;
            (<any>ol).Tile.prototype.disposeInternal.call(this);
        };

        (<any>ol).TileQueue.prototype.handleTileChange = function (event) {
            let tile = /** @type {ol.Tile} */ (event.target);
            let state = tile.getState();
            if (state === (<any>ol).TileState.LOADED || state === (<any>ol).TileState.ERROR ||
                state === (<any>ol).TileState.EMPTY || state === (<any>ol).TileState.ABORT ||
                state === (<any>ol).TileState.CANCEL) {
                if (state === (<any>ol).TileState.ABORT || state === (<any>ol).TileState.ERROR) {
                    (<any>ol).events.unlisten(tile, (<any>ol).events.EventType.CHANGE,
                        this.handleTileChange, this);
                }

                let tileKey = tile.getKey();
                if (tileKey in this.tilesLoadingKeys_) {
                    delete this.tilesLoadingKeys_[tileKey];
                    --this.tilesLoading_;
                }

                // Remove the enqueue records, if the tile has been dispose before load
                if (tileKey in this.queuedElements_) {
                    delete this.queuedElements_[tileKey];
                }
                this.tileChangeCallback_();
            }
        };

        // remove quickZoom when animation complete
        (<any>ol).View.prototype.updateAnimations_ = function () {
            if (this.updateAnimationKey_ !== undefined) {
                cancelAnimationFrame(this.updateAnimationKey_);
                this.updateAnimationKey_ = undefined;
            }
            if (!this.getAnimating()) {
                return;
            }
            var now = Date.now();
            var more = false;
            for (var i = this.animations_.length - 1; i >= 0; --i) {
                var series = this.animations_[i];
                var seriesComplete = true;
                for (var j = 0, jj = series.length; j < jj; ++j) {
                    var animation = series[j];
                    if (animation.complete) {
                        continue;
                    }
                    var elapsed = now - animation.start;
                    var fraction = animation.duration > 0 ? elapsed / animation.duration : 1;
                    if (fraction >= 1) {
                        animation.complete = true;
                        fraction = 1;
                    } else {
                        seriesComplete = false;
                    }
                    var progress = animation.easing(fraction);
                    if (animation.sourceCenter) {
                        var x0 = animation.sourceCenter[0];
                        var y0 = animation.sourceCenter[1];
                        var x1 = animation.targetCenter[0];
                        var y1 = animation.targetCenter[1];
                        var x = x0 + progress * (x1 - x0);
                        var y = y0 + progress * (y1 - y0);
                        this.set((<any>ol).ViewProperty.CENTER, [x, y]);
                    }
                    if (animation.sourceResolution && animation.targetResolution) {
                        var resolution = progress === 1 ?
                            animation.targetResolution :
                            animation.sourceResolution + progress * (animation.targetResolution - animation.sourceResolution);
                        if (animation.anchor) {
                            this.set((<any>ol).ViewProperty.CENTER,
                                this.calculateCenterZoom(resolution, animation.anchor));
                        }
                        this.set((<any>ol).ViewProperty.RESOLUTION, resolution);
                    }
                    if (animation.sourceRotation !== undefined && animation.targetRotation !== undefined) {
                        var rotation = progress === 1 ?
                            (<any>ol).math.modulo(animation.targetRotation + Math.PI, 2 * Math.PI) - Math.PI :
                            animation.sourceRotation + progress * (animation.targetRotation - animation.sourceRotation);
                        if (animation.anchor) {
                            this.set((<any>ol).ViewProperty.CENTER,
                                this.calculateCenterRotate(rotation, animation.anchor));
                        }
                        this.set((<any>ol).ViewProperty.ROTATION, rotation);
                    }
                    more = true;
                    if (!animation.complete) {
                        break;
                    }
                }
                if (seriesComplete) {
                    this.animations_[i] = null;
                    this.setHint((<any>ol).ViewHint.ANIMATING, -1);
                    var callback = series[0].callback;
                    if (callback) {
                        callback(true);
                    }
                }
            }
            // prune completed series
            this.animations_ = this.animations_.filter(Boolean);
            if (more && this.updateAnimationKey_ === undefined) {
                this.updateAnimationKey_ = requestAnimationFrame(this.updateAnimations_);
            }
        };

        // Get quickZoom zoom in/out
        (<any>ol).View.prototype.animate = function (var_args) {
            var animationCount = arguments.length;
            var callback;
            if (animationCount > 1 && typeof arguments[animationCount - 1] === 'function') {
                callback = arguments[animationCount - 1];
                --animationCount;
            }
            if (!this.isDef()) {
                // if view properties are not yet set, shortcut to the final state
                var state = arguments[animationCount - 1];
                if (state.center) {
                    this.setCenter(state.center);
                }
                if (state.zoom !== undefined) {
                    this.setZoom(state.zoom);
                }
                if (state.rotation !== undefined) {
                    this.setRotation(state.rotation);
                }
                if (callback) {
                    callback(true);
                }
                return;
            }
            var start = Date.now();
            var center = this.getCenter().slice();
            var resolution = this.getResolution();
            var rotation = this.getRotation();
            var series = [];
            var quickZoom = false;
            for (var i = 0; i < animationCount; ++i) {
                var options = /** @type {olx.AnimationOptions} */ (arguments[i]);

                var animation = /** @type {ol.ViewAnimation} */ ({
                    start: start,
                    complete: false,
                    anchor: options.anchor,
                    duration: options.duration !== undefined ? options.duration : 1000,
                    easing: options.easing || ol.easing.inAndOut
                });

                if (options.center) {
                    animation["sourceCenter"] = center;
                    animation["targetCenter"] = options.center;
                    center = animation["targetCenter"];
                }

                if (options.zoom !== undefined) {
                    animation["sourceResolution"] = resolution;
                    animation["targetResolution"] = this.constrainResolution(
                        this.maxResolution_, options.zoom - this.minZoom_, 0);
                    resolution = animation["targetResolution"];

                    if (!quickZoom) {
                        quickZoom = Math.abs(animation["sourceResolution"] - animation["targetResolution"]) * 2 >= animation["sourceResolution"];
                    }
                } else if (options.resolution) {
                    animation["sourceResolution"] = resolution;
                    animation["targetResolution"] = options.resolution;
                    resolution = animation["targetResolution"];

                    if (!quickZoom) {
                        quickZoom = Math.abs(animation["sourceResolution"] - animation["targetResolution"]) * 2 >= animation["sourceResolution"];
                    }
                }

                if (options.rotation !== undefined) {
                    animation["sourceRotation"] = rotation;
                    var delta = (<any>ol).math.modulo(options.rotation - rotation + Math.PI, 2 * Math.PI) - Math.PI;
                    animation["targetRotation"] = rotation + delta;
                    rotation = animation["targetRotation"];
                }


                animation["callback"] = callback;

                // check if animation is a no-op
                if ((<any>ol).View.isNoopAnimation(animation)) {
                    animation.complete = true;
                    // we still push it onto the series for callback handling
                } else {
                    start += animation.duration;
                }
                series.push(animation);
            }
            this.animations_.push(series);
            this["quickZoom"] = quickZoom;
            this.setHint((<any>ol).ViewHint.ANIMATING, 1);
            this.updateAnimations_();
        };

        // add quickZoom into frameState
        (<any>ol).PluggableMap.prototype.renderFrame_ = function (time) {
            var i, ii, viewState;

            var size = this.getSize();
            var view = this.getView();
            var extent = ol.extent.createEmpty();
            var previousFrameState = this.frameState_;
            /** @type {?olx.FrameState} */
            var frameState = null;
            if (size !== undefined && (<any>ol).size.hasArea(size) && view && view.isDef()) {
                var viewHints = view.getHints(this.frameState_ ? this.frameState_.viewHints : undefined);
                var quickZoom = view["quickZoom"];
                var layerStatesArray = this.getLayerGroup().getLayerStatesArray();
                var layerStates = {};
                for (i = 0, ii = layerStatesArray.length; i < ii; ++i) {
                    layerStates[(<any>ol).getUid(layerStatesArray[i].layer)] = layerStatesArray[i];
                }
                viewState = view.getState();
                var center = viewState.center;
                var pixelResolution = viewState.resolution / this.pixelRatio_;
                center[0] = Math.round(center[0] / pixelResolution) * pixelResolution;
                center[1] = Math.round(center[1] / pixelResolution) * pixelResolution;
                frameState = /** @type {olx.FrameState} */ ({
                    animate: false,
                    coordinateToPixelTransform: this.coordinateToPixelTransform_,
                    extent: extent,
                    focus: !this.focus_ ? center : this.focus_,
                    index: this.frameIndex_++,
                    layerStates: layerStates,
                    layerStatesArray: layerStatesArray,
                    logos: (<any>ol).obj.assign({}, this.logos_),
                    pixelRatio: this.pixelRatio_,
                    pixelToCoordinateTransform: this.pixelToCoordinateTransform_,
                    postRenderFunctions: [],
                    size: size,
                    skippedFeatureUids: this.skippedFeatureUids_,
                    tileQueue: this.tileQueue_,
                    time: time,
                    usedTiles: {},
                    viewState: viewState,
                    viewHints: viewHints,
                    quickZoom: quickZoom,
                    currentResolution: viewState.resolution,
                    wantedTiles: {}
                });
            }

            if (frameState) {
                frameState.extent = (<any>ol).extent.getForViewAndSize(viewState.center,
                    viewState.resolution, viewState.rotation, frameState.size, extent);
            }

            this.frameState_ = frameState;
            this.renderer_.renderFrame(frameState);

            if (frameState) {
                if (frameState.animate) {
                    this.render();
                }
                Array.prototype.push.apply(
                    this.postRenderFunctions_, frameState.postRenderFunctions);

                if (previousFrameState) {
                    var moveStart = !this.previousExtent_ ||
                        (!ol.extent.isEmpty(this.previousExtent_) &&
                            !ol.extent.equals(frameState.extent, this.previousExtent_));
                    if (moveStart) {
                        this.dispatchEvent(
                            new ol.MapEvent((<any>ol).MapEventType.MOVESTART, this, previousFrameState));
                        this.previousExtent_ = (<any>ol).extent.createOrUpdateEmpty(this.previousExtent_);
                    }
                }

                var idle = this.previousExtent_ &&
                    !frameState.viewHints[(<any>ol).ViewHint.ANIMATING] &&
                    !frameState.viewHints[(<any>ol).ViewHint.INTERACTING] &&
                    !ol.extent.equals(frameState.extent, this.previousExtent_);

                if (idle) {
                    this.dispatchEvent(
                        new ol.MapEvent((<any>ol).MapEventType.MOVEEND, this, frameState));
                    (<any>ol).extent.clone(frameState.extent, this.previousExtent_);
                }
            }

            this.dispatchEvent(
                new ol.MapEvent((<any>ol).MapEventType.POSTRENDER, this, frameState));

            setTimeout(this.handlePostRender.bind(this), 0);

        };

        // refine drawImage performance
        (<any>ol).renderer.canvas.TileLayer.prototype.drawTileImage = function (tile, frameState, layerState, x, y, w, h, gutter, transition) {
            var image = tile.getImage(this.getLayer());
            if (!image) {
                return;
            }
            var uid = (<any>ol).getUid(this);
            var alpha = transition ? tile.getAlpha(uid, frameState.time) : 1;
            if (alpha === 1 && !this.getLayer().getSource().getOpaque(frameState.viewState.projection)) {
                this.context.clearRect(x, y, w, h);
            }
            var alphaChanged = alpha !== this.context.globalAlpha;
            if (alphaChanged) {
                this.context.save();
                this.context.globalAlpha = alpha;
            }
            this.context.drawImage(image, gutter, gutter,
                image.width - 2 * gutter, image.height - 2 * gutter, x, y, w, h);

            if (alphaChanged) {
                this.context.restore();
            }
            if (alpha !== 1) {
                frameState.animate = true;
            } else if (transition) {
                tile.endTransition(uid);
            }
        };

        //refine drawing, and remove instructions after using
        (<any>ol).render.canvas.Replay.prototype.replay_ = function (
            context, transform, skippedFeaturesHash,
            instructions, featureCallback, opt_hitExtent) {
            /** @type {Array.<number>} */
            var pixelCoordinates;
            if (this.instructions != instructions) {
                // hit instructions
                if (this.pixelCoordinates_ && (<any>ol).array.equals(transform, this.renderedTransform_)) {
                    pixelCoordinates = this.pixelCoordinates_;
                } else {
                    pixelCoordinates = (<any>ol).geom.flat.transform.transform2D(
                        this.coordinates, 0, this.coordinates.length, 2,
                        transform, []);
                }
            }
            else {
                // instructions
                if (this.pixelCoordinates_ && (<any>ol).array.equals(transform, this.renderedTransform_)) {
                    pixelCoordinates = this.pixelCoordinates_;
                } else {
                    if (!this.pixelCoordinates_) {
                        this.pixelCoordinates_ = [];
                    }
                    pixelCoordinates = (<any>ol).geom.flat.transform.transform2D(
                        this.coordinates, 0, this.coordinates.length, 2,
                        transform, this.pixelCoordinates_);
                    (<any>ol).transform.setFromArray(this.renderedTransform_, transform);
                }
            }

            if (this.webglEnds) {
                var webglContext=(<any>ol).webglContext;
                // let webglContext=this.webglContext;
                let width = webglContext.canvas.width;
                let height = webglContext.canvas.height;
                if (this.webglDrawType === 'polygonReplay') {
                    // gl.enable(gl.BLEND);
                    // gl.blendFunc(gl.SRC_COLOR, gl.ONE_MINUS_SRC_ALPHA);
                    drawPolygonGl(webglContext.gl, 
                        { 
                            coordinates: this.webglCoordinates, 
                            webglEnds: this.webglEnds, 
                            webglStyle: this.webglStyle, 
                            webglIndexObj: this.webglIndexObj 
                        }
                    );
                    context.drawImage(webglContext.canvas, 0, 0, width, height);
                }
                else if (this.webglDrawType === 'lineStringReplay') {
                    // drawLineString(webglContext.gl, 
                    //     { 
                    //         webglLineIndex: this.webglLineIndex
                    //     }
                    // );
                    // context.drawImage(webglContext.canvas, 0, 0, width, height);
                }
            }else {
                var skipFeatures = !(<any>ol).obj.isEmpty(skippedFeaturesHash);
                var i = 0; // instruction index
                var ii = instructions.length; // end of instructions
                var d = 0; // data index
                var dd; // end of per-instruction data
                var anchorX, anchorY, prevX, prevY, roundX, roundY, declutterGroup, image;
                var pendingFill = 0;
                var pendingStroke = 0;
                var lastFillInstruction = null;
                var lastStrokeInstruction = null;
                var coordinateCache = this.coordinateCache_;
                var viewRotation = this.viewRotation_;

                var state = /** @type {olx.render.State} */ ({
                    context: context,
                    pixelRatio: this.pixelRatio,
                    resolution: this.resolution,
                    rotation: viewRotation
                });

                // When the batch size gets too big, performance decreases. 200 is a good
                // balance between batch size and number of fill/stroke instructions.
                var batchSize =
                    this.instructions != instructions || this.overlaps ? 0 : 200;


                while (i < ii) {
                    var instruction = instructions[i];
                    var type = /** @type {ol.render.canvas.Instruction} */ (instruction[0]);
                    var /** @type {ol.Feature|ol.render.Feature} */ feature, x, y;
                    switch (type) {
                        case (<any>ol).render.canvas.Instruction.BEGIN_GEOMETRY:
                            feature = /** @type {ol.Feature|ol.render.Feature} */ (instruction[1]);
                            if ((skipFeatures &&
                                skippedFeaturesHash[(<any>ol).getUid(feature).toString()]) ||
                                !feature.getGeometry()) {
                                i = /** @type {number} */ (instruction[2]);
                            } else if (opt_hitExtent !== undefined && !ol.extent.intersects(
                                opt_hitExtent, feature.getGeometry().getExtent())) {
                                i = /** @type {number} */ (instruction[2]) + 1;
                            } else {
                                ++i;
                            }
                            break;
                        case (<any>ol).render.canvas.Instruction.BEGIN_PATH:
                            if (pendingFill > batchSize) {
                                this.fill_(context);
                                pendingFill = 0;
                            }
                            if (pendingStroke > batchSize) {
                                context.stroke();
                                pendingStroke = 0;
                            }
                            if (!pendingFill && !pendingStroke) {
                                context.beginPath();
                                prevX = prevY = NaN;
                            }
                            ++i;
                            break;
                        case (<any>ol).render.canvas.Instruction.CIRCLE:
                            d = /** @type {number} */ (instruction[1]);
                            var x1 = pixelCoordinates[d];
                            var y1 = pixelCoordinates[d + 1];
                            var x2 = pixelCoordinates[d + 2];
                            var y2 = pixelCoordinates[d + 3];
                            var dx = x2 - x1;
                            var dy = y2 - y1;
                            var r = Math.sqrt(dx * dx + dy * dy);
                            context.moveTo(x1 + r, y1);
                            context.arc(x1, y1, r, 0, 2 * Math.PI, true);
                            ++i;
                            break;
                        case (<any>ol).render.canvas.Instruction.CLOSE_PATH:
                            context.closePath();
                            ++i;
                            break;
                        case (<any>ol).render.canvas.Instruction.CUSTOM:
                            d = /** @type {number} */ (instruction[1]);
                            dd = instruction[2];
                            var geometry = /** @type {ol.geom.SimpleGeometry} */ (instruction[3]);
                            var renderer = instruction[4];
                            var fn = instruction.length == 6 ? instruction[5] : undefined;
                            state["geometry"] = geometry;
                            state["feature"] = feature;
                            if (!(i in coordinateCache)) {
                                coordinateCache[i] = [];
                            }
                            var coords = coordinateCache[i];
                            if (fn) {
                                fn(pixelCoordinates, d, dd, 2, coords);
                            } else {
                                coords[0] = pixelCoordinates[d];
                                coords[1] = pixelCoordinates[d + 1];
                                coords.length = 2;
                            }
                            renderer(coords, state);
                            ++i;
                            break;
                        case (<any>ol).render.canvas.Instruction.DRAW_IMAGE:
                            d = /** @type {number} */ (instruction[1]);
                            dd = /** @type {number} */ (instruction[2]);
                            image =  /** @type {HTMLCanvasElement|HTMLVideoElement|Image} */
                                (instruction[3]);
                            // Remaining arguments in DRAW_IMAGE are in alphabetical order
                            anchorX = /** @type {number} */ (instruction[4]);
                            anchorY = /** @type {number} */ (instruction[5]);
                            declutterGroup = featureCallback ? null : /** @type {ol.DeclutterGroup} */ (instruction[6]);
                            var height = /** @type {number} */ (instruction[7]);
                            var opacity = /** @type {number} */ (instruction[8]);
                            var originX = /** @type {number} */ (instruction[9]);
                            var originY = /** @type {number} */ (instruction[10]);
                            var rotateWithView = /** @type {boolean} */ (instruction[11]);
                            var rotation = /** @type {number} */ (instruction[12]);
                            var scale = /** @type {number} */ (instruction[13]);
                            var snapToPixel = /** @type {boolean} */ (instruction[14]);
                            var width = /** @type {number} */ (instruction[15]);

                            var padding, backgroundFill, backgroundStroke;
                            if (instruction.length > 16) {
                                padding = /** @type {Array.<number>} */ (instruction[16]);
                                backgroundFill = /** @type {boolean} */ (instruction[17]);
                                backgroundStroke = /** @type {boolean} */ (instruction[18]);
                            } else {
                                padding = (<any>ol).render.canvas.defaultPadding;
                                backgroundFill = backgroundStroke = false;
                            }

                            if (rotateWithView) {
                                rotation += viewRotation;
                            }
                            for (; d < dd; d += 2) {
                                this.replayImage_(context,
                                    pixelCoordinates[d], pixelCoordinates[d + 1], image, anchorX, anchorY,
                                    declutterGroup, height, opacity, originX, originY, rotation, scale,
                                    snapToPixel, width, padding,
                                    backgroundFill ? /** @type {Array.<*>} */ (lastFillInstruction) : null,
                                    backgroundStroke ? /** @type {Array.<*>} */ (lastStrokeInstruction) : null);
                            }
                            this.renderDeclutter_(declutterGroup, feature);
                            ++i;
                            break;
                        case (<any>ol).render.canvas.Instruction.DRAW_CHARS:
                            var begin = /** @type {number} */ (instruction[1]);
                            var end = /** @type {number} */ (instruction[2]);
                            var baseline = /** @type {number} */ (instruction[3]);
                            declutterGroup = featureCallback ? null : /** @type {ol.DeclutterGroup} */ (instruction[4]);
                            var overflow = /** @type {number} */ (instruction[5]);
                            var fillKey = /** @type {string} */ (instruction[6]);
                            var maxAngle = /** @type {number} */ (instruction[7]);
                            var measure = /** @type {function(string):number} */ (instruction[8]);
                            var offsetY = /** @type {number} */ (instruction[9]);
                            var strokeKey = /** @type {string} */ (instruction[10]);
                            var strokeWidth =  /** @type {number} */ (instruction[11]);
                            var text = /** @type {string} */ (instruction[12]);
                            var textKey = /** @type {string} */ (instruction[13]);
                            var textScale = /** @type {number} */ (instruction[14]);

                            var pathLength = (<any>ol).geom.flat.length.lineString(pixelCoordinates, begin, end, 2);
                            var textLength = measure(text);
                            if (overflow || textLength <= pathLength) {
                                var textAlign = /** @type {ol.render.canvas.TextReplay} */ (this).textStates[textKey].textAlign;
                                var startM = (pathLength - textLength) * (<any>ol).render.replay.TEXT_ALIGN[textAlign];
                                var parts = (<any>ol).geom.flat.textpath.lineString(
                                    pixelCoordinates, begin, end, 2, text, measure, startM, maxAngle);
                                if (parts) {
                                    var c, cc, chars, label, part;
                                    if (strokeKey) {
                                        for (c = 0, cc = parts.length; c < cc; ++c) {
                                            part = parts[c]; // x, y, anchorX, rotation, chunk
                                            chars = /** @type {string} */ (part[4]);
                                            label = /** @type {ol.render.canvas.TextReplay} */ (this).getImage(chars, textKey, '', strokeKey);
                                            anchorX = /** @type {number} */ (part[2]) + strokeWidth;
                                            anchorY = baseline * label.height + (0.5 - baseline) * 2 * strokeWidth - offsetY;
                                            this.replayImage_(context,
                            /** @type {number} */(part[0]), /** @type {number} */(part[1]), label,
                                                anchorX, anchorY, declutterGroup, label.height, 1, 0, 0,
                            /** @type {number} */(part[3]), textScale, false, label.width,
                                                (<any>ol.render).canvas.defaultPadding, null, null);
                                        }
                                    }
                                    if (fillKey) {
                                        for (c = 0, cc = parts.length; c < cc; ++c) {
                                            part = parts[c]; // x, y, anchorX, rotation, chunk
                                            chars = /** @type {string} */ (part[4]);
                                            label = /** @type {ol.render.canvas.TextReplay} */ (this).getImage(chars, textKey, fillKey, '');
                                            anchorX = /** @type {number} */ (part[2]);
                                            anchorY = baseline * label.height - offsetY;
                                            this.replayImage_(context,
                            /** @type {number} */(part[0]), /** @type {number} */(part[1]), label,
                                                anchorX, anchorY, declutterGroup, label.height, 1, 0, 0,
                            /** @type {number} */(part[3]), textScale, false, label.width,
                                                (<any>ol).render.canvas.defaultPadding, null, null);
                                        }
                                    }
                                }
                            }
                            this.renderDeclutter_(declutterGroup, feature);
                            ++i;
                            break;
                        case (<any>ol).render.canvas.Instruction.END_GEOMETRY:
                            if (featureCallback !== undefined) {
                                feature = /** @type {ol.Feature|ol.render.Feature} */ (instruction[1]);
                                var result = featureCallback(feature);
                                if (result) {
                                    return result;
                                }
                            }
                            ++i;
                            break;
                        case (<any>ol).render.canvas.Instruction.FILL:
                            if (batchSize) {
                                pendingFill++;
                            } else {
                                this.fill_(context);
                            }
                            ++i;
                            break;
                        case (<any>ol).render.canvas.Instruction.MOVE_TO_LINE_TO:
                            d = /** @type {number} */ (instruction[1]);
                            dd = /** @type {number} */ (instruction[2]);
                            x = pixelCoordinates[d];
                            y = pixelCoordinates[d + 1];
                            roundX = (x + 0.5) | 0;
                            roundY = (y + 0.5) | 0;
                            if (roundX !== prevX || roundY !== prevY) {
                                context.moveTo(x, y);
                                prevX = roundX;
                                prevY = roundY;
                            }
                            for (d += 2; d < dd; d += 2) {
                                x = pixelCoordinates[d];
                                y = pixelCoordinates[d + 1];
                                roundX = (x + 0.5) | 0;
                                roundY = (y + 0.5) | 0;
                                if (d == dd - 2 || roundX !== prevX || roundY !== prevY) {
                                    context.lineTo(x, y);
                                    prevX = roundX;
                                    prevY = roundY;
                                }
                            }
                            ++i;
                            break;
                        case (<any>ol).render.canvas.Instruction.SET_FILL_STYLE:
                            lastFillInstruction = instruction;
                            this.fillOrigin_ = instruction[2];

                            if (pendingFill) {
                                this.fill_(context);
                                pendingFill = 0;
                                if (pendingStroke) {
                                    context.stroke();
                                    pendingStroke = 0;
                                }
                            }

                            context.fillStyle = /** @type {ol.ColorLike} */ (instruction[1]);
                            ++i;
                            break;
                        case (<any>ol).render.canvas.Instruction.SET_STROKE_STYLE:
                            lastStrokeInstruction = instruction;
                            if (pendingStroke) {
                                context.stroke();
                                pendingStroke = 0;
                            }
                            this.setStrokeStyle_(context, /** @type {Array.<*>} */(instruction));
                            ++i;
                            break;
                        case (<any>ol).render.canvas.Instruction.STROKE:
                            if (batchSize) {
                                pendingStroke++;
                            } else {
                                context.stroke();
                            }
                            ++i;
                            break;
                        default:
                            ++i; // consume the instruction anyway, to avoid an infinite loop
                            break;
                    }
                }
                if (pendingFill) {
                    this.fill_(context);
                }
                if (pendingStroke) {
                    context.stroke();
                }

            }

            return undefined;
        };

        (<any>ol).renderer.canvas.VectorTileLayer.prototype.forEachFeatureAtCoordinate = function (coordinate, frameState, hitTolerance, callback, thisArg) {
            var resolution = frameState.viewState.resolution;
            var rotation = frameState.viewState.rotation;
            hitTolerance = hitTolerance == undefined ? 0 : hitTolerance;
            var layer = this.getLayer();
            /** @type {Object.<string, boolean>} */
            var features = {};

            /** @type {Array.<ol.VectorImageTile>} */
            var renderedTiles = this.renderedTiles;

            var source = /** @type {ol.source.VectorTile} */ (layer.getSource());
            var tileGrid = source.getTileGridForProjection(frameState.viewState.projection);
            var bufferedExtent, found;
            var i, ii, replayGroup;
            var tile, tileCoord, tileExtent;
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
                    found = found || replayGroup.forEachFeatureAtCoordinate(
                        coordinate, resolution, rotation, hitTolerance, {},
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
        };

    }
}
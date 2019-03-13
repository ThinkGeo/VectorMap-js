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
            opt_options["renderMode"] = 'vector';
            super(opt_options);
        } else {
            var options = {}
            options["declutter"] = true;
            options["minimalist"] = true;
            opt_options["renderMode"] = 'vector';
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
                this.backgroundWorkerCount = 2;
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

        (<any>ol).VectorImageTile.prototype.disposeInternal = function (context) {
            for (let i = 0, ii = this.tileKeys.length; i < ii; ++i) {
                let sourceTileKey = this.tileKeys[i];
                let sourceTile = this.getTile(sourceTileKey);
                sourceTile.consumers--;
                if (sourceTile.consumers == 0) {
                    // BufferCache in webgl
                    var vectorTile = this.sourceTiles_[sourceTileKey];
                    var replayGroups = vectorTile.replayGroups_;

                    for(var key in replayGroups){
                        replayGroups[key].getDeleteResourcesFunction(context)();
                    }

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
                    this.isDrag = true;
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
                    wantedTiles: {},
                    context: this.renderer_.context_,
                    isDrag: view.isDrag,
                    isZoomOut:view.isZoomOut,
                    isPinchOut:view.isPinchOut,
                    isClickZoomOut:view.isClickZoomOut
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
            // if(this.tileQueue_.elements_.length>0){
            //     debugger;
            // }
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

        // overwrite
        (<any>ol.render).webgl.Replay.prototype.replay = function (
            context, viewRotation, skippedFeaturesHash, screenXY) {
            this.viewRotation_ = viewRotation;
            this.webglReplay_(context, 
                skippedFeaturesHash, undefined, undefined, screenXY);
        };

        // recalculate the verctices of text for resolution changed                 
        (<any>ol.render).webgl.Replay.prototype.declutterRepeat_ = function (context, screenXY){
            var startIndicesFeature = this.startIndicesFeature;
            var startIndicesStyle = this.startIndicesStyle;
            // this.indices.length = 0;
            // this.vertices.length = 0;
            // this.groupIndices.length = 0;
            // this.images_.length = 0;
            var frameState = context.frameState;
            var pixelRatio = frameState.pixelRatio;
            // var tilePixelExtent = [];           
            this.screenXY = screenXY;
            // this.tilePixelExtent = tilePixelExtent;
            this.tmpOptions = [];

            for(var i = 0; i < startIndicesFeature.length; i++){
                var feature = startIndicesFeature[i];
                var style = startIndicesStyle[i];
                var declutterGroup = style.declutterGroup_;
                var geometry = feature.getGeometry();
                var type = feature.getType(); 

                if(!style){
                    continue;
                }

                if(this instanceof (<any>ol).render.webgl.ImageReplay){
                    this.setImageStyle(style);

                    var type = geometry.getType();
                    if(type == 'LineString'){
                        this.drawLineStringImage(geometry, feature, frameState, declutterGroup);                    
                    }else{
                        this.replayImage_(frameState, declutterGroup, geometry.getFlatCoordinates(), style.scale_);
                        this.renderDeclutter_(declutterGroup, feature);
                    }
                }else{ 
                    if(type == 'MultiLineString'){
                        var ends = geometry.getEnds();
                        for(var k = 0; k < ends.length; k++){
                            var flatCoordinates = geometry.getFlatCoordinates().slice(ends[k - 1] || 0, ends[k]);
                            var newFeature = new (<any>ol).render.Feature('LineString', flatCoordinates, [flatCoordinates.length], feature.properties_, feature.id_);
                            
                            this.setTextStyle(style);
                            this.drawLineStringText(newFeature.getGeometry(), newFeature, frameState, declutterGroup);
                        }  
                    }else{
                        this.setTextStyle(style);
                        if(this.label){          
                            var lineWidth = (this.state_.lineWidth / 2) * this.state_.scale;        
                            this.width = this.label.width + lineWidth; 
                            this.height = this.label.height; 
                            this.anchorX = Math.floor(this.width * this.textAlign_ - this.offsetX_);
                            this.anchorY = Math.floor(this.height * this.textBaseline_ - this.offsetY_);
                            this.replayImage_(frameState, declutterGroup, geometry.getFlatCoordinates(), this.state_.scale / pixelRatio);
                            this.renderDeclutter_(declutterGroup, feature);
                        }else{   
                            // draw chars 
                            this.drawLineStringText(geometry, feature, frameState, declutterGroup);
                        }
                    }
                }
            }
        };
    
        (<any>ol.render).webgl.Replay.prototype.renderDeclutter_ = function (declutterGroup, feature){
            if(declutterGroup && declutterGroup.length > 5){
                var groupCount = declutterGroup[4];
                if (groupCount == 1 || groupCount == declutterGroup.length - 5) {
                    var box = {
                        minX: /** @type {number} */ (declutterGroup[0]),
                        minY: /** @type {number} */ (declutterGroup[1]),
                        maxX: /** @type {number} */ (declutterGroup[2]),
                        maxY: /** @type {number} */ (declutterGroup[3]),
                        value: feature
                    };

                    if(!this.declutterTree.collides(box)){
                        this.declutterTree.insert(box);
                        for (var j = 5, jj = declutterGroup.length; j < jj; ++j) {
                            var declutter = declutterGroup[j];
                            var options = declutter[0];
                            var this$1 = declutter[1];
                            this$1.tmpOptions.push(options);

                            // if(this$1 instanceof (<any>ol).render.webgl.TextReplay){
                            //     this$1.drawText(options);
                            // }else if(this$1 instanceof (<any>ol).render.webgl.ImageReplay){
                            //     this$1.drawPoint(options);
                            // }
                        }
                    }
                    declutterGroup.length = 5;
                    (<any>ol.extent).createOrUpdateEmpty(declutterGroup);
                }
            }
        };

        (<any>ol.render).webgl.Replay.prototype.replayCharImage_ = function (frameState, declutterGroup, part){
            var scale = this.scale;
            var coordinateToPixelTransform = frameState.coordinateToPixelTransform;
            var x = part[0];
            var y = part[1];
            var rotation = part[3];
            var text = part[4];
            var cos = Math.cos(rotation);
            var sin = Math.sin(rotation); 
            var anchorX = part[2];
            var anchorY = Math.floor(this.height * this.textBaseline_ - this.offsetY_);
            var width = this.width;
            var height = this.height;
            var bottomLeft = [];
            var bottomRight = [];
            var topLeft = [];
            var topRight = [];
            var offsetX, offsetY;
            var pixelCoordinate = (<any>ol).transform.apply(coordinateToPixelTransform,
                [x - this.origin[0] + this.screenXY[0], y - this.origin[1] + this.screenXY[1]]);
            x = pixelCoordinate[0];
            y = pixelCoordinate[1];

            // bottom-left corner
            offsetX = -scale * anchorX;
            offsetY = -scale * (height - anchorY);
            bottomLeft[0] = x + (offsetX * cos - offsetY * sin);
            bottomLeft[1] = y + (offsetX * sin + offsetY * cos);

            // bottom-right corner
            offsetX = scale * (width - anchorX);
            offsetY = -scale * (height - anchorY);
            bottomRight[0] = x + (offsetX * cos - offsetY * sin);
            bottomRight[1] = y + (offsetX * sin + offsetY * cos);

            // top-right corner
            offsetX = scale * (width - anchorX);
            offsetY = scale * anchorY;
            topRight[0] = x + (offsetX * cos - offsetY * sin);
            topRight[1] = y + (offsetX * sin + offsetY * cos);

            // top-left corner
            offsetX = -scale * anchorX;
            offsetY = scale * anchorY;
            topLeft[0] = x + (offsetX * cos - offsetY * sin);
            topLeft[1] = y + (offsetX * sin + offsetY * cos);

            (<any>ol).extent.extendCoordinate(declutterGroup, bottomLeft);
            (<any>ol).extent.extendCoordinate(declutterGroup, bottomRight);
            (<any>ol).extent.extendCoordinate(declutterGroup, topRight);
            (<any>ol).extent.extendCoordinate(declutterGroup, topLeft);

            var declutterArgs = [{
                anchorX,
                anchorY,
                rotation,
                flatCoordinates: [part[0], part[1]],
                text,
                currAtlas: this.currAtlas_
            }, this];
            declutterGroup.push(declutterArgs);
        };
  
        (<any>ol.render).webgl.TextReplay.prototype.drawLineStringText = function (geometry, feature, frameState, declutterGroup) {
            var offset = 0;
            var stride = 2;
            var resolution = frameState.currentResolution;
            var text = this.text_;
            var maxAngle = this.maxAngle_;
            var lineStringCoordinates = geometry.getFlatCoordinates();
            var end = lineStringCoordinates.length;
            var pathLength = (<any>ol.geom).flat.length.lineString(lineStringCoordinates, offset, end, stride, resolution);
            let textLength = this.getTextSize_([text])[0];

            if(this.label){
                pathLength = textLength
            }
            if (textLength * 1.2 <= pathLength) {  
                let declutterGroups = [];
                this.extent = (<any>ol.extent).createOrUpdateEmpty();          
                var ratio = 1.194328566955879 / resolution;

                if(ratio >= 3){
                    ratio /= 2;
                }
                var distance = 180 * ratio;
                var tmpLength = pathLength - textLength;
                var centerPoint = tmpLength / 2;
                var leftPoint = centerPoint;
                var rightPoint = centerPoint;
                var pointArray = [];
                pointArray.push(centerPoint);

                if(frameState.currentResolution < 1){
                    while(leftPoint > ((textLength / 2) + distance)){
                        leftPoint = leftPoint - distance;
                        pointArray.push(leftPoint);        
                    }
                    while(rightPoint < ((pathLength - textLength / 2) - distance)){
                        rightPoint = rightPoint + distance;                                   
                        pointArray.push(rightPoint);                                    
                    }
                }

                for (var len = 0; len < pointArray.length; len++) {
                    let tempDeclutterGroup;
                    if (declutterGroup) {
                        // tempDeclutterGroup = featureCallback ? null : declutterGroup.slice(0);
                        tempDeclutterGroup = declutterGroup.slice(0);
                    }                          

                    var startM = pointArray[len];                    
                    let parts = (<any>ol.geom).flat.textpath.lineString(lineStringCoordinates, offset, end, 2, text, this, startM, 
                            maxAngle, resolution);
                    
                    if(parts){
                        for(let i = 0; i < parts.length; i++){
                            var part = parts[i];
                            var lines = part[4];
                            var textSize = this.getTextSize_([lines]);
                            this.width = textSize[0];
                            this.height = textSize[1];

                            this.replayCharImage_(frameState, tempDeclutterGroup, part);
                        }   
                        var canvas = frameState.context.canvas_;
                        var intersects = tempDeclutterGroup[0] <= canvas.width && tempDeclutterGroup[2] >= 0 && tempDeclutterGroup[1] <= canvas.height && tempDeclutterGroup[3] >= 0;
                        
                        if(declutterGroup){    
                            if(!intersects && declutterGroup[4] == 1){
                                continue;
                            }          
                            declutterGroups.push(tempDeclutterGroup);
                        }
                    }
                }

                for (let d = 0; d < declutterGroups.length; d++) {
                    let targetDeclutterGroup = declutterGroups[d];
                    if (targetDeclutterGroup && targetDeclutterGroup.length > 5) {
                        let targetExtent = [targetDeclutterGroup[0], targetDeclutterGroup[1], targetDeclutterGroup[2], targetDeclutterGroup[3]];
                        // if (targetExtent[0] > tilePixelExtent[0] && targetExtent[1] > tilePixelExtent[3] && targetExtent[2] < tilePixelExtent[2] && targetExtent[3] < tilePixelExtent[1]) {
                        this.renderDeclutter_(targetDeclutterGroup, feature);
                        // }
                    }
                }
            }
        };

        (<any>ol.render).webgl.ImageReplay.prototype.drawLineStringImage = function (geometry, feature, frameState, declutterGroup) {
            var offset = 0;
            var stride = 2;
            var pixelRatio = frameState.pixelRatio;
            var resolution = frameState.currentResolution;
            var lineStringCoordinates = geometry.getFlatCoordinates();
            var end = lineStringCoordinates.length;
            var pathLength = (<any>ol.geom).flat.length.lineString(lineStringCoordinates, offset, end, stride, resolution);
            let width = this.width;            
            let spaceDistance = 0;

             if (width * 4 <= pathLength) {  
                this.extent = (<any>ol.extent).createOrUpdateEmpty();          
                var ratio = 1.194328566955879 / resolution;

                if(ratio >= 3){
                    ratio /= 2;
                }
                var distance = 280 * ratio;
                var tmpLength = pathLength - width;
                var centerPoint = tmpLength / 2 + spaceDistance;
                var leftPoint = centerPoint;
                var rightPoint = centerPoint;
                var pointArray = [];
                pointArray.push(centerPoint);

                if(frameState.currentResolution < 1){
                    while(leftPoint > ((width / 2) + distance)){
                        leftPoint = leftPoint - distance;
                        pointArray.push(leftPoint + spaceDistance);        
                    }
                    while(rightPoint < ((pathLength - width / 2) - distance)){
                        rightPoint = rightPoint + distance;                                   
                        pointArray.push(rightPoint + spaceDistance);                                    
                    }
                }

                for (var len = 0; len < pointArray.length; len++) {
                    let tempDeclutterGroup;
                    if (declutterGroup) {
                        // tempDeclutterGroup = featureCallback ? null : declutterGroup.slice(0);
                        tempDeclutterGroup = declutterGroup.slice(0);
                    }                          

                    var startM = pointArray[len];                    
                    let parts = (<any>ol.geom).flat.textpath.imagelineString(lineStringCoordinates, offset, end, 2, width, startM, resolution);
                    
                    if(parts){
                        for(let i = 0; i < parts.length; i++){
                            var part = parts[i];
                            this.anchorX = part[2];
                            this.rotation = part[3];
                            this.replayImage_(frameState, declutterGroup, [part[0], part[1]], this.scale / pixelRatio);
                            this.renderDeclutter_(declutterGroup, feature);
                        }   
                    }
                }
            }
        };

        (<any>ol.render).webgl.TextReplay.prototype.drawText = function (options) {
            var this$1 = this;
            var text = options.text;
            var label = options.label;
            if (text || label) {
                var offset = 0;
                var end = 2;
                var stride = 2;    
                
                // this.startIndices.push(this.indices.length);
                var flatCoordinates = options.flatCoordinates;
                if(label){
                    var image = label;
                    this.originX = 0;
                    this.originY = 0;
                    this.width = options.width;
                    this.height = options.height;
                    // this.width = width + lineWidth;
                    this.imageHeight = image.height;
                    this.imageWidth = image.width;
                    this.anchorX = options.anchorX;
                    this.anchorY = options.anchorY;
                    this.rotation = options.rotation;
                    this.scale = options.scale;
                    this.opacity = options.opacity;
                    var currentImage;
    
                    if (this.images_.length === 0) {
                        this.images_.push(image);
                    } else {
                        currentImage = this.images_[this.images_.length - 1];
                        if ((<any>ol).getUid(currentImage) != (<any>ol).getUid(image)) {
                            this.groupIndices.push(this.indices.length);
                            this.images_.push(image);
                        }
                    }
                    this.drawText_(flatCoordinates, offset, end, stride);
                }else{
                    this.scale = 1;
                    var glyphAtlas = options.currAtlas;
                    var j, jj, currX, currY, charArr, charInfo;
                    var anchorX = options.anchorX;
                    var anchorY = options.anchorY;          
                    var lineWidth = (this.state_.lineWidth / 2) * this.state_.scale;
                    this$1.rotation = options.rotation;
                    currX = 0;
                    currY = 0;
                    charArr = text.split('');
            
                    for (j = 0, jj = charArr.length; j < jj; ++j) {
                        charInfo = glyphAtlas.atlas.getInfo(charArr[j]);
            
                        if (charInfo) {
                            var image = charInfo.image;    
                            this$1.anchorX = anchorX - currX;
                            this$1.anchorY = anchorY - currY;
                            this$1.originX = j === 0 ? charInfo.offsetX - lineWidth : charInfo.offsetX;
                            this$1.originY = charInfo.offsetY;
                            this$1.height = glyphAtlas.height;
                            this$1.width = j === 0 || j === charArr.length - 1 ?
                                glyphAtlas.width[charArr[j]] + lineWidth : glyphAtlas.width[charArr[j]];
                            this$1.imageHeight = image.height;
                            this$1.imageWidth = image.width;
                            this$1.rotateWithView = 1;

                            if (this$1.images_.length === 0) {
                                this$1.images_.push(image);
                            } else {
                                var currentImage = this$1.images_[this$1.images_.length - 1];
                                if ((<any>ol).getUid(currentImage) != (<any>ol).getUid(image)) {
                                    this$1.groupIndices.push(this$1.indices.length);
                                    this$1.images_.push(image);
                                }
                            }
                
                            this$1.drawText_(flatCoordinates, offset, end, stride);
                        }
                        currX += this$1.width;
                    }
                }
            }
        };

        (<any>ol.render).webgl.ImageReplay.prototype.drawPoint = function (options) {
            var offset = 0;
            var end = 2;
            var stride = 2;    
            var flatCoordinates = options.flatCoordinates;
            var image = options.image;
            this.originX = options.originX;
            this.originY = options.originY;
            this.imageWidth = options.imageWidth;
            this.imageHeight = options.imageHeight;
            this.opacity = options.opacity;
            this.width = options.width;
            this.height = options.height;
            this.rotation = options.rotation;
            this.rotateWithView = 1;
            this.scale = options.scale;

            var currentImage;
            if (this.images_.length === 0) {
                this.images_.push(image);
            } else {
                currentImage = this.images_[this.images_.length - 1];
                if ((<any>ol).getUid(currentImage) != (<any>ol).getUid(image)) {
                    this.groupIndices.push(this.indices.length);
                    this.images_.push(image);
                }
            }

            // if (this.hitDetectionImages_.length === 0) {
            //     this.hitDetectionImages_.push(hitDetectionImage);
            // } else {
            //     currentImage =
            //         this.hitDetectionImages_[this.hitDetectionImages_.length - 1];
            //     if (ol.getUid(currentImage) != ol.getUid(hitDetectionImage)) {
            //         this.hitDetectionGroupIndices.push(this.indices.length);
            //         this.hitDetectionImages_.push(hitDetectionImage);
            //     }
            // }

            this.drawCoordinates(
                flatCoordinates, offset, end, stride);
        };

        // Blocking repeat
        (<any>ol.render).webgl.Replay.prototype.replayImage_ = function (frameState, declutterGroup, flatCoordinates, scale){
            var box = [];
            var screenXY = this.screenXY;
            var pixelCoordinate = (<any>ol).transform.apply(frameState.coordinateToPixelTransform, [flatCoordinates[0] - this.origin[0] + screenXY[0], flatCoordinates[1] - this.origin[1] + screenXY[1]]);
            var canvas = frameState.context.canvas_;
            var rotation = this.rotation;            

            var offsetX = -scale * (this.anchorX);
            var offsetY = -scale * (this.height - this.anchorY);
            box[0] = pixelCoordinate[0] + offsetX;
            box[3] = pixelCoordinate[1] - offsetY;

            offsetX = scale * (this.width - this.anchorX);
            offsetY = scale * this.anchorY;        
            box[2] = pixelCoordinate[0] + offsetX;
            box[1] = pixelCoordinate[1] - offsetY;

            var intersects = box[0] <= canvas.width && box[2] >= 0 && box[1] <= canvas.height && box[3] >= 0;
            if(declutterGroup){    
                if(!intersects && declutterGroup[4] == 1){
                    return;
                }                
                (<any>ol).extent.extend(declutterGroup, box);
                
                var declutterArgs = [{
                    flatCoordinates,
                    rotation,
                    scale,
                    width: this.width,
                    height: this.height,
                    anchorX: this.anchorX,
                    anchorY: this.anchorY,
                    label: this.label,
                    image: this.image,
                    imageHeight: this.imageHeight,
                    imageWidth: this.imageWidth,
                    opacity: this.opacity,
                    originX: this.originX,
                    originY: this.originY
                }, this];
                declutterGroup.push(declutterArgs);
            }
        };

        (<any>ol.geom).flat.textpath.lineString = function (
            flatCoordinates, offset, end, stride, text, webglTextReplay, startM, maxAngle, resolution) {
            var result = [];
    
            // Keep text upright
            var reverse = flatCoordinates[offset] > flatCoordinates[end - stride];
            
            var numChars = text.length;
    
            var x1 = flatCoordinates[offset];
            var y1 = flatCoordinates[offset + 1];
            offset += stride;
            var x2 = flatCoordinates[offset];
            var y2 = flatCoordinates[offset + 1];
            var segmentM = 0;
            var segmentLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / resolution;
    
            var chunk = '';
            var chunkLength = 0;
            var data, index, previousAngle;  
            
            for (var i = 0; i < numChars; ++i) {
                index = reverse ? numChars - i - 1 : i;
                var char = text.charAt(index);
                chunk = reverse ? char + chunk : chunk + char;
                // var charLength = webglTextReplay.getTextSize_([chunk])[0] - chunkLength;    
                var charLength = webglTextReplay.getTextSize_([char])[0];    
                chunkLength += charLength;
                var charM = startM + charLength / 2;
                
                while (segmentM + segmentLength < charM) {
                    x1 = x2;
                    y1 = y2;
                    offset += stride;
                    x2 = flatCoordinates[offset];
                    y2 = flatCoordinates[offset + 1];
                    segmentM += segmentLength;
                    segmentLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / resolution;
                }

                if((x1 > x2) !== reverse){
                    return false;
                }

                // label exceed the road range
                if(offset > end - stride){
                    return false;
                }

                var segmentPos = charM - segmentM;
                var angle = Math.atan2(y2 - y1, x2 - x1);
                if (reverse) {
                    angle += angle > 0 ? -Math.PI : Math.PI;
                }
                if (previousAngle !== undefined) {
                    var delta = angle - previousAngle;
                    delta += (delta > Math.PI) ? -2 * Math.PI : (delta < -Math.PI) ? 2 * Math.PI : 0;
                    if (Math.abs(delta) > maxAngle) {
                        return null;
                    }
                }            
                var interpolate = segmentPos / segmentLength;
                var x = (<any>ol).math.lerp(x1, x2, interpolate);
                var y = (<any>ol).math.lerp(y1, y2, interpolate);            
                if (previousAngle == angle) {
                    if (reverse) {                                            
                        data[0] = x;
                        data[1] = y;
                        data[2] = charLength / 2;
                    }
                    data[4] = chunk;
                } else {
                    chunk = char;
                    chunkLength = charLength;
                    data = [x, y, charLength / 2, -angle, chunk];
                    if (reverse) {
                        result.unshift(data);
                    } else {
                        result.push(data);
                    }
                    previousAngle = angle;
                }            
                startM += charLength;
            }
            
            return result;
        };

        (<any>ol.geom).flat.textpath.imagelineString = function (
            flatCoordinates, offset, end, stride, width, startM, resolution) {
            var result = [];
            var x1 = flatCoordinates[offset];
            var y1 = flatCoordinates[offset + 1];
            offset += stride;
            var x2 = flatCoordinates[offset];
            var y2 = flatCoordinates[offset + 1];
            var segmentM = 0;
            var segmentLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / resolution;
            var data; 
            var charM = startM + width / 2;

            while (segmentM + segmentLength < charM) {
                x1 = x2;
                y1 = y2;
                offset += stride;
                x2 = flatCoordinates[offset];
                y2 = flatCoordinates[offset + 1];
                segmentM += segmentLength;
                segmentLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / resolution;
            }

            // label exceed the road range
            if(offset > end - stride){
                return false;
            }

            var segmentPos = charM - segmentM;
            var angle = Math.atan2(y2 - y1, x2 - x1);      
            var interpolate = segmentPos / segmentLength;            
            var x = (<any>ol).math.lerp(x1, x2, interpolate);
            var y = (<any>ol).math.lerp(y1, y2, interpolate);   

            data = [x, y, width / 2, -angle];
            result.push(data);
           
            return result;
        };

        (<any>ol.geom).flat.length.lineString = function (flatCoordinates, offset, end, stride, resolution) {
            var x1 = flatCoordinates[offset];
            var y1 = flatCoordinates[offset + 1];
            var length = 0;
            var i;
            for (i = offset + stride; i < end; i += stride) {
                var x2 = flatCoordinates[i];
                var y2 = flatCoordinates[i + 1];
                length += (Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) / resolution);
                x1 = x2;
                y1 = y2;
            }
            return length;
        };
        // webgl render
        (<any>ol).render.webgl.Replay.prototype.webglReplay_ = function (
            context, skippedFeaturesHash, featureCallback, opt_hitExtent, screenXY
        ) {
            var frameState = context.frameState;
            var layerState = context.layerState;
            var viewState = frameState.viewState;
            var center = viewState.center;
            var size = frameState.size;
            var pixelRatio = frameState.pixelRatio;
            var resolution = viewState.resolution;
            var opacity = layerState.opacity;
            var rotation = viewState.rotation;
            var oneByOne = undefined;

            var gl = context.getGL();
            var tmpStencil, tmpStencilFunc, tmpStencilMaskVal, tmpStencilRef, tmpStencilMask,
                tmpStencilOpFail, tmpStencilOpPass, tmpStencilOpZFail;
           
            if (this.lineStringReplay) {
                tmpStencil = gl.isEnabled(gl.STENCIL_TEST);
                tmpStencilFunc = gl.getParameter(gl.STENCIL_FUNC);
                tmpStencilMaskVal = gl.getParameter(gl.STENCIL_VALUE_MASK);
                tmpStencilRef = gl.getParameter(gl.STENCIL_REF);
                tmpStencilMask = gl.getParameter(gl.STENCIL_WRITEMASK);
                tmpStencilOpFail = gl.getParameter(gl.STENCIL_FAIL);
                tmpStencilOpPass = gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);
                tmpStencilOpZFail = gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);

                gl.enable(gl.STENCIL_TEST);
                gl.clear(gl.STENCIL_BUFFER_BIT);
                gl.stencilMask(255);
                gl.stencilFunc(gl.ALWAYS, 1, 255);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);

                // this.lineStringReplay.replay(context,
                //     center, resolution, rotation, size, pixelRatio,
                //     opacity, skippedFeaturesHash,
                //     featureCallback, oneByOne, opt_hitExtent);

                // gl.stencilMask(0);
                // gl.stencilFunc(context.NOTEQUAL, 1, 255);
            }

            var shouldBeCached = (this instanceof (<any>ol).render.webgl.TextReplay || this instanceof (<any>ol).render.webgl.ImageReplay) ? false : true;

            context.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer, shouldBeCached);
            context.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer, shouldBeCached);

            var locations = this.setUpProgram(gl, context, size, pixelRatio);
                
            // set the "uniform" values
            var projectionMatrix = (<any>ol).transform.reset(this.projectionMatrix_);
            (<any>ol).transform.scale(projectionMatrix, 2 / (resolution * size[0]), 2 / (resolution * size[1]));
            (<any>ol).transform.rotate(projectionMatrix, -rotation);
            (<any>ol).transform.translate(projectionMatrix, -(center[0] - screenXY[0]), -(center[1] - screenXY[1]));

            var offsetScaleMatrix = (<any>ol).transform.reset(this.offsetScaleMatrix_);
            (<any>ol).transform.scale(offsetScaleMatrix, 2 / size[0], 2 / size[1]);

            var offsetRotateMatrix = (<any>ol).transform.reset(this.offsetRotateMatrix_);
            if (rotation !== 0) {
                (<any>ol).transform.rotate(offsetRotateMatrix, -rotation);
            }

            gl.uniformMatrix4fv(locations.u_projectionMatrix, false,
                (<any>ol).vec.Mat4.fromTransform(this.tmpMat4_, projectionMatrix));
            gl.uniformMatrix4fv(locations.u_offsetScaleMatrix, false,
                (<any>ol).vec.Mat4.fromTransform(this.tmpMat4_, offsetScaleMatrix));
            gl.uniformMatrix4fv(locations.u_offsetRotateMatrix, false,
                (<any>ol).vec.Mat4.fromTransform(this.tmpMat4_, offsetRotateMatrix));
            gl.uniform1f(locations.u_opacity, opacity); 
            
            // FIXME replace this temp solution with text calculation in worker
            if(this instanceof (<any>ol).render.webgl.TextReplay || this instanceof (<any>ol).render.webgl.ImageReplay){
                gl.uniform1f(locations.u_zIndex, 0);
            }else if(this instanceof (<any>ol).render.webgl.LineStringReplay){
                this.u_zIndex = locations.u_zIndex;
            }else if(this instanceof (<any>ol).render.webgl.PolygonReplay){
                this.u_zIndex = locations.u_zIndex;
            }           

            // draw!
            var result;
            if (featureCallback === undefined) { 
                this.drawReplay(gl, context, skippedFeaturesHash, false);
            } else {
                // draw feature by feature for the hit-detection
                result = this.drawHitDetectionReplay(gl, context, skippedFeaturesHash,
                featureCallback, oneByOne, opt_hitExtent);
            }

            // disable the vertex attrib arrays
            this.shutDownProgram(gl, locations);
            
            if (this.lineStringReplay) {
                if (!tmpStencil) {
                    gl.disable(gl.STENCIL_TEST);
                }
                gl.clear(gl.STENCIL_BUFFER_BIT);
                gl.stencilFunc(/** @type {number} */ (tmpStencilFunc),
                    /** @type {number} */ (tmpStencilRef), /** @type {number} */ (tmpStencilMaskVal));
                gl.stencilMask(/** @type {number} */ (tmpStencilMask));
                gl.stencilOp(/** @type {number} */ (tmpStencilOpFail),
                    /** @type {number} */ (tmpStencilOpZFail), /** @type {number} */ (tmpStencilOpPass));
                // gl.stencilMask(0);
            }
           frameState.animate = true;
            return result;
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
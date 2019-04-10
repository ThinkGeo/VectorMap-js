import { GeoVectorTileSource } from "../source/geoVectorTileSource";
import { GeoVectorTile } from "../geoVectorTile";
import { GeoStyle } from "../style/geoStyle";
import { GeoMVTFormat } from "../format/geoMvt";
import { StyleJsonCache } from "../tree/styleJsonCache";
import { StyleJsonCacheItem } from "../tree/styleJsonCacheItem";
import { GeoVectorTileLayerRender } from "../renderer/geoVectorTileLayerRender";
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
                    context: this.renderer_.context_
                    // isDrag: view.isDrag,
                    // isZoomOut:view.isZoomOut,
                    // isPinchOut:view.isPinchOut,
                    // isClickZoomOut:view.isClickZoomOut
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

        // recalculate the verctices of text for resolution changed                 
        (<any>ol.render).webgl.Replay.prototype.declutterRepeat_ = function (context, screenXY){
            var startIndicesFeature = this.startIndicesFeature;
            var startIndicesStyle = this.startIndicesStyle;
            var frameState = context.frameState;
            var pixelRatio = frameState.pixelRatio;
            this.screenXY = screenXY;

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
                        if(style.label){
                            this.label = style.label;
                            this.maxAngle_ = style.maxAngle_;
                            var lineWidth = (this.state_.lineWidth / 2) * this.state_.scale;        
                            this.width = this.label.width + lineWidth; 
                            this.height = this.label.height; 
                            this.originX = lineWidth;
                            this.originY = 0;
                            this.anchorX = Math.floor(this.width * this.textAlign_ - this.offsetX_);
                            this.anchorY = Math.floor(this.height * this.textBaseline_ * pixelRatio - this.offsetY_);
                            this.replayImage_(frameState, declutterGroup, geometry.getFlatCoordinates(), this.state_.scale / pixelRatio);
                            this.renderDeclutter_(declutterGroup, feature);
                        }else{   
                            // draw chars 
                            this.roadText = true;
                            this.drawLineStringText(geometry, feature, frameState, declutterGroup);
                        }
                    }
                }
            }
        };
       
        (<any>ol.render).webgl.Replay.prototype.replayCharImage_ = function (frameState, declutterGroup, part){
            var scale = this.scale ;
            var coordinateToPixelTransform = frameState.coordinateToPixelTransform;
            var x = part[0];
            var y = part[1];
            var rotation = part[3];
            var text = part[4];
            var cos = Math.cos(rotation);
            var sin = Math.sin(rotation); 
            var anchorX = part[2] * window.devicePixelRatio;
            var anchorY = Math.floor(this.height * this.textBaseline_ - this.offsetY_);
            var width = this.width*window.devicePixelRatio;
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
            var data, index, previousAngle;  
            
            for (var i = 0; i < numChars; ++i) {
                index = reverse ? numChars - i - 1 : i;
                var char = text.charAt(index);
                chunk = reverse ? char + chunk : chunk + char;
                var charLength = webglTextReplay.getTextSize_([char])[0];    
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
    }
}
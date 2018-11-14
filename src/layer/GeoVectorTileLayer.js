import VectorTileLayer from './VectorTile';
import LayerType from 'ol/LayerType';
import GeoVectorTileSource from '../source/geoVectorTileSource';
import GeoMVTFormat from '../format/geoMVTFormat';
import GeoStyle from '../style/geoStyle';
import StyleJsonCache from '../tree/styleJsonCache';
import { createXYZ } from 'ol/tilegrid';
import Map from 'ol/Map';
import TileQueue from "ol/TileQueue";
import TileState from "ol/TileState";
import { unlisten } from "ol/events/";
import EventType from "ol/events/EventType";
import CanvasMapRenderer from 'ol/renderer/canvas/Map';
import CanvasImageLayerRenderer from 'ol/renderer/canvas/ImageLayer';
import CanvasVectorLayerRenderer from 'ol/renderer/canvas/VectorLayer';
import { getUid } from 'ol/util'
import CanvasTileLayerRenderer from '../renderer/canvas/TileLayer';
import CanvasVectorTileLayerRenderer from '../renderer/canvas/VectorTileLayer';
import GeoVectorTileRenderer from '../renderer/canvas/GeoVectorTileLayer';
import GeoCanvasVectorTileLayerRenderer from '../renderer/canvas/GeoVectorTileLayer';
import StyleJsonCacheItem from '../tree/styleJsonCacheItem';
import GeoVectorTile from '../GeoVectorTile';
import TreeNode from '../tree/treeNode';
import Tree from '../tree/tree';
import WorkerManager from "../worker/workerManager";

class GeoVectorTileLayer extends VectorTileLayer {
    constructor(stylejson, opt_options) {
        const options = opt_options ? opt_options : ({});
        options["declutter"] = options["declutter"] === undefined ? true : options["declutter"];
        super(options);
        this.multithread = options.multithread == undefined ? true : options.multithread
        this.backgroundWorkerCount = options.backgroundWorkerCount == undefined ? 1 : options.backgroundWorkerCount;

        this.minimalist = options.minimalist === undefined ? true : options.minimalist;
        this.maxDataZoom = options.maxDataZoom === undefined ? 14 : options.maxDataZoom;
        this.proxy = options["proxy"];
        this.clientId = options["clientId"];
        this.clientSecret = options["clientSecret"];
        this.apiKey = options["apiKey"];

        if (this.multithread && window.Worker) {
            this.workerManager = new WorkerManager();
            this.workerManager.initWorkers();
        }

        this.styleJson = null;
        if (this.isStyleJsonUrl(stylejson)) {
            this.loadStyleJsonAsyn(stylejson);
        }
        else {
            this.loadStyleJson(stylejson);
        }

        LayerType["GEOVECTORTILE"] = "GEOVECTORTILE";
        this.type = LayerType.GEOVECTORTILE;


    }

    isStyleJsonUrl(styleJson) {
        if (styleJson) {
            if (typeof styleJson !== "object") {
                return true;
            }
        }
        return false;
    }

    loadStyleJsonAsyn(styleJsonUrl) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", styleJsonUrl, false);

        xhr.onload = function (event) {
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

    loadStyleJson(inputStyleJson) {
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

                // Set the layer background
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


                // this is the column name of pbflayer name, 
                let layerName = "layerName"

                // Create a StyleJsonCache
                // let styleJsonCache = createStyleJsonCache( )
                let styleJsonCache = new StyleJsonCache();

                let styleIdIndex = 0;
                for (let styleId of styleIds) {

                    // Select style json object by style id.
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
                            let treeNode = new TreeNode(item);
                            this.createChildrenNode(treeNode, item, zoom);
                            styleJsonCache.add(zoom, item.dataLayerName, new Tree(treeNode, styleIdIndex));
                        }

                        styleIdIndex += 1;
                    }
                }
                let geoFormat = source.getGeoFormat();
                geoFormat.setStyleJsonCache(styleJsonCache);

                if (this.workerManager) {
                    let messageData = {
                        formatId: getUid(geoFormat),
                        styleJson: styleJsonCache.styleJson,
                        geoTextStyleInfos: styleJsonCache.geoTextStyleInfos
                    };
                    for (let i = 0; i < this.workerManager.workerCount; i++) {
                        this.workerManager.postMessage(getUid(messageData), "initStyleJSON", messageData, undefined, i);
                    }

                    source.setWorkerManager(this.workerManager);
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
                            if (url.indexOf('?') > 0) {
                                url = url + '&apiKey=' + this.apiKey;
                            }
                            else {
                                url = url + '?apiKey=' + this.apiKey;
                            }
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
                tileClass: GeoVectorTile,
                urls: sourceJson["urls"],
                clientId: this.clientId,
                clientSecret: this.clientSecret,
                format: format,
                projection: "EPSG:3857",
                tileGrid: this.createVectorTileGrid(),
                cacheSize: 1024,
                multithread: this.multithread,
                minimalist: this.minimalist,
                maxDataZoom: this.maxDataZoom
            });
            format.setSource(source);
            return source;
        }
    }
    getVectorSourceFormat() {
        let format = new GeoMVTFormat(undefined, { multithread: this.isMultithread, minimalist: this.minimalist });

        return format;
    }
    createVectorTileGrid() {
        return createXYZ({ tileSize: 512, maxZoom: 22 });
    }

    getVariables(variablesJson) {
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

    replaceVariables(styleJson, variables) {
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

    createChildrenNode(currentNode, item, zoom) {
        if (item.subStyleCacheItems && item.subStyleCacheItems.length > 0) {
            for (let i = 0, ii = item.subStyleCacheItems.length; i < ii; i++) {
                let subStyleItem = item.subStyleCacheItems[i];
                if (zoom >= subStyleItem.minZoom && zoom <= subStyleItem.maxZoom) {
                    let node = new TreeNode(subStyleItem);
                    currentNode.children.push(node);
                    this.createChildrenNode(node, subStyleItem, zoom);
                }
            }
        }
    }

    isStyleJsonUrl(styleJson) {
        if (styleJson) {
            if (typeof styleJson !== "object") {
                return true;
            }
        }
        return false;
    }
}

Map.prototype.createRenderer = function createRenderer() {
    var renderer = new CanvasMapRenderer(this);
    renderer.registerLayerRenderers([
        CanvasImageLayerRenderer,
        CanvasTileLayerRenderer,
        CanvasVectorLayerRenderer,
        CanvasVectorTileLayerRenderer,
        GeoCanvasVectorTileLayerRenderer
    ]);
    return renderer;
};

TileQueue.prototype.handleTileChange = function (event) {
    const tile = /** @type {import("./Tile.js").default} */ (event.target);
    const state = tile.getState();
    if (state === TileState.LOADED || state === TileState.ERROR ||
        state === TileState.EMPTY || state === TileState.ABORT) {
        if (tile.isGeoVectorTile) {
            if (tile.replayCreated) {
                unlisten(tile, EventType.CHANGE, this.handleTileChange, this);
            }
        }
        else {
            unlisten(tile, EventType.CHANGE, this.handleTileChange, this);
        }

        const tileKey = tile.getKey();
        if (tileKey in this.tilesLoadingKeys_) {
            delete this.tilesLoadingKeys_[tileKey];
            --this.tilesLoading_;
        }
        this.tileChangeCallback_();
    }
}

export default GeoVectorTileLayer;
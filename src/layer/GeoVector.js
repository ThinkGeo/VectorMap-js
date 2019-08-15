import {GeoStyle} from '../style/geoStyle';
import GeoVectorSource from "../source/geoVector";
import {StyleJsonCache} from '../tree/styleJsonCache';
import {StyleJsonCacheItem} from '../tree/styleJsonCacheItem';
import {TreeNode} from '../tree/treeNode';
import {Tree} from '../tree/tree';
import { GeoVectorLayerRender } from "../renderer/geoVectorLayerRender";

export class GeoVector extends ol.layer.Vector {
    constructor(stylejson, opt_options) {
        const options = opt_options ? opt_options : ({});
        options["declutter"] = options["declutter"] === undefined ? true : options["declutter"];
        options["defaultStyle"] = options["defaultStyle"] === undefined ? false : options["defaultStyle"];
        super(options)

        this.proxy = options["proxy"];
        this.clientId = options["clientId"];
        this.clientSecret = options["clientSecret"];
        this.apiKey = options["apiKey"];
        this.defaultStyle = options["defaultStyle"];

        this.styleJson = null;
        if (this.isStyleJsonUrl(stylejson)) {
            this.loadStyleJsonAsyn(stylejson);
        }
        else {
            this.loadStyleJson(stylejson);
        }

        ol.LayerType["GEOVECTOR"] = "GEOVECTOR";
        this.type = ol.LayerType.GEOVECTOR;
        ol.plugins.register(ol.PluginType.LAYER_RENDERER, GeoVectorLayerRender);
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

                if (this.defaultStyle) {
                    source.defaultStyle = true;
                }
                else
                {
                    let styleJsons = styleJson["styles"];
                    let styleIds = layerJson["styles"];
                    let minZoom = 0;
                    let maxZoom = 22;
    
                    let layerName = "layerName"
    
                    // Create a StyleJsonCache
                    let styleJsonCache = new StyleJsonCache();
    
                    let styleIdIndex = 1;
                    let tmpZoomArr = [];
                    for(let i = minZoom; i <= maxZoom; i++){
                        tmpZoomArr.push(i);
                    }
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

                            let item = new StyleJsonCacheItem(styleJson, tmpZoomArr, layerName, styleIdIndex);
    
                            item.zoomArr.forEach(function(zoom){
                                let treeNode = new TreeNode(item);
                                this.createChildrenNode(treeNode, item, zoom);
                                styleJsonCache.add(zoom, item.dataLayerName, new Tree(treeNode, styleIdIndex));
                            });
                            // for (let zoom = item.minZoom; zoom <= item.maxZoom; zoom++) {
                            // }
    
                            styleIdIndex += 1;
                        }
                    }
                    this.styleJsonCache = styleJsonCache;
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
                    let url = sourceJson["url"];
                    var host = location.host;
                    var protocol = location.protocol;
                    if (url.indexOf('/') !== 0) {
                        url = protocol + '//' + host + '/' + url;
                    }
                    else if (url.indexOf('/') === 0) {
                        url = protocol + '//' + host + url;
                    }

                    // apiKey
                    if (url.indexOf('apiKey') === -1 && this.apiKey) {
                        url = url + '?apiKey=' + this.apiKey;
                    }
                    // proxy
                    if (this.proxy) {
                        url = this.proxy + encodeURIComponent(url);
                    }
                    sourceJson[url] = url;
                    this.geoSources[sourceJson["id"]] = this.createSource(sourceJson);
                }
            });

            return this.geoSources[sourceId];
        }

        return false;
    }

    createSource(sourceJson) {
        var sourceType = sourceJson["type"].toLowerCase();
        var format = undefined;

        var options = {};
        if (sourceJson["dataProjection"] !== undefined) {
            options["dataProjection"] = sourceJson["dataProjection"];
        }
        if (sourceJson["featureProjection"] !== undefined) {
            options["featureProjection"] = sourceJson["featureProjection"];
        }
        if (sourceJson["extent"] !== undefined) {
            options["extent"] = sourceJson["extent"];
        }

        if (sourceType === "geojson") {
            format = new ol.format.GeoJSON(options);
        }
        else if (sourceType === "esrijson") {

            format = new ol.format.EsriJSON(options);
        }
        else if (sourceType === "topojson") {
            // TODO: support "layers", http://openlayers.org/en/latest/examples/topojson.html?q=topojson.
            format = new ol.format.TopoJSON(options);
        }
        else if (sourceType === "igc") {
            format = new ol.format.IGC(options);
        }
        else if (sourceType === "polyline") {
            format = new ol.format.Polyline(options);
        }
        else if (sourceType === "wkt") {
            format = new ol.format.WKT(options);
            // The options of WKT format didn't have projection.
            if(options["dataProjection"])
            {
                format.dataProjection= options["dataProjection"]
            }
            if(options["featureProjection"])
            {
                format.featureProjection= options["featureProjection"]
            }
        }
        else if (sourceType === "gpx") {
            format = new ol.format.GPX(options);
        }
        else if (sourceType === "kml") {
            format = new ol.format.KML(options);
        }
        else if (sourceType === "wfs") {
            // Format is GeoJSON.
            format = new ol.format.GeoJSON(options);
        }

        var source = new GeoVectorSource({
            url: sourceJson["url"],
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            format: format
        });
        return source;
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
                // if (zoom >= subStyleItem.minZoom && zoom <= subStyleItem.maxZoom) {
                if(subStyleItem.zoomArr.includes(zoom)){
                    let node = new TreeNode(subStyleItem);
                    currentNode.children.push(node);
                    this.createChildrenNode(node, subStyleItem, zoom);
                }
            }
        }
    }
}

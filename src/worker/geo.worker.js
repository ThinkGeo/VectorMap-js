import util from "./util";
import StyleJsonCache from "../tree/styleJsonCache";
import StyleJsonCacheItem from "../tree/styleJsonCacheItem";
import TreeNode from "../tree/treeNode";
import Tree from "../tree/tree";
import PBF from 'pbf';
import GeometryType from 'ol/geom/GeometryType';
import RenderFeature from 'ol/render/Feature';
import LRUCache from 'ol/structs/LRUCache'
import rbush from "rbush";
import Projection from "ol/proj/Projection";
import Units from "ol/proj/Units";
import GeoCanvasReplayGroup from "../render/canvas/GeoReplayGroup";
import GeoTextStyle from "../style/geoTextStyle";
import GeoShieldStyle from "../style/geoShieldStyle";
import GeoPointStyle from "../style/geoPointStyle";
import { getUid } from "ol/util";
import { renderFeature } from '../renderer/vector';
import { intersects } from 'ol/extent';
import GeoLineStyle from "../style/geoLineStyle";
import Instruction from "ol/render/canvas/Instruction";
import ReplayGroupCustom from '../render/webgl/ReplayGroupCustom';
import XYZ from 'ol/source/XYZ';
import {getBottomLeft,getBottomRight,getTopRight,getTopLeft} from 'ol/extent';
import MVT from 'ol/format/MVT';
import {getHeight} from "ol/extent"






var readFeaturesAndCreateInstructTrees = function (source, zoom, dataZoom, styleJsonCache, layerName, tileExtent, tileResolution) {
    var pbf = new PBF((source));
    var pbfLayers = pbf.readFields(layersPBFReader, {});
    var features = [];
    var pbfLayer = undefined;

    var layerIdMatchedGeoStylesGroupByPbfLayerName = styleJsonCache.geoStyleGroupByZoom[zoom];

    if (!layerIdMatchedGeoStylesGroupByPbfLayerName) {
        return features;
    }

    var pbfLayerNamesWithGeoStyle = [];
    for (var pbfLayerName in layerIdMatchedGeoStylesGroupByPbfLayerName) {
        pbfLayerNamesWithGeoStyle.push(pbfLayerName);
    }

    var allFeatures = {};
    var featureIndex = 0;
    var instructsCache = [];
    var treeStyleFirstCache = [];
    var extent = undefined;
    for (var name in pbfLayers) {
        if (self.layers_ && self.layers_.indexOf(name) === -1) {
            continue;
        }
        if (pbfLayerNamesWithGeoStyle.indexOf(name) === -1 && !pbfLayerNamesWithGeoStyle.includes("undefined")) {
            continue;
        }

        pbfLayer = pbfLayers[name];
        extent = pbfLayer.extent;

        var skipOffset = 1;
        var scale = getHeight(tileExtent) / (extent / (zoom - dataZoom + 1));
        var offset = (tileResolution / scale) * skipOffset;

        var cacheTrees = [];
        Array.prototype.push.apply(cacheTrees, layerIdMatchedGeoStylesGroupByPbfLayerName["undefined"]);
        Array.prototype.push.apply(cacheTrees, layerIdMatchedGeoStylesGroupByPbfLayerName[name]);

        if (cacheTrees && cacheTrees.length > 0) {
            replaceFiltersToIndexOfPbfLayer(cacheTrees, pbfLayer);
            for (var i = 0; i < pbfLayer.length; i++) {
                var rawFeature = readRawFeature_(pbf, pbfLayer, i);
                var feature = undefined;
                for (var j = 0; j < cacheTrees.length; j++) {
                    var cacheTree = cacheTrees[j];
                    var treeIndex = cacheTree.treeIndex;
                    if (instructsCache[treeIndex] === undefined) {
                        instructsCache[treeIndex] = {
                            min: 10,
                            max: -10
                        };
                        treeStyleFirstCache[treeIndex] = cacheTree.root.data.styleFirst;
                    }

                    var matchedNode = undefined;
                    var checkNodeMatched = function (node) {
                        var styleJsonCacheItem = node.data;
                        var matched = false;
                        if (styleJsonCacheItem.filterGroup.length > 0) {
                            for (var i = 0; i < styleJsonCacheItem.filterGroup.length; i++) {
                                var filters = styleJsonCacheItem.filterGroup[i];
                                var groupMatched = true;
                                for (var j = 0; j < filters.length; j++) {
                                    var filter = filters[j];
                                    if (!filter.matchOLFeature(rawFeature, zoom)) {
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

                    var selectNode = function (node) {
                        matchedNode = node.data;
                    };
                    cacheTree.traverseNode(checkNodeMatched, selectNode);

                    if (matchedNode) {
                        if (feature === undefined) {
                            feature = self.createFeature_(pbf, rawFeature, layerName, offset);

                            featureIndex += 1;
                            allFeatures[featureIndex] = feature;
                        }

                        var zindex = 0;
                        if (cacheTree.root.data.zIndex) {
                            zindex = feature.properties_[cacheTree.root.data.zIndex]
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
                        instructsCache[treeIndex][zindex].push([featureIndex, matchedNode]);

                        feature.extent_ = undefined;
                    }
                }
            }
        }
        cacheTrees.length = 0;
        self.extent_ = pbfLayer ? [0, 0, pbfLayer.extent, pbfLayer.extent] : null;
    }

    return [allFeatures, instructsCache, extent];
}
var getInstructs = function (instructsTree) {
    var instructs = [];
    var mainGeoStyleIds = {};
    if (instructsTree) {
        // the tress index means the index of SyleId.
        for (var i = 0; i < instructsTree.length; i++) {
            var instructsInOneTree = instructsTree[i];
            if (instructsInOneTree) {
                for (var j = instructsInOneTree.min, jj = instructsInOneTree.max; j <= jj; j++) {
                    var instructsInOneZIndex = instructsInOneTree[j];
                    if (instructsInOneZIndex) {
                        var childrenInstructs = [];
                        for (var h = 0; h < instructsInOneZIndex.length; h++) {
                            var instruct = instructsInOneZIndex[h];
                            var geoStyle = instruct[1].geoStyle;
                            if (geoStyle) {
                                instructs.push([instruct[0], geoStyle.id, i]);
                                // if (geoStyle.constructor.name === "GeoPointStyle" || geoStyle.constructor.name === "GeoTextStyle" || geoStyle.constructor.name === "GeoShieldStyle" || (geoStyle.constructor.name === "GeoLineStyle" && geoStyle.onewaySymbol !== undefined)) {
                                //     mainGeoStyleIds[geoStyle.id] = "";
                                // }
                            }
                            var childrenGeoStyles = instruct[1].childrenGeoStyles;
                            if (childrenGeoStyles) {
                                for (var k = 0; k < childrenGeoStyles.length; k++) {
                                    childrenInstructs.push([instruct[0], childrenGeoStyles[k].id, i]);
                                    // if (childrenGeoStyles[k].constructor.name === "GeoPointStyle" || childrenGeoStyles[k].constructor.name === "GeoTextStyle" || childrenGeoStyles[k].constructor.name === "GeoShieldStyle" || (childrenGeoStyles[k].constructor.name === "GeoLineStyle" && childrenGeoStyles[k].onewaySymbol === true)) {
                                    //     mainGeoStyleIds[childrenGeoStyles[k].id] = "";
                                    // }
                                }
                            }
                        }
                        Array.prototype.push.apply(instructs, childrenInstructs);
                        childrenInstructs.length = 0;
                        instructsInOneZIndex.length = 0;
                    }
                }
            }
        }
        instructsTree.length = 0;
    }
    return [instructs, mainGeoStyleIds];
};

var createSubTileInstructCaches = function (features, instructs, extent, tileCoord, requestCoord) {
    var subTileCachedInstruct = {};

    var offsetZ = tileCoord[0] - requestCoord[0];
    var tileSize = extent / Math.pow(2, offsetZ);

    var tileRange = getTileRange(requestCoord, tileCoord[0]);
    var tiles = {};
    for (var x = tileRange[0]; x <= tileRange[2]; x++) {
        var minX = (x - tileRange[0]) * tileSize;
        var maxX = (x - tileRange[0] + 1) * tileSize;
        for (var y = tileRange[3]; y >= tileRange[1]; y--) {
            var minY = (tileRange[3] - y) * tileSize;
            var maxY = (tileRange[3] - y + 1) * tileSize;
            tiles["" + [x, y]] = [minX, minY, maxX, maxY];
        }
    }

    for (var i = 0; i < instructs.length; i++) {
        var instruct = instructs[i];
        var feature = features[instruct[0]];
        var featureExtent = feature.getExtent();

        var featureTileRange = getFeatureTileRange(featureExtent, extent, tileSize, requestCoord, offsetZ);
        for (var x = tileRange[0] > featureTileRange[0] ? tileRange[0] : featureTileRange[0], xx = featureTileRange[2] > tileRange[2] ? tileRange[2] : featureTileRange[2]; x <= xx; x++) {
            for (var y = tileRange[1] > featureTileRange[1] ? tileRange[1] : featureTileRange[1], yy = featureTileRange[3] > tileRange[3] ? tileRange[3] : featureTileRange[3]; y <= yy; y++) {
                var tileKey = "" + [x, y];
                var tileExtent = tiles[tileKey];
                if (subTileCachedInstruct[tileKey] === undefined) {
                    subTileCachedInstruct[tileKey] = [];
                }
                subTileCachedInstruct[tileKey].push(instruct);
            }
        }
        feature.extent_ = undefined;
    }
    return subTileCachedInstruct;
}

var getTileRange = function (tileCoord, zoom) {
    var x = tileCoord[1];
    var y = tileCoord[2];
    var minX = x;
    var maxX = x;
    var minY = y;
    var maxY = y;

    for (var i = tileCoord[0]; i < zoom; i++) {
        minX = minX * 2;
        maxX = maxX * 2 + 1;
        minY = minY * 2;
        maxY = maxY * 2 + 1;
    }
    return [minX, minY, maxX, maxY];
}

var getFeatureTileRange = function (featureExtent, extent, tileSize, requestTileCoord, offsetZ) {

    var minX = requestTileCoord[1] * Math.pow(2, offsetZ) + Math.floor(featureExtent[0] / tileSize);
    var maxX = requestTileCoord[1] * Math.pow(2, offsetZ) + Math.floor(featureExtent[2] / tileSize);
    var minY = requestTileCoord[2] * Math.pow(2, offsetZ) + Math.floor((extent - featureExtent[3]) / tileSize);
    var maxY = requestTileCoord[2] * Math.pow(2, offsetZ) + Math.floor((extent - featureExtent[1]) / tileSize);

    return [minX, minY, maxX, maxY];
}



var readRawGeometry_ = function (pbf, feature, flatCoordinates, ends, offset) {
    var prevX = 0;
    var prevY = 0;
    var isBegin = true;

    pbf.pos = feature.geometry;

    var end = pbf.readVarint() + pbf.pos;
    var cmd = 1;
    var length = 0;
    var x = 0;
    var y = 0;
    var coordsLen = 0;
    var currentEnd = 0;

    while (pbf.pos < end) {
        if (!length) {
            var cmdLen = pbf.readVarint();
            cmd = cmdLen & 0x7;
            length = cmdLen >> 3;
            isBegin = true;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += pbf.readSVarint();
            y += pbf.readSVarint();

            if (cmd === 1) { // moveTo
                if (coordsLen > currentEnd) {
                    ends.push(coordsLen);
                    currentEnd = coordsLen;
                }
            }

            if (isBegin || Math.abs(prevX - x) + Math.abs(prevY - y) > offset) {
                flatCoordinates.push(x, y);
                prevX = x;
                prevY = y;
                coordsLen += 2;
                isBegin = false;
            }
        } else if (cmd === 7) {

            if (coordsLen > currentEnd) {
                // close polygon
                flatCoordinates.push(
                    flatCoordinates[currentEnd], flatCoordinates[currentEnd + 1]);
                coordsLen += 2;
                isBegin = true;
            }

        } else {
            assert(false, 59); // Invalid command found in the PBF
        }
    }

    if (coordsLen > currentEnd) {
        ends.push(coordsLen);
        currentEnd = coordsLen;
    }

};



var readRawFeature_ = function (pbf, layer, i) {
    pbf.pos = layer.features[i];
    var end = pbf.readVarint() + pbf.pos;
    var feature = {
        layer: layer,
        type: 0,
        properties: {},
        propertiesIndex: {}
    };
    pbf.readFields(featureColumnValue, feature, end);
    return feature;
};

var featureColumnValue = function (tag, feature, pbf) {
    if (tag === 1) {
        feature.id = pbf.readVarint();
    }
    else if (tag === 2) {
        var end = pbf.readVarint() + pbf.pos;
        while (pbf.pos < end) {
            var key = pbf.readVarint();
            var value = pbf.readVarint();
            feature.propertiesIndex[key] = value;
            key = feature.layer.keys[key];
            value = feature.layer.values[value];
            feature.properties[key] = value;
        }
    }
    else if (tag === 3) {
        feature.type = pbf.readVarint();
    }
    else if (tag === 4) {
        feature.geometry = pbf.pos;
    }
};

var replaceFiltersToIndexOfPbfLayer = function (cacheTrees, pbfLayer) {
    for (var i = 0, ii = cacheTrees.length; i < ii; i++) {
        var cacheTree = cacheTrees[i];
        replaceCacheItemFiltersToIndexOfPbfLayer(cacheTree.root, pbfLayer);
    }
}
var replaceCacheItemFiltersToIndexOfPbfLayer = function (node, pbfLayer) {
    var data = node.data;

    for (var i = 0; i < data.filterGroup.length; i++) {
        var filters = data.filterGroup[i];
        var geoFilter;
        for (var j = 0; j < filters.length; j++) {
            geoFilter = filters[j];
            geoFilter.replaceVaulesToPbfIndex(pbfLayer);
        }
    }

    if (node.children) {
        for (var i = 0, ii = node.children.length; i < ii; i++) {
            replaceCacheItemFiltersToIndexOfPbfLayer(node.children[i], pbfLayer);
        }
    }
}

var createStyleJsonCache = function (stylejson, geoTextStyleInfos) {
    var styleIdIndex = 1;
    var geoStyles = {};
    var styleJsonCache = new StyleJsonCache();
    styleJsonCache["geoTextStyleInfos"] = geoTextStyleInfos;
    for (var id in stylejson) {
        var json = stylejson[id];
        
        var item = new StyleJsonCacheItem(json, 0, 24, "layerName", styleIdIndex);

        for (var zoom = item.minZoom; zoom <= item.maxZoom; zoom++) {
            var treeNode = new TreeNode(item);
            createChildrenNode(treeNode, item, zoom);
          
            styleJsonCache.add(zoom, item.dataLayerName, new Tree(treeNode, styleIdIndex));
        }

        styleIdIndex += 1;
    }
    return styleJsonCache;
}

var createChildrenNode = function (currentNode, item, zoom) {
    if (item.subStyleCacheItems && item.subStyleCacheItems.length > 0) {
        for (var i = 0, ii = item.subStyleCacheItems.length; i < ii; i++) {
            var subStyleItem = item.subStyleCacheItems[i];
            if (zoom >= subStyleItem.minZoom && zoom <= subStyleItem.maxZoom) {
                var node = new TreeNode(subStyleItem);
                currentNode.children.push(node);
                createChildrenNode(node, subStyleItem, zoom);
            }
        }
    }
}


self.styleJsonCache = {};
self.vectorTilesData = {};
self.tileCoordWithSourceCoord = {};
self.requestCache = {};
self.postCancelMessageData = {};

self.onmessage = function (msg) {
    var methodInfo = msg.data["methodInfo"];
    var messageData = msg.data["messageData"];
    var debugInfo = msg.data["debugInfo"];

    if (debugInfo) {
        var now = new Date().getTime();
    }

    var method = self[methodInfo.methodName];
    if (method) {
        var resultMessageData = method(messageData, methodInfo);
        if (resultMessageData) {

            var postMessageData = {
                methodInfo: methodInfo,
                messageData: resultMessageData,
                debugInfo: {
                    postMessageDateTime: new Date().getTime()
                }
            }

            postMessage(postMessageData);
            postMessageData = undefined;
        }
    }
}

self.initStyleJSON = function (styleJsonInfo, methodInfo) {
    self.styleJsonCache[styleJsonInfo.formatId] = self.createStyleJsonCache(styleJsonInfo.styleJson, styleJsonInfo.geoTextStyleInfos);
}

self.request = function (requestInfo, methodInfo) {
    var maxDataZoom = requestInfo.maxDataZoom
    var requestCoord = requestInfo.requestCoord;
    var tileCoord = requestInfo.tileCoord;
    var vectorImageTileCoord = requestInfo.vectorImageTileCoord;
    var formatId = requestInfo.formatId;
    var minimalist = requestInfo.minimalist;
    var layerName = requestInfo.layerName;
    var vectorTileDataCahceSize = requestInfo.vectorTileDataCahceSize
    var tileExtent = requestInfo.tileExtent;
    var tileResolution = requestInfo.tileResolution;
    var tileRange = requestInfo.tileRange;
    var requestToken = requestInfo.token;
    var url = requestInfo.url;

    var cacheKey = requestCoord.join(",") + "," + tileCoord[0];
    var tileFeatureAndInstructions = self.getTileInstructions(cacheKey, tileCoord);

    if (tileFeatureAndInstructions) {
        var resultData = {
            requestKey: cacheKey,
            status: "succeed",
        };

        var postMessageData = {
            methodInfo: methodInfo,
            messageData: resultData,
            debugInfo: {
                postMessageDateTime: new Date().getTime()
            }
        }

        postMessage(postMessageData);
    }
    else {
        var postMessageData = {
            methodInfo: methodInfo,
            messageData: {},
            debugInfo: {
                postMessageDateTime: new Date().getTime()
            }
        };

        if (self.requestResults === undefined) {
            self.requestResults = new LRUCache(16);
        }
        if (self.requestResults.containsKey(requestCoord.toString())) {
            var resultMessageData = self.createDrawingInstructs(self.requestResults.get(requestCoord.toString()), tileCoord[0], formatId, tileCoord, requestCoord, layerName, vectorTileDataCahceSize, tileExtent, tileResolution);
            postMessageData.messageData = resultMessageData;
            postMessage(postMessageData);
        }
        else {
            // cancel tiles out of frameExtent
            var values = [];
            for (var key in self.tileCoordWithSourceCoord) {
                values.push(self.tileCoordWithSourceCoord[key])
            }

            if (values.length > 0) {
                var lastestCoord = values[values.length - 1];
                var lastestX = lastestCoord[1];
                var lastestY = lastestCoord[2];
                if (lastestCoord[0] !== vectorImageTileCoord[0]) {
                    for (var key in self.requestCache) {
                        var tileXhr = self.requestCache[key];
                        if (tileXhr) {
                            var coords = self.tileCoordWithSourceCoord[key];
                            var x = coords[1];
                            var y = coords[2];
                            if (coords[0] !== vectorImageTileCoord[0]) {
                                tileXhr.abort();
                                postMessage(self.postCancelMessageData[key]);
                                delete self.requestCache[key];
                                delete self.tileCoordWithSourceCoord[key];
                                delete self.postCancelMessageData[key];
                            }
                        }
                    }
                }
                else if ((tileRange.minX - 1 > lastestX || tileRange.maxX + 1 < lastestX) || (tileRange.minY - 1 > lastestY || tileRange.maxY + 1 < lastestY)) {
                    for (var key in self.requestCache) {
                        var tileXhr = self.requestCache[key];
                        if (tileXhr) {
                            var coords = self.tileCoordWithSourceCoord[key];
                            var x = coords[1];
                            var y = coords[2];
                            if ((tileRange.minX - 1 > x || tileRange.maxX + 1 < x) || (tileRange.minY - 1 > y || tileRange.maxY + 1 < y)) {
                                tileXhr.abort();
                                postMessage(self.postCancelMessageData[key]);
                                delete self.requestCache[key];
                                delete self.tileCoordWithSourceCoord[key];
                                delete self.postCancelMessageData[key];
                            }
                        }
                    }
                }
            }

            var resultMessageData = {
                requestKey: cacheKey,
                status: "cancel",
            };

            postMessageData.messageData = resultMessageData;

            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";
            // Client ID and Client Secret
            if (requestToken) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + requestToken);
            }

            xhr.onload = function (event) {
                if (!xhr.status || xhr.status >= 200 && xhr.status < 300) {
                    var source = undefined;
                    source = /** @type {ArrayBuffer} */ (xhr.response);
                    if (source) {
                        // save response to cache;
                        if (maxDataZoom === requestCoord[0]) {
                            self.requestResults.set(requestCoord.toString(), source);
                            while (self.requestResults.canExpireCache()) {
                                self.requestResults.pop();
                            }
                        }

                        var resultMessageData = self.createDrawingInstructs(source, tileCoord[0], formatId, tileCoord, requestCoord, layerName, vectorTileDataCahceSize, tileExtent, tileResolution);
                        postMessageData.messageData = resultMessageData;
                        postMessage(postMessageData);
                    }
                    else {
                        postMessageData.messageData.status = "failure";
                        postMessage(postMessageData);
                    }
                }
                else {
                    postMessageData.messageData.status = "failure";
                    postMessage(postMessageData);
                }

                delete self.requestCache[cacheKey];
            }
            xhr.onerror = function () {
                postMessageData.messageData.status = "failure";
                postMessage(postMessageData);
                delete self.requestCache[cacheKey];
            }.bind(this);
            xhr.send();
            self.requestCache[cacheKey] = xhr;
            self.tileCoordWithSourceCoord[cacheKey] = vectorImageTileCoord;
            postMessageData.messageData.status = "cancel";
            self.postCancelMessageData[cacheKey] = postMessageData;
        }
    }
}

self.createReplayGroup = function (messageData, methodInfo) {

    var replayGroupInfo = messageData[0];
    var resolution = replayGroupInfo[2];
    self["devicePixelRatio"] = messageData[6];
    var formatId = messageData[7];
    var coordinateToPixelTransform = messageData[8];
    var pixelToCoordinateTransform=messageData[13];
    var maxDataZoom = messageData[9];
    var vectorTileDataCahceSize = messageData[10];
    var replayGroup = new ReplayGroupCustom(replayGroupInfo[0], replayGroupInfo[1], replayGroupInfo[7]);
    var mainDrawingInstructs = [];
    var mainFeatures = [];
    var mainFeatureIndex = 0;
    var renderFeature = function (feature, geoStyles, options, instruct) {
        var styles = undefined;
        if (geoStyles) {
            if (geoStyles && geoStyles.length > 0) {
                for (var i = 0, ii = geoStyles.length; i < ii; i++) {
                    if (geoStyles[i]) {
                        if (geoStyle.constructor.name === "GeoLineStyle" && geoStyle.onewaySymbol !== undefined) {
                            mainFeatures.push(feature);
                            mainDrawingInstructs.push([mainFeatureIndex, geoStyles[i].id, instruct[2]]);
                            mainFeatureIndex++;
                        }
                        else {
                            var ol4Styles = geoStyles[i].getStyles(feature, resolution, options);
                            if (geoStyles[i] instanceof GeoTextStyle || geoStyles[i] instanceof GeoShieldStyle || geoStyles[i] instanceof GeoPointStyle) {
                                if (ol4Styles) {
                                    mainFeatures.push(feature);
                                    mainDrawingInstructs.push([mainFeatureIndex, geoStyles[i].id, instruct[2]]);
                                    mainFeatureIndex++;
                                }
                            }
                            else {
                                if (styles === undefined) {
                                    styles = [];
                                }
                                Array.prototype.push.apply(styles, ol4Styles);
                            }
                        }
                    }
                }
            }
        }
        else {
            var styleFunction = feature.getStyleFunction();
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
            var dirty = self.renderFeature(feature, squaredTolerance, styles,
                replayGroup,options);
            self.dirty_ = self.dirty_ || dirty;
        }
    };

    var requestTileCoord = messageData[1];
    var tileCoord = messageData[2];

    // TEST     

    if(tileCoord.toString() !== "2,1,-2"){
    // if(tileCoord.toString() !== "14,12928,-6725"){
    // if(!(tileCoord.toString() == "16,13813,-24873" || tileCoord.toString() == "17,27627,-49745")){
        // debugger;
        // return
    }
    // TEST END

    var tileProjection = new Projection({
        code: 'EPSG:3857',
        units:Units.TILE_PIXELS
    });
    var projection = new Projection({
        code: 'EPSG:3857',
        units: Units.TILE_PIXELS
    });

    var tileProjectionInfo = messageData[3];
    var projectInfo = messageData[4];
    for (var name in tileProjectionInfo) {
        tileProjection[name] = tileProjectionInfo[name];
    }
    for (var name in projectInfo) {
        projection[name] = projectInfo[name];
    }

    var squaredTolerance = messageData[5];
    var tileCoordKey = requestTileCoord.join(",") + "," + tileCoord[0];
    var vectorTileData = null;

    if (self.vectorTilesData[formatId].containsKey(tileCoordKey)) {
        vectorTileData = self.vectorTilesData[formatId].get(tileCoordKey);
    }
    else {
        self.console.log("missing", tileCoord, tileCoordKey)
    }            

    if (tileCoord[0] < maxDataZoom) {
        self.vectorTilesData[formatId].remove(tileCoordKey);
    }

    if(!vectorTileData){
        return false;
    }
    var features = vectorTileData.features;
    var styleJsonCache = vectorTileData.styleJsonCache;
    var subTileInstructCaches = vectorTileData.subTileInstructCaches;
    var mainGeoStyleIds = vectorTileData.mainGeoStyleIds;
    var tileKey = "" + [tileCoord[1], tileCoord[2]];

    var geoStyles = styleJsonCache.geoStyles;
    var instructs = subTileInstructCaches[tileKey];

    var strategyTree = rbush(9);

    var tileGrid = new XYZ().getTileGrid();
    var bbox = tileGrid.getTileCoordExtent(tileCoord);


    var bottomLeft = getBottomLeft(bbox);
    var bottomRight = getBottomRight(bbox);
    var topRight = getTopRight(bbox);
    var topLeft =getTopLeft(bbox);

    var coords = bottomLeft.concat(bottomRight,topRight,topLeft);
    var feature = new RenderFeature('Polygon',coords, [8], {layerName: "ocean"}, 0);
    var geoStyle = geoStyles["ocean#0"];
    renderFeature.call(this, feature, [geoStyle], { strategyTree: strategyTree, frameState: { coordinateToPixelTransform: coordinateToPixelTransform,pixelToCoordinateTransform:pixelToCoordinateTransform } }, [0,'ocean#0',0]);

    if (instructs && instructs.length > 0) {           
        for (var i = 0; i < instructs.length; i++) {
            var geoStyleId = instructs[i][1];

            if (mainGeoStyleIds[geoStyleId] === undefined) {
                var geoStyle = geoStyles[geoStyleId];
                var featureInfo = features[instructs[i][0]];               
                var clonedFlatCoordinates = featureInfo.flatCoordinates_.slice(0);
                var cloneEnds = featureInfo.ends_.slice(0);      
                var feature = new RenderFeature(featureInfo.type_, clonedFlatCoordinates, cloneEnds, featureInfo.properties_, featureInfo.id_);
                feature.getGeometry().transform(tileProjection, projection);
                feature.extent_ = bbox;                        
                feature["styleId"] = geoStyleId; 

                // clip line segment
                var type = feature.type_;
                if(type == 'LineString'){
                    var clipped = self.clipLine(feature.flatCoordinates_, bbox, squaredTolerance);                            
                    var flatCoordinates = clipped.flatCoordinates;
                    var ends = clipped.ends;
                    
                    if(flatCoordinates.length <= 2){                                
                        continue;
                    }

                    if(ends.length > 1) {
                        feature.type_ = 'MultiLineString';
                    }
                    feature.flatCoordinates_ = flatCoordinates;
                    feature.ends_ = ends; 
                }else if(type == 'MultiLineString'){  
                    var clipped = self.clipMultiLine(feature.flatCoordinates_, feature.ends_, bbox, squaredTolerance);
                    var flatCoordinates = clipped.flatCoordinates;
                    var ends = clipped.ends;
                    
                    if(flatCoordinates.length <= 2){                                
                        continue;
                    }
                    feature.flatCoordinates_ = flatCoordinates;
                    feature.ends_ = ends; 
                }
                renderFeature.call(this, feature, [geoStyle], { strategyTree: strategyTree, frameState: { coordinateToPixelTransform: coordinateToPixelTransform,pixelToCoordinateTransform:pixelToCoordinateTransform } }, instructs[i]);
            }
        }
    }
    strategyTree.clear();

    return { 
        'replays': replayGroup.replaysByZIndex_,
        features: mainFeatures, 
        instructs: mainDrawingInstructs
    };
}


self.disposeSourceTile = function (disposeSourceTileInfo, methodInfo) {
    var sourceTileCoord = disposeSourceTileInfo["sourceTileCoord"];
    var requestCoord = disposeSourceTileInfo["requestCoord"];
    var maxDataZoom = disposeSourceTileInfo["maxDataZoom"];
    // Remove the feature and Instructions of source tile.
    if (self.features) {
        let cacheKey = sourceTileCoord + "," + sourceTileCoord[0];
        if (self.features.containsKey(cacheKey)) {
            self.removeTileInstructions(cacheKey);
        }
    }
    // Remove the apply feature and Instructions of source tile
    if (self.applyFeatures) {
        let cacheKey = sourceTileCoord.toString();
        if (self.applyFeatures.containsKey(cacheKey)) {
            self.reomveApplyTileInstructions(cacheKey);
        }
    }
}

// Method

self.saveApplyTileInstructions = function (newFeatureAndInstructs, sourceTileCoord, vectorImageTileZoom) {
    let key = sourceTileCoord.toString();
    if (self.applyFeatures === undefined) {
        self.applyFeatures = new LRUCache(16);
    }
    if (self.applyFeatures.containsKey(key)) {
        let cacheItem = self.applyFeatures.get(key);
        cacheItem[vectorImageTileZoom] = newFeatureAndInstructs;
    }
    else {
        let cacheItem = {};
        cacheItem[vectorImageTileZoom] = newFeatureAndInstructs;
        self.applyFeatures.set(key, cacheItem);
    }
}

self.getApplyTileInstructions = function (sourceTileCoord, vectorImageTileZoom) {
    if (self.applyFeatures === undefined) {
        return;
    }
    else {
        var key = sourceTileCoord.toString();
        if (self.applyFeatures.containsKey(key)) {
            return self.applyFeatures.get(key)[vectorImageTileZoom];
        }
    }
}

self.reomveApplyTileInstructions = function (sourceTileCoord) {
    if (self.applyFeatures === undefined) {
        return;
    }
    else {
        var key = sourceTileCoord.toString();
        if (self.applyFeatures.containsKey(key)) {
            self.applyFeatures.remove(key);
        }
    }
}

self.createApplyTileInstructions = function (features, formatId, vectorImageTileZoom) {
    const outputFeatures = [];
    var styleJsonCache = self.styleJsonCache[formatId];
    var zoomMatchedGeoStylesGroupByLayerId = styleJsonCache.geoStyleGroupByZoom[vectorImageTileZoom];
    if (!zoomMatchedGeoStylesGroupByLayerId) {
        return [[], []];
    }

    var instructsCache = [];
    var featureIndex = -1;
    for (var pbfLayerName in zoomMatchedGeoStylesGroupByLayerId) {
        let cacheTrees = zoomMatchedGeoStylesGroupByLayerId[pbfLayerName];
        if (cacheTrees && cacheTrees.length > 0) {
            for (let i = 0; i < features.length; i++) {
                let feature = features[i];
                if (feature.get(self.layerName) === pbfLayerName) {
                    let matchedFeature = undefined;
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
                                        if (!filter.matchOLFeature(feature, vectorImageTileZoom)) {
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
                            if (matchedFeature === undefined) {
                                matchedFeature = feature;
                                outputFeatures.push(feature);
                                featureIndex += 1;
                            }

                            let zindex;
                            if (cacheTree.root.data.zIndex) {
                                zindex = feature.get(cacheTree.root.data.zIndex);
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

                            instructsCache[treeIndex][zindex].push([featureIndex, matchedNode]);
                            feature.extent_ = undefined;
                        }
                    }
                }
            }
        }





    }

    let instructs = [];
    for (let i = 0; i < instructsCache.length; i++) {
        let instructsInOneTree = instructsCache[i];
        if (instructsInOneTree) {
            for (let j = instructsInOneTree.min, jj = instructsInOneTree.max; j <= jj; j++) {
                let instructsInOneZIndex = instructsInOneTree[j];
                if (instructsInOneZIndex) {
                    let childrenInstructs = [];
                    for (let h = 0; h < instructsInOneZIndex.length; h++) {
                        let instruct = instructsInOneZIndex[h];
                        var feature = outputFeatures[instruct[0]];
                        feature.styleId = feature.styleId ? feature.styleId : {}
                        if (instruct[1].geoStyle) {
                            feature.styleId[instruct[1].geoStyle.id] = 0;
                            instructs.push([instruct[0], instruct[1].geoStyle, i]);
                        }

                        if (instruct[1].childrenGeoStyles) {
                            for (let k = 0; k < instruct[1].childrenGeoStyles.length; k++) {
                                feature.styleId[instruct[1].childrenGeoStyles[k].id] = 1;
                                childrenInstructs.push([instruct[0], instruct[1].childrenGeoStyles[k], i]);
                            }
                        }
                    }
                    Array.prototype.push.apply(instructs, childrenInstructs);
                }
            }
        }
    }
    return [outputFeatures, instructs]
}

self.renderFeature = function (feature, squaredTolerance, styles, replayGroup,options) {
    if (!styles) {
        return false;
    }
    let loading = false;
    if (Array.isArray(styles)) {
        for (let i = 0, ii = styles.length; i < ii; ++i) {
            loading = renderFeature(
                replayGroup, feature, styles[i], squaredTolerance,
                self.handleStyleImageChange_, this,options) || loading;
        }
    } else {
        loading = renderFeature(
            replayGroup, feature, styles, squaredTolerance,
            self.handleStyleImageChange_, this);
    }
    return loading;
}

self.createStyleJsonCache = function (stylejson, geoTextStyleInfos) {
    var styleIdIndex = 0;
    var geoStyles = {};
    var styleJsonCache = new StyleJsonCache();
    styleJsonCache["geoTextStyleInfos"] = geoTextStyleInfos;
    for (var id in stylejson) {
        var json = stylejson[id];
        var item = new StyleJsonCacheItem(json, 0, 24, "layerName",styleIdIndex);

        for (var zoom = item.minZoom; zoom <= item.maxZoom; zoom++) {
            var treeNode = new TreeNode(item);
            self.createChildrenNode(treeNode, item, zoom);
            styleJsonCache.add(zoom, item.dataLayerName, new Tree(treeNode, styleIdIndex,styleIdIndex));
        }

        styleIdIndex += 1;
    }
    return styleJsonCache;
}

self.createChildrenNode = function (currentNode, item, zoom) {
    if (item.subStyleCacheItems && item.subStyleCacheItems.length > 0) {
        for (var i = 0, ii = item.subStyleCacheItems.length; i < ii; i++) {
            var subStyleItem = item.subStyleCacheItems[i];
            if (zoom >= subStyleItem.minZoom && zoom <= subStyleItem.maxZoom) {
                var node = new TreeNode(subStyleItem);
                currentNode.children.push(node);
                self.createChildrenNode(node, subStyleItem, zoom);
            }
        }
    }
}

self.createDrawingInstructs = function (source, zoom, formatId, tileCoord, requestCoord, layerName, vectorTileDataCahceSize, tileExtent, tileResolution) {

    var styleJsonCache = self.styleJsonCache[formatId];  
    var readData = readFeaturesAndCreateInstructTrees(source, zoom, requestCoord[0], styleJsonCache, layerName, tileExtent, tileResolution);

    var features = readData[0];
    var instructsTree = readData[1];
    var extent = readData[2];

    var instructsData = getInstructs(instructsTree);
    var instructs = instructsData[0];
    var mainGeoStyleIds = instructsData[1];

    var subTileInstructCaches = createSubTileInstructCaches(features, instructs, extent, tileCoord, requestCoord);
    instructs.length = 0;
    var sourceProject = {};

    var oTile = {
        features: features,
        styleJsonCache: styleJsonCache,
        subTileInstructCaches: subTileInstructCaches,
        sourceProject: sourceProject,
        lastExtent: extent,
        mainGeoStyleIds: mainGeoStyleIds
    };

    var requestKey = requestCoord.join(",") + "," + zoom;

    var vectorTileCache = null;
    vectorTileDataCahceSize = vectorTileDataCahceSize === undefined ? 1024 : vectorTileDataCahceSize;

    if (self.vectorTilesData[formatId] === undefined) {     
        self.vectorTilesData[formatId] = new LRUCache(vectorTileDataCahceSize);
    }
    
    vectorTileCache = self.vectorTilesData[formatId];
    vectorTileCache.highWaterMark = vectorTileDataCahceSize;
    while (vectorTileCache.canExpireCache()) {
        vectorTileCache.pop();
    }

    if (!vectorTileCache.containsKey(requestKey)) {
        vectorTileCache.set(requestKey, oTile);
    }

    var tileKey = tileCoord[1] + "," + tileCoord[2];

    var resultData = {
        status: "succeed",
        requestKey: requestKey
    };

    return resultData;
}

self.readFeaturesAndInstructions = function (source, zoom, formatId, tileCoord, requestCoord, layerName, vectorTileDataCahceSize, tileExtent, tileResolution) {
    const features = [];
    var styleJsonCache = self.styleJsonCache[formatId];

    let zoomMatchedGeoStylesGroupByLayerId = styleJsonCache.geoStyleGroupByZoom[tileCoord[0]];
    if (!zoomMatchedGeoStylesGroupByLayerId) {
        return [[], []];
    }

    let pbfLayerNamesWithGeoStyle = [];
    for (let pbfLayerName in zoomMatchedGeoStylesGroupByLayerId) {
        pbfLayerNamesWithGeoStyle.push(pbfLayerName);
    }

    let instructsCache = [];

    var featureIndex = -1;
    const pbf = new PBF(/** @type {ArrayBuffer} */(source));
    const pbfLayers = pbf.readFields(layersPBFReader, {});

    for (const name in pbfLayers) {
        if (pbfLayerNamesWithGeoStyle.indexOf(name) === -1) {
            continue;
        }

        const pbfLayer = pbfLayers[name];

        let cacheTrees = zoomMatchedGeoStylesGroupByLayerId[name];
        if (cacheTrees && cacheTrees.length > 0) {
            for (let i = 0; i < pbfLayer.length; i++) {
                const rawFeature = readRawFeature(pbf, pbfLayer, i);
                let feature;
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
                                    if (!filter.matchOLFeature(rawFeature, tileCoord[0])) {
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
                        if (feature === undefined) {
                            feature = self.createFeature_(pbf, rawFeature);
                            features.push(feature);
                            featureIndex += 1;
                        }

                        let zindex;

                        if (cacheTree.root.data.zIndex) {
                            zindex = rawFeature.properties[cacheTree.root.data.zIndex];
                            feature.properties_[cacheTree.root.data.zIndex] = zindex;
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

                        instructsCache[treeIndex][zindex].push([featureIndex, matchedNode]);
                        feature.extent_ = undefined;
                    }
                }
            }
        }
    }
    let instructs = [];
    for (let i = 0; i < instructsCache.length; i++) {
        let instructsInOneTree = instructsCache[i];
        if (instructsInOneTree) {
            for (let j = instructsInOneTree.min, jj = instructsInOneTree.max; j <= jj; j++) {
                let instructsInOneZIndex = instructsInOneTree[j];
                if (instructsInOneZIndex) {
                    let childrenInstructs = [];
                    for (let h = 0; h < instructsInOneZIndex.length; h++) {
                        let instruct = instructsInOneZIndex[h];
                        var feature = features[instruct[0]];
                        feature.styleId = feature.styleId ? feature.styleId : {}
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

    return [features, instructs];
}
function layersPBFReader(tag, layers, pbf) {
    if (tag === 3) {
        const layer = {
            keys: [],
            values: [],
            features: []
        };
        const end = pbf.readVarint() + pbf.pos;
        pbf.readFields(layerPBFReader, layer, end);
        layer.length = layer.features.length;
        if (layer.length) {
            layers[layer.name] = layer;
        }
    }
}
function layerPBFReader(tag, layer, pbf) {
    if (tag === 15) {
        layer.version = pbf.readVarint();
    } else if (tag === 1) {
        layer.name = pbf.readString();
    } else if (tag === 5) {
        layer.extent = pbf.readVarint();
    } else if (tag === 2) {
        layer.features.push(pbf.pos);
    } else if (tag === 3) {
        layer.keys.push(pbf.readString());
    } else if (tag === 4) {
        let value = null;
        const end = pbf.readVarint() + pbf.pos;
        while (pbf.pos < end) {
            tag = pbf.readVarint() >> 3;
            value = tag === 1 ? pbf.readString() :
                tag === 2 ? pbf.readFloat() :
                    tag === 3 ? pbf.readDouble() :
                        tag === 4 ? pbf.readVarint64() :
                            tag === 5 ? pbf.readVarint() :
                                tag === 6 ? pbf.readSVarint() :
                                    tag === 7 ? pbf.readBoolean() : null;
        }
        layer.values.push(value);
    }
}
function readRawFeature(pbf, layer, i) {
    pbf.pos = layer.features[i];
    const end = pbf.readVarint() + pbf.pos;

    const feature = {
        layer: layer,
        type: 0,
        properties: {}
    };
    pbf.readFields(featurePBFReader, feature, end);
    return feature;
}
function featurePBFReader(tag, feature, pbf) {
    if (tag == 1) {
        feature.id = pbf.readVarint();
    } else if (tag == 2) {
        const end = pbf.readVarint() + pbf.pos;
        while (pbf.pos < end) {
            const key = feature.layer.keys[pbf.readVarint()];
            const value = feature.layer.values[pbf.readVarint()];
            feature.properties[key] = value;
        }
    } else if (tag == 3) {
        feature.type = pbf.readVarint();
    } else if (tag == 4) {
        feature.geometry = pbf.pos;
    }
}
self.createFeature_ = function (pbf, rawFeature, opt_options) {
    const type = rawFeature.type;
    if (type === 0) {
        return null;
    }

    let feature;
    const id = rawFeature.id;
    const values = rawFeature.properties;
    values[self.layerName_] = rawFeature.layer.name;

    const flatCoordinates = [];
    const ends = [];
    self.readRawGeometry_(pbf, rawFeature, flatCoordinates, ends);

    const geometryType = getGeometryType(type, ends.length);
    feature = new RenderFeature(geometryType, flatCoordinates, ends, values, id);

    return feature;
}
self.readRawGeometry_ = function (pbf, feature, flatCoordinates, ends) {
    pbf.pos = feature.geometry;

    const end = pbf.readVarint() + pbf.pos;
    let cmd = 1;
    let length = 0;
    let x = 0;
    let y = 0;
    let coordsLen = 0;
    let currentEnd = 0;

    while (pbf.pos < end) {
        if (!length) {
            const cmdLen = pbf.readVarint();
            cmd = cmdLen & 0x7;
            length = cmdLen >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += pbf.readSVarint();
            y += pbf.readSVarint();

            if (cmd === 1) { // moveTo
                if (coordsLen > currentEnd) {
                    ends.push(coordsLen);
                    currentEnd = coordsLen;
                }
            }

            flatCoordinates.push(x, y);
            coordsLen += 2;

        } else if (cmd === 7) {

            if (coordsLen > currentEnd) {
                // close polygon
                flatCoordinates.push(
                    flatCoordinates[currentEnd], flatCoordinates[currentEnd + 1]);
                coordsLen += 2;
            }

        } else {
            assert(false, 59); // Invalid command found in the PBF
        }
    }

    if (coordsLen > currentEnd) {
        ends.push(coordsLen);
        currentEnd = coordsLen;
    }

}

self.getGeometryType = function (type, numEnds) {
    /** @type {GeometryType} */
    let geometryType;
    if (type === 1) {
        geometryType = numEnds === 1 ?
            GeometryType.POINT : GeometryType.MULTI_POINT;
    } else if (type === 2) {
        geometryType = numEnds === 1 ?
            GeometryType.LINE_STRING :
            GeometryType.MULTI_LINE_STRING;
    } else if (type === 3) {
        geometryType = GeometryType.POLYGON;
        // MultiPolygon not relevant for rendering - winding order determines
        // outer rings of polygons.
    }
    return geometryType;
}




self.CreateInstructionsForHomologousTiles = function (featuresAndInstructions, requestCoord, zoom) {
    let subTileCachedInstruct = {};
    let offsetZ = zoom - requestCoord[0];
    let tileSize = 4096 / Math.pow(2, offsetZ);
    let tileRange = self.getTileRange(requestCoord, zoom);

    let features = featuresAndInstructions[0];
    let instructs = featuresAndInstructions[1];
    if (instructs === undefined) {
    }
    for (let i = 0; i < instructs.length; i++) {
        let instruct = instructs[i];
        let feature = features[instruct[0]];

        let featureExtent = feature.getExtent();

        let featureTileRange = self.getFeatureTileRange(featureExtent, 4096, tileSize, requestCoord, offsetZ);
        for (let x = tileRange[0] > featureTileRange[0] ? tileRange[0] : featureTileRange[0], xx = featureTileRange[2] > tileRange[2] ? tileRange[2] : featureTileRange[2]; x <= xx; x++) {
            for (let y = tileRange[1] > featureTileRange[1] ? tileRange[1] : featureTileRange[1], yy = featureTileRange[3] > tileRange[3] ? tileRange[3] : featureTileRange[3]; y <= yy; y++) {
                let tileKey = "" + [zoom, x, y];
                if (subTileCachedInstruct[tileKey] === undefined) {
                    subTileCachedInstruct[tileKey] = [];
                }
                subTileCachedInstruct[tileKey].push(instruct);
            }
        }
    }

    return subTileCachedInstruct;
}
self.getTileRange = function (tileCoord, zoom) {
    let x = tileCoord[1];
    let y = tileCoord[2];
    let minX = x;
    let maxX = x;
    let minY = y;
    let maxY = y;

    for (let i = tileCoord[0]; i < zoom; i++) {
        minX = minX * 2;
        maxX = maxX * 2 + 1;
        minY = minY * 2;
        maxY = maxY * 2 + 1;
    }

    return [minX, minY, maxX, maxY];
}
self.getFeatureTileRange = function (featureExtent, extent, tileSize, requestCoord, offsetZ) {

    let minX = requestCoord[1] * Math.pow(2, offsetZ) + Math.floor(featureExtent[0] / tileSize);
    let maxX = requestCoord[1] * Math.pow(2, offsetZ) + Math.floor(featureExtent[2] / tileSize);
    let minY = requestCoord[2] * Math.pow(2, offsetZ) + Math.floor((extent - featureExtent[3]) / tileSize);
    let maxY = requestCoord[2] * Math.pow(2, offsetZ) + Math.floor((extent - featureExtent[1]) / tileSize);

    return [minX, minY, maxX, maxY];
}

self.saveTileInstructions = function (cacheKey, features, homologousTilesInstructions) {
    self.vectorTilesData[cacheKey] = homologousTilesInstructions;

    if (self.features === undefined) {
        self.features = new LRUCache(64);
    }
    if (self.features.containsKey(cacheKey)) {
        self.features.replace(cacheKey, features);
    }
    else {
        // TODO: the condition for clearing the cache is that the tile is released. 
        self.features.set(cacheKey, features);
        // while (self.features.canExpireCache()) {
        //     const lastKey = self.features.peekLastKey();
        //     self.features.remove(lastKey);
        //     delete self.vectorTilesData[lastKey]
        // }
    }
}

self.getTileInstructions = function (cacheKey, tileCoord) {
    let featuresAndInstructs = undefined;
    if (self.features && self.features.containsKey(cacheKey)) {
        if (self.vectorTilesData && self.vectorTilesData[cacheKey]) {
            featuresAndInstructs = [self.features.get(cacheKey), self.vectorTilesData[cacheKey][tileCoord] === undefined ? [] : self.vectorTilesData[cacheKey][tileCoord]];
        }
    }

    return featuresAndInstructs;
}

self.removeTileInstructions = function (cacheKey) {
    if (self.features && self.features.containsKey(cacheKey)) {
        self.features.remove(cacheKey);
        delete self.vectorTilesData[cacheKey];
    }
}


self.clipMultiLine = function(points, ends, bounds, squaredTolerance){
    var clippedFlatCoordinates;
    var clippedEnds;
    var clipped; 
    var flatCoordinates = [], ends_ = [];
    ends.unshift(0);

    for(var i = 1; i < ends.length; i++){
        clipped = self.clipLine(points.slice(ends[i - 1], ends[i]), bounds, squaredTolerance);
        clippedFlatCoordinates = clipped.flatCoordinates;
        clippedEnds = clipped.ends;
        if(clippedFlatCoordinates.length > 2){
            clippedEnds = clippedEnds.map(function(item) {return item + flatCoordinates.length} );
            ends_ = ends_.concat(clippedEnds);
            flatCoordinates = flatCoordinates.concat(clippedFlatCoordinates);
        }
    }            

    return {
        "flatCoordinates":flatCoordinates,
        "ends": ends_
    }
}
self.clipLine = function(points, bounds, squaredTolerance){
    var clippedFlatCoordinates = [];
    var clippedEnds = [];
    var clipped = self.clipPoint(points, bounds, squaredTolerance);

    for(var j = 0; j < clipped.length; j++){
        var coords = clipped[j];
        if(coords.length > 2){
            clippedFlatCoordinates=clippedFlatCoordinates.concat(coords);
            clippedEnds.push(clippedFlatCoordinates.length);
        }
    }

    return {
        flatCoordinates: clippedFlatCoordinates,
        ends: clippedEnds
    }
}

self.clipPoint = function (points, bounds, squaredTolerance) {
    var i, k, segment;
    var parts = [];
    var len = points.length;
    var a = [];
    var b = [];
    self.lastCode = undefined;

    for (i = 0, k = 0; i < len - 3; i += 2) {
        a = [points[i], points[i + 1]];
        b = [points[i + 2], points[i + 3]];
        segment = self.clipSegment(a, b, bounds, i);
        if (!segment) {
            continue;
        }
        parts[k] = parts[k] || [];
        
        var shortDistance = (sqDist(segment[0], segment[1]) <= squaredTolerance);
        if(!shortDistance){
            parts[k] = parts[k].concat(segment[0]);
        }

        // if segment goes out of screen, or it's the last one, it's the end of the line part
        if ((segment[1][0] !== points[i + 2]) || (segment[1][1] !== points[i + 3]) || (i === len - 4)) {
            parts[k] = parts[k].concat(segment[1]);
            k++;
        }
    }
    
    return parts;
}
self.clipSegment = function (a, b, bounds, useLastCode) {
    var codeA = useLastCode ? self.lastCode : getBitCode(a, bounds),
        codeB =getBitCode(b, bounds),
        codeOut, p, newCode;

    self.lastCode = codeB;

    while (true) {
        // if a,b is inside the clip window (trivial accept)
        if (!(codeA | codeB)) {
            return [a, b];
        // if a,b is outside the clip window (trivial reject)
        } else if (codeA & codeB) {
            return false;
        // other cases
        } else {
            codeOut = codeA || codeB;
            p = getEdgeIntersection(a, b, codeOut, bounds);
            newCode = getBitCode(p, bounds);

            if (codeOut === codeA) {
                a = p;
                codeA = newCode;
            } else {
                b = p;
                codeB = newCode;
            }
        }
    }
}

function getBitCode (p, bounds) {
    var code = 0;

    if (p[0] < bounds[0]) { // left
        code |= 1;
    } else if (p[0] > bounds[2]) { // right
        code |= 2;
    }
    if (p[1] < bounds[1]) { // bottom
        code |= 4;
    } else if (p[1] > bounds[3]) { // top
        code |= 8;
    }

    return code;
};

function getEdgeIntersection (a, b, code, bounds) {
    var dx = b[0] - a[0],
        dy = b[1] - a[1],
        minX = bounds[0],
        minY = bounds[1],
        maxX = bounds[2],
        maxY = bounds[3];

    if (code & 8) { // top
        return [a[0] + dx * (maxY - a[1]) / dy, maxY];
    } else if (code & 4) { // bottom
        return [a[0] + dx * (minY - a[1]) / dy, minY];
    } else if (code & 2) { // right
        return [maxX, a[1] + dy * (maxX - a[0]) / dx];
    } else if (code & 1) { // left
        return [minX, a[1] + dy * (minX - a[0]) / dx];
    }
};

function sqDist(p1, p2) {
    var dx = p2[0] - p1[0],
        dy = p2[1] - p1[1];
        
    return dx * dx + dy * dy;
};
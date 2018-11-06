import util from "./util";
import StyleJsonCache from "../tree/styleJsonCache";
import StyleJsonCacheItem from "../tree/styleJsonCacheItem";
import TreeNode from "../tree/treeNode";
import Tree from "../tree/tree";
import PBF from 'pbf';
import GeometryType from 'ol/geom/GeometryType';
import RenderFeature from 'ol/render/Feature';
import LRUCache from 'ol/structs/LRUCache'


self.styleJsonCache = {};
self.vectorTilesData = {};
self.features = {};

self.onmessage = function (msg) {
    var methodInfo = msg.data["methodInfo"];
    var messageData = msg.data["messageData"];
    var debugInfo = msg.data["debugInfo"];

    if (debugInfo) {
        var now = new Date().getTime();
        // console.log("+++" + methodInfo.uid + " " + methodInfo.methodName + ": " + (now - debugInfo.postMessageDateTime));
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
    var requestCoord = requestInfo.requestCoord;
    var tileCoord = requestInfo.tileCoord;
    var vectorImageTileCoord = requestInfo.vectorImageTileCoord;
    var formatId = requestInfo.formatId;
    var minimalist = requestInfo.minimalist;
    var layerName = requestInfo.layerName;
    var vectorTileDataCahceSize = requestInfo.vectorTileDataCahceSize
    var tileExtent = requestInfo.tileExtent;
    var tileResolution = requestInfo.tileResolution;

    var requestKey = requestCoord.join(",") + "," + tileCoord[0];
    var tileKey = tileCoord[1] + "," + tileCoord[2];
    var tileRange = requestInfo.tileRange;
    var olTile;
    var formatOlTiles = self.vectorTilesData[formatId];
    if (formatOlTiles && formatOlTiles.containsKey(requestKey)) {
        olTile = formatOlTiles.get(requestKey);
    }

    if (olTile) {
        var res = self.getMainInstructs(olTile, olTile.mainGeoStyleIds);

        var resultData = {
            requestKey: requestKey,
            status: "succeed",
            mainInstructs: res
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
        var xhr = new XMLHttpRequest();
        xhr.open("GET", requestInfo.url, true);
        // TODO others type, such as geojson.
        xhr.responseType = "arraybuffer";

        // Client ID and Client Secret
        if (requestInfo.token) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + requestInfo.token);
        }

        var postMessageData = {
            methodInfo: methodInfo,
            messageData: {},
            debugInfo: {
                postMessageDateTime: new Date().getTime()
            }
        };
        xhr.onload = function (event) {
            if (!xhr.status || xhr.status >= 200 && xhr.status < 300) {
                var source = undefined;
                source = /** @type {ArrayBuffer} */ (xhr.response);
                if (source) {
                    var resultMessageData = self.createDrawingInstructs(source, tileCoord[0], formatId, tileCoord, requestCoord, layerName, vectorTileDataCahceSize, tileExtent, tileResolution);
                    postMessageData.messageData = resultMessageData;
                    postMessage(postMessageData);
                }
            }
        }
        xhr.send();

    }






}


// Method

self.createStyleJsonCache = function (stylejson, geoTextStyleInfos) {
    var styleIdIndex = 0;
    var geoStyles = {};
    var styleJsonCache = new StyleJsonCache();
    styleJsonCache["geoTextStyleInfos"] = geoTextStyleInfos;
    for (var id in stylejson) {
        var json = stylejson[id];
        var item = new StyleJsonCacheItem(json, 0, 24, "layerName");

        for (var zoom = item.minZoom; zoom <= item.maxZoom; zoom++) {
            var treeNode = new TreeNode(item);
            self.createChildrenNode(treeNode, item, zoom);
            styleJsonCache.add(zoom, item.dataLayerName, new Tree(treeNode, styleIdIndex));
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
    var featuresAndInstructions = self.readFeaturesAndInstructions(source, zoom, formatId, tileCoord, requestCoord, layerName, vectorTileDataCahceSize, tileExtent, tileResolution);
    var homologousTilesInstructions = CreateInstructionsForHomologousTiles(featuresAndInstructions, requestCoord, tileCoord[0]);

    self.saveTileInstructions(formatId, requestCoord, zoom, featuresAndInstructions[0], homologousTilesInstructions);
    var tileFeatureAndInstrictions = self.saveTileInstructions(formatId, requestCoord, tileCoord);

    var requestKey = requestCoord.join(",") + "," + zoom;
    var resultData = {
        status: "succeed",
        requestKey: requestKey,
        data: tileFeatureAndInstrictions
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
                            feature.styleId[instruct[1].geoStyle.id] = 0;
                            instructs.push([instruct[0], instruct[1].geoStyle.id, i]);
                        }

                        if (instruct[1].childrenGeoStyles) {
                            for (let k = 0; k < instruct[1].childrenGeoStyles.length; k++) {
                                feature.styleId[instruct[1].childrenGeoStyles[k].id] = 1;
                                childrenInstructs.push([instruct[0], instruct[1].childrenGeoStyles[k].id, i]);
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
    values[this.layerName_] = rawFeature.layer.name;

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
    let tileRange = this.getTileRange(requestCoord, zoom);

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
self.getFeatureTileRange = function (featureExtent, extent, tileSize, requestCoord, offsetZ) {

    let minX = requestCoord[1] * Math.pow(2, offsetZ) + Math.floor(featureExtent[0] / tileSize);
    let maxX = requestCoord[1] * Math.pow(2, offsetZ) + Math.floor(featureExtent[2] / tileSize);
    let minY = requestCoord[2] * Math.pow(2, offsetZ) + Math.floor((extent - featureExtent[3]) / tileSize);
    let maxY = requestCoord[2] * Math.pow(2, offsetZ) + Math.floor((extent - featureExtent[1]) / tileSize);

    return [minX, minY, maxX, maxY];
}

self.saveTileInstructions = function (formatId, requestCoord, zoom, features, homologousTilesInstructions) {
    let cacheKey = "" + requestCoord + "," + zoom;
    if (self.vectorTilesData[formatId] === undefined) {
        self.vectorTilesData[formatId] = {};
    }
    self.vectorTilesData[formatId][cacheKey] = homologousTilesInstructions;

    if (self.features[formatId] === undefined) {
        self.features[formatId] = new LRUCache(4);
    }
    if (self.features[formatId].containsKey(cacheKey)) {
        self.features[formatId].replace(cacheKey, features);
    }
    else {
        self.features[formatId].set(cacheKey, features);
        while (this.features[formatId].canExpireCache()) {
            const lastKey = self.features[formatId].peekLastKey();
            self.features[formatId].remove(lastKey);
            delete self.vectorTilesData[formatId][cacheKey]
        }
    }



}
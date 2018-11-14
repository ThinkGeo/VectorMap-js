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

self.styleJsonCache = {};
self.vectorTilesData = {};

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
    var tileRange = requestInfo.tileRange;
    var requestToken = requestInfo.token;
    var url = requestInfo.url;

    var cacheKey = requestCoord.join(",") + "," + tileCoord[0];
    var tileFeatureAndInstrictions = self.getTileInstrictions(cacheKey, tileCoord);

    if (tileFeatureAndInstrictions) {
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
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);

        xhr.responseType = "arraybuffer";

        // Client ID and Client Secret
        if (requestToken) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + requestToken);
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


self.createReplayGroup = function (createReplayGroupInfo, methodInfo) {
    let replayGroupInfo = createReplayGroupInfo["replayGroupInfo"];
    let resolution = replayGroupInfo[2];
    let requestCoord = createReplayGroupInfo["requestCoord"];
    let tileCoord = createReplayGroupInfo["tileCoord"];
    let tileProjectionInfo = createReplayGroupInfo["tileProjectionInfo"];
    let projectInfo = createReplayGroupInfo["projectInfo"];
    let sourceTileExtent = createReplayGroupInfo["sourceTileExtent"];
    let bufferedExtent = createReplayGroupInfo["bufferedExtent"];
    let squaredTolerance = createReplayGroupInfo["squaredTolerance"];
    let coordinateToPixelTransform = createReplayGroupInfo["coordinateToPixelTransform"];

    let frameState = {
        coordinateToPixelTransform: coordinateToPixelTransform
    };

    var cacheKey = requestCoord.join(",") + "," + tileCoord[0];
    var tileFeatureAndInstrictions = self.getTileInstrictions(cacheKey, tileCoord);
    if (tileFeatureAndInstrictions === undefined) {
        debugger;
    }
    let features = tileFeatureAndInstrictions[0];
    let instructs = tileFeatureAndInstrictions[1];
    let strategyTree = rbush(9);


    let tileProjection = new Projection({
        code: 'EPSG:3857',
        units: Units.TILE_PIXELS
    })
    let projection = new Projection({
        code: 'EPSG:3857',
        units: Units.TILE_PIXELS
    })

    for (var name in tileProjectionInfo) {
        tileProjection[name] = tileProjectionInfo[name];
    }
    for (var name in projectInfo) {
        projection[name] = projectInfo[name];
    }

    let replayGroup = new GeoCanvasReplayGroup(replayGroupInfo[0], replayGroupInfo[1], replayGroupInfo[2], replayGroupInfo[3],
        replayGroupInfo[4], replayGroupInfo[5], replayGroupInfo[6]);

    let drawingFeatures = {};
    let mainDrawingInstructs = [];
    const render = function (feature, geostyle) {
        let styles;
        if (geostyle) {
            if (geostyle instanceof GeoLineStyle && geostyle.onewaySymbol !== undefined) {
                drawingFeatures[getUid(feature)] = feature;
                mainDrawingInstructs.push([getUid(feature), geostyle.id]);
            }
            else {
                let ol4Styles = geostyle.getStyles(feature, resolution, { frameState: frameState, strategyTree, strategyTree });
                if (geostyle instanceof GeoTextStyle || geostyle instanceof GeoShieldStyle || geostyle instanceof GeoPointStyle) {
                    drawingFeatures[getUid(feature)] = feature;
                    mainDrawingInstructs.push([getUid(feature), geostyle.id]);
                }
                else {
                    if (styles === undefined) {
                        styles = [];
                    }
                    Array.prototype.push.apply(styles, ol4Styles);
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
            const dirty = self.renderFeature(feature, squaredTolerance, styles, replayGroup);
            drawingFeatures[getUid(feature)] = feature;
        }
    };

    for (let i = 0, ii = instructs.length; i < ii; i++) {
        const featureIndex = instructs[i][0];
        const featureInfo = features[featureIndex];

        let feature = new RenderFeature(featureInfo.type_, featureInfo.flatCoordinates_, featureInfo.ends_, featureInfo.properties_);
        let geoStyle = instructs[i][1];
        if (!featureInfo["projected"]) {
            feature.getGeometry().transform(tileProjection, projection);
            feature.extent_ = null;
            featureInfo["projected"] = true;
        }
        if (!bufferedExtent || intersects(bufferedExtent, feature.getGeometry().getExtent())) {
            render(feature, geoStyle);
        }
    }
    replayGroup.finish();
    var resultData = {
    };

    for (var zIndex in replayGroup.replaysByZIndex_) {
        var replays = replayGroup.replaysByZIndex_[zIndex];
        if (!resultData[zIndex]) {
            resultData[zIndex] = {};
        }
        for (var replayType in replays) {
            if (!resultData[zIndex][replayType]) {
                resultData[zIndex][replayType] = {};
            }
            var replay = replays[replayType];
            resultData[zIndex][replayType]["instructions"] = [];
            for (let i = 0; i < replay.instructions.length; i++) {
                let instruction = replay.instructions[i];
                if (instruction[0] === Instruction.BEGIN_GEOMETRY || instruction[0] === Instruction.END_GEOMETRY) {
                    let feature = instruction[1];
                    instruction[1] = getUid(feature);
                }
                resultData[zIndex][replayType]["instructions"].push(instruction);
            }
            resultData[zIndex][replayType]["coordinates"] = replay.coordinates.slice(0);
            replay.coordinates.length = 0;
            replay.instructions.length = 0;
        }
    }

    return { "replays": resultData, "features": drawingFeatures, "mainDrawingInstructs": mainDrawingInstructs };
}

// Method


self.renderFeature = function (feature, squaredTolerance, styles, replayGroup) {
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
    let cacheKey = requestCoord + "," + zoom;
    self.saveTileInstructions(cacheKey, featuresAndInstructions[0], homologousTilesInstructions);
    var tileFeatureAndInstrictions = self.getTileInstrictions(cacheKey, tileCoord);

    if (tileFeatureAndInstrictions === undefined) {
        debugger;
    }
    var requestKey = requestCoord.join(",") + "," + zoom;
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
        self.features = new LRUCache(1024);
    }
    if (self.features.containsKey(cacheKey)) {
        self.features.replace(cacheKey, features);
    }
    else {
        self.features.set(cacheKey, features);
        while (this.features.canExpireCache()) {
            const lastKey = self.features.peekLastKey();
            self.features.remove(lastKey);
            delete self.vectorTilesData[lastKey]
        }
    }
}

self.getTileInstrictions = function (cacheKey, tileCoord) {
    let featuresAndInstructs = undefined;
    if (self.features && self.features.containsKey(cacheKey)) {
        if (self.vectorTilesData && self.vectorTilesData[cacheKey]) {
            featuresAndInstructs = [this.features.get(cacheKey), this.vectorTilesData[cacheKey][tileCoord] === undefined ? [] : this.vectorTilesData[cacheKey][tileCoord]];
        }
    }

    return featuresAndInstructs;
}


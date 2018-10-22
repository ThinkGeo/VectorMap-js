export class GeoMVTFormat extends (ol.format.MVT as { new(p: olx.format.MVTOptions): any; }) {
    styleJsonCache: any;
    layerName: string;
    maxDataZoom: number;
    maxDataZoomCache: any;
    registeredLoadEvents: any;

    lruCache: any;
    sourceCache: any;


    constructor(styleJSonCache: any, options: any) {
        options.layerName = options.layerName ? options.layerName : "layerName";
        super(options);
        this.isMultithread = options.multithread;
        this.minimalist = options.minimalist;
        this.maxDataZoom = options.maxDataZoom ? options.maxDataZoom : 14;
        this.layerName = options.layerName;
        this.styleJsonCache = styleJSonCache;
        this.maxDataZoomCache = {};
        this.registeredLoadEvents = {};
        this.lruCache = new (<any>ol).structs.LRUCache(15);
        this.sourceCache = {};
    }

    getLayerName(): string {
        return this.layerName;
    }


    registerTileLoadEvent(tile, success, failure, callback) {
        let hasRequested = true;
        let requestKey = tile.requestTileCoord.join(",") + "," + tile.tileCoord[0];
        let loadEventInfo = {
            tile: tile,
            successFunction: success,
            failureFunction: failure,
            callback: callback
        }
        if (this.registeredLoadEvents[requestKey] === undefined) {
            this.registeredLoadEvents[requestKey] = [];
            hasRequested = false;
        }

        this.registeredLoadEvents[requestKey].push(loadEventInfo);
        return hasRequested;
    }

    readFeaturesAndCreateInstructsNew(source: ArrayBuffer, requestTileCoord, tileCoord) {
        let pbf = new (<any>ol).ext.PBF((source));
        let pbfLayers = pbf.readFields((<any>ol).format.MVT.pbfReaders_.layers, {});
        let pbfLayer;
        let features = [];
        let featureIndex = -1;

        let zoomMatchedGeoStylesGroupByLayerId = this.styleJsonCache.geoStyleGroupByZoom[tileCoord[0]];
        if (!zoomMatchedGeoStylesGroupByLayerId) {
            return features;
        }

        let pbfLayerNamesWithGeoStyle = [];
        for (let pbfLayerName in zoomMatchedGeoStylesGroupByLayerId) {
            pbfLayerNamesWithGeoStyle.push(pbfLayerName);
        }

        let instructsCache = [];
        for (let name in pbfLayers) {
            if (this.layers_ && this.layers_.indexOf(name) === -1) {
                continue;
            }
            if (pbfLayerNamesWithGeoStyle.indexOf(name) === -1) {
                continue;
            }

            pbfLayer = pbfLayers[name];

            let cacheTrees = zoomMatchedGeoStylesGroupByLayerId[name];


            if (cacheTrees && cacheTrees.length > 0) {
                this.replaceFiltersToIndexOfPbfLayer(cacheTrees, pbfLayer);
                for (let i = 0; i < pbfLayer.length; i++) {
                    let rawFeature = (<any>ol.format.MVT).readRawFeature_(pbf, pbfLayer, i);
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
                                feature = this.createFeature_(pbf, rawFeature);
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

            this.extent_ = pbfLayer ? [0, 0, pbfLayer.extent, pbfLayer.extent] : null;
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


        let subTileCachedInstruct = {};
        let offsetZ = tileCoord[0] - requestTileCoord[0];

        // TODO Get Extent 
        let tileSize = 4096 / Math.pow(2, offsetZ);

        let tileRange = this.getTileRange(requestTileCoord, tileCoord[0]);
        let tiles = {};
        for (let x = tileRange[0]; x <= tileRange[2]; x++) {
            let minX = (x - tileRange[0]) * tileSize;
            let maxX = (x - tileRange[0] + 1) * tileSize;
            for (let y = tileRange[3]; y >= tileRange[1]; y--) {
                let minY = (tileRange[3] - y) * tileSize;
                let maxY = (tileRange[3] - y + 1) * tileSize;
                tiles["" + [x, y]] = [minX, minY, maxX, maxY];
            }
        }
        for (let i = 0; i < instructs.length; i++) {
            let instruct = instructs[i];
            let feature = features[instruct[0]];
            let featureExtent = feature.getExtent();
            let featureTileRange = this.getFeatureTileRange(featureExtent, 4096, tileSize, requestTileCoord, offsetZ);

            for (let x = tileRange[0] > featureTileRange[0] ? tileRange[0] : featureTileRange[0], xx = featureTileRange[2] > tileRange[2] ? tileRange[2] : featureTileRange[2]; x <= xx; x++) {
                for (let y = tileRange[1] > featureTileRange[1] ? tileRange[1] : featureTileRange[1], yy = featureTileRange[3] > tileRange[3] ? tileRange[3] : featureTileRange[3]; y <= yy; y++) {
                    let tileKey = "" + [x, y];
                    let tileExtent = tiles[tileKey];
                    if (subTileCachedInstruct[tileKey] === undefined) {
                        subTileCachedInstruct[tileKey] = [];
                    }
                    subTileCachedInstruct[tileKey].push(instruct);
                }
            }

        }

        return [features, subTileCachedInstruct];
    }

    getCachedSource(tileCoord: string) {
        return this.sourceCache[tileCoord];
    }

    tryLoadTileFromCacheOrRegosterLoadEvent(tileCoord: any, originalZoom, cacheTileInfo: any) {
        let hasRequested = true;
        let tileCoordKey = tileCoord.join(",") + "," + originalZoom;

        if (this.lruCache.containsKey(tileCoordKey)) {
            let oTile = this.lruCache.get(tileCoordKey);
            this.cachedTileCallback(oTile, [cacheTileInfo]);
        }
        else {
            if (this.registeredLoadEvents[tileCoordKey] === undefined) {
                this.registeredLoadEvents[tileCoordKey] = [];
                hasRequested = false;
            }

            this.registeredLoadEvents[tileCoordKey].push(cacheTileInfo);
        }
        return hasRequested;
    }

    addSourceToCache(source: ArrayBuffer, zoom: number, options: any) {
        if (this.sourceCache[options.tileCoord] === undefined) {
            this.sourceCache[options.tileCoord] = source;
        }

        let instructsTree = this.readFeaturesAndCreateInstructTrees(source, zoom, options);

        let instructs = this.getInstructs(instructsTree);

        let subTileInstructCaches = this.createSubTileInstructCaches(instructs, options);

        let sourceProject = this.readProjection(source);
        let tileCoordKey = options.tileCoord.join(",") + "," + zoom;

        let lastExtent = this.getLastExtent();

        let oTile = { subTileInstructCaches: subTileInstructCaches, sourceProject: sourceProject, lastExtent: lastExtent };
        this.lruCache.set(tileCoordKey, oTile);

        let cachedTileInfo = this.registeredLoadEvents[tileCoordKey];
        delete this.registeredLoadEvents[tileCoordKey];

        this.cachedTileCallback(oTile, cachedTileInfo);
    }

    readFeaturesAndCreateInstructTrees(source: ArrayBuffer, zoom: number, options: any) {
        let pbf = new (<any>ol).ext.PBF((source));
        let pbfLayers = pbf.readFields((<any>ol).format.MVT.pbfReaders_.layers, {});
        let features = [];
        let pbfLayer;

        let zoomMatchedGeoStylesGroupByLayerId = this.styleJsonCache.geoStyleGroupByZoom[zoom];
        if (!zoomMatchedGeoStylesGroupByLayerId) {
            return features;
        }

        let pbfLayerNamesWithGeoStyle = [];
        for (let pbfLayerName in zoomMatchedGeoStylesGroupByLayerId) {
            pbfLayerNamesWithGeoStyle.push(pbfLayerName);
        }

        let instructsCache = [];

        for (let name in pbfLayers) {

            if (this.layers_ && this.layers_.indexOf(name) === -1) {
                continue;
            }
            if (pbfLayerNamesWithGeoStyle.indexOf(name) === -1) {
                continue;
            }

            pbfLayer = pbfLayers[name];
            options["extent"] = pbfLayer.extent;

            let cacheTrees = zoomMatchedGeoStylesGroupByLayerId[name];

            if (cacheTrees && cacheTrees.length > 0) {
                this.replaceFiltersToIndexOfPbfLayer(cacheTrees, pbfLayer);

                for (let i = 0; i < pbfLayer.length; i++) {
                    let rawFeature = (<any>ol.format.MVT).readRawFeature_(pbf, pbfLayer, i);
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

                        let selectNode = function (node) {
                            matchedNode = node.data;
                        };
                        cacheTree.traverseNode(checkNodeMatched, selectNode);

                        if (matchedNode) {
                            if (feature === undefined) {
                                feature = this.createFeature_(pbf, rawFeature);
                                if (this.minimalist) {
                                    feature.properties_ = {};
                                }
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
                            instructsCache[treeIndex][zindex].push([feature, matchedNode]);

                            if (this.minimalist) {
                                if (matchedNode.geoStyle && (matchedNode.geoStyle.constructor.name === "GeoTextStyle" || matchedNode.geoStyle.constructor.name === "GeoShieldStyle")) {
                                    feature.properties_[matchedNode.geoStyle.name] = rawFeature.properties[matchedNode.geoStyle.name];
                                }
                                if (matchedNode.childrenGeoStyles && matchedNode.childrenGeoStyles.length > 0) {
                                    for (let i = 0; i < matchedNode.childrenGeoStyles.length; i++) {
                                        feature.properties_[matchedNode.childrenGeoStyles[i].name] = rawFeature.properties[matchedNode.childrenGeoStyles[i].name];
                                    }
                                }
                            }

                            feature.extent_ = undefined;
                        }
                    }
                }
            }
            this.extent_ = pbfLayer ? [0, 0, pbfLayer.extent, pbfLayer.extent] : null;
        }
        return instructsCache;
    }

    getInstructs(instructsTree) {
        let instructs = [];
        // the tress index means the index of SyleId.
        for (let i = 0; i < instructsTree.length; i++) {
            let instructsInOneTree = instructsTree[i];

            if (instructsInOneTree) {
                for (let j = instructsInOneTree.min, jj = instructsInOneTree.max; j <= jj; j++) {
                    let instructsInOneZIndex = instructsInOneTree[j];
                    if (instructsInOneZIndex) {
                        let childrenInstructs = [];
                        for (let h = 0; h < instructsInOneZIndex.length; h++) {
                            let instruct = instructsInOneZIndex[h];
                            instruct[0].styleId = instruct[0].styleId ? instruct[0].styleId : {}

                            if (instruct[1].geoStyle) {
                                instruct[0].styleId[instruct[1].geoStyle.id] = 0;
                                instructs.push([instruct[0], instruct[1].geoStyle, i]);
                            }

                            if (instruct[1].childrenGeoStyles) {
                                for (let k = 0; k < instruct[1].childrenGeoStyles.length; k++) {
                                    instruct[0].styleId[instruct[1].childrenGeoStyles[k].id] = 1;
                                    childrenInstructs.push([instruct[0], instruct[1].childrenGeoStyles[k], i]);
                                }
                            }
                        }
                        Array.prototype.push.apply(instructs, childrenInstructs);
                    }
                }
            }
        }
        return instructs;
    }

    createSubTileInstructCaches(instructs, options) {
        let subTileCachedInstruct = {};

        let offsetZ = options.originalCoord[0] - options.tileCoord[0];
        let tileSize = options.extent / Math.pow(2, offsetZ);

        let tileRange = this.getTileRange(options.tileCoord, options.originalCoord[0]);
        let tiles = {};
        for (let x = tileRange[0]; x <= tileRange[2]; x++) {
            let minX = (x - tileRange[0]) * tileSize;
            let maxX = (x - tileRange[0] + 1) * tileSize;
            for (let y = tileRange[3]; y >= tileRange[1]; y--) {
                let minY = (tileRange[3] - y) * tileSize;
                let maxY = (tileRange[3] - y + 1) * tileSize;
                tiles["" + [x, y]] = [minX, minY, maxX, maxY];
            }
        }

        for (let i = 0; i < instructs.length; i++) {
            let instruct = instructs[i];
            let featureExtent = instruct[0].getGeometry().getExtent();
            let featureTileRange = this.getFeatureTileRange(featureExtent, options.extent, tileSize, options.tileCoord, offsetZ);
            for (let x = tileRange[0] > featureTileRange[0] ? tileRange[0] : featureTileRange[0], xx = featureTileRange[2] > tileRange[2] ? tileRange[2] : featureTileRange[2]; x <= xx; x++) {
                for (let y = tileRange[1] > featureTileRange[1] ? tileRange[1] : featureTileRange[1], yy = featureTileRange[3] > tileRange[3] ? tileRange[3] : featureTileRange[3]; y <= yy; y++) {
                    let tileKey = "" + [x, y];
                    let tileExtent = tiles[tileKey];
                    if (subTileCachedInstruct[tileKey] === undefined) {
                        subTileCachedInstruct[tileKey] = [];
                    }
                    subTileCachedInstruct[tileKey].push(instruct);
                }
            }
        }
        return subTileCachedInstruct;
    }

    cachedTileCallback(oTile, cacheTileInfos) {

        for (let i = 0; i < cacheTileInfos.length; i++) {
            let cacheTileInfo = cacheTileInfos[i];
            let tileKey = "" + cacheTileInfo.tile.tileCoord[1] + "," + cacheTileInfo.tile.tileCoord[2];

            cacheTileInfo.callback(cacheTileInfo.tile, cacheTileInfo.successFunction, [], oTile.subTileInstructCaches[tileKey], oTile.sourceProject, oTile.lastExtent);
        }
    }

    getTileRange(tileCoord, zoom) {
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

    getFeatureTileRange(featureExtent, extent, tileSize, requestTileCoord, offsetZ) {

        let minX = requestTileCoord[1] * Math.pow(2, offsetZ) + Math.floor(featureExtent[0] / tileSize);
        let maxX = requestTileCoord[1] * Math.pow(2, offsetZ) + Math.floor(featureExtent[2] / tileSize);
        let minY = requestTileCoord[2] * Math.pow(2, offsetZ) + Math.floor((extent - featureExtent[3]) / tileSize);
        let maxY = requestTileCoord[2] * Math.pow(2, offsetZ) + Math.floor((extent - featureExtent[1]) / tileSize);

        return [minX, minY, maxX, maxY];
    }

    getExtent(originalCoord, tilecoord, extent) {
        let ox = originalCoord[1];
        let x = tilecoord[1];
        let xPath = [];
        while (ox !== x) {
            let remainder = ox % 2;
            xPath.push(remainder);
            ox = Math.floor(ox / 2);
        }
        let newExtent = extent;
        let offsetX = 0;
        for (let i = xPath.length - 1; i >= 0; i--) {
            newExtent = newExtent / 2;
            if (xPath[i] === 1) {
                offsetX += newExtent;
            }
        }

        let oy = originalCoord[2];
        let y = tilecoord[2];
        let yPath = [];
        while (oy !== y) {
            let remainder = oy % 2;
            yPath.push(remainder);
            oy = Math.floor(oy / 2);
        }
        newExtent = extent;
        let offsetY = 0;
        for (let i = yPath.length - 1; i >= 0; i--) {
            newExtent = newExtent / 2;
            if (yPath[i] === 0) {
                offsetY += newExtent;
            }
        }
        // TODO: add the buffer
        return [offsetX, offsetY, offsetX + newExtent, offsetY + newExtent];
    }

    replaceFiltersToIndexOfPbfLayer(cacheTrees, pbfLayer) {
        for (let i = 0, ii = cacheTrees.length; i < ii; i++) {
            let cacheTree = cacheTrees[i];
            this.replaceCacheItemFiltersToIndexOfPbfLayer(cacheTree.root, pbfLayer);
        }
    }

    replaceCacheItemFiltersToIndexOfPbfLayer(node, pbfLayer) {
        let data = node.data;

        for (let i = 0; i < data.filterGroup.length; i++) {
            let filters = data.filterGroup[i];
            let geoFilter;
            for (let j = 0; j < filters.length; j++) {
                geoFilter = filters[j];
                geoFilter.replaceVaulesToPbfIndex(pbfLayer);
            }
        }


        if (node.children) {
            for (let i = 0, ii = node.children.length; i < ii; i++) {
                this.replaceCacheItemFiltersToIndexOfPbfLayer(node.children[i], pbfLayer);
            }
        }
    }



    readFeaturesAndCreateInstructs(source: ArrayBuffer, zoom: number, options: any) {
        let pbf = new (<any>ol).ext.PBF((source));
        let pbfLayers = pbf.readFields((<any>ol).format.MVT.pbfReaders_.layers, {});
        let features = [];
        let pbfLayer;

        let zoomMatchedGeoStylesGroupByLayerId = this.styleJsonCache.geoStyleGroupByZoom[zoom];
        if (!zoomMatchedGeoStylesGroupByLayerId) {
            return features;
        }

        let pbfLayerNamesWithGeoStyle = [];
        for (let pbfLayerName in zoomMatchedGeoStylesGroupByLayerId) {
            pbfLayerNamesWithGeoStyle.push(pbfLayerName);
        }

        let instructsCache = [];

        for (let name in pbfLayers) {

            if (this.layers_ && this.layers_.indexOf(name) === -1) {
                continue;
            }
            if (pbfLayerNamesWithGeoStyle.indexOf(name) === -1) {
                continue;
            }

            pbfLayer = pbfLayers[name];

            let cacheTrees = zoomMatchedGeoStylesGroupByLayerId[name];

            if (cacheTrees && cacheTrees.length > 0) {
                this.replaceFiltersToIndexOfPbfLayer(cacheTrees, pbfLayer);

                for (let i = 0; i < pbfLayer.length; i++) {
                    let rawFeature = (<any>ol.format.MVT).readRawFeature_(pbf, pbfLayer, i);
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

                        let selectNode = function (node) {
                            matchedNode = node.data;
                        };
                        cacheTree.traverseNode(checkNodeMatched, selectNode);

                        if (matchedNode) {
                            if (feature === undefined) {
                                feature = this.createFeature_(pbf, rawFeature);
                                if (this.minimalist) {
                                    feature.properties_ = {};
                                }
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
                            instructsCache[treeIndex][zindex].push([feature, matchedNode]);
                            if (this.minimalist) {
                                if (matchedNode.geoStyle && matchedNode.geoStyle.constructor.name === "GeoTextStyle") {
                                    feature.properties_[matchedNode.geoStyle.name] = rawFeature.properties[matchedNode.geoStyle.name];
                                }
                                if (matchedNode.childrenGeoStyles && matchedNode.childrenGeoStyles.length > 0) {
                                    for (let i = 0; i < matchedNode.childrenGeoStyles.length; i++) {
                                        feature.properties_[matchedNode.childrenGeoStyles[i].name] = rawFeature.properties[matchedNode.childrenGeoStyles[i].name];
                                    }
                                }
                            }

                            feature.extent_ = undefined;
                        }
                    }
                }
            }
            this.extent_ = pbfLayer ? [0, 0, pbfLayer.extent, pbfLayer.extent] : null;
        }


        let instructs = [];
        // the tress index means the index of SyleId.
        for (let i = 0; i < instructsCache.length; i++) {
            let instructsInOneTree = instructsCache[i];

            if (instructsInOneTree) {
                for (let j = instructsInOneTree.min, jj = instructsInOneTree.max; j <= jj; j++) {
                    let instructsInOneZIndex = instructsInOneTree[j];
                    if (instructsInOneZIndex) {
                        let childrenInstructs = [];
                        for (let h = 0; h < instructsInOneZIndex.length; h++) {
                            let instruct = instructsInOneZIndex[h];
                            instruct[0].styleId = instruct[0].styleId ? instruct[0].styleId : {}
                            if (instruct[1].geoStyle) {
                                instruct[0].styleId[instruct[1].geoStyle.id] = 0;
                                instructs.push([instruct[0], instruct[1].geoStyle, i]);
                            }

                            if (instruct[1].childrenGeoStyles) {
                                for (let k = 0; k < instruct[1].childrenGeoStyles.length; k++) {
                                    instruct[0].styleId[instruct[1].childrenGeoStyles[k].id] = 1;
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

    static readRawFeature_(pbf, layer, i) {
        pbf.pos = layer.features[i];
        let end = pbf.readVarint() + pbf.pos;

        let feature = {
            layer: layer,
            type: 0,
            properties: {},
            propertiesIndex: {}
        };
        pbf.readFields((<any>ol).format.MVT.pbfReaders_.featureColumnValue, feature, end);

        return feature;
    }

    static featureColumnValue(tag: any, feature: any, pbf: any) {
        if (tag === 1) {
            feature.id = pbf.readVarint();
        } else if (tag === 2) {
            let end = pbf.readVarint() + pbf.pos;
            while (pbf.pos < end) {
                let key = pbf.readVarint();
                let value = pbf.readVarint();
                feature.propertiesIndex[key] = value;
                key = feature.layer.keys[key];
                value = feature.layer.values[value];
                feature.properties[key] = value;
            }
        } else if (tag === 3) {
            feature.type = pbf.readVarint();
        } else if (tag === 4) {
            feature.geometry = pbf.pos;
        }
    }
}
(<any>ol).format.MVT.readRawFeature_ = GeoMVTFormat.readRawFeature_;
(<any>ol).format.MVT.pbfReaders_["featureColumnValue"] = GeoMVTFormat.featureColumnValue;

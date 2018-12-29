import VectorTile from './VectorTile';
import { modulo } from '../ol/math';
import { assert } from '../ol/asserts.js';
import FormatType from '../ol/format/FormatType';
import TileState from '../ol/TileState.js';
import VectorImageTile, { defaultLoadFunction } from '../VectorImageTile';

import { wrapX } from '../ol/tileGrid';
import { hash, getKeyZXY, withinExtentAndZ } from '../ol/tilecoord';
import LRUCache from '../ol/structs/LRUCache';

import { createTileGridForProjection } from "../geoTileGrid";

class GeoVectorTileSource extends VectorTile {
    constructor(opt_optins) {
        const options = opt_optins ? opt_optins : {};
        options.tileLoadFunction = options.tileLoadFunction ? options.tileLoadFunction : defaultLoadFunction;
        super(options);
        this.maxDataZoom = options.maxDataZoom;
        this.apiKey = options.apiKey;

        if (options["tileUrlFunction"] === undefined) {
            this.setTileUrlFunction(this.getTileUrlFunction());
        }
        this.geoFormat = options.format;
        this.registerRequest = {};
        this.instructionsCache = {};
        this.features = new LRUCache(4);
        this.clientId = options.clientId;
        this.clientSecret = options.clientSecret;

        this.applyFeatures = new LRUCache(4);
        this.applyInstructionsCache = [];
        this.registerCreateReplayGroup = {};
    }

    setUrls(urls) {
        if (this.apiKey) {
            for (var i = 0; i < urls.length; i++) {
                let url = urls[i];
                if (url.indexOf('apiKey') === -1) {
                    if (url.indexOf('?') > 0) {
                        urls[i] = url + '&apiKey=' + this.apiKey;
                    }
                    else {
                        urls[i] = url + '?apiKey=' + this.apiKey;
                    }
                }
            }
        }
        this.urls = urls;
        var key = urls.join('\n');
        if (this.generateTileUrlFunction_) {
            this.setTileUrlFunction(this.getTileUrlFunction(), key);
        } else {
            this.setKey(key);
        }
    }

    // Add "isGeoVectorTile" for VectorTImageTile
    getTile(z, x, y, pixelRatio, projection) {
        const tileCoordKey = getKeyZXY(z, x, y);
        if (this.tileCache.containsKey(tileCoordKey)) {
            return (
            /** @type {!import("../Tile.js").default} */ (this.tileCache.get(tileCoordKey))
            );
        } else {
            const tileCoord = [z, x, y];

            const urlTileCoord = this.getTileCoordForTileUrlFunction(
                tileCoord, projection);
            const tile = new VectorImageTile(
                tileCoord,
                urlTileCoord !== null ? TileState.IDLE : TileState.EMPTY,
                this.getRevision(),
                this.format_, this.tileLoadFunction, urlTileCoord, this.tileUrlFunction,
                this.tileGrid, this.getTileGridForProjection(projection),
                this.sourceTiles_, pixelRatio, projection, this.tileClass,
                this.handleTileChange.bind(this), tileCoord[0]);
            tile.isGeoVectorTile = true;

            this.tileCache.set(tileCoordKey, tile);
            return tile;
        }
    }

    getGeoFormat() {
        return this.geoFormat;
    }

    getTileUrlFunction() {
        let zRegEx = /\{z\}/g;
        let xRegEx = /\{x\}/g;
        let yRegEx = /\{y\}/g;
        let dashYRegEx = /\{-y\}/g;
        let urls = this.urls;
        let tileGrid = this.tileGrid;
        let maxDataZoom = this.maxDataZoom;

        return function (tileCoord) {
            if (!tileCoord) {
                return undefined;
            } else {
                let requestCoord = [tileCoord[0], tileCoord[1], tileCoord[2]];
                if (maxDataZoom && requestCoord[0] > maxDataZoom) {
                    while (requestCoord[0] !== maxDataZoom) {
                        requestCoord[0] -= 1;
                        requestCoord[1] = Math.floor(requestCoord[1] / 2);
                        requestCoord[2] = Math.floor(requestCoord[2] / 2);
                    }
                }
                let h = hash(tileCoord);
                let index = modulo(h, urls.length);
                let template = urls[index];
                var requestUrl = template.replace(zRegEx, requestCoord[0].toString())
                    .replace(xRegEx, requestCoord[1].toString())
                    .replace(yRegEx, function () {
                        let y = -requestCoord[2] - 1;
                        return y.toString();
                    })
                    .replace(dashYRegEx, function () {
                        let z = requestCoord[0];
                        let range = tileGrid.getFullTileRange(z);
                        assert(range, 55); // The {-y} placeholder requires a tile grid with extent
                        let y = range.getHeight() + requestCoord[2];
                        return y.toString();
                    });
                return [requestUrl, requestCoord];
            }
        };
    }

    registerTileLoadEvent(tile, successFunction, failureFunction) {
        var hasRequested = true;
        let requestKey = tile.requestCoord.join(",") + "," + tile.tileCoord[0];
        let loadEventInfo = {
            tile: tile,
            successFunction: successFunction,
            failureFunction: failureFunction,
        }


        if (this.registerRequest[requestKey] === undefined) {
            this.registerRequest[requestKey] = [];
            hasRequested = false;
        }

        this.registerRequest[requestKey].push(loadEventInfo);
        return hasRequested;
    }
    getTileLoadEvent(requestKey) {

        let tileLoadEventInfos = this.registerRequest[requestKey]
        delete this.registerRequest[requestKey];

        return tileLoadEventInfos;
    }
    saveTileInstructions(cacheKey, features, homologousTilesInstructions) {
        this.instructionsCache[cacheKey] = homologousTilesInstructions;

        if (this.features.containsKey(cacheKey)) {
            this.features.replace(cacheKey, features);
        }
        else {
            this.features.set(cacheKey, features);
            while (this.features.canExpireCache()) {
                const lastKey = this.features.peekLastKey();
                this.features.remove(lastKey);
                delete this.instructionsCache[lastKey]
            }
        }
    }
    getTileInstrictions(cacheKey, tileCoord) {
        let featuresAndInstructs = undefined;
        if (this.features.containsKey(cacheKey)) {
            if (this.instructionsCache[cacheKey]) {
                featuresAndInstructs = [this.features.get(cacheKey), this.instructionsCache[cacheKey][tileCoord] === undefined ? [] : this.instructionsCache[cacheKey][tileCoord]];
            }
        }

        return featuresAndInstructs;
    }

    registerCreateReplayGroupEvent(sourceTileCoordAndStyleZ, createReplayGroupFunction) {
        let hasCreated = true;
        if (this.registerCreateReplayGroup[sourceTileCoordAndStyleZ] === undefined) {
            this.registerCreateReplayGroup[sourceTileCoordAndStyleZ] = [];
            hasCreated = false;
        }

        this.registerCreateReplayGroup[sourceTileCoordAndStyleZ].push(createReplayGroupFunction);
        return hasCreated;
    }
    getCreateReplayGroupEvent(sourceTileCoordAndStyleZ) {
        let createReplayGroupFunctions = this.registerCreateReplayGroup[sourceTileCoordAndStyleZ]
        delete this.registerCreateReplayGroup[sourceTileCoordAndStyleZ];

        return createReplayGroupFunctions;
    }

    saveApplyTileInstructions(cacheKey, features, homologousTilesInstructions) {
        this.applyInstructionsCache[cacheKey] = homologousTilesInstructions;

        if (this.applyFeatures.containsKey(cacheKey)) {
            this.applyFeatures.replace(cacheKey, features);
        }
        else {
            this.applyFeatures.set(cacheKey, features);
        }
    }

    setWorkerManager(workerManager) {
        this.workerManager = workerManager;
    }
    getWorkerManager(workerManager) {
        return this.workerManager;
    }

    getIDAndSecret(self) {
        let xhr = new XMLHttpRequest();
        let url = 'https://gisserver.thinkgeo.com/api/v1/auth/token';
        let content = 'ApiKey=' + self.clientId + '&ApiSecret=' + self.clientSecret;

        xhr.open("POST", url, false);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function (event) {
            if (!xhr.status || xhr.status >= 200 && xhr.status < 300) {
                var token = JSON.parse(xhr.responseText).data.access_token;
                self.token = token;
            }
        }.bind(this);
        xhr.onerror = function () {
        }.bind(this);
        xhr.send(content);
    }

    getTileGridForProjection(projection) {
        const code = projection.getCode();
        let tileGrid = this.tileGrids_[code];
        if (!tileGrid) {
            // A tile grid that matches the tile size of the source tile grid is more
            // likely to have 1:1 relationships between source tiles and rendered tiles.
            const sourceTileGrid = this.tileGrid;
            tileGrid = this.tileGrids_[code] = createTileGridForProjection(projection, undefined,
                sourceTileGrid ? sourceTileGrid.getTileSize(sourceTileGrid.getMinZoom()) : undefined);
        }
        return tileGrid;
    }

    forEachLoadedTile(projection, z, tileRange, callback) {
        const tileCache = this.getTileCacheForProjection(projection);
        if (!tileCache) {
            return false;
        }
        let covered = true;
        let tile, tileCoordKey, loaded;
        for (let x = tileRange.minX; x <= tileRange.maxX; ++x) {
            for (let y = tileRange.minY; y <= tileRange.maxY; ++y) {
                tileCoordKey = getKeyZXY(z, x, y);
                loaded = false;
                if (tileCache.containsKey(tileCoordKey)) {
                    tile = /** @type {!import("../Tile.js").default} */ (tileCache.get(tileCoordKey));
                    // MapSuite : add replay created checking
                    loaded = tile.getState() === TileState.LOADED && tile.replayCreated;
                    if (!loaded) {
                        tile = tile.getInterimTile();
                        loaded = tile.getState() === TileState.LOADED && tile.replayCreated;
                    }
                    if (loaded) {
                        loaded = (callback(tile) !== false);
                    }
                }
                if (!loaded) {
                    covered = false;
                }
            }
        }
        return covered;
    }

}

export default GeoVectorTileSource;
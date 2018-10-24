import VectorTile from './VectorTile';
import { hash, getKeyZXY } from 'ol/tileCoord';
import { modulo } from 'ol/math';
import { assert } from 'ol/asserts.js';
import FormatType from 'ol/format/FormatType';
import TileState from 'ol/TileState.js';
import VectorImageTile, { defaultLoadFunction } from '../VectorImageTile';

class GeoVectorTileSource extends VectorTile {
    constructor(opt_optins) {
        const options = opt_optins ? opt_optins : {};
        options.tileLoadFunction = options.tileLoadFunction ? options.tileLoadFunction : defaultLoadFunction;
        super(options);
        // this.maxDataZoom = options.maxDataZoom;
        // if (options["tileUrlFunction"] === undefined) {
        //     this.setTileUrlFunction(this.getGeoTileUrlFunction());
        // }
        // this.clientId = options.clientId;
        // this.clientSecret = options.clientSecret;
        this.geoFormat = options.format;
        // this.tileLoadFunction = this.vectorTileLoadFunction.bind(this);
        // this.isMultithread = options["multithread"] === undefined ? true : options["multithread"];
    }

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

            this.tileCache.set(tileCoordKey, tile);
            return tile;
        }
    }

    getGeoFormat() {
        return this.geoFormat;
    }



    // getGeoTileUrlFunction() {
    //     let zRegEx = /\{z\}/g;
    //     let xRegEx = /\{x\}/g;
    //     let yRegEx = /\{y\}/g;
    //     let dashYRegEx = /\{-y\}/g;
    //     let urls = this.urls;
    //     let tileGrid = this.tileGrid;
    //     let maxDataZoom = this.maxDataZoom;

    //     return function (tileCoord) {
    //         if (!tileCoord) {
    //             return undefined;
    //         } else {
    //             let requestCoord = [tileCoord[0], tileCoord[1], tileCoord[2]];
    //             if (maxDataZoom && requestCoord[0] > maxDataZoom) {
    //                 while (requestCoord[0] !== maxDataZoom) {
    //                     requestCoord[0] -= 1;
    //                     requestCoord[1] = Math.floor(requestCoord[1] / 2);
    //                     requestCoord[2] = Math.floor(requestCoord[2] / 2);
    //                 }
    //             }
    //             let h = hash(tileCoord);
    //             let index = modulo(h, urls.length);
    //             let template = urls[index];
    //             return template.replace(zRegEx, requestCoord[0].toString())
    //                 .replace(xRegEx, requestCoord[1].toString())
    //                 .replace(yRegEx, function () {
    //                     let y = -requestCoord[2] - 1;
    //                     return y.toString();
    //                 })
    //                 .replace(dashYRegEx, function () {
    //                     let z = requestCoord[0];
    //                     let range = tileGrid.getFullTileRange(z);
    //                     assert(range, 55); // The {-y} placeholder requires a tile grid with extent
    //                     let y = range.getHeight() + requestCoord[2];
    //                     return y.toString();
    //                 });
    //         }
    //     };
    // }

    // vectorTileLoadFunction(tile, url) {
    //     let loader = this.loadFeaturesXhr(
    //         url,
    //         tile.getFormat(),
    //         tile.onLoad.bind(tile),
    //         tile.onError.bind(tile),
    //         this
    //     );
    //     tile.setLoader(loader);
    // }

    // getIDAndSecret(self) {
    //     let xhr = new XMLHttpRequest();
    //     let url = 'https://gisserver.thinkgeo.com/api/v1/auth/token';
    //     let content = 'ApiKey=' + self.clientId + '&ApiSecret=' + self.clientSecret;

    //     xhr.open("POST", url, false);
    //     xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    //     xhr.onload = function (event) {
    //         if (!xhr.status || xhr.status >= 200 && xhr.status < 300) {
    //             var token = JSON.parse(xhr.responseText).data.access_token;
    //             self.token = token;
    //         }
    //     }.bind(this);
    //     xhr.onerror = function () {
    //     }.bind(this);
    //     xhr.send(content);
    // }

    // loadFeaturesXhr(url, format, success, failure, self) {
    //     return (
    //         function (extent, resolution, projection) {
    //             var sourceTile = this;
    //             let maxDataZoom = format.maxDataZoom;
    //             let requestTileCoord = [this.tileCoord[0], this.tileCoord[1], this.tileCoord[2]];
    //             if (maxDataZoom && requestTileCoord[0] > maxDataZoom) {
    //                 while (requestTileCoord[0] !== maxDataZoom) {
    //                     requestTileCoord[0] -= 1;
    //                     requestTileCoord[1] = Math.floor(requestTileCoord[1] / 2);
    //                     requestTileCoord[2] = Math.floor(requestTileCoord[2] / 2);
    //                 }
    //             }
    //             this.requestTileCoord = requestTileCoord;

    //             let tileGrid = self.getTileGrid();
    //             let tileExtent = tileGrid.getTileCoordExtent(sourceTile.tileCoord);
    //             let tileResolution = tileGrid.getResolution(sourceTile.tileCoord[0]);

    //             let callback = function (tile, callbackFunction, sourceProjection, lastExtent) {
    //                 callbackFunction.call(tile, sourceProjection, lastExtent);
    //             };

    //             let hasRequested = false;

    //             hasRequested = format.registerTileLoadEvent(this, success, failure, callback);

    //             if (!hasRequested) {
    //                 // Client ID and Client Secret   
    //                 if (url.indexOf('apiKey') === -1 && self.clientId && self.clientSecret && !self.token) {
    //                     self.getIDAndSecret(self);
    //                 }
    //                 let tileCoord = this.tileCoord;
    //                 let tile = this;
    //                 let xhr = new XMLHttpRequest();
    //                 xhr.open("GET",
    //                     typeof url === "function" ? (url)(extent, resolution, projection) : url,
    //                     true);

    //                 if (self.token) {
    //                     xhr.setRequestHeader('Authorization', 'Bearer ' + self.token);
    //                 }

    //                 if (format.getType() === FormatType.ARRAY_BUFFER) {
    //                     xhr.responseType = "arraybuffer";
    //                 }

    //                 xhr.onload = function (event) {
    //                     if (!xhr.status || xhr.status >= 200 && xhr.status < 300) {
    //                         let type = format.getType();
    //                         /** @type {Document | Node | Object | string | undefined} */
    //                         let source;
    //                         if (type === FormatType.ARRAY_BUFFER) {
    //                             source = /** @type {ArrayBuffer} */ (xhr.response);
    //                         }

    //                         if (source) {
    //                             // ReadFeature

    //                             var data = format.readFeaturesAndCreateInstructsNew(source, requestTileCoord, tileCoord);

    //                             // Call Load Event
    //                             let requestKey = tile.requestTileCoord.join(",") + "," + tile.tileCoord[0];
    //                             let tileLoadEventInfos = format.registeredLoadEvents[requestKey];
    //                             delete format.registeredLoadEvents[requestKey];
    //                             for (let i = 0; i < tileLoadEventInfos.length; i++) {
    //                                 let loadEventInfo = tileLoadEventInfos[i];

    //                                 let tileKey = "" + loadEventInfo.tile.tileCoord[1] + "," + loadEventInfo.tile.tileCoord[2];
    //                                 loadEventInfo.tile.featuresAndInstructs = { features: data[0], instructs: data[1][tileKey] }
    //                                 loadEventInfo.callback(loadEventInfo.tile, loadEventInfo.successFunction, format.readProjection());
    //                             }

    //                         } else {
    //                             failure.call(this);
    //                         }
    //                     } else {
    //                         failure.call(this);
    //                     }
    //                 }.bind(this);
    //                 xhr.onerror = function () {
    //                     failure.call(this);
    //                 }.bind(this);
    //                 this["xhr"] = xhr;
    //                 xhr.send();
    //             }
    //         }
    //     );
    // }

    // forEachLoadedTile(projection, z, tileRange, callback, layer) {
    //     let tileCache = this.getTileCacheForProjection(projection);
    //     if (!tileCache) {
    //         return false;
    //     }

    //     let covered = true;
    //     let tile, tileCoordKey, loaded;
    //     for (let x = tileRange.minX; x <= tileRange.maxX; ++x) {
    //         for (let y = tileRange.minY; y <= tileRange.maxY; ++y) {
    //             tileCoordKey = getKeyZXY(z, x, y);
    //             loaded = false;
    //             if (tileCache.containsKey(tileCoordKey)) {
    //                 tile = /** @type {!ol.Tile} */ (tileCache.get(tileCoordKey));
    //                 loaded = tile.getState() === (ol).TileState.LOADED;
    //                 if (loaded) {
    //                     if (layer) {
    //                         let replayState = tile.getReplayState(layer);
    //                         loaded = replayState.renderedTileLoaded;
    //                     }
    //                 }
    //                 if (loaded) {
    //                     loaded = (callback(tile) !== false);
    //                 }
    //             }
    //             if (!loaded) {
    //                 covered = false;
    //             }
    //         }
    //     }
    //     return covered;
    // }
}

export default GeoVectorTileSource;
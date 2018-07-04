import { WorkerManager } from "../worker/workerManager";

export class GeoVectorTileSource extends (ol.source.VectorTile as { new(p: olx.source.VectorTileOptions): any; }) {
    geoFormat: any;
    isMultithread: boolean;
    constructor(options) {
        super(options);
        this.maxDataZoom = options.maxDataZoom;
        this.clientId = options.clientId;
        this.clientSecret = options.clientSecret;
        this.geoFormat = options.format;
        this.tileLoadFunction = this.vectorTileLoadFunction.bind(this);
        this.isMultithread = options["multithread"] === undefined ? true : options["multithread"];
    }

    getGeoFormat(): any {
        return this.geoFormat;
    }

    public getGeoTileUrlFunction() {
        let zRegEx = /\{z\}/g;
        let xRegEx = /\{x\}/g;
        let yRegEx = /\{y\}/g;
        let dashYRegEx = /\{-y\}/g;
        let template = this.urls[0];
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
                return template.replace(zRegEx, requestCoord[0].toString())
                    .replace(xRegEx, requestCoord[1].toString())
                    .replace(yRegEx, function () {
                        let y = -requestCoord[2] - 1;
                        return y.toString();
                    })
                    .replace(dashYRegEx, function () {
                        let z = requestCoord[0];
                        let range = tileGrid.getFullTileRange(z);
                        (<any>ol).asserts.assert(range, 55); // The {-y} placeholder requires a tile grid with extent
                        let y = range.getHeight() + requestCoord[2];
                        return y.toString();
                    });
            }
        };
    }

    public vectorTileLoadFunction(tile: ol.VectorTile, urls: string[]) {
        let loader = this.loadFeaturesXhr(
            urls,
            tile.getFormat(),
            (<any>tile).onLoad.bind(tile),
            (<any>tile).onError.bind(tile),
            this
        );
        tile.setLoader(loader);
    }

    public getIDAndSecret(self) {
        let xhr = new XMLHttpRequest();
        let url = 'https://gisserverbeta.thinkgeo.com/api/v1/auth/token';
        let content = 'ApiKey=' + self.clientId + '&ApiSecret=' + self.clientSecret;

        xhr.open("POST", url, false);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function (event: any) {
            if (!xhr.status || xhr.status >= 200 && xhr.status < 300) {
                var token = JSON.parse(<any>xhr.responseText).data.access_token;
                self.token = token;
            }
        }.bind(this);
        xhr.onerror = function () {
        }.bind(this);
        xhr.send(content);
    }

    public loadFeaturesXhr(urls: string[] | string, format: any, success: any, failure: any, self: any) {

        return (
            function (extent: any, resolution: any, projection: any) {
                let maxDataZoom = format.dataMaxZoom;
                let requestTileCoord = [this.tileCoord[0], this.tileCoord[1], this.tileCoord[2]];
                if (maxDataZoom && requestTileCoord[0] > maxDataZoom) {
                    while (requestTileCoord[0] !== maxDataZoom) {
                        requestTileCoord[0] -= 1;
                        requestTileCoord[1] = Math.floor(requestTileCoord[1] / 2);
                        requestTileCoord[2] = Math.floor(requestTileCoord[2] / 2);
                    }
                }
                this.requestTileCoord = requestTileCoord;


                let callback = function (tile, successFunction, sourceProjection, lastExtent) {
                    successFunction.call(tile, sourceProjection, lastExtent);
                };

                let hasRequested = false;

                hasRequested = format.registerTileLoadEvent(this, success, callback);

                if (!hasRequested) {
                    const loader = url => {
                        // Client ID and Client Secret   
                        if (url.indexOf('apiKey') === -1 && self.clientId && self.clientSecret && !self.token) {
                            self.getIDAndSecret(self);
                        }

                        if (format.isMultithread && format.workerManager) {

                            let requestInfo = {
                                url: typeof url === "function" ? (<any>url)(extent, resolution, projection) : url,
                                type: format.getType(),
                                tileCoord: this.tileCoord,
                                requestCoord: requestTileCoord,
                                minimalist: format.minimalist,
                                dataMaxZoom: format.dataMaxZoom,
                                formatId: (<any>ol).getUid(format),
                                layerName: format.layerName,
                                token: self.token,
                            };

                            let loadedCallback = function (data, methodInfo) {
                                let requestKey = data.requestKey;
                                let tileLoadEventInfos = format.registeredLoadEvents[requestKey];
                                delete format.registeredLoadEvents[requestKey];
                                for (let i = 0; i < tileLoadEventInfos.length; i++) {
                                    let loadEventInfo = tileLoadEventInfos[i];
                                    loadEventInfo.tile.workerId = methodInfo.workerId; // Currently, we just one web worker for one layer.
                                    let tileKey = "" + loadEventInfo.tile.tileCoord[1] + "," + loadEventInfo.tile.tileCoord[2];

                                    loadEventInfo.callback(loadEventInfo.tile, loadEventInfo.successFunction, format.readProjection());
                                }
                            };

                            format.workerManager.postMessage(this.tileCoord + (<any>ol).getUid(loadedCallback), "request", requestInfo, loadedCallback, undefined);
                        }
                        else {

                            let tileCoord = this.tileCoord;
                            let tile = this;
                            let xhr = new XMLHttpRequest();
                            xhr.open("GET",
                                typeof url === "function" ? (<any>url)(extent, resolution, projection) : url,
                                true);

                            if (self.token) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + self.token);
                            }

                            if (format.getType() === (<any>ol).format.FormatType.ARRAY_BUFFER) {
                                xhr.responseType = "arraybuffer";
                            }

                            xhr.onload = function (event: any) {
                                if (!xhr.status || xhr.status >= 200 && xhr.status < 300) {
                                    let type = format.getType();
                                    /** @type {Document|Node|Object|string|undefined} */
                                    let source;
                                    if (type === (<any>ol).format.FormatType.JSON ||
                                        type === (<any>ol).format.FormatType.TEXT) {
                                        source = xhr.responseText;
                                    } else if (type === (<any>ol).format.FormatType.XML) {
                                        source = xhr.responseXML;
                                        if (!source) {
                                            source = (<any>ol).xml.parse(xhr.responseText);
                                        }
                                    } else if (type === (<any>ol).format.FormatType.ARRAY_BUFFER) {
                                        source = /** @type {ArrayBuffer} */ (xhr.response);
                                    }

                                    if (source) {
                                        // ReadFeature

                                        var data = format.readFeaturesAndCreateInstructsNew(source, requestTileCoord, tileCoord);

                                        // Call Load Event
                                        let requestKey = tile.requestTileCoord.join(",") + "," + tile.tileCoord[0];
                                        let tileLoadEventInfos = format.registeredLoadEvents[requestKey];
                                        delete format.registeredLoadEvents[requestKey];
                                        for (let i = 0; i < tileLoadEventInfos.length; i++) {
                                            let loadEventInfo = tileLoadEventInfos[i];

                                            let tileKey = "" + loadEventInfo.tile.tileCoord[1] + "," + loadEventInfo.tile.tileCoord[2];
                                            loadEventInfo.tile.featuresAndInstructs = { features: data[0], instructs: data[1][tileKey] }
                                            loadEventInfo.callback(loadEventInfo.tile, loadEventInfo.successFunction, format.readProjection());
                                        }

                                    } else {
                                        failure.call(this);
                                    }
                                } else {
                                    failure.call(this);
                                }
                            }.bind(this);
                            xhr.onerror = function () {
                                failure.call(this);
                            }.bind(this);
                            this["xhr"] = xhr;
                            format.source.dispatchEvent(new (<any>ol.VectorTile).Event("sendingTileRequest", xhr));
                            xhr.send();
                        }
                    }

                    if (Array.isArray(urls)) {
                        urls.forEach(loader)
                    } else if (typeof urls === 'string') {
                        loader(urls)
                    };
                }

                // let process = function (z, x, y, originalZoom) {
                //     if (z > format.dataMaxZoom) {
                //         format instanceof ol.format.MVT ? internalFailure.call(this) : failure.call(this);
                //     }
                //     else {
                //         let hasRequested = false;
                //         if (z === format.dataMaxZoom) {
                //             let callback = function (tile, successFunction, features, instructs, sourceProjection, lastExtent) {
                //                 let originalCoord = tile.tileCoord;
                //                 if (z) {
                //                     tile.tileCoord = [z, x, -y - 1];
                //                 }
                //                 successFunction.call(tile, [features, instructs], sourceProjection, lastExtent);
                //             };
                //             hasRequested = format.tryLoadTileFromCacheOrRegosterLoadEvent([z, x, -y - 1], originalZoom, { tile: this, successFunction: success, callback: callback });
                //             if (!hasRequested) {
                //                 let originalCoord = this.tileCoord;
                //                 let source = format.getCachedSource([z, x, -y - 1]);
                //                 if (source) {
                //                     format.addSourceToCache(source, originalZoom, { featureProjection: projection, originalCoord: originalCoord, tileCoord: [z, x, -y - 1] });
                //                     hasRequested = true;
                //                 }
                //             }
                //         }
                //         if (!hasRequested) {
                //             let isDataMaxZoom = z === format.dataMaxZoom;
                //             let xhr = new XMLHttpRequest();
                //             xhr.open("GET",
                //                 typeof url === "function" ? url(extent, resolution, projection) : url,
                //                 true);
                //             if (format.getType() === (<any>ol).format.FormatType.ARRAY_BUFFER) {
                //                 xhr.responseType = "arraybuffer";
                //             }

                //             xhr.onload = function (event: any) {
                //                 if (!xhr.status || xhr.status >= 200 && xhr.status < 300) {
                //                     let type = format.getType();
                //                     /** @type {Document|Node|Object|string|undefined} */
                //                     let source;
                //                     if (type === (<any>ol).format.FormatType.JSON ||
                //                         type === (<any>ol).format.FormatType.TEXT) {
                //                         source = xhr.responseText;
                //                     } else if (type === (<any>ol).format.FormatType.XML) {
                //                         source = xhr.responseXML;
                //                         if (!source) {
                //                             source = (<any>ol).xml.parse(xhr.responseText);
                //                         }
                //                     } else if (type === (<any>ol).format.FormatType.ARRAY_BUFFER) {
                //                         source = /** @type {ArrayBuffer} */ (xhr.response);
                //                     }
                //                     if (source) {
                //                         let originalCoord = this.tileCoord;
                //                         if (isDataMaxZoom) {
                //                             // success.call(this, format.readFeaturesAndCreateInstructs(source, originalZoom, { featureProjection: projection, originalCoord: originalCoord, tilecoord: this.tileCoord }), format.readProjection(source), format.getLastExtent());
                //                             format.addSourceToCache(source, originalZoom, { featureProjection: projection, originalCoord: originalCoord, tileCoord: [z, x, -y - 1] });
                //                         } else {

                //                             success.call(this, format.readFeaturesAndCreateInstructs(source, originalZoom, { featureProjection: projection, originalCoord: originalCoord, tilecoord: this.tileCoord }), format.readProjection(source), format.getLastExtent());
                //                         }
                //                     } else {
                //                         format instanceof ol.format.MVT ? internalFailure.call(this) : failure.call(this);
                //                     }
                //                 } else {
                //                     failure.call(this);
                //                 }
                //             }.bind(this);
                //             xhr.onerror = function () {
                //                 failure.call(this);
                //             }.bind(this);
                //             this["xhr"] = xhr;
                //             xhr.send();
                //         }
                //     }
                // };
                // let parts = url.substring(0, url.lastIndexOf(".")).split("/");
                // let y = +parts.pop();
                // let x = +parts.pop();
                // let z = +parts.pop();
                // let originalZ = z;
                // process.call(this, z, x, y, originalZ);
            }
        );
    }
}
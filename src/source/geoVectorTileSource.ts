
export class GeoVectorTileSource extends (ol.source.VectorTile as { new(p: olx.source.VectorTileOptions): any; }) {
    geoFormat: any;
    isMultithread: boolean;
    constructor(options) {
        super(options);
        this.maxDataZoom = options.maxDataZoom;
        if (options["tileUrlFunction"] === undefined) {
            this.setTileUrlFunction(this.getGeoTileUrlFunction());
        }
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
                let h = (<any>ol).tilecoord.hash(tileCoord);
                let index = (<any>ol).math.modulo(h, urls.length);
                let template = urls[index];
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
        let url = 'https://gisserver.thinkgeo.com/api/v1/auth/token';
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
                var _this = this;
                let maxDataZoom = format.maxDataZoom;
                let requestTileCoord = [this.tileCoord[0], this.tileCoord[1], this.tileCoord[2]];
                if (maxDataZoom && requestTileCoord[0] > maxDataZoom) {
                    while (requestTileCoord[0] !== maxDataZoom) {
                        requestTileCoord[0] -= 1;
                        requestTileCoord[1] = Math.floor(requestTileCoord[1] / 2);
                        requestTileCoord[2] = Math.floor(requestTileCoord[2] / 2);
                    }
                }
                this.requestTileCoord = requestTileCoord;


                let callback = function (tile, callbackFunction, sourceProjection, lastExtent) {
                    callbackFunction.call(tile, sourceProjection, lastExtent);
                };

                let hasRequested = false;

                hasRequested = format.registerTileLoadEvent(this, success, failure, callback);

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
                                maxDataZoom: format.maxDataZoom,
                                formatId: (<any>ol).getUid(format),
                                layerName: format.layerName,
                                token: self.token,
                                vectorTileDataCahceSize: format["vectorTileDataCahceSize"],
                                tileRange: _this.tileRange,
                                tileCoordWithSourceCoord: _this.tileCoordWithSourceCoord
                            };

                            let loadedCallback = function (data, methodInfo) {
                                let requestKey = data.requestKey;
                                let tileLoadEventInfos = format.registeredLoadEvents[requestKey];
                                delete format.registeredLoadEvents[requestKey];
                                for (let i = 0; i < tileLoadEventInfos.length; i++) {
                                    let loadEventInfo = tileLoadEventInfos[i];
                                    loadEventInfo.tile.workerId = methodInfo.workerId; // Currently, we just one web worker for one layer.
                                    // let tileKey = "" + loadEventInfo.tile.tileCoord[1] + "," + loadEventInfo.tile.tileCoord[2];
                                    // FIXME Eric
                                    if(data.status === "cancel"){
                                        loadEventInfo.tile.setState((<any>ol).TileState.CANCEL);                                      
                                    }else if (data.status === "succeed") {
                                        loadEventInfo.callback(loadEventInfo.tile, loadEventInfo.successFunction, format.readProjection());
                                    }
                                    else {
                                        loadEventInfo.callback(loadEventInfo.tile, loadEventInfo.failureFunction, format.readProjection());
                                    }
                                }                                
                            }

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
            }
        );
    }
}
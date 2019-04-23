
class GeoVectorSource extends ol.source.Vector {
    constructor(opt_options) {
        const options = opt_options || {};
        super(options);

        //  Custom xhr function
        if (options.loader !== undefined) {
            this.loader_ = options.loader;
        } else if (this.url_ !== undefined) {
            ol.asserts.assert(this.format_, 7); // `format` must be set when `url` is set
            var format = this.getFormat();
            // create a XHR feature loader for "url" and "format"
            this.loader_ = this.xhr(this.url_, /** @type {import("../format/Feature.js").default} */(this.format_));
        }
    }

    public xhr(url, format) {
        return loadFeaturesXhr(url, format,
            /**
             * @param {Array<import("./Feature.js").default>} features The loaded features.
             * @param {import("./proj/Projection.js").default} dataProjection Data
             * projection.
             * @this {import("./source/Vector").default|import("./VectorTile.js").default}
             */
            function (features, dataProjection) {
                var VOID = function() {};
                const sourceOrTile = /** @type {?} */ (this);
                if (typeof sourceOrTile.addFeatures === 'function') {
            /** @type {import("./source/Vector").default} */ (sourceOrTile).addFeatures(features);
                }
            }, /* FIXME handle error */ VOID);
    }

    public loadFeaturesXhr(url, format, success, failure) {
        return (
            /**
             * @param {import("./extent.js").Extent} extent Extent.
             * @param {number} resolution Resolution.
             * @param {import("./proj/Projection.js").default} projection Projection.
             * @this {import("./source/Vector").default|import("./VectorTile.js").default}
             */
            function (extent, resolution, projection) {
    
                const xhr = new XMLHttpRequest();
                xhr.open('GET',
                    typeof url === 'function' ? url(extent, resolution, projection) : url,
                    true);
                if (format.getType() == ol.format.FormatType.ARRAY_BUFFER) {
                    xhr.responseType = 'arraybuffer';
                }
                /**
                 * @param {Event} event Event.
                 * @private
                 */
                xhr.onload = function (event) {
                    // status will be 0 for file:// urls
                    if (!xhr.status || xhr.status >= 200 && xhr.status < 300) {
                        const type = format.getType();
                        /** @type {Document|Node|Object|string|undefined} */
                        let source;
                        if (type == ol.format.FormatType.JSON || type == ol.format.FormatType.TEXT) {
                            source = xhr.responseText;
                        } else if (type == ol.format.FormatType.XML) {
                            source = xhr.responseXML;
                            if (!source) {
                                source = new DOMParser().parseFromString(xhr.responseText, 'application/xml');
                            }
                        } else if (type == ol.format.FormatType.ARRAY_BUFFER) {
                            source = /** @type {ArrayBuffer} */ (xhr.response);
                        }
                        if (source) {
                            let features = [];
                            if (format.dataProjection !== undefined) {
                                features = format.readFeatures(source, { featureProjection: projection, dataProjection: format.dataProjection })
                            }
                            else {
                                features = format.readFeatures(source, { featureProjection: projection })
                            }
    
                            success.call(this, features, format.readProjection(source), format.getLastExtent());
                        } else {
                            failure.call(this);
                        }
                    } else {
                        failure.call(this);
                    }
                }.bind(this);
                /**
                 * @private
                 */
                xhr.onerror = function () {
                    failure.call(this);
                }.bind(this);
                xhr.send();
            }
        );
    }
}
export default GeoVectorSource;
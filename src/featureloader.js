/**
 * @module ol/featureloader
 */
import { VOID } from 'ol/functions.js';
import FormatType from 'ol/format/FormatType.js';
import { getUid } from 'ol/util';
import TileState from "ol/TileState";


/**
 * {@link module:ol/source/Vector} sources use a function of this type to
 * load features.
 *
 * This function takes an {@link module:ol/extent~Extent} representing the area to be loaded,
 * a `{number}` representing the resolution (map units per pixel) and an
 * {@link module:ol/proj/Projection} for the projection  as
 * arguments. `this` within the function is bound to the
 * {@link module:ol/source/Vector} it's called from.
 *
 * The function is responsible for loading the features and adding them to the
 * source.
 * @typedef {function(this:module:ol/source/Vector, module:ol/extent~Extent, number,
 *                    module:ol/proj/Projection)} FeatureLoader
 * @api
 */


/**
 * {@link module:ol/source/Vector} sources use a function of this type to
 * get the url to load features from.
 *
 * This function takes an {@link module:ol/extent~Extent} representing the area
 * to be loaded, a `{number}` representing the resolution (map units per pixel)
 * and an {@link module:ol/proj/Projection} for the projection  as
 * arguments and returns a `{string}` representing the URL.
 * @typedef {function(module:ol/extent~Extent, number, module:ol/proj/Projection): string} FeatureUrlFunction
 * @api
 */


/**
 * @param {string|module:ol/featureloader~FeatureUrlFunction} url Feature URL service.
 * @param {module:ol/format/Feature} format Feature format.
 * @param {function(this:module:ol/VectorTile, Array<module:ol/Feature>, module:ol/proj/Projection, module:ol/extent~Extent)|function(this:module:ol/source/Vector, Array<module:ol/Feature>)} success
 *     Function called with the loaded features and optionally with the data
 *     projection. Called with the vector tile or source as `this`.
 * @param {function(this:module:ol/VectorTile)|function(this:module:ol/source/Vector)} failure
 *     Function called when loading failed. Called with the vector tile or
 *     source as `this`.
 * @return {module:ol/featureloader~FeatureLoader} The feature loader.
 */
export function loadFeaturesXhr(url, format, success, failure) {
  return (
    /**
     * @param {module:ol/extent~Extent} extent Extent.
     * @param {number} resolution Resolution.
     * @param {module:ol/proj/Projection} projection Projection.
     * @this {module:ol/source/Vector|module:ol/VectorTile}
     */
    function (extent, resolution, projection) {
      var vectorTileSource = format.getSource();

      var sendRequest = true;

      // Try get cached features and instrictions;
      let cacheKey = this.requestCoord + "," + this.tileCoord[0];
      var tileFeatureAndInstrictions = vectorTileSource.getTileInstrictions(cacheKey, this.tileCoord);

      if (tileFeatureAndInstrictions) {
        success.call(this, tileFeatureAndInstrictions,
          format.readProjection(undefined), format.getLastExtent());
        sendRequest = false;
      }
      else {
        var hasRequested = vectorTileSource.registerTileLoadEvent(this, success, failure);
        sendRequest = !hasRequested;
      }

      if (sendRequest) {

        var workerManager = vectorTileSource.getWorkerManager();

        if (workerManager) {
          // Client ID and Client Secret   
          if (url.indexOf('apiKey') === -1 && vectorTileSource.clientId && vectorTileSource.clientSecret && !vectorTileSource.token) {
            vectorTileSource.getIDAndSecret(vectorTileSource);
          }

          let tileGrid = vectorTileSource.getTileGrid();
          let tileExtent = tileGrid.getTileCoordExtent(this.tileCoord);
          let tileResolution = tileGrid.getResolution(this.tileCoord[0]);

          let requestInfo = {
            url: typeof url === 'function' ? url(extent, resolution, projection) : url,
            type: format.getType(),
            tileCoord: this.tileCoord,
            requestCoord: this.requestCoord,
            minimalist: format.minimalist,
            maxDataZoom: format.maxDataZoom,
            formatId: getUid(format),
            layerName: format.layerName,
            token: vectorTileSource.token,
            vectorTileDataCahceSize: format["vectorTileDataCahceSize"],
            tileRange: this.tileRange,
            tileCoordWithSourceCoord: this.tileCoordWithSourceCoord,
            vectorImageTileCoord: this.vectorImageTileCoord,
            tileExtent: tileExtent,
            tileResolution: tileResolution
          };
          let loadedCallback = function (data, methodInfo) {
            let requestKey = data.requestKey;
            var tileLoadEventInfos = vectorTileSource.getTileLoadEvent(requestKey)
            for (let i = 0; i < tileLoadEventInfos.length; i++) {
              let loadEventInfo = tileLoadEventInfos[i];
              loadEventInfo.tile.workerId = methodInfo.workerId;
              if (data.status === "succeed") {
                data.data;
                let tileKey =loadEventInfo.tile.tileCoord+"";
                loadEventInfo.successFunction.call(loadEventInfo.tile, [data.data[0],data.data[1][tileKey]], format.readProjection({}), format.getLastExtent())
              }
            }
          }
          workerManager.postMessage(getUid(loadedCallback), "request", requestInfo, loadedCallback, undefined);
        }
        else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', typeof url === 'function' ? url(extent, resolution, projection) : url, true);
          if (format.getType() == FormatType.ARRAY_BUFFER) {
            xhr.responseType = 'arraybuffer';
          }
          xhr.onload = function (event) {
            // status will be 0 for file:// urls
            if (!xhr.status || xhr.status >= 200 && xhr.status < 300) {
              var type = format.getType();
              /** @type {Document | Node | Object | string | undefined} */
              var source;
              if (type == FormatType.JSON || type == FormatType.TEXT) {
                source = xhr.responseText;
              } else if (type == FormatType.XML) {
                source = xhr.responseXML;
                if (!source) {
                  source = new DOMParser().parseFromString(xhr.responseText, 'application/xml');
                }
              } else if (type == FormatType.ARRAY_BUFFER) {
                source = /** @type {ArrayBuffer} */ (xhr.response);
              }
              if (source) {
                // Get the all feature in the request tile and the instructions of the tile zoom
                var featuresAndInstructions = format.readFeaturesAndInstructions(source, { featureProjection: projection, tileCoord: this.tileCoord });

                var isOverMaxDataZoom = vectorTileSource.maxDataZoom < this.tileCoord[0];
                if (isOverMaxDataZoom) {
                  // Segment instructions to homologous cells.
                  var homologousTilesInstructions = format.CreateInstructionsForHomologousTiles(featuresAndInstructions, this.requestCoord, this.tileCoord[0]);

                  // Save the homologousTilesInstructions to source
                  vectorTileSource.saveTileInstructions(cacheKey, featuresAndInstructions[0], homologousTilesInstructions);

                  // Get tile load Event
                  var tileLoadEventInfos = vectorTileSource.getTileLoadEvent(cacheKey)

                  for (let i = 0; i < tileLoadEventInfos.length; i++) {
                    let loadEventInfo = tileLoadEventInfos[i];
                    var tileFeatureAndInstrictions = vectorTileSource.getTileInstrictions(cacheKey, loadEventInfo.tile.tileCoord);
                    loadEventInfo.successFunction.call(loadEventInfo.tile, tileFeatureAndInstrictions, format.readProjection(source), format.getLastExtent())
                  }
                }
                else {
                  // Get tile load Event
                  var tileLoadEventInfos = vectorTileSource.getTileLoadEvent(cacheKey)
                  for (let i = 0; i < tileLoadEventInfos.length; i++) {
                    let loadEventInfo = tileLoadEventInfos[i];
                    loadEventInfo.successFunction.call(loadEventInfo.tile, featuresAndInstructions, format.readProjection(source), format.getLastExtent())
                  }
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
          xhr.send();
        }
      }
    }
  );
}

/**
 * Create an XHR feature loader for a `url` and `format`. The feature loader
 * loads features (with XHR), parses the features, and adds them to the
 * vector source.
* @param {string | module: ol/featureloader~FeatureUrlFunction} url Feature URL service.
* @param {module: ol/format/Feature} format Feature format.
* @return {module: ol/featureloader~FeatureLoader} The feature loader.
                * @api
                */
export function xhr(url, format) {
  return loadFeaturesXhr(url, format,
    /**
* @param {Array < module: ol/Feature>} features The loaded features.
* @param {module: ol/proj/Projection} dataProjection Data
    * projection.
* @this {module: ol/source/Vector}
    */
    function (features, dataProjection) {
      this.addFeatures(features);
    }, /* FIXME handle error */ VOID);
}

//# sourceMappingURL=featureloader.js.map
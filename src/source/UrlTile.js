/**
 * @module ol/source/UrlTile
 */
import {getUid} from 'ol/util';
import TileState from 'ol/TileState';
import {expandUrl, createFromTemplates, nullTileUrlFunction} from 'ol/tileurlfunction';
import TileSource, {TileSourceEvent} from './Tile';
import TileEventType from 'ol/source/TileEventType';
import {getKeyZXY} from 'ol/tilecoord';

/**
 * @typedef {Object} Options
 * @property {import("./Source.js").AttributionLike} [attributions]
 * @property {boolean} [attributionsCollapsible=true] Attributions are collapsible.
 * @property {number} [cacheSize]
 * @property {boolean} [opaque]
 * @property {import("../proj.js").ProjectionLike} [projection]
 * @property {import("./State.js").default} [state]
 * @property {import("../tilegrid/TileGrid.js").default} [tileGrid]
 * @property {import("../Tile.js").LoadFunction} tileLoadFunction
 * @property {number} [tilePixelRatio]
 * @property {import("../Tile.js").UrlFunction} [tileUrlFunction]
 * @property {string} [url]
 * @property {Array<string>} [urls]
 * @property {boolean} [wrapX=true]
 * @property {number} [transition]
 */


/**
 * @classdesc
 * Base class for sources providing tiles divided into a tile grid over http.
 *
 * @fires import("./TileEvent.js").default
 */
class UrlTile extends TileSource {
  /**
   * @param {Options} options Image tile options.
   */
  constructor(options) {

    super({
      attributions: options.attributions,
      cacheSize: options.cacheSize,
      opaque: options.opaque,
      projection: options.projection,
      state: options.state,
      tileGrid: options.tileGrid,
      tilePixelRatio: options.tilePixelRatio,
      wrapX: options.wrapX,
      transition: options.transition,
      attributionsCollapsible: options.attributionsCollapsible
    });

    /**
     * @private
     * @type {boolean}
     */
    this.generateTileUrlFunction_ = !options.tileUrlFunction;

    /**
     * @protected
     * @type {import("../Tile.js").LoadFunction}
     */
    this.tileLoadFunction = options.tileLoadFunction;

    /**
     * @protected
     * @type {import("../Tile.js").UrlFunction}
     */
    this.tileUrlFunction = options.tileUrlFunction ? options.tileUrlFunction.bind(this) : nullTileUrlFunction;

    /**
     * @protected
     * @type {!Array<string>|null}
     */
    this.urls = null;

    if (options.urls) {
      this.setUrls(options.urls);
    } else if (options.url) {
      this.setUrl(options.url);
    }

    /**
     * @private
     * @type {!Object<number, boolean>}
     */
    this.tileLoadingKeys_ = {};

  }

  /**
   * Return the tile load function of the source.
   * @return {import("../Tile.js").LoadFunction} TileLoadFunction
   * @api
   */
  getTileLoadFunction() {
    return this.tileLoadFunction;
  }

  /**
   * Return the tile URL function of the source.
   * @return {import("../Tile.js").UrlFunction} TileUrlFunction
   * @api
   */
  getTileUrlFunction() {
    return this.tileUrlFunction;
  }

  /**
   * Return the URLs used for this source.
   * When a tileUrlFunction is used instead of url or urls,
   * null will be returned.
   * @return {!Array<string>|null} URLs.
   * @api
   */
  getUrls() {
    return this.urls;
  }

  /**
   * Handle tile change events.
   * @param {import("../events/Event.js").default} event Event.
   * @protected
   */
  handleTileChange(event) {
    const tile = /** @type {import("../Tile.js").default} */ (event.target);
    const uid = getUid(tile);
    const tileState = tile.getState();
    let type;
    if (tileState == TileState.LOADING) {
      this.tileLoadingKeys_[uid] = true;
      type = TileEventType.TILELOADSTART;
    } else if (uid in this.tileLoadingKeys_) {
      delete this.tileLoadingKeys_[uid];
      type = tileState == TileState.ERROR ? TileEventType.TILELOADERROR :
        (tileState == TileState.LOADED || tileState == TileState.ABORT) ?
          TileEventType.TILELOADEND : undefined;
    }
    if (type != undefined) {
      this.dispatchEvent(new TileSourceEvent(type, tile));
    }
  }

  /**
   * Set the tile load function of the source.
   * @param {import("../Tile.js").LoadFunction} tileLoadFunction Tile load function.
   * @api
   */
  setTileLoadFunction(tileLoadFunction) {
    this.tileCache.clear();
    this.tileLoadFunction = tileLoadFunction;
    this.changed();
  }

  /**
   * Set the tile URL function of the source.
   * @param {import("../Tile.js").UrlFunction} tileUrlFunction Tile URL function.
   * @param {string=} opt_key Optional new tile key for the source.
   * @api
   */
  setTileUrlFunction(tileUrlFunction, opt_key) {
    this.tileUrlFunction = tileUrlFunction;
    this.tileCache.pruneExceptNewestZ();
    if (typeof opt_key !== 'undefined') {
      this.setKey(opt_key);
    } else {
      this.changed();
    }
  }

  /**
   * Set the URL to use for requests.
   * @param {string} url URL.
   * @api
   */
  setUrl(url) {
    const urls = this.urls = expandUrl(url);
    this.setUrls(urls);
  }

  /**
   * Set the URLs to use for requests.
   * @param {Array<string>} urls URLs.
   * @api
   */
  setUrls(urls) {
    this.urls = urls;
    const key = urls.join('\n');
    if (this.generateTileUrlFunction_) {
      this.setTileUrlFunction(createFromTemplates(urls, this.tileGrid), key);
    } else {
      this.setKey(key);
    }
  }

  /**
   * @inheritDoc
   */
  useTile(z, x, y) {
    const tileCoordKey = getKeyZXY(z, x, y);
    if (this.tileCache.containsKey(tileCoordKey)) {
      this.tileCache.get(tileCoordKey);
    }
  }
}


export default UrlTile;

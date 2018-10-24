/**
 * @module ol/source/Source
 */

import {VOID} from 'ol/functions';
import BaseObject from 'ol/Object';
import {get as getProjection} from 'ol/proj';
import SourceState from 'ol/source/State';


/**
 * A function that returns a string or an array of strings representing source
 * attributions.
 *
 * @typedef {function(import("../PluggableMap.js").FrameState): (string|Array<string>)} Attribution
 */


/**
 * A type that can be used to provide attribution information for data sources.
 *
 * It represents either
 * * a simple string (e.g. `'© Acme Inc.'`)
 * * an array of simple strings (e.g. `['© Acme Inc.', '© Bacme Inc.']`)
 * * a function that returns a string or array of strings (`{@link module:ol/source/Source~Attribution}`)
 *
 * @typedef {string|Array<string>|Attribution} AttributionLike
 */


/**
 * @typedef {Object} Options
 * @property {AttributionLike} [attributions]
 * @property {boolean} [attributionsCollapsible=true] Attributions are collapsible.
 * @property {import("../proj.js").ProjectionLike} projection
 * @property {SourceState} [state='ready']
 * @property {boolean} [wrapX=false]
 */


/**
 * @classdesc
 * Abstract base class; normally only used for creating subclasses and not
 * instantiated in apps.
 * Base class for {@link module:ol/layer/Layer~Layer} sources.
 *
 * A generic `change` event is triggered when the state of the source changes.
 * @api
 */
class Source extends BaseObject {
  /**
   * @param {Options} options Source options.
   */
  constructor(options) {

    super();

    /**
     * @private
     * @type {import("../proj/Projection.js").default}
     */
    this.projection_ = getProjection(options.projection);

    /**
     * @private
     * @type {?Attribution}
     */
    this.attributions_ = adaptAttributions(options.attributions);

    /**
     * @private
     * @type {boolean}
     */
    this.attributionsCollapsible_ = options.attributionsCollapsible !== undefined ?
      options.attributionsCollapsible : true;

    /**
     * This source is currently loading data. Sources that defer loading to the
     * map's tile queue never set this to `true`.
     * @type {boolean}
     */
    this.loading = false;

    /**
     * @private
     * @type {SourceState}
     */
    this.state_ = options.state !== undefined ?
      options.state : SourceState.READY;

    /**
     * @private
     * @type {boolean}
     */
    this.wrapX_ = options.wrapX !== undefined ? options.wrapX : false;

  }

  /**
   * Get the attribution function for the source.
   * @return {?Attribution} Attribution function.
   */
  getAttributions() {
    return this.attributions_;
  }

  /**
   * @return {boolean} Aattributions are collapsible.
   */
  getAttributionsCollapsible() {
    return this.attributionsCollapsible_;
  }

  /**
   * Get the projection of the source.
   * @return {import("../proj/Projection.js").default} Projection.
   * @api
   */
  getProjection() {
    return this.projection_;
  }

  /**
   * @abstract
   * @return {Array<number>|undefined} Resolutions.
   */
  getResolutions() {}

  /**
   * Get the state of the source, see {@link module:ol/source/State~State} for possible states.
   * @return {SourceState} State.
   * @api
   */
  getState() {
    return this.state_;
  }

  /**
   * @return {boolean|undefined} Wrap X.
   */
  getWrapX() {
    return this.wrapX_;
  }

  /**
   * Refreshes the source and finally dispatches a 'change' event.
   * @api
   */
  refresh() {
    this.changed();
  }

  /**
   * Set the attributions of the source.
   * @param {AttributionLike|undefined} attributions Attributions.
   *     Can be passed as `string`, `Array<string>`, `{@link module:ol/source/Source~Attribution}`,
   *     or `undefined`.
   * @api
   */
  setAttributions(attributions) {
    this.attributions_ = adaptAttributions(attributions);
    this.changed();
  }

  /**
   * Set the state of the source.
   * @param {SourceState} state State.
   * @protected
   */
  setState(state) {
    this.state_ = state;
    this.changed();
  }
}

/**
 * @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
 * @param {number} resolution Resolution.
 * @param {number} rotation Rotation.
 * @param {number} hitTolerance Hit tolerance in pixels.
 * @param {Object<string, boolean>} skippedFeatureUids Skipped feature uids.
 * @param {function(import("../Feature.js").FeatureLike): T} callback Feature callback.
 * @return {T|void} Callback result.
 * @template T
 */
Source.prototype.forEachFeatureAtCoordinate = VOID;


/**
 * Turns the attributions option into an attributions function.
 * @param {AttributionLike|undefined} attributionLike The attribution option.
 * @return {?Attribution} An attribution function (or null).
 */
function adaptAttributions(attributionLike) {
  if (!attributionLike) {
    return null;
  }
  if (Array.isArray(attributionLike)) {
    return function(frameState) {
      return attributionLike;
    };
  }

  if (typeof attributionLike === 'function') {
    return attributionLike;
  }

  return function(frameState) {
    return [attributionLike];
  };
}


export default Source;

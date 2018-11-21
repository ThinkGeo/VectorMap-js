import TileGrid from "ol/tilegrid/TileGrid";
import { clamp } from 'ol/math.js';
import { get as getProjection, METERS_PER_UNIT } from 'ol/proj.js';
import { containsCoordinate, createOrUpdate, getCorner, getHeight, getWidth } from 'ol/extent.js';
import { toSize } from 'ol/size.js';
import { DEFAULT_MAX_ZOOM, DEFAULT_TILE_SIZE } from 'ol/tilegrid/common.js';
import { extentFromProjection } from "ol/tilegrid";
import Corner from 'ol/extent/Corner.js';
import {assign} from 'ol/obj.js';



export function createTileGridByXYZ(opt_options) {
    var options = /** @type {module:ol/tilegrid/TileGrid~Options} */ ({});
    assign(options, opt_options !== undefined ?
        opt_options : /** @type {module:ol/tilegrid~XYZOptions} */ ({}));
    if (options.extent === undefined) {
        options.extent = getProjection('EPSG:3857').getExtent();
    }
    options.resolutions = resolutionsFromExtent(
        options.extent, options.maxZoom, options.tileSize);
    delete options.maxZoom;
    return new GeoTileGrid(options);
}

export function createTileGridForProjection(projection, opt_maxZoom, opt_tileSize, opt_corner) {
    var extent = extentFromProjection(projection);
    return createTileGridForExtent(extent, opt_maxZoom, opt_tileSize, opt_corner)
}

export function createTileGridForExtent(extent, opt_maxZoom, opt_tileSize, opt_corner) {
    var corner = opt_corner !== undefined ? opt_corner : Corner.TOP_LEFT;

    var resolutions = resolutionsFromExtent(extent, opt_maxZoom, opt_tileSize);

    return new GeoTileGrid({
        extent: extent,
        origin: getCorner(extent, corner),
        resolutions: resolutions,
        tileSize: opt_tileSize
    });
}

function resolutionsFromExtent(extent, opt_maxZoom, opt_tileSize) {
    var maxZoom = opt_maxZoom !== undefined ?
        opt_maxZoom : DEFAULT_MAX_ZOOM;

    var height = getHeight(extent);
    var width = getWidth(extent);

    var tileSize = toSize(opt_tileSize !== undefined ?
        opt_tileSize : DEFAULT_TILE_SIZE);
    var maxResolution = Math.max(
        width / tileSize[0], height / tileSize[1]);

    var length = maxZoom + 1;
    var resolutions = new Array(length);
    for (var z = 0; z < length; ++z) {
        resolutions[z] = maxResolution / Math.pow(2, z);
    }
    return resolutions;
}

class GeoTileGrid extends TileGrid {
    constructor(options) {
        super(options);
    }

    getZForResolution(resolution, opt_direction) {
        const z = this.linearFindNearestCustom(this.resolutions_, resolution, opt_direction || 0);
        return clamp(z, this.minZoom, this.maxZoom);
    }
    // the zoom boundary is at 0.68.
    linearFindNearestCustom(arr, target, direction) {
        const n = arr.length;
        if (arr[0] <= target) {
            return 0;
        } else if (target <= arr[n - 1]) {
            return n - 1;
        } else {
            let i;
            if (direction > 0) {
                for (i = 1; i < n; ++i) {
                    if (arr[i] < target) {
                        return i - 1;
                    }
                }
            } else if (direction < 0) {
                for (i = 1; i < n; ++i) {
                    if (arr[i] <= target) {
                        return i;
                    }
                }
            } else {
                for (i = 1; i < n; ++i) {
                    if (arr[i] == target) {
                        return i;
                    } else if (arr[i] < target) {
                        var delta = arr[i - 1] - arr[i];
                        delta = delta * 0.5;
                        if (arr[i - 1] - target - delta < target - arr[i]) {
                            return i - 1;
                        } else {
                            return i;
                        }

                    }
                }
            }
            return n - 1;
        }
    }
}

export default GeoTileGrid;
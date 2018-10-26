import CanvasVectorTileLayerRenderer from './VectorTileLayer';
import LayerType from 'ol/LayerType';
// import ReplayType from 'ol/render/ReplayType';
// import { ORDER } from 'ol/render/replay';
// import { createCanvasContext2D } from 'ol/dom';
// import VectorTileRenderType from 'ol/layer/VectorTileRenderType';
import { buffer, containsCoordinate, equals, getIntersection, getTopLeft, intersects } from 'ol/extent';

import TileState from 'ol/TileState';
import { equivalent as equivalentProjection } from 'ol/proj';
import CanvasReplayGroup, { replayDeclutter } from 'ol/render/canvas/ReplayGroup';
import { getSquaredTolerance as getSquaredRenderTolerance, renderFeature } from '../vector';
// import { getUid } from 'ol/util';
// import ViewHint from 'ol/ViewHint';
import Units from 'ol/proj/Units';
// import { create as createTransform, compose as composeTransform } from 'ol/transform';
// import GeoStyle from '../../style/geoStyle';

class GeoCanvasVectorTileLayerRenderer extends CanvasVectorTileLayerRenderer {
    constructor(layer) {
        super(layer);
    }
    /**
   * @param {import("../../VectorImageTile.js").default} tile Tile.
   * @param {number} pixelRatio Pixel ratio.
   * @param {import("../../proj/Projection.js").default} projection Projection.
   * @private
   */
    createReplayGroup_(tile, pixelRatio, projection) {
        const layer = /** @type {import("../../layer/Vector.js").default} */ (this.getLayer());
        const revision = layer.getRevision();
        const renderOrder = /** @type {import("../../render.js").OrderFunction} */ (layer.getRenderOrder()) || null;

        const replayState = tile.getReplayState(layer);
        if (!replayState.dirty && replayState.renderedRevision == revision &&
            replayState.renderedRenderOrder == renderOrder) {
            return;
        }

        const source = /** @type {import("../../source/VectorTile.js").default} */ (layer.getSource());
        const sourceTileGrid = source.getTileGrid();
        const tileGrid = source.getTileGridForProjection(projection);
        const resolution = tileGrid.getResolution(tile.tileCoord[0]);
        const tileExtent = tile.extent;

        const zIndexKeys = {};
        for (let t = 0, tt = tile.tileKeys.length; t < tt; ++t) {
            const sourceTile = tile.getTile(tile.tileKeys[t]);
            if (sourceTile.getState() != TileState.LOADED) {
                continue;
            }

            const sourceTileCoord = sourceTile.tileCoord;
            const requestCoord = sourceTile.requestCoord;
            const sourceTileExtent = sourceTileGrid.getTileCoordExtent(requestCoord);
            const sharedExtent = getIntersection(tileExtent, sourceTileExtent);
            const bufferedExtent = equals(sourceTileExtent, sharedExtent) ? null :
                buffer(sharedExtent, layer.getRenderBuffer() * resolution, this.tmpExtent);
            const tileProjection = sourceTile.getProjection();
            let reproject = false;
            if (!equivalentProjection(projection, tileProjection)) {
                reproject = true;
                sourceTile.setProjection(projection);
            }
            replayState.dirty = false;
            const replayGroup = new CanvasReplayGroup(0, sharedExtent, resolution,
                pixelRatio, source.getOverlaps(), this.declutterTree_, layer.getRenderBuffer());
            const squaredTolerance = getSquaredRenderTolerance(resolution, pixelRatio);

            /**
             * @param {import("../../Feature.js").FeatureLike} feature Feature.
             * @this {CanvasVectorTileLayerRenderer}
             */
            const render = function (feature, geostyle) {
                let styles;
                if (geostyle) {
                    let ol4Styles = geostyle.getStyles(feature, resolution, {});
                    if (styles === undefined) {
                        styles = [];
                    }
                    Array.prototype.push.apply(styles, ol4Styles);
                }
                else {
                    const styleFunction = feature.getStyleFunction() || layer.getStyleFunction();
                    if (styleFunction) {
                        styles = styleFunction(feature, resolution);
                    }
                }

                if (styles) {
                    const dirty = this.renderFeature(feature, squaredTolerance, styles, replayGroup);
                    this.dirty_ = this.dirty_ || dirty;
                    replayState.dirty = replayState.dirty || dirty;
                }
            };

            const featuresAndInstructs = sourceTile.getFeatures();

            const features = featuresAndInstructs[0];
            const instructs = featuresAndInstructs[1];

            if (renderOrder && renderOrder !== replayState.renderedRenderOrder) {
                features.sort(renderOrder);
            }
            for (let i = 0, ii = instructs.length; i < ii; ++i) {
                const featureIndex = instructs[i][0];
                const feature = features[featureIndex];

                let geoStyle = instructs[i][1];

                if (reproject && !feature["projected"]) {
                    if (tileProjection.getUnits() == Units.TILE_PIXELS) {
                        // projected tile extent
                        tileProjection.setWorldExtent(sourceTileExtent);
                        // tile extent in tile pixel space
                        tileProjection.setExtent(sourceTile.getExtent());
                    }
                    feature.getGeometry().transform(tileProjection, projection);
                    feature["projected"] = true;
                    feature.extent_ = null;
                }
                if (!bufferedExtent || intersects(bufferedExtent, feature.getGeometry().getExtent())) {
                    render.call(this, feature, geoStyle);
                }
            }
            replayGroup.finish();
            for (const r in replayGroup.getReplays()) {
                zIndexKeys[r] = true;
            }
            sourceTile.setReplayGroup(layer, tile.tileCoord.toString(), replayGroup);
        }
        replayState.renderedRevision = revision;
        replayState.renderedRenderOrder = renderOrder;
    }
}

GeoCanvasVectorTileLayerRenderer['handles'] = function (layer) {
    return layer.getType() === LayerType.GEOVECTORTILE;
};

GeoCanvasVectorTileLayerRenderer['create'] = function (mapRenderer, layer) {
    return new GeoCanvasVectorTileLayerRenderer(/** @type {import("../../layer/VectorTile.js").default} */(layer));
};


export default GeoCanvasVectorTileLayerRenderer;
import CanvasVectorLayerRenderer from "./VectorLayer";
import LayerType from 'ol/LayerType';


class GeoCanvasVectorLayerRenderer extends CanvasVectorLayerRenderer {
    constructor(layer) {
        super(layer);
    }
}

GeoCanvasVectorLayerRenderer['handles'] = function (layer) {
    return layer.getType() === LayerType.GEOVECTOR;
};

GeoCanvasVectorLayerRenderer['create'] = function (mapRenderer, layer) {
    return new GeoCanvasVectorLayerRenderer(/** @type {import("../../layer/VectorTile.js").default} */(layer));
};

export default GeoCanvasVectorLayerRenderer

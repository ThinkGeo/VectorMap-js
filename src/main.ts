import { VectorTileLayer } from "./layer/vectorTileLayer";
import { GeoVector as VectorLayer } from "./layer/geoVector";
import { GeoHeatmap as Heatmap } from "./layer/geoHeatmap";
import { VectorTileLayerThreadMode } from "./worker/vectorTileLayerThreadMode";

ol.mapsuite = {};

ol.mapsuite["Heatmap"] = Heatmap;
ol.mapsuite["VectorLayer"] = VectorLayer;
ol.mapsuite["VectorTileLayer"] = VectorTileLayer;
ol.mapsuite["VectorTileLayerThreadMode"] = VectorTileLayerThreadMode;

ol.olInit = olInit;
// (<any>window)["ol"] = ol;
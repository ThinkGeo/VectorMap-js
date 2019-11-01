import { VectorTileLayer } from "./layer/vectorTileLayer";
import { GeoVector as VectorLayer } from "./layer/geoVector";
import { GeoHeatmap as Heatmap } from "./layer/geoHeatmap";
import { VectorTileLayerThreadMode } from "./worker/vectorTileLayerThreadMode";

ol.thinkgeo = {};

ol.thinkgeo["Heatmap"] = Heatmap;
ol.thinkgeo["VectorLayer"] = VectorLayer;
ol.thinkgeo["VectorTileLayer"] = VectorTileLayer;
ol.thinkgeo["VectorTileLayerThreadMode"] = VectorTileLayerThreadMode;

ol.olInit = olInit;
// (<any>window)["ol"] = ol;
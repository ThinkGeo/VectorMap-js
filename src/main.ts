import { VectorTileLayer } from "./layer/vectorTileLayer";
import { GeoVector as VectorLayer } from "./layer/geoVector";
import { VectorTileLayerThreadMode } from "./worker/vectorTileLayerThreadMode";

(<any>ol).mapsuite = {};

(<any>ol).mapsuite["VectorLayer"] = VectorLayer;
(<any>ol).mapsuite["VectorTileLayer"] = VectorTileLayer;
(<any>ol).mapsuite["VectorTileLayerThreadMode"] = VectorTileLayerThreadMode;

(<any>window)["ol"] = ol;
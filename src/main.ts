import { VectorTileLayer } from "./layer/vectorTileLayer";
import { VectorTileLayerThreadMode } from "./worker/vectorTileLayerThreadMode";

(<any>ol).mapsuite = {};

(<any>ol).mapsuite["VectorTileLayer"] = VectorTileLayer;
(<any>ol).mapsuite["VectorTileLayerThreadMode"] = VectorTileLayerThreadMode;

(<any>window)["ol"] = ol;
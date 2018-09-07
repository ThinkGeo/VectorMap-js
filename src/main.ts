import { VectorTileLayer } from "./layer/vectorTileLayer";
import { VectorTileLayerThreadMode } from "./worker/vectorTileLayerThreadMode";
import { webglCaculate } from "./worker/webgl";

(<any>ol).mapsuite = {};

(<any>ol).mapsuite["VectorTileLayer"] = VectorTileLayer;
(<any>ol).mapsuite["VectorTileLayerThreadMode"] = VectorTileLayerThreadMode;

(<any>window)["ol"] = ol;
(<any>window)["webglCaculate"] = webglCaculate;
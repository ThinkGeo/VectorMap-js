import { VectorTileLayer } from "./layer/vectorTileLayer";

(<any>ol).mapsuite = {};

(<any>ol).mapsuite["VectorTileLayer"] = VectorTileLayer;

(<any>window)["ol"] = ol;
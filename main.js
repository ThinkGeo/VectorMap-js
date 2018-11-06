import { Map, View } from 'ol';
import GeoVectorTileLayer from './src/layer/GeoVectorTileLayer'
import VectorTileLayer from './src/layer/VectorTile'
import VectorTileSource from 'ol/source/vectorTile'
import MVT from 'ol/format/MVT'
import { GEOLOCATION } from 'ol/has';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import { createXYZ } from 'ol/tilegrid';
import TileDebug from 'ol/source/TileDebug'
import Tile from 'ol/layer/Tile'
import light from './thinkgeo-world-streets-light';
import { fromLonLat } from 'ol/proj'


var view = new View({
  center: fromLonLat([-96.79748, 32.78819]),
  zoom: 4,
  maxZoom: 19,
  maxResolution: 40075016.68557849 / 512
});
var zoom = view.getZoom();
document.getElementById("olzoom").innerHTML = "Zoom:" + (zoom);
view.on("change:resolution", function (e) {
  var zoom = view.getZoom();
  if ((zoom.toString()).indexOf(".") > 0) {
    zoom = zoom.toFixed(2);
  }
  document.getElementById("olzoom").innerHTML = "Zoom:" + (zoom);
});

var vectorTile = new GeoVectorTileLayer(light, {
  maxDataZoom: 14,
  multithread: false,
  updateWhileAnimating: true,
  updateWhileInteracting: true
})

var tilegrid = new Tile({
  source: new TileDebug({
    projection: "EPSG:3857",
    tileGrid: createXYZ({ tileSize: 512, maxZoom: 22 })
  })
})

var map = new Map({
  layers: [vectorTile],
  target: 'map',
  view: view
});

window["map"] = map;
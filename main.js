import { Map, View } from 'ol';
import GeoVectorTileLayer from './src/layer/GeoVectorTileLayer'
import VectorTileLayer from 'ol/layer/VectorTile'
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
import { FALSE } from 'ol/functions';


var view = new View({
  center: [-10775718.490585351, 3868389.0226015863],
  zoom: 14,
  // maxZoom: 19,
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

var geoVectorTileLayer = new GeoVectorTileLayer(light, {
  maxDataZoom: 14,
  multithread: true,
  updateWhileAnimating: true,
  updateWhileInteracting: true
})

var tilegrid = new Tile({
  source: new TileDebug({
    projection: "EPSG:3857",
    tileGrid: createXYZ({ tileSize: 512, maxZoom: 22 })
  })
})

var vectorTileLayer = new VectorTileLayer({
  source: new VectorTileSource({
    format: new MVT(),
    url: "https://cloud1.thinkgeo.com/api/v1/maps/vector/streets/3857/{z}/{x}/{y}.pbf?apiKey=Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~"
  })
})
var map = new Map({
  layers: [geoVectorTileLayer],
  target: 'map',
  view: view
});

window["map"] = map;
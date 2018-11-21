import { Map, View } from 'ol';
import GeoVectorTileLayer from './src/layer/GeoVectorTileLayer'
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorTileSource from 'ol/source/vectorTile'
import MVT from 'ol/format/MVT'
import { GEOLOCATION } from 'ol/has';
import { Fill, Style, Text } from 'ol/style.js';
import { createXYZ } from 'ol/tilegrid';
import { createTileGridByXYZ } from "./src/geoTileGrid";
import TileDebug from 'ol/source/TileDebug'
import Tile from 'ol/layer/Tile'
import light from './thinkgeo-world-streets-light';
import { fromLonLat } from 'ol/proj'
import { FALSE } from 'ol/functions';
import GeoTileGrid from "./src/geoTileGrid";


var view = new View({
  // center: [-10775718.490585351, 3868389.0226015863],
  center: [260637.765211225, 6249780.338744789],
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

var style = new Style({
  text: new Text({
    font: 'bold 11px "Open Sans", "Arial Unicode MS", "sans-serif"',
    placement: 'line',
    fill: new Fill({
      color: '#cccccc'
    })
  })
});


var vectorTileLayer = new VectorTileLayer({
  updateWhileAnimating: true,
  updateWhileInteracting: true,
  source: new VectorTileSource({
    format: new MVT({
      layers: ["road_name"]
    }),
    url: "https://cloud1.thinkgeo.com/api/v1/maps/vector/streets/3857/{z}/{x}/{y}.pbf?apiKey=Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~"
  }),
  declutter: true
})
var map = new Map({
  layers: [geoVectorTileLayer,tilegrid],
  target: 'map',
  view: view,
});

window["map"] = map;
import { Map, View } from 'ol';
import GeoVectorTileLayer from './src/layer/GeoVectorTileLayer'
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorTileSource from 'ol/source/vectorTile'
import MVT from 'ol/format/MVT'
import { GEOLOCATION } from 'ol/has';
import { createXYZ } from 'ol/tilegrid';
import TileDebug from 'ol/source/TileDebug'
import Tile from 'ol/layer/Tile'
import light from './thinkgeo-world-streets-light';
import { fromLonLat } from 'ol/proj'

import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { Fill, Stroke, Style, Text } from 'ol/style.js';

import GeoVectorLayer from "./src/layer/GeoVector";
import geosjonStyle from "./geojson";


var view = new View({
  center: fromLonLat([-100.79748, 32.78819]),
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


var map = new Map({
  target: 'map',
  view: view
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
// map.addLayer(geoVectorTileLayer);


var style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.6)'
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 1
  }),
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: '#000'
    }),
    stroke: new Stroke({
      color: '#fff',
      width: 3
    })
  })
});

var vectorLayer = new VectorLayer({
  source: new VectorSource({
    url: 'https://openlayers.org/en/latest/examples/data/geojson/countries.geojson',
    format: new GeoJSON()
  }),
  style: function (feature) {
    style.getText().setText(feature.get('name'));
    return style;
  }
});
// map.addLayer(vectorLayer);


var geoVectorLayer = new GeoVectorLayer(geosjonStyle, {
  multithread: false
})
map.addLayer(geoVectorLayer);


window["map"] = map;
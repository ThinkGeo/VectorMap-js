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

var stylejson =
  {
    "id": "thinkgeo-world-streets-light",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "sources": [{
      "id": "worldstreets_source_test",
      "url": "https://cloud1.thinkgeo.com/api/v1/maps/vector/streets/3857/{z}/{x}/{y}.pbf?apiKey=Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~",
      "type": "MVT"
    }],
    "styles": [
      {
        "id": "country",
        "filter": "layerName='country'",
        "style": [{
          "filter": "zoom>=0;zoom<=5;",
          "polygon-fill": "#ffe659"
        },
        {
          "filter": "zoom>=6;zoom<=19;",
          "polygon-fill": "#cccccc"
        }]
      }
    ],
    "layers": [{
      "id": "worldstreets_layers",
      "source": "worldstreets_source_test",
      "styles": ["country"]
    }]
  }

var vectorTile = new GeoVectorTileLayer(stylejson, {
  maxDataZoom: 14
})

var tilegrid = new Tile({
  source: new TileDebug({
    projection: "EPSG:3857",
    tileGrid: createXYZ({ tileSize: 512, maxZoom: 22 })
  })
})


var map = new Map({
  layers: [vectorTile, tilegrid],
  target: 'map',
  view: new View({
    center: [-11000000, 4600000],
    zoom: 15
  })
});
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


var stylejson =
  {
    "id": "thinkgeo-world-streets-light",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "variables": {
      "@naturalAndSports": "#439c3c",
      "@tourism": "#7d5e48",
      "@transportation": "#30b7d9",
      "@cultural": "#5d869b",
      "@industrial": "#544757",
      "@shop": "#15b959",
      "@eat": "#ff8845",
      "@entertainment": "#49a940",
      "@medical": "#f77171",
      "@commonService": "#bc61c7",
      "@agriculture": "#e1e3d2",
      "@ice": "#ffffff",
      "@wood": "#d4e7cc",
      "@grassland": "#e5f1c9",
      "@scrub": "#cbe5bd",
      "@rock": "#ded6bc",
      "@wetland": "#d4ece1",
      "@park": "rgba(167, 218, 122, 0.35)",
      "@pitch": "#c1dcb9",
      "@swimmingPool": "#aadaff",
      "@sand": "#f1ebd1",
      "@cemetery": "#dff6d2",
      "@sand_opacity07": "rgba(241, 235, 209, 0.7)",
      "@sand_opacity05": "rgba(241, 235, 209, 0.5)",
      "@sand_opacity02": "rgba(241, 235, 209, 0.2)",
      "@crops": "#c9e4bb",
      "@crops_opacity07": "rgba(201, 228, 187, 0.7)",
      "@crops_opacity05": "rgba(201, 228, 187, 0.5)",
      "@crops_opacity02": "rgba(201, 228, 187, 0.2)",
      "@grass_opacity07": "rgba(229, 241, 201, 0.7)",
      "@grass_opacity05": "rgba(229, 241, 201, 0.5)",
      "@grass_opacity02": "rgba(229, 241, 201, 0.2)",
      "@swamps": "#dde7c2",
      "@swamps_opacity07": "rgba(221, 231, 194, 0.7)",
      "@swamps_opacity05": "rgba(221, 231, 194, 0.5)",
      "@swamps_opacity02": "rgba(221, 231, 194, 0.2)",
      "@trees": "#b8d7b5",
      "@trees_opacity07": "rgba(184, 215, 181, 0.7)",
      "@trees_opacity05": "rgba(184, 215, 181, 0.5)",
      "@trees_opacity02": "rgba(184, 215, 181, 0.2)",
      "@tundra": "#e4ecce",
      "@tundra_opacity07": "rgba(228, 236, 206, 0.7)",
      "@tundra_opacity05": "rgba(228, 236, 206, 0.5)",
      "@tundra_opacity02": "rgba(228, 236, 206, 0.2)",
      "@countryFill": "#f0eee8",
      "@urbanArea": "#e9e6de",
      "@water": "#aac6ee",
      "@waterLabels": "#496588",
      "@farmLabels": "#3cb40e",
      "@roadFill": "#ffffff",
      "@roadOutline": "#e5e5e5",
      "@motorwayFill": "#febd80",
      "@motorwayOutline": "#e9aa6f",
      "@primaryFill": "#ffffff",
      "@primaryOutline": "#e5e5e5",
      "@trunkFill": "#ffe659",
      "@trunkOutline": "#f0d43a",
      "@linkFill": "#fdc04e",
      "@roadTrack": "#efc14a",
      "@cycleway": "#abd0a7",
      "@roadShieldMotorway": "#f6ce93",
      "@roadShieldTrunk": "#ffe659",
      "@rail": "#cccccc",
      "@railOther": "#00ff00",
      "@railSubway": "#f3759f",
      "@lightRail": "#9ed899",
      "@aerowayLevel1": "#bcc4cd",
      "@aerowayLevel3": "#c5cdd7",
      "@aerowayLevel5": "#e5e5e5",
      "@adminLabelLevel1": "#6a6a69",
      "@adminLabelLevel3": "#8c8b86",
      "@adminLabelLevel5": "#a8a5a2",
      "@adminLabelLevel7": "#c1c1be",
      "@grayLevel0": "#333333",
      "@grayLevel1": "#666666",
      "@grayLevel2": "#737373",
      "@grayLevel3": "#808080",
      "@grayLevel4": "#999999",
      "@grayLevel5": "#cccccc",
      "@grayLevel6": "#d6d6d6",
      "@grayLevel7": "#ffffff",
      "@buildingShadow": "#ccc8bd",
      "@buildingOutline": "#dad6cb",
      "@buildingFill": "#e9e4d8",
      "@buildingName": "#8b8a85",
      "@haloSolid": "#ffffff",
      "@haloTransp50": "rgba(255, 255, 255, 0.5)",
      "@haloTransp35": "rgba(255, 255, 255, 0.35)",
      "@name": "name"
    },
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
      },
      {
        "id": "country_boundary",
        "filter": "layerName='admin_boundary';admin_level=2",
        "style": [{
          "filter": "disputed=1",
          "style": [{
            "filter": "zoom=1",
            "line-width": 1,
            "line-color": "@adminLabelLevel7"
          }, {
            "filter": "zoom>=2;zoom<=3",
            "line-width": 3,
            "line-color": "@haloTransp50",
            "children": [{
              "line-width": 1,
              "line-color": "@adminLabelLevel3"
            }]
          }, {
            "filter": "zoom>=4;zoom<=19",
            "line-width": 5,
            "line-color": "@haloTransp35",
            "children": [{
              "line-width": 1,
              "line-color": "@adminLabelLevel3"
            }]
          }]
        }, {
          "filter": "disputed=0",
          "line-width": 1,
          "style": [{
            "filter": "zoom=1",
            "line-color": "@adminLabelLevel7"
          }, {
            "filter": "zoom>=2;zoom<=10",
            "line-color": "@adminLabelLevel3",
            "line-dasharray": "3,3"
          }, {
            "filter": "zoom>=11;zoom<=19",
            "line-width": 5,
            "line-color": "@haloTransp35",
            "children": [{
              "line-width": 3,
              "line-color": "@adminLabelLevel5",
              "line-dasharray": "8,6"
            }]
          }]
        }]
      }
    ],
    "layers": [{
      "id": "worldstreets_layers",
      "source": "worldstreets_source_test",
      "styles": ["country", "country_boundary"]
    }]
  }

var vectorTile = new GeoVectorTileLayer(light, {
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
    zoom: 3
  })
});
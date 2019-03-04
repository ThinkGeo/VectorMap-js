/*===========================================================================*/
// Label Features
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Map Icon Fonts
//   2. Layer Setup
//   3. Map Control Setup
/*===========================================================================*/


/*---------------------------------------------*/
// 1. ThinkGeo Map Icon Fonts
/*---------------------------------------------*/

// First we'll load the Map Icon Fonts using the WebFont loader. The loaded 
// Icon Fonts will be rendered as POI icons on the background layer. 
// For more info, see our wiki: 
// https://wiki.thinkgeo.com/wiki/thinkgeo_iconfonts 
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/2.0.0/vectormap-icons.css"]
    }
});


/*---------------------------------------------*/
// 2. Layer Setup
/*---------------------------------------------*/

// Now, we need to create the layers for our map. In this map, we use two 
// layers for the map. One that display road lines and road names as the 
// background layer, another dispalys the hotel poi point data.

// Create different styles for our layers. 
// This style is for the base map layer, which displays the road and road name. 
const baseLayerStyle = {
    "id": "thinkgeo-world-streets-light",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "variables": {},
    "styles": [{
        "id": "block_boundary",
        "style": [{
            "filter": "zoom>=0;zoom<=19;",
            "line-width": 2,
            "line-color": "a59f80",
        }]
    }, {
        "id": "block_name",
        "style": [{
            "text-name": "NAME",
            "text-fill": "#496588",
            "text-halo-fill": "rgba(255, 255, 255, 0.5)",
            "text-halo-radius": 2,
            "text-force-horizontal-for-line": false,
            "style": [{
                "filter": "zoom>=3;zoom<=19;",
                "text-font": "oblique 600 16px Arial, Helvetica, sans-serif",
            }]
        }]
    }],
    "sources": [{
        "id": "block_source",
        "url": "../data/label.json",
        "type": "GeoJSON",
        "dataProjection": "EPSG:3857",
        "featureProjection": "EPSG:4326"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "block_source",
        "styles": [
            "block_boundary", "block_name"
        ]
    }]
};

// This style is for the hotel poi layer, which displays the hotel poi points.
const hotelPoiStyle = {
    "id": "hotel",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "variables": {},
    "styles": [{
        "id": "poi_icon",
        "point-type": "glyph",
        "point-glyph": "vectormap-icons",
        "point-size": 22,
        "point-fill": "#ed0e0e",
        "style": [{
            "filter": "zoom>=0;zoom<=19",
            "point-glyph-name": "\ue082"
        }]
    }],
    "sources": [{
        "id": "block_source",
        "url": "../data/hotels.json",
        "type": "GeoJSON",
        "dataProjection": "EPSG:3857",
        "featureProjection": "EPSG:4326"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "block_source",
        "styles": [
            "poi_icon"
        ]
    }]
};

// Create base map layer by using the pre-defined style.
let baseMapLayer = new ol.mapsuite.VectorLayer(baseLayerStyle, {
    multithread: false
});

// Create hotel poi layer by using the pre-defined style.
let hotelPoiLayer = new ol.mapsuite.VectorLayer(hotelPoiStyle, {
    multithread: false
});


/*---------------------------------------------*/
// 3. Map Control Setup
/*---------------------------------------------*/

// Now, we'll set up the map control and add the pre-defined layers to our map.

// Create and initialize our map.
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,    
    // States that the HTML tag with id="map" should serve as the container for our map.
    target: 'map',
    // Add our previously-defined two layers to the map.
    layers: [baseMapLayer,hotelPoiLayer],
    // Create a default view for the map when it starts up.
    view: new ol.View({
        // Center the map on Frisco, TX and start at zoom level 16.
        center: ol.proj.fromLonLat([-96.820787, 33.098294]),
        maxResolution: 40075016.68557849 / 512,
        zoom: 16,
        minZoom: 0,
        maxZoom: 19       
    }),
});

// Add a button to the map that lets us toggle full-screen display mode.
map.addControl(new ol.control.FullScreen());
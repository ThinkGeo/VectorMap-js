/*===========================================================================*/
// Style Lines from GeoJSON
// Sample map by ThinkGeo
// 
//   1. Layers Setup
//   2. Map Control Setup
/*===========================================================================*/


/*---------------------------------------------*/
// 1. Layers Setup
/*---------------------------------------------*/

// First, the map is a combanation of three layers. So we have to set up three styles
// and the three corresponding layers: 
//    1. baseMapLayer
//    2. countryNameLayer
//    3. riverLayer
// For more info about the StyleJSON, see our wiki: 
// https://wiki.thinkgeo.com/wiki/thinkgeo_stylejson
const baseMapStyleJson = {
    "id": "europe",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "styles": [{
        "id": "country",
        "style": [{
            "filter": "zoom>=0;zoom<=18;",
            "polygon-fill": "#25273e"
        }]
    },
    {
        "id": "country_boundary",
        "style": [{
            "filter": "zoom>=0;zoom<=3;",
            "line-width": 1,
            "line-color": "rgba(255, 255, 255, 0.4)",
        },
        {
            "filter": "zoom>=4;zoom<=18;",
            "line-width": 1,
            "line-color": "rgba(255, 255, 255, 0.6)",
        }
        ]
    }, {
        "id": "country_name",
        "style": [{
            "text-name": "NAME",
            "text-wrap-width": 20,
            "text-fill": "#fff",
            "text-halo-fill": "#ed6c82",
            "text-halo-radius": 2,
            "style": [{
                "filter": "zoom>=3;zoom<=18;",
                "text-font": "18px Calibri,sans-serif",
            }]
        }]
    }
    ],
    "sources": [{
        "id": "data_source",
        "url": "../data/europe.json",
        "type": "GeoJSON"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "data_source",
        "styles": [
            "country", "country_boundary", "country_name"
        ]
    }]
};

const countryNameStyleJson = {
    "id": "europe",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "styles": [{
        "id": "country_name",
        "style": [{
            "text-name": "NAME",
            "text-wrap-width": 20,
            "text-fill": "#fff",
            "text-halo-fill": "#ed6c82",
            "text-halo-radius": 2,
            "style": [{
                "filter": "zoom>=3;zoom<=18;",
                "text-font": "18px Calibri,sans-serif",
            }]
        }]
    }],
    "sources": [{
        "id": "data_source",
        "url": "../data/europe.json",
        "type": "GeoJSON"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "data_source",
        "styles": [
            "country_name"
        ]
    }]
}

const riverStyleJson = {
    "id": "river_style",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "styles": [{
        "id": "river",
        "style": [{
            "line-width": 5,
            "line-color": "#5482e4",
            "text-force-horizontal-for-line": 0,
        }]
    }, {
        "id": "river_name",
        "style": [{
            "text-name": "name",
            "text-wrap-width": 20,
            "text-fill": "#990100",
            "text-halo-fill": "#ed6c82",
            "text-halo-radius": 3,
            "text-font": "18px Calibri,sans-serif"
        }]
    }],
    "sources": [{
        "id": "river_source",
        "url": "../data/river.json",
        "type": "GeoJSON",
        "dataProjection": "EPSG:3857",
        "featureProjection": "EPSG:4326"
    }],
    "layers": [{
        "id": "river_layers",
        "source": "river_source",
        "styles": [
            "river", "river_name"
        ]
    }]
};

// Create layer with diiffent style json
let baseMapLayer = new ol.mapsuite.VectorLayer(baseMapStyleJson, {
    multithread: false
});

let countryNameLayer = new ol.mapsuite.VectorLayer(countryNameStyleJson, {
    multithread: false
});

let riverLayer = new ol.mapsuite.VectorLayer(riverStyleJson, {
    multithread: false
});


/*---------------------------------------------*/
// 2. Map Control Setup
/*---------------------------------------------*/

// Create and initialize our map.
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    // Add our previously-defined layers to the map.
    layers: [baseMapLayer, riverLayer, countryNameLayer],
    // States that the HTML tag with id="map" should serve as the container for our map.
    target: 'map',
    // Create a default view for the map when it starts up.
    view: new ol.View({
        // Center the map on Europe and start at zoom level 6.
        center: ol.proj.fromLonLat([18.79620, 50.55423]),
        maxResolution: 40075016.68557849 / 512,
        zoom: 6,
        minZoom: 0,
        maxZoom: 19
    })
});

// Add a button to the map that lets us toggle full-screen display mode.
map.addControl(new ol.control.FullScreen());

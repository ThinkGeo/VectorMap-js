//Load icon font
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

//style json
const geosjonStyle = {
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

const hotelStyleJson = {
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

//Create block line layer
let blockMapLayer = new ol.mapsuite.VectorLayer(geosjonStyle, {
    multithread: false
});

//Create hotel poi layer
let hotelLayer = new ol.mapsuite.VectorLayer(hotelStyleJson, {
    multithread: false
});

//Craete map
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [blockMapLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.820787, 33.098294]),
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 16,
        minZoom: 0,
       
    }),
});

map.addControl(new ol.control.FullScreen());

map.addLayer(hotelLayer);
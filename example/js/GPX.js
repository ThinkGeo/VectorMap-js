 //Load icon font
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

//Style json data
const gpxJonStyle =
{
    "id": "thinkgeo-world-streets-light",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "variables": {
    },
    "styles": [{
        "id": "Line",
        "style": [
            {
                "line-color": "	#00008B",
                "line-width": 3,
            },
        ]
    }, {
        "id":  "Point",
        "style": [
            {
                "point-type": "symbol",
                "point-symbol-type": "circle",
                "point-outline-color": "#ed6c82",
                "point-outline-width": 2,
                "point-fill": "#990100",
                "point-size": 16,
                
                 
            },
        ]
    },


    ],
    "sources": [{
        "id": "countries_source",
        "url": "../data/fells_loop.gpx",
        "type": "GPX"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "countries_source",
        "styles": [
            "Line", "Point"
        ]
    }]
}
const styleJson = {
    light: 'https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json',
}
const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~'


let light = new ol.mapsuite.VectorTileLayer(styleJson.light, {
    apiKey: apiKey,
    layerName: 'light'
});


let gpxVectorLayer = new ol.mapsuite.VectorLayer(gpxJonStyle, {
    multithread: false
})

//Create view
let view = new ol.View({
    center: [-7916041.528716288, 5228379.045749711],
    maxZoom: 19,
    maxResolution: 40075016.68557849 / 512,
    zoom: 13,
   
});

//Create Map
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    target: 'map',
    layers: [
        light, gpxVectorLayer
    ],
    view: view,
    loadTilesWhileInteracting: true,
    loadTilesWhileAnimating: true
});

map.addControl(new ol.control.FullScreen());
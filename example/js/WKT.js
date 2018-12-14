//load font
WebFont.load({
    custom: {
        families: ['vectormap-icons'],
        urls: ['https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css']
    }
});

// Style json
const WKTstyleJson =
{
    "id": "thinkgeo-world-streets-light",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "variables": {
    },
    "styles": [{
        "id": "country",
        "style": [
            {
                "polygon-fill": "rgba(241,47,110,0.5)"
            },
        ]
    },
    ],
    "sources": [{
        "id": "countries_source",
        "url": "https://thinkgeo.github.io/vectormapsample/data/map.wkt",
        "type": "WKT",
        "dataProjection":"EPSG:4326",
        "featureProjection":"EPSG:3857"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "countries_source",
        "styles": [
            "country"
        ]
    }] 
}

const styleJson = {
    light: 'https://cdn.thinkgeo.com/worldstreets-styles/1.0.0-beta009/light.json',
}
const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~'

//Base map layer
let light = new ol.mapsuite.VectorTileLayer(styleJson.light, {
    apiKey: apiKey,
    layerName: 'light'
});

let wktVectorLayer = new ol.mapsuite.VectorLayer(WKTstyleJson, {
    multithread: false
})

//Create view
let view = new ol.View({
    center: ol.proj.fromLonLat([-86.79620, 32.79423]),
    zoom: 7,
    maxZoom: 19,
});


//Create map
let map =  new ol.Map({                         
    loadTilesWhileAnimating: true,                         
    loadTilesWhileInteracting: true,
    target: 'map',
    layers: [
        light, wktVectorLayer,
    ],
    view: view,
    loadTilesWhileInteracting: true,
    loadTilesWhileAnimating: true
});
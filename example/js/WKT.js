const geosjonStyle =
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
        "url": "../data/map.wkt",
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
    light: 'https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json',
}
const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~'

let light = new ol.mapsuite.VectorTileLayer(styleJson.light, {
    apiKey: apiKey,
    layerName: 'light'
});

let geoVectorLayer = new ol.mapsuite.VectorLayer(geosjonStyle, {
    multithread: false
})

let view = new ol.View({
    center: ol.proj.fromLonLat([-86.79620, 32.79423]),
    zoom: 7,
    maxZoom: 19,
});



let map = new ol.Map({
    target: 'map',
    layers: [
        light, geoVectorLayer,
    ],
    view: view,
    loadTilesWhileInteracting: true,
    loadTilesWhileAnimating: true
});
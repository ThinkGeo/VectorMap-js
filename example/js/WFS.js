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
                "line-color": "#ff00ff",
                "line-width": 2,
            },
        ]
    },

    ],
    "sources": [{
        "id": "countries_source",
        "url": "https://ahocevar.com/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=osm:water_areas&outputFormat=application/json&srsname=EPSG:3857&bbox=-8948502.010602657,5370465.607316485,-8869275.030785069,5393396.715802036,EPSG:3857",
        "type": "WFS",
        "dataProjection": "EPSG:3857"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "countries_source",
        "styles": [
            "country"
        ]
    }]
}

let satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud3.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg"
            + "?apiKey=WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~",
    }),
});

let geoVectorLayer = new ol.mapsuite.VectorLayer(geosjonStyle, {
    multithread: false
})

let view = new ol.View({
    center: [-8908887.277395891, 5381918.072437216],
    maxZoom: 19,
    zoom: 12,
    progressiveZoom: false,

});

let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    target: 'map',
    layers: [
        satelliteLayer, geoVectorLayer
    ],
    view: view,
    loadTilesWhileInteracting: true,
    loadTilesWhileAnimating: true
});
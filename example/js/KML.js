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
        "filter": "name='Simme'",
        "style": [{
            "line-color": "#f0eee8",
            "line-width": 10
        }
        ]
    }],
    "sources": [{
        "id": "countries_source",
        "url": "../data/2012-02-10.kml",
        "type": "KML"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "countries_source",
        "styles": [
            "country"
        ]
    }]
}



let geoVectorLayer = new ol.mapsuite.VectorLayer(geosjonStyle, {
    multithread: false
})

let view = new ol.View({
    center: [876970.8463461736, 5859807.853963373],
    zoom: 10,
    maxZoom: 19,
    maxResolution: 40075016.68557849 / 512
});

 

let map = new ol.Map({
    target: 'map',
    layers: [
        geoVectorLayer
    ],
    view: view,
    loadTilesWhileInteracting: true,
    loadTilesWhileAnimating: true
});
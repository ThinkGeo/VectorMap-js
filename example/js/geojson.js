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
        "style": [{
            "filter": "zoom>=0;zoom<=3;",
            "polygon-fill": "#b3b9f5"
        },
        {
            "filter": "zoom>=4;zoom<=22;",
            "polygon-fill": "#6066a9"
        }]
    },
    {
        "id": "country_boundary",
        "style": [{
            "filter": "zoom>=0;zoom<=3;",
            "line-width": 3,
            "line-color": "rgba(0, 0, 0, 0.4)",
        },
        {
            "filter": "zoom>=4;zoom<=22;",
            "line-width": 3,
            "line-color": "rgba(0, 0, 0, 0.6)",
        }]
    }, {
        "id": "country_name",
        "style": [{
            "text-name": "name",
            "text-wrap-width": 20,
            "text-fill": "#496588",
            "text-halo-fill": "rgba(255, 255, 255, 0.5)",
            "text-halo-radius": 2,
            "text-font": "oblique 600 16px Arial, Helvetica, sans-serif"

        }
        ]
    }],
    "sources": [{
        "id": "countries_source",
        "url": "../data/countries.json",
        "type": "GeoJSON"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "countries_source",
        "styles": [
            "country", "country_boundary", "country_name"
        ]
    }]
}



let geoVectorLayer = new ol.mapsuite.VectorLayer(geosjonStyle, {
    multithread: false
})

let view = new ol.View({
    center: ol.proj.fromLonLat([-96.79620, 32.79423]),
    zoom: 3,
    minZoom: 2,
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
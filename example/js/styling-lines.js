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

const countryNameStyle = {
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

let baseMapLayer = new ol.mapsuite.VectorLayer(baseMapStyleJson, {
    multithread: false
});

let countryNameLayer = new ol.mapsuite.VectorLayer(countryNameStyle, {
    multithread: false
});

let riverLayer = new ol.mapsuite.VectorLayer(riverStyleJson, {
    multithread: false
});

let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [baseMapLayer, riverLayer, countryNameLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([18.79620, 50.55423]),
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 6,
        minZoom: 0,
    }),
});

map.addControl(new ol.control.FullScreen());
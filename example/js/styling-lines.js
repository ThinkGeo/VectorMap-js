WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const baseMapStyle = {
    "id": "europe",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "styles": [{
            "id": "country",
            "style": [{
                "filter": "zoom>=0;zoom<=18;",
                "polygon-fill": "#f3b600"
            }]
        },
        {
            "id": "country_boundary",
            "style": [{
                    "filter": "zoom>=0;zoom<=3;",
                    "line-width": 2,
                    "line-color": "rgba(255, 255, 255, 0.4)",
                },
                {
                    "filter": "zoom>=4;zoom<=18;",
                    "line-width": 3,
                    "line-color": "rgba(255, 255, 255, 0.6)",
                }
            ]
        }, {
            "id": "country_name",
            "style": [{
                "text-name": "NAME",
                "text-wrap-width": 20,
                "text-fill": "#990100",
                "text-halo-fill": "#fff",
                "text-halo-radius": 3,
                "style": [{
                    "filter": "zoom>=3;zoom<=18;",
                    "text-font": "16px Calibri,sans-serif",
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

const riverStyle = {
    "id": "river_style",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "styles": [{
        "id": "river",
        "style": [{
            "line-width": 2,
            "line-color": "#4e81a5",
            "text-force-horizontal-for-line": 0,
        }]
    }, {
        "id": "river_name",
        "style": [{
            "text-name": "name",
            "text-fill": "#f00",
            "text-halo-radius": 3,
            "text-halo-fill": "#fff",
            "text-font": "14px Calibri,sans-serif"
        }]
    }],
    "sources": [{
        "id": "river_source",
        "url": "../data/river.json",
        "type": "GeoJSON",
        "dataProjection":"EPSG:3857",
        "featureProjection":"EPSG:4326"
    }],
    "layers": [{
        "id": "river_layers",
        "source": "river_source",
        "styles": [
            "river", "river_name"
        ]
    }]
};

let baseMapLayer = new ol.mapsuite.VectorLayer(baseMapStyle, {
    multithread: false
});

let riverLayer = new ol.mapsuite.VectorLayer(riverStyle, {
    multithread: false
});

let map = new ol.Map({
    layers: [baseMapLayer,riverLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([18.79620, 50.55423]),
        zoom: 7,
        minZoom: 0,
        maxZoom: 18
    }),
});
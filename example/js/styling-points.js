
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json";

const worldstreets = new ol.mapsuite.VectorTileLayer(worldstreetsStyle,
    {
        apiKey: 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~'      // please go to https://cloud.thinkgeo.com to create
    });


const geosjonStyle = {
    "id": "Frisco-school-poi",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "background": "#aac6ee",
    "variables": {},
    "styles": [{
        "id": "poi_icon",
        "point-type": "glyph",
        "point-glyph": "vectormap-icons",
        "point-fill": "#439c3c",
        "point-size": 22,
        "line-width": 3,
        "line-color": "rgba(255, 255, 255, 0.6)",
        // "point-glyph-name": "\e0a8",
        "point-outline-color": "#ffffff",
        "point-outline-width": 3,
        // "style": [{
        //     "style": [{
        //         "point-fill": "5d869b",
        //         "point-glyph-name": "\e0a8"
        //     }]
        // }]
           
        },
        {
            "id": "country_name",
            "style": [{
                "text-name": "NAME",
                "text-wrap-width": 20,
                "text-fill": "#496588",
                "text-halo-fill": "rgba(255, 255, 255, 0.5)",
                "text-halo-radius": 2,
                "style": [
                    {
                        "filter": "zoom>=3;zoom<=22;",
                        "text-font": "oblique 600 16px Arial, Helvetica, sans-serif",
                    }
                ]
            }]
        }
    ],
    "sources": [{
        "id": "school_source",
        "url": "../data/Frisco-school-poi.geojson",
        "type": "GeoJSON",
        "dataProjection":"EPSG:3857",
        "featureProjection":"EPSG:4326"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "school_source",
        "styles": [
            "poi_icon","country_name"
        ]
    }]
}

let pointLayer = new ol.mapsuite.VectorLayer(geosjonStyle, {
    multithread: false
})

let map = new ol.Map({
    layers: [pointLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.79620, 33.15423]),
        zoom: 14,
    }),
});



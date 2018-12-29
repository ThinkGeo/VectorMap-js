const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0-beta009/light.json";

const worldstreets = new ol.mapsuite.VectorTileLayer(worldstreetsStyle, {
    apiKey: 'Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~' // please go to https://cloud.thinkgeo.com to create
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
            "point-size": 36,
            "point-outline-color": "#ffffff",
            "point-outline-width": 3,
            "point-fill": "#ff6666",
            "point-mask-outline-width": 1,
            "point-glyph-mask-type": "circle",
            "point-glyph-mask-color": "#5dc33f",
            "style": [{
                "filter": "SUBTYPE=2",
                "point-fill": "#FF0000",
                "point-glyph-name": "\ue0aa"

            }, {
                "filter": "SUBTYPE=3",
                "point-fill": "#000080",
                "point-glyph-name": "\ue0a8"

            }, {
                "filter": "SUBTYPE=5",
                "point-fill": "#4B0080",
                "point-glyph-name": "\ue0ab"
            }, {
                "filter": "SUBTYPE=7",
                "point-fill": "#800000",
                "point-glyph-name": "\ue0ab"
            }]
        },
        {
            "id": "poi_name",
            "style": [{
                "text-name": "NAME",
                "text-wrap-width": 40,
                "text-fill": "#496588",
                "text-halo-fill": "rgba(255, 255, 255, 0.5)",
                "text-halo-radius": 2,
                "text-font": "oblique 600 10px Arial, Helvetica, sans-serif",
            }]
        }
    ],
    "sources": [{
        "id": "school_source",
        "url": "../data/Frisco-school-poi.geojson",
        "type": "GeoJSON",
        "dataProjection": "EPSG:3857",
        "featureProjection": "EPSG:4326"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "school_source",
        "styles": [
            "poi_icon", "poi_name"
        ]
    }]
}

let pointLayer = new ol.mapsuite.VectorLayer(geosjonStyle, {
    multithread: false
})

let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [worldstreets, pointLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.79620, 33.15423]),
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 13,
    }),
});

map.addControl(new ol.control.FullScreen());
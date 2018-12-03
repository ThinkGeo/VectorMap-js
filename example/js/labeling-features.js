
const geosjonStyle = {
    "id": "thinkgeo-world-streets-light",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "variables": {},
    "styles": [
        {
            "id": "block_boundary",
            "style": [{
                    "filter": "zoom>=0;zoom<=22;",
                    "line-width": 2,
                    "line-color": "a59f80",
                }
            ]
        }, {
            "id": "block_name",
            "style": [{
                "text-name": "NAME",
              
                "text-fill": "#496588",
                "text-halo-fill": "rgba(255, 255, 255, 0.5)",
                "text-halo-radius": 2,
                "text-force-horizontal-for-line": false,
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
        "id": "block_source",
        "url": "../data/label.json",
        "type": "GeoJSON",
        "dataProjection":"EPSG:3857",
        "featureProjection":"EPSG:4326"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "block_source",
        "styles": [
            "block_boundary", "block_name"
        ]
    }]
}

let blockMapLayer = new ol.mapsuite.VectorLayer(geosjonStyle, {
    multithread: false
})



let map = new ol.Map({
    layers: [blockMapLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.820787, 33.098294]),
        zoom: 17,
    }),
});









 
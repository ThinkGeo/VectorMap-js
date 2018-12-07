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
                "line-color": "#635B5A",
                "line-width": 1,
            },
        ]
    },
    {
        "id": "continent",
        "style": [{
            "filter": "name='South Dakota,Tennessee,Texas,Utah,Vermont,Virginia,Washington,West Virginia,Wisconsin,Wyoming'",
            "style": [
                {
                    "polygon-fill": "#4c79c1",
                }
            ]
        },
        {
            "filter": "name='Alabama,Alaska,Arizona,Arkansas,California,Colorado,Connecticut,Delaware,District of Columbia,Florida,Georgia,Hawaii,Idaho,Illinois,Indiana,Iowa,Kansas,Kentucky,Louisiana,Maine,Maryland'",
            "style": [
                {
                    "polygon-fill": "rgb(121, 166, 238)",
                }
            ]
        }, {
            "filter": "name='Massachusetts,Michigan,Minnesota,Mississippi,Missouri,Montana,Nebraska,Nevada,New Hampshire,New Jersey,New Mexico,New York,North Carolina,North Dakota,Ohio,Oklahoma,Oregon,Pennsylvania,Rhode Island,South Carolina'",
            "style": [
                {
                    "polygon-fill": "#25529a"
                }
            ]
        }
        ]
    }, {
        "id": "continent_name",
        "style": [{
            "text-name": "name",
            "text-wrap-width": 20,
            "text-fill": "#496588",
            "text-halo-fill": "#b1dff5",
            "text-halo-radius": 2,
            "style": [
                {
                    "filter": "zoom>=0;zoom<=22;",
                    "text-font": "oblique 600 16px Arial, Helvetica, sans-serif",
                }
            ]
        }]
    }
    ],
    "sources": [{
        "id": "countries_source",
        "url": "../data/map.kml",
        "type": "KML"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "countries_source",
        "styles": [
            "continent", "country","continent_name"
        ]
    }]
}



let geoVectorLayer = new ol.mapsuite.VectorLayer(geosjonStyle, {
    multithread: false
})

let view = new ol.View({
    center: ol.proj.fromLonLat([-96.79620, 37.79423]),
    zoom: 5,
    maxZoom: 19,
});

let map = new ol.Map({
    loadTilesWhileAnimating: true, loadTilesWhileInteracting: true,
    target: 'map',
    layers: [
        geoVectorLayer
    ],
    view: view,
    loadTilesWhileInteracting: true,
    loadTilesWhileAnimating: true
}); 
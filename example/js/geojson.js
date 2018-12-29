//style json
const geosjonStyle = {
    "id": "thinkgeo-world-streets-light",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "variables": {},
    "styles": [{
            "id": "country",
            "style": [{
                "filter": "zoom>=0;zoom<=22;",
                "polygon-fill": "#0073ba"
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
                    "filter": "zoom>=4;zoom<=22;",
                    "line-width": 2,
                    "line-color": "rgba(255, 255, 255, 0.6)",
                }
            ]
        }, {
            "id": "country_name",
            "style": [{
                "text-name": "name",
                "text-wrap-width": 20,
                "text-fill": "#496588",
                "text-halo-fill": "#b1dff5",
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

//mapsuite vectorLayer
let geoVectorLayer = new ol.mapsuite.VectorLayer(geosjonStyle, {
    multithread: false
})

//create view
let view = new ol.View({
    center: ol.proj.fromLonLat([18.79620, 45.55423]),   
     maxZoom: 19,
     maxResolution: 40075016.68557849 / 512,
     zoom: 3,
    minZoom: 1,
 
    maxResolution: 40075016.68557849 / 512
});

//creat map
let map =  new ol.Map({                         
    loadTilesWhileAnimating: true,                         
    loadTilesWhileInteracting: true,
    target: 'map',
    layers: [
        geoVectorLayer
    ],
    view: view,
    loadTilesWhileInteracting: true,
    loadTilesWhileAnimating: true
});

map.addControl(new ol.control.FullScreen());
let geosjonStyle =
{
    "id": "thinkgeo-world-streets-light",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#02BFFF",
    "variables": {},
    "styles": [{
        "id": "country",
        "style": [{
            "filter": "zoom>=0;zoom<=22;",
            "polygon-fill": "#02BFFF"
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
            "line-width": 1,
            "line-color": "rgba(255, 255, 255, 0.6)",
        }
        ]
    }, {
        "id": "country_name",
        "style": [{
            "text-name": "name",
            "text-wrap-width": 1,
            "text-fill": "#496588",
            "text-halo-fill": "rgba(255, 255, 255, 0.5)",
            "text-halo-radius": 1,
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
        "url": "https://thinkgeo.github.io/vectormapsample/data/countries.json",
        "type": "GeoJSON",
        "dataProjection": "EPSG:4326",
        "featureProjection": ""
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "countries_source",
        "styles": [
            "country", "country_boundary", "country_name"
        ]
    }]
}


proj4.defs('ESRI:53009', '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 ' +
    '+b=6371000 +units=m +no_defs');
proj4.defs("ESRI:54003", "+proj=mill +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +R_A +datum=WGS84 +units=m +no_defs");
ol.proj.proj4.register(proj4);

let sphereMollweideProjection = new ol.proj.Projection({
    code: 'ESRI:53009',
    extent: [-9009954.605703328, -9009954.605703328,
        9009954.605703328, 9009954.605703328],
    worldExtent: [-179, -89.99, 179, 89.99]
});
let sphereMillerProjection = new ol.proj.Projection({
    code: 'ESRI:54003',
    extent: [-9009954.605703328, -9009954.605703328,
        9009954.605703328, 9009954.605703328],
    worldExtent: [-179, -89.99, 179, 89.99]
});
let mercatorView = new ol.View({
    center: ol.proj.fromLonLat([10.051631, 30.179598]),
    projection: 'EPSG:3857',
    zoom: 2.4
});
let mollweideView = new ol.View({
    center: [0, 0],
    projection: sphereMollweideProjection,
    resolutions: [65536, 32768, 16384, 8192, 4096, 2048],
    zoom: 1.2
})
let millerView = new ol.View({
    center: ol.proj.fromLonLat([10.051631, 26.179598]),
    projection: sphereMillerProjection,
    resolutions: [65536, 32768, 16384, 8192, 4096, 2048],
    zoom: 1.2
})

let equirectangularView = new ol.View({
    center: [0, 0],
    projection: 'EPSG:4326',
    zoom: 2.4
});

let map = new ol.Map({
    keyboardEventTarget: document,
    layers: [],
    target: 'map',

});
let graticule = new ol.Graticule(
    {
        'map': map,
        'strokeStyle': new ol.style.Stroke({
            color: 'rgba(255,255,255,0.9)',
            width: 1,
            lineDash: [0.5, 4]
        }),
    }
);
let updateViewProjection = () => {
    map.getLayers().getArray().forEach(layer => {
        map.removeLayer(layer);
    });
    geosjonStyle.sources[0].featureProjection = projection.value
    map.addLayer(
        new ol.mapsuite.VectorLayer(geosjonStyle, {
            multithread: false, 
        })
    )
    let newView = null;
    switch (projection.value) {
        case 'EPSG:4326': newView = equirectangularView; break;
        case 'EPSG:3857': newView = mercatorView; break;
        case 'ESRI:54003': newView = millerView; break;
        case 'ESRI:54009': newView = mollweideView; break;
    }
    map.setView(newView);
}
projection.onchange = function () {
    updateViewProjection();
};
updateViewProjection();
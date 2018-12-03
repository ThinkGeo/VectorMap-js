let geosjonStyle =
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
        "type": "GeoJSON",
        // "dataProjection":null,
        // "featureProjection":"EPSG:3857"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "countries_source",
        "styles": [
            "country", "country_boundary", "country_name"
        ]
    }]
}

let light = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png?apiKey=v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~`,
        tileSize: 512,
    }),
    layerName: 'light'
});

proj4.defs("ESRI:54003","+proj=mill +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +R_A +datum=WGS84 +units=m +no_defs");
ol.proj.proj4.register(proj4);

let geoVectorLayer = new ol.mapsuite.VectorLayer(geosjonStyle, {
    multithread: false,
    
})

let projection=document.getElementById('projection');
projection.onchange = function() {
    updateViewProjection();
};

let map = new ol.Map({
    target: 'map',
    layers: [
        light
    ],
    view: new ol.View({
        // projection: 'EPSG:3857',
        center: [0, 0],
        zoom: 1.5
    })
});

function updateViewProjection() {
    var newProj = ol.proj.get(projection.value);
    var newProjExtent = newProj.getExtent();
    var newView = new ol.View({
      projection: newProj,
      center: ol.extent.getCenter(newProjExtent || [0, 0, 0, 0]),
      zoom: 1.5,
      extent: newProjExtent || undefined
    });
    map.setView(newView);
  }
  projection.onchange = function() {
    updateViewProjection();
  };

  updateViewProjection();
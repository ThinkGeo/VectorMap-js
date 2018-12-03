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

// proj4.defs("ESRI:54010","+proj=eck6 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs");
// proj4.defs("EPSG:4326","+proj=longlat +datum=WGS84 +no_defs");
proj4.defs("ESRI:54003","+proj=mill +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +R_A +datum=WGS84 +units=m +no_defs");

ol.proj.proj4.register(proj4);



let geoVectorLayer = new ol.mapsuite.VectorLayer(geosjonStyle, {
    multithread: false
})

let projection=document.getElementById('projection');
projection.onchange = function() {
    updateViewProjection();
};

let map = new ol.Map({
    target: 'map',
    layers: [
        geoVectorLayer
    ],
    view: new ol.View({
        projection: 'EPSG:3857',
        center: [0, 0],
        zoom: 2
    })
});

function updateViewProjection() {
    var newProj = ol.proj.get(projection.value);
    var newProjExtent = newProj.getExtent();
    var newView = new ol.View({
      projection: newProj,
      center: ol.extent.getCenter(newProjExtent || [0, 0, 0, 0]),
      zoom: 0,
      extent: newProjExtent || undefined
    });
    map.setView(newView);

    // Example how to prevent double occurrence of map by limiting layer extent
    // if (newProj == ol.proj.get('EPSG:3857')) {
    //   layers['bng'].setExtent([-1057216, 6405988, 404315, 8759696]);
    // } else {
    //   layers['bng'].setExtent(undefined);
    // }
  }


  /**
   * Handle change event.
   */
  projection.onchange = function() {
    updateViewProjection();
  };

  updateViewProjection();
var view = new ol.View({
    //center: [0, 0],
    //center: [-10784844.42768457, 4989250.967286606],// poi
    //center: [-8232679.211417493, 4963666.086553334],// NY
    center: [-10776351.166102841, 3864500.475986851],// dallas road
    //center: [-10796026.396196617, 5003517.396574807],// country_name
    //center: [-10783010.162497278, 3862161.525031017],// road text 16
    //center:[-10787223.389888179, 3863490.4854171653], // road label 14
    //center: [-8051563.931156208, 6108477.916978194], // ol polygon 8
    //center:[-15008563.377850933, 4304933.433021126], // country polygon
    zoom: 12,
    maxZoom: 19,
    maxResolution: 40075016.68557849 / 512,
    progressiveZoom: true
});
var zoom = view.getZoom();
document.getElementById("olzoom").innerHTML = "Zoom:" + (zoom);
view.on("change:resolution", function (e) {
    var zoom = view.getZoom();
    if ((zoom.toString()).indexOf(".") > 0) {
        zoom = zoom.toFixed(2);
    }
    document.getElementById("olzoom").innerHTML = "Zoom:" + (zoom);
});

var worldStreetsLayer = new ol.thinkgeo.VectorTileLayer("thinkgeo-world-streets-light-new.json", {
    declutter: true,
    multithread: true,
    minimalist: true,
    //apiKey: "GoE6l7_Ji_JfDnUhby9awntg9Pi1MABMYv0J6cNTPzY~"
});

var vectorPolygons = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: 'https://openlayers.org/en/v4.6.5/examples/data/geojson/polygon-samples.geojson',
        format: new ol.format.GeoJSON()
    }),
});

var mapboxLayer = new ol.layer.VectorTile({
    declutter: true,
    source: new ol.source.VectorTile({
        format: new ol.format.MVT({
            featureClass: ol.Feature
        }),
        url: "https://c.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoiYWhvY2V2YXIiLCJhIjoiY2pzbmg0Nmk5MGF5NzQzbzRnbDNoeHJrbiJ9.7_-_gL8ur7ZtEiNwRfCy7Q"
    }),
    style:function(f,r){
        if(f.getGeometry().getType()=='Polygon')
        {
            return new ol.style.Style({
                stroke:new ol.style.Stroke({
                    color:"red",
                    width:1
                })
            })
        }
      
    }
})


var olWorldStreetMap = new ol.layer.VectorTile({
    declutter: true,
    source: new ol.source.VectorTile({
        format: new ol.format.MVT({
            featureClass: ol.Feature
        }),
        url: "https://c.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoiYWhvY2V2YXIiLCJhIjoiY2pzbmg0Nmk5MGF5NzQzbzRnbDNoeHJrbiJ9.7_-_gL8ur7ZtEiNwRfCy7Q"
    }),
    style:function(f,r){
        if(f.getGeometry().getType()=='Polygon')
        {
            return new ol.style.Style({
                stroke:new ol.style.Stroke({
                    color:"red",
                    width:1
                })
            })
        }
      
    }
})

var layer = new ol.layer.Tile({
    source: new ol.source.OSM()
  });

var debugLayer = new ol.layer.Tile({
    source: new ol.source.TileDebug({
        projection: "EPSG:3857",
        tileGrid: mapboxLayer.getSource().getTileGrid()
    })
});

var vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: function (feature, resolution) {
        return new ol.style.Style({
            stroke:new ol.style.Stroke({
                color:"red",
                width:1
            })
        })
    }
})
vectorLayer.getSource().addFeature(new ol.Feature(new ol.geom.Point([-10783941.374986181, 4990142.424126486])))

var map = new ol.Map({
    layers: [worldStreetsLayer, vectorLayer,debugLayer],
    target: 'map',
    view: view,
    renderer: 'webgl',
    loadTilesWhileInteracting: true
});

map.on("click", function showInfo(event) {
    var features = map.getFeaturesAtPixel(event.pixel);

    if (!features) {
        info.innerText = '';
        info.style.opacity = 0;
    }
    else {
        var properties = features[0].getProperties();
        delete properties["geometry"];
        info.innerText = JSON.stringify(properties, null, 2);
        info.style.opacity = 1;
    }


    if (features) {
        for (let index = 0; index < features.length; index++) {
            const element = features[index];
            console.log(element["styleId"]);
        }
        vectorLayer.getSource().clear();
        vectorLayer.getSource().addFeatures(features);
    }
    else
    {
        vectorLayer.getSource().clear();
    }
})
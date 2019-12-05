var view = new ol.View({
    //center: [0, 0],
    //center: [-10784844.42768457, 4989250.967286606],// poi
    //center: [-8231292.426002176, 4952348.061687753],// NY
    //center:[-8186799.75338646, 4952102.791557407],// NY road label reverse
    //center: [-10780142.293364197, 3888254.56808908],// dallas road 
    //center: [-10796026.396196617, 5003517.396574807],// country_name
    //center: [-10783010.162497278, 3862161.525031017],// road text 16
    //center :[-10782797.10767367, 3865969.721878732], // road name and one way icon
    //center:[-10787223.389888179, 3863490.4854171653], // road label 14
    //center: [-8051563.931156208, 6108477.916978194], // ol polygon 8
    //center:[-15008563.377850933, 4304933.433021126], // country polygon

    // center:[-10781710.09549699, 3888480.3828394795],// road clip issue zoom 17.
    // center:[-10777094.140020758, 3865651.7722501396], 
    center:[-10776404.929903472, 3866030.036479002],
    zoom: 19,
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
    style: function (f, r) {
        if (f.getGeometry().getType() == 'Polygon') {
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: "red",
                    width: 1
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
    style: function (f, r) {
        if (f.getGeometry().getType() == 'Polygon') {
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: "red",
                    width: 1
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
            stroke: new ol.style.Stroke({
                color: "red",
                width: 1
            })
        })
    }
})
vectorLayer.getSource().addFeature(new ol.Feature(new ol.geom.Point([-10783941.374986181, 4990142.424126486])))

var lineStyle= new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: "blue",
        width: 4
    })
});

var layer = new ol.layer.VectorTile({
    source: new ol.source.VectorTile({
        format: new ol.format.MVT({
            featureClass:ol.Feature
        }),
        url: 'http://localhost:1314/tile/{z}/{x}/{y}'
    }),
    renderMode: "vector",
    style:function(f,r)
    {
        if(f.get('layer')==='road'&&f.get('class')==='motorway_link')
        {
            return lineStyle
        }
    }
});

var map = new ol.Map({
     layers: [worldStreetsLayer, vectorLayer,debugLayer],
     renderer: 'webgl',

    //renderer: ['canvas'],
    //layers: [layer, vectorLayer],

    target: 'map',
    view: view,
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
        vectorLayer.getSource().addFeature(features[0]);
    }
    else {
        vectorLayer.getSource().clear();
    }
})
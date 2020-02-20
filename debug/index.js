

var view = new ol.View({
    //center:[-8186799.75338646, 4952102.791557407],zoom:17,// NY road label reverse
    //center: [-10796026.396196617, 5003517.396574807],// country_name
    //center: [-10783010.162497278, 3862161.525031017],// road text 16
    //center :[-10782797.10767367, 3865969.721878732], // road name and one way icon
    //center:[-10787223.389888179, 3863490.4854171653], // road label 14
    //center: [-8051563.931156208, 6108477.916978194], // ol polygon 8
    //center:[-15008563.377850933, 4304933.433021126], // country polygon

    //center:[-10781710.244788043, 3888472.76899487], zoom:17,// road clip issue zoom 17.
    //center:[-10774719.96412073, 3866961.8013970205],zoom:17 // footway line dash crash issue.
    //center: [-10782895.441743676, 3887414.379523998], zoom: 18,// U-turn

    //center: [-22997335.8, -3253574.954307], zoom: 17,// drawing order of road
    //center:[-22997462.8, -3250401.7], zoom:19, // drawing order of road

    //center: [-10775289.210973945, 3865761.202605083], zoom: 2, //// drawing order of road in Dallas
    //center: [-10781709.991733968, 3888501.660642869], zoom: 19, //// drawing order of road in Dallas
    //center: [-10775277.566270417, 3865890.936545674], zoom: 19,
    //center: [-10777048.158370923, 3867537.467766296], zoom: 19,
    //center:[-10777049.352699492, 3867713.631229918],zoom:16,

    //center: [-10893951.564327799, 3897504.687934755],zoom:18,
     center:[-10774544.651882764, 3866357.9649097803],zoom:1,

    // zoom: 18,
    // center: [11582817.642707704,3580985.7848741873],
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

var worldStreetsSource = new ol.thinkgeo.VectorTileSource({
    url: 'http://localhost:1314/tile/{z}/{x}/{y}'
})

var worldStreetsLayer = new ol.thinkgeo.VectorTileLayer("thinkgeo-world-streets-light-new.json", {
    mapLayerId: "worldstreets",
    minimalist:false,
    source: worldStreetsSource
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
            image: new ol.style.Circle({
                fill: new ol.style.Fill({
                    color: "red"
                }),
                radius: 10
            }),
            text: new ol.style.Text({
                fill: new ol.style.Fill({
                    color: "black"
                }),
                text: "ABC"
            }),
            stroke: new ol.style.Stroke({
                color: "red",
                width: 1
            })
        })
    }
})
vectorLayer.getSource().addFeature(new ol.Feature(new ol.geom.Point([-10783941.374986181, 4990142.424126486])))

var lineStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: "blue",
        width: 4
    })
});

var layer = new ol.layer.VectorTile({
    source: new ol.source.VectorTile({
        format: new ol.format.MVT({
            featureClass: ol.Feature
        }),
        url: 'http://localhost:1314/tile/{z}/{x}/{y}'
    }),
    renderMode: "vector",
    style: function (f, r) {
        if (f.get('layer') === 'road' && f.get('class') === 'motorway_link') {
            return lineStyle
        }
    }
});

var map = new ol.Map({
    layers: [worldStreetsLayer, vectorLayer, debugLayer],
    renderer: 'webgl',

    //renderer: ['canvas'],
    //layers: [layer, vectorLayer],

    target: 'map',
    view: view,
    loadTilesWhileInteracting: true
});

map.on("click", function showInfo(event) {
    vectorLayer.getSource().addFeature(new ol.Feature(new ol.geom.Point(event.coordinate)))

    // var features = map.getFeaturesAtPixel(event.pixel);

    // if (!features) {
    //     info.innerText = '';
    //     info.style.opacity = 0;
    // }
    // else {
    //     var properties = features[0].getProperties();
    //     delete properties["geometry"];
    //     info.innerText = JSON.stringify(properties, null, 2);
    //     info.style.opacity = 1;
    // }


    // if (features) {
    //     for (let index = 0; index < features.length; index++) {
    //         const element = features[index];
    //         console.log(element["styleId"]);
    //     }
    //     vectorLayer.getSource().clear();
    //     let olFeature = new ol.Feature({
    //         geometry: getGeometryByType(features[0].type_, features[0].flatCoordinates_, 'XY')
    //     });
    //     olFeature.getGeometry()['ends_'] = features[0].ends_;
    //     olFeature.setProperties(features[0].properties_);
    //     vectorLayer.getSource().addFeature(olFeature);
    // }
    // else {
    //     vectorLayer.getSource().clear();
    // }
})

let getGeometryByType = (type, flatCoordinates, layout) => {
    var geometry;
    layout = layout || 'XY';

    var transformedCoordinates = [];
    for (let i = 0; i < flatCoordinates.length; i += 2) {
        transformedCoordinates.push([flatCoordinates[i], flatCoordinates[i + 1]]);
    }

    switch (type) {
        case 'Point': geometry = new ol.geom.Point(flatCoordinates, layout); break;
        case 'Polygon': geometry = new ol.geom.Polygon([transformedCoordinates], layout); break;
        case 'LineString': geometry = new ol.geom.LineString(transformedCoordinates, layout); break;
        case 'MultiLineString': geometry = new ol.geom.MultiLineString([transformedCoordinates], layout); break;
        default: console.log(type);
    }

    return geometry;
};
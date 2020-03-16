var view = new ol.View({
    center:[0,0],zoom:0,
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
    url: 'http://localhost:1314/v2/tile/{z}/{x}/{y}'
})

var worldStreetsLayer = new ol.thinkgeo.VectorTileLayer("thinkgeo-world-streets-light-new.json", {
    mapLayerId: "worldstreets",
    source: worldStreetsSource
});

var layer = new ol.layer.Tile({
    source: new ol.source.OSM()
});

var debugLayer = new ol.layer.Tile({
    source: new ol.source.TileDebug({
        projection: "EPSG:3857",
        tileGrid: worldStreetsLayer.getSource().getTileGrid()
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
            }),
            stroke: new ol.style.Stroke({
                color: "red",
                width: 1
            })
        })
    }
})

var map = new ol.Map({
    layers: [worldStreetsLayer, vectorLayer, debugLayer],
    renderer:['webgl'],
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
        }
        vectorLayer.getSource().clear();
        let olFeature = new ol.Feature({
            geometry: getGeometryByType(features[0].type_, features[0].flatCoordinates_, 'XY')
        });
        olFeature.getGeometry()['ends_'] = features[0].ends_;
        olFeature.setProperties(features[0].properties_);
        vectorLayer.getSource().addFeature(olFeature);
    }
    else {
        vectorLayer.getSource().clear();
    }
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
        default: ;
    }

    return geometry;
};
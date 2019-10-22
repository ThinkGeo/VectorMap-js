var view = new ol.View({
    //center: [0, 0],
    center: [-10784844.42768457, 4989250.967286606],
    //center: [-8232679.211417493, 4963666.086553334],// NY
    //center: [-10775413.17372718, 3866116.842477651],// dallas
    //center: [2583066.0947164265, -210895.4425131777],// country_name
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

var worldStreetsLayer = new ol.mapsuite.VectorTileLayer("thinkgeo-world-streets-light.json", {
    declutter: true,
    multithread: true,
    minimalist: true,
});

var circleStyle = new ol.style.Circle({
    fill: new ol.style.Fill({
        color: '#ff00ffFF'
    }),
    radius:40
})
circleStyle.setOpacity(0.5)

var vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: new ol.style.Style({
        image: circleStyle
    })
})
vectorLayer.getSource().addFeature(new ol.Feature(new ol.geom.Point([-10784844.42768457, 4989250.967286606])))

var map = new ol.Map({
    layers: [worldStreetsLayer,vectorLayer],
    target: 'map',
    view: view,
    renderer: 'webgl',
    loadTilesWhileInteracting: true
});

// map.on("click", function showInfo(event) {
//     var features = map.getFeaturesAtPixel(event.pixel);
//     vectorLayer.getSource().clear();
//     vectorLayer.getSource().addFeatures(features);
// vectorLayer.getSource().addFeature(new ol.Feature(new ol.geom.Point(3866116.842477651,-10775413.17372718)))

//   })
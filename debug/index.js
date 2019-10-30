var view = new ol.View({
    //center: [0, 0],
    //center: [-10784844.42768457, 4989250.967286606],// poi
    //center: [-8232679.211417493, 4963666.086553334],// NY
    //center: [-10775413.17372718, 3866116.842477651],// dallas
    center: [-10796026.396196617, 5003517.396574807],// country_name
    //center: [-10783010.162497278, 3862161.525031017],// road text 16
    //center:[-10787223.389888179, 3863490.4854171653], // road label 14
    zoom: 1,
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
    radius: 40
})
circleStyle.setOpacity(0.5)

var vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector()
})
vectorLayer.getSource().addFeature(new ol.Feature(new ol.geom.Point([-10784844.42768457, 4989250.967286606])))

var map = new ol.Map({
    layers: [ worldStreetsLayer,vectorLayer],
    target: 'map',
    view: view,
    renderer: 'webgl',
    loadTilesWhileInteracting: true
});

map.on("click", function showInfo(event) {
    var features = map.getFeaturesAtPixel(event.pixel);
    if (features) {
        for (let index = 0; index < features.length; index++) {
            const element = features[index];
            console.log(element["styleId"]);
            
        }
        vectorLayer.getSource().clear();
        vectorLayer.getSource().addFeatures(features);
    }
})
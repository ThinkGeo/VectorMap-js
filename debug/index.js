var view = new ol.View({
    center: [-10784739.476061746, 4989285.901397186],
    //center: [-8232679.211417493, 4963666.086553334],// NY
    //center: [-10775517.886785883, 3866095.7412080616],// dallas
    //center: [2583066.0947164265, -210895.4425131777],// country_name
    zoom: 5,
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

var map = new ol.Map({
    layers: [worldStreetsLayer],
    target: 'map',
    view: view,
    renderer: 'webgl',
    loadTilesWhileInteracting: true
});
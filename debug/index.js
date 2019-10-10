var view = new ol.View({
    center: [-10784739.476061746, 4989285.901397186],
    zoom: 5,
    maxZoom: 19,
    maxResolution: 40075016.68557849 / 512
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
    layers: [ worldStreetsLayer ],
    target: 'map',
    view: view,
    renderer: 'webgl',
    loadTilesWhileInteracting: true
});

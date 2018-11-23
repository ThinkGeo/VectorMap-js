let layer = new ol.mapsuite.VectorTileLayer(light, {
});

var geoVectorLayer = new ol.mapsuite.VectorLayer(geosjonStyle, {
    multithread: false
})

var tilegrid = new ol.layer.Tile({
    source: new ol.source.TileDebug({
        projection: "EPSG:3857",
        tileGrid: ol.tilegrid.createXYZ({ tileSize: 512, maxZoom: 22 })
    })
})


var view = new ol.View({
    // center: [-10775718.490585351, 3868389.0226015863],
    center: [260637.765211225, 6249780.338744789],
    zoom: 6,
    // maxZoom: 19,
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

var map = new ol.Map({
    target: 'map',
    layers: [
        layer, tilegrid
    ],
    view: view
});
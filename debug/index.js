let layer = new ol.mapsuite.VectorTileLayer(light, {
    multithread: true
});

var tilegrid = new ol.layer.Tile({
    source: new ol.source.TileDebug({
        projection: "EPSG:3857",
        tileGrid: ol.tilegrid.createXYZ({ tileSize: 512, maxZoom: 22 })
    })
})

var style = new ol.style.Style({
    text: new ol.style.Text({
        font: 'bold 11px "Open Sans", "Arial Unicode MS", "sans-serif"',
        placement: 'line',
        fill: new ol.style.Fill({
            color: '#cccccc'
        })
    })
});

var vectorTileLayer = new ol.layer.VectorTile({
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    source: new ol.source.VectorTile({
        format: new ol.format.MVT({
        }),
        url: "https://cloud1.thinkgeo.com/api/v1/maps/vector/streets/3857/{z}/{x}/{y}.pbf?apiKey=Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~"
    }),
    declutter: true
})


var view = new ol.View({
    center: [-10775718.490585351, 3868389.0226015863],
    zoom: 4,
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

var map = new ol.Map({
    target: 'map',
    layers: [
        layer
    ],
    view: view,
    loadTilesWhileInteracting: true
});
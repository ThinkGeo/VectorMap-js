var view = new ol.View({
    center: ol.proj.fromLonLat([-96.79748, 32.78819]),
    zoom: 2,
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
    // threadMode:ol.mapsuite.VectorTileLayerThreadMode.Default,
    // backgroundWorkerCount:2,
    multithread: true,
    minimalist: true,
});

// var tileGrid1 = new ol.layer.Tile({
//     source: new ol.source.TileDebug({
//         projection: "EPSG:3857",
//         tileGrid: worldStreetsLayer.createVectorTileGrid()
//     })
// });

// var tileGrid2 = new ol.layer.Tile({
//     source: new ol.source.OSM()
// });

var map = new ol.Map({
    layers: [worldStreetsLayer],
    target: 'map',
    view: view,
    renderer: 'webgl',
    loadTilesWhileInteracting: true
});

map.on('click', showInfo);
function showInfo(event) {
    var features = map.getFeaturesAtPixel(event.pixel);
    if(features)
    {
        // for(var i=0;i<features.length;i++)
        // {
        //     console.log(features[i].styleId);
        // }
        // console.log(features);
    }
}

// document.getElementById('test').onclick = function(){
//     console.log('test');
//     worldStreetsLayer.update('test.json');
// }

// disable rotation in mobile devices
if ((navigator.userAgent.match(/(pad|iPad|iOS|Android|iPhone)/i))) {
    map.getInteractions().forEach(function (element, index, array) {
        // if (element instanceof ol.interaction.DragRotateAndZoom) element.setActive(false);
        // if (element instanceof ol.interaction.PinchRotate) element.setActive(false);
    });
}
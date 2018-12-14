 
// retina layer
let map2xLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud.thinkgeo.com/api/v1/maps/raster/light/x2/3857/512/{z}/{x}/{y}.png"
            + "?apiKey=v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~",// please go to https://cloud.thinkgeo.com to create
        tileSize: 512,
        tilePixelRatio: 2
    }),
});

//craet map
let map2x = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [map2xLayer],
    target: 'map@2x',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.79620, 32.79423]),
        zoom: 4,
        progressiveZoom: false,

    }),
});
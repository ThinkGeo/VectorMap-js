 
// retina layer
let map2xLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud.thinkgeo.com/api/v1/maps/raster/light/x2/3857/512/{z}/{x}/{y}.png"
            + "?apiKey=Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~",// please go to https://cloud.thinkgeo.com to create
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
        maxZoom: 19,maxResolution: 40075016.68557849 / 512,zoom: 3,
        progressiveZoom: false,

    }),
});
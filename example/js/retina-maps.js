 
// Retina layer
let map2xLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud.thinkgeo.com/api/v1/maps/raster/light/x2/3857/512/{z}/{x}/{y}.png"
            + "?apiKey=WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~",// please go to https://cloud.thinkgeo.com to create
        tileSize: 512,
        tilePixelRatio: 2
    }),
});

//Create map
let map2x = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [map2xLayer],
    target: 'map@2x',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.79620, 32.79423]),
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 3,
        progressiveZoom: false,
        

    }),
});

map2x.addControl(new ol.control.FullScreen());
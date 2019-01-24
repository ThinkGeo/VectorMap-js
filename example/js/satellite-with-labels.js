 
const satelliteLabelStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0-beta009/transparent-background.json";

//label layer
let satelliteLabeLayer = new ol.mapsuite.VectorTileLayer(satelliteLabelStyle, {
    apiKey: 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~' // please go to https://cloud.thinkgeo.com to create
});

//satellite Layer
let satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg" +
            "?apiKey=WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~",
        tileSize: 512
    }),
});

// create map
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [satelliteLayer, satelliteLabeLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.79620, 32.79423]),
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 3,
        progressiveZoom: false,
    }),
});

map.addControl(new ol.control.FullScreen());
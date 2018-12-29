 
const satelliteLabelStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0-beta009/transparent-background.json";

//label layer
let satelliteLabeLayer = new ol.mapsuite.VectorTileLayer(satelliteLabelStyle, {
    apiKey: 'Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~' // please go to https://cloud.thinkgeo.com to create
});

//satellite Layer
let satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg" +
            "?apiKey=Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~",
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
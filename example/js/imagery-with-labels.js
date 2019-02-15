
//Label featuer
let imageryLabeLayer = new ol.mapsuite.VectorTileLayer("https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/transparent-background.json", {
    apiKey: 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~', // Please go to https://cloud.thinkgeo.com to create
    visible: true
});

//Image feature
let imageryLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: 'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg' //Source from NASA
    }),
});

//Create map
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [imageryLayer, imageryLabeLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.79620, 35.79423]),
        maxZoom: 7,
        maxResolution: 40075016.68557849 / 512,
        zoom: 3,
        minZoom: 3,

    }),
});

//Control map full screen
map.addControl(new ol.control.FullScreen());
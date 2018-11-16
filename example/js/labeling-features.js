WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});
const satelliteLabelStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/transparent-background.json";

let satelliteLabeLayer = new ol.mapsuite.VectorTileLayer(satelliteLabelStyle, {
    apiKey: '73u5e1NSIPmm9eDIqf6pjh0DoW2nyH2A4oJfDJW4bJE~' // please go to https://cloud.thinkgeo.com to create
});

let map = new ol.Map({
    layers: [satelliteLabeLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.79620, 32.79423]),
        zoom: 4,
    }),
});
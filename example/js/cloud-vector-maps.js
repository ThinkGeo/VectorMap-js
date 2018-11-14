WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});
 
var worldstreetsStyle = "http://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json";
var worldstreets = new ol.mapsuite.VectorTileLayer(worldstreetsStyle,
    {
        apiKey: '73u5e1NSIPmm9eDIqf6pjh0DoW2nyH2A4oJfDJW4bJE~'
    });
let map = new ol.Map({
    layers: [worldstreets],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.79620, 32.79423]),
        zoom: 4,
    }),
});
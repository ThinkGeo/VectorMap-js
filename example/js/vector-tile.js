WebFont.load({
    custom: {
        families: ['vectormap-icons'],
        urls: ['https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css']
    }
});


const styleJson = {
    light: 'http://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json',
}
const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~'

let light = new ol.mapsuite.VectorTileLayer(styleJson.light, {
    apiKey: apiKey,
    layerName: 'light'
});

let map = new ol.Map({
    layers: [light],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.79620, 32.79423]),
        zoom: 16,
        minZoom: 2
    })
});

map.on('pointermove', showInfo);

var info = document.getElementById('info');
function showInfo(event) {
    var features = map.getFeaturesAtPixel(event.pixel);
    if (!features) {
        info.innerText = '';
        info.style.opacity = 0;
        return;
    }
    var properties = features[0].getProperties();
    info.innerText = JSON.stringify(properties, null, 2);
    info.style.opacity = 1;
}


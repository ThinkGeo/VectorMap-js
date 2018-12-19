WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ['https://cdn.thinkgeo.com/vectormap-icons/2.0.0-beta004/vectormap-icons.css']
    }
});

var layer = new ol.mapsuite.VectorTileLayer('../data/vectortils_gray.json', {
    'apiKey': 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~'
});

var map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [layer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-98.413148, 38.736301]),
        zoom: 4,
        minZoom: 0,
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512
    }),
});
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ['https://cdn.thinkgeo.com/vectormap-icons/2.0.0-beta004/vectormap-icons.css']
    }
});

var layer = new ol.mapsuite.VectorTileLayer('../data/vectortils_gray.json', {
    'apiKey': 'Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~'
});

var map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [layer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-98.413148, 38.736301]),
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 4,
        minZoom: 0,
        maxResolution: 40075016.68557849 / 512
    }),
});

map.addControl(new ol.control.FullScreen());
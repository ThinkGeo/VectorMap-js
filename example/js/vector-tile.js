WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ['https://cdn.thinkgeo.com/vectormap-icons/2.0.0-beta004/vectormap-icons.css']
    }
});

var layer = new ol.mapsuite.VectorTileLayer('../data/vectortils_gray.json');

var map = new ol.Map({
    layers: [layer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-98.413148, 38.736301]),
        zoom: 5,
        minZoom: 2,
        maxZoom: 19
    }),
});

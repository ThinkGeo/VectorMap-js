WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const apiKey ='v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~';

const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json";

let worldStreetLayer = new ol.mapsuite.VectorTileLayer(worldstreetsStyle, {
    'apiKey': apiKey,
});

let heatMapLayer = new ol.layer.Heatmap({
    source: new ol.source.Vector({
        url: '../data/2012_Earthquakes_Mag5.xml',
        format: new ol.format.KML({
            extractStyles: false
        })
    }),
    blur: 15,
    radius: 10
});

heatMapLayer.getSource().on('addfeature', function (event) {
    // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
    // standards-violating <magnitude> tag in each Placemark.  We extract it from
    // the Placemark's name instead.
    let name = event.feature.get('name');
    let magnitude = parseFloat(name.substr(2));
    event.feature.set('weight', magnitude - 5);
});

let map =  new ol.Map({                         loadTilesWhileAnimating: true,                         loadTilesWhileInteracting: true,
    layers: [worldStreetLayer, heatMapLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([149.704275, -15.037667]),
        zoom: 4,
        minZoom: 2
    })
});
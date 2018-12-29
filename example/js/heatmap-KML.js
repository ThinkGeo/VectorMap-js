WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const apiKey = 'Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~';
const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0-beta009/light.json";

// base map layer
let worldStreetLayer = new ol.mapsuite.VectorTileLayer(worldstreetsStyle, {
    'apiKey': apiKey,
});

//heatmap layer
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

//add heatmap layer feature
heatMapLayer.getSource().on('addfeature', function (event) {
    // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
    // standards-violating <magnitude> tag in each Placemark.  We extract it from
    // the Placemark's name instead.
    let name = event.feature.get('name');
    let magnitude = parseFloat(name.substr(2));
    event.feature.set('weight', magnitude - 5);
});

//creat map
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [worldStreetLayer, heatMapLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([149.704275, -15.037667]),
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 3,
        minZoom: 2
    })
});

map.addControl(new ol.control.FullScreen());
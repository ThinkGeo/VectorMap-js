WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~';

const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json";

let worldStreetLayer = new ol.mapsuite.VectorTileLayer(worldstreetsStyle, {
    'apiKey': apiKey,
});

let satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png"
            + "?apiKey=v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~",
        tileSize: 512,
    }),
});

let map = new ol.Map({
    layers: [satelliteLayer],
    target: 'map',
    view: new ol.View({
        zoom: 5,
        center: [166326, 5992663]
    })
})

const addFeatures = function (nb) {
    let ssize = 20; // seed size
    console.log(map.getSize())
    let ext = map.getView().calculateExtent(map.getSize());
    let dx = ext[2] - ext[0];
    let dy = ext[3] - ext[1];
    let dl = Math.min(dx, dy);
    let features = [];
    for (let i = 0; i < nb / ssize; ++i) {
        let seed = [ext[0] + dx * Math.random(), ext[1] + dy * Math.random()]
        for (let j = 0; j < ssize; j++) {
            let f = new ol.Feature(new ol.geom.Point(
                [seed[0] + dl / 10 * Math.random(),
                seed[1] + dl / 10 * Math.random()
                ]
            ));
            f.set('id', i * ssize + j);
            features.push(f);
        }
    }
    source.clear();
    source.addFeatures(features);
}

// Vector source
let source = new ol.source.Vector();
// add 2000 features
addFeatures(2000);

// Interaction to move the source features
let modify = new ol.interaction.Modify({
    source: source
});
modify.setActive(true);
map.addInteraction(modify);

let hexbin, layer;

let min, max, maxi;
const styleFn = function (f, res) {
    // depending on the number of objects in the aggregate.
    let color;
    if (f.get('features').length > max) color ='#00f';
    else if (f.get('features').length > min) color = '#f00';
    else color = [7, 157, 157, 1];
    return [new ol.style.Style({
        fill: new ol.style.Fill({
            color: color
        })
    })];
}
// Create HexBin and calculate min/max
const reset = function () {
    let size = 40000;
    if (layer) map.removeLayer(layer);
    let features;

    hexbin = new ol.source.HexBin({
        source: source, // source of the bin
        size: size // hexagon size (in map unit)
    });
    layer = new ol.layer.Vector({
        source: hexbin,
        opacity: 0.5,
        style: styleFn,
        renderMode: 'image'
    });
    features = hexbin.getFeatures();
    // Calculate min/ max value
    min = Infinity;
    max = 0;
    for (let i = 0, f; f = features[i]; i++) {
        let n = f.get('features').length;
        if (n < min) min = n;
        if (n > max) max = n;
    }
    let dl = (max - min);
    maxi = max;
    min = Math.max(1, Math.round(dl / 4));
    max = Math.round(max - dl / 3);

    // Add layer
    map.addLayer(layer);
}
reset();
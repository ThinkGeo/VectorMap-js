let satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png" +
            "?apiKey=v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~",
        tileSize: 512,
    }),
});

let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [satelliteLayer],
    target: 'map',
    view: new ol.View({
        zoom: 5,
        center: ol.proj.fromLonLat([-96.79620, 38.79423]),
        progressiveZoom: false,

    })
})

const getJson = () => {
    let readTextFile = new Promise(function (resolve, reject) {
        let file = "../data/GeocodingResult.JSON";
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function (ERR) {
            if (rawFile.readyState === 4) {
                if (rawFile.status == "200") {
                    resolve(rawFile.responseText);
                } else {
                    reject(new Error(ERR));
                }
            }
        }
        rawFile.send(null);
    });
    return readTextFile;
};

// let features;
// const addFeatures = () => {
//     getJson().then((data) => {
//         let result = JSON.parse(data);
//         for (let i = 0, length = result.length; i < length; i++) {
//             let point = ol.proj.fromLonLat(result[i].coordinate);
//             features[i] = new ol.Feature(new ol.geom.Point(point));
//             features[i].set('id', i);
//         }

//         source.clear();
//         source.addFeatures(features);
//     })
// }

const addFeatures = function () {
    // let ssize = 20; // seed size
    // let dl = 3693437.206739716;
    let features = [];

    getJson().then((data) => {
        let result = JSON.parse(data);
        for (let k = 0, length = result.length; k < length; k++) {
            let point = ol.proj.fromLonLat(result[k].coordinate);
            let seed = point;
            // for (let j = 0; j < ssize; j++) {
            let f = new ol.Feature(new ol.geom.Point(
                seed
            ));
            // let f = new ol.Feature(new ol.geom.Point(
            //     [seed[0] + dl / 10 * Math.random(),
            //         seed[1] + dl / 10 * Math.random()
            //     ]
            // ));
            f.set('id', k);
            features.push(f);
            // }
        }
        source.clear();
        source.addFeatures(features);
    });
};

let source = new ol.source.Vector();
// Vector source
// add 2000 features
addFeatures();

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
    if (f.get('features').length > 20) {
        color = '#00e1fc'; 
    }
    else if (f.get('features').length > min) {
        color = '#a4e601';
    } 
    else {
        color = '#ee484d';
    } 
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
        opacity: 0.7,
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
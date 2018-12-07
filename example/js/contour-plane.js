WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';

const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/dark.json";

//base map layer
let worldStreetLayer = new ol.mapsuite.VectorTileLayer(worldstreetsStyle, {
    'apiKey': apiKey,
});

//contour layer
let vector = new ol.layer.Vector({
    source: null
});

//create map
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [worldStreetLayer, vector],
    target: 'map',
    view: new ol.View({
        center: [11877713.642017495, 4671206.770222437],
        zoom: 4,
        progressiveZoom: false,

    })
});

// Convert the json  to geoson
$.get("https://thinkgeo.github.io/vectormapsample/data/rainfall.json", function (result) {
    let geojson = {
        "type": "FeatureCollection",
        "totalFeatures": result.contours.length,
        "features": []
    };

    for (let i = 0; i < result.contours.length; i++) {
        let contour = result.contours[i];
        let coords = [];
        for (let j = 0; j < contour.latAndLong.length; j++) {
            let latlon = contour.latAndLong[j];
            coords.push(ol.proj.transform([latlon[1], latlon[0]], 'EPSG:4326', 'EPSG:3857'));
        }
        let feature = {
            "type": "Feature",
            "geometry_name": "geom",
            "geometry": {
                "type": "Polygon",
                "coordinates": [coords]
            },
            "properties": {
                "color": contour.color,
                "symbol": contour.symbol
            }
        };
        geojson.features.push(feature);
    }
    let vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(geojson)
    });

    //Definition of style
    let styleFunc = function (feature) {
        let color = feature.get("color");
        color = "rgba(" + color + ")";
        return new ol.style.Style({
            fill: new ol.style.Fill({
                color: color
            })
        })
    };
    vector.setSource(vectorSource);
    vector.setStyle(styleFunc);
    vector.setOpacity(0.8);
})

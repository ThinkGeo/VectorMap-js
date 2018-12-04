WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~';

const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/dark.json";

let worldStreetLayer = new ol.mapsuite.VectorTileLayer(worldstreetsStyle, {
    'apiKey': apiKey,
});

let satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png"
            + "?apiKey=v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~",
        tileSize: 512,
    }),
});

let vector = new ol.layer.Vector({
    source: null
});

let map =  new ol.Map({                         
    loadTilesWhileAnimating: true,                         
    loadTilesWhileInteracting: true,
    layers: [satelliteLayer, vector],
    target: 'map',
    view: new ol.View({
        center: [11877713.642017495, 4671206.770222437],
        zoom: 4,
        progressiveZoom: false,

    })
});

$.get("../data/rainfall.json", function (result) {
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

    let styleFunc = function (feature) {
        let color = feature.get("color");
        color = "rgba(" + color + ")";
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: color,
                width: 2
            }),
        })
    };
    vector.setSource(vectorSource);
    vector.setStyle(styleFunc);
    vector.setOpacity(0.8);
})

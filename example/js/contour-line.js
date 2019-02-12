WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';

const worldstreetsStyle = "https://cdn.thinkgeo.com/ worldstreets-styles/1.1.0/dark.json";

//Base layer
let worldStreetLayer = new ol.mapsuite.VectorTileLayer(worldstreetsStyle, {
    'apiKey': apiKey,
});

//Heatmap layer
let vector = new ol.layer.Vector({
    source: null,
    style: function (feature) {
        textStyle.getText().setText(feature.get('symbol'));
        return textStyle;
    }
});

//Create map
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [worldStreetLayer, vector],
    target: 'map',
    view: new ol.View({
        center: [11877713.642017495, 3471206.770222437],
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 3,
        progressiveZoom: false,

    })
});
map.addControl(new ol.control.FullScreen());
// Convert the json  to geoson
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

    vector.setSource(vectorSource);

})

//Style of line 
let styleLineFunc = function (feature) {
    let color = feature.get("color");
    let text = feature.get("symbol");
    color = "rgba(" + color + ")";
    return new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: color,
            width: 2
        }),
        text: new ol.style.Text({
            text: text,
            placement: 'line',
            font: '20px  Calibri,sans-serif',
            fill: new ol.style.Fill({
                color: color,
            }),
            stroke: new ol.style.Stroke({
                color: '#fff',
                width: 2
            }),
        })
    })
};

//Style of  plane
let stylePlaneFunc = function (feature) {
    let color = feature.get("color");
    color = "rgba(" + color + ")";
    return new ol.style.Style({
        fill: new ol.style.Fill({
            color: color
        })
    })
};

vector.setStyle(styleLineFunc);
vector.setOpacity(0.8);

// Check the status of checkbox:
if ($('#checkbox').prop('checked')) {
    vector.setStyle(stylePlaneFunc);
}
$('#checkbox').change(function () {
    if ($('#checkbox').prop('checked')) {
        vector.setStyle(stylePlaneFunc);
    } else {
        vector.setStyle(styleLineFunc);
    }
})
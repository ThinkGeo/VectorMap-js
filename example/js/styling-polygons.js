
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json";
 
//base map style 
const baseMapStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: '#0b72d2'
    }),
    stroke: new ol.style.Stroke({
        color: 'rgba(255, 255, 255, 0.6)',
        width: 0.6
    }),
    text: new ol.style.Text({
        font: '16px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: '#f4755d'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
        }),
    })
})

//highlight style
const highlightStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: '#f4755d'
    }),
    stroke: new ol.style.Stroke({
        color: '#627ce3',
        width: 2
    }),
    text: new ol.style.Text({
        font: '16px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: 'rgb(103, 183, 220)'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
        }),
    })
})

let baseMapLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: '../data/countries.json',
        format: new ol.format.GeoJSON()
    }),
    style: function (feature) {
        baseMapStyle.getText().setText(feature.get('name'));
        return baseMapStyle;
    }
});

let map = new ol.Map({
    layers: [baseMapLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([2.570481, 26.927630]),
        zoom: 2.5,
    }),
});

let featureOverlay = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: function (feature) {
        highlightStyle.getText().setText(feature.get('name'));
        return highlightStyle;
    }
})

let highlight;

const displayFeatureInfo = function (pixel) {
    let feature = map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
    });

    if (feature !== highlight) {
        if (highlight) {
            featureOverlay.getSource().removeFeature(highlight);
        }
        if (feature) {
            featureOverlay.getSource().addFeature(feature);
        }
        highlight = feature;
    }
}

map.on('pointermove', function (evt) {
    if (evt.dragging) {
        return;
    }
    let pixel = map.getEventPixel(evt.originalEvent);
    displayFeatureInfo(pixel);
});

map.on('click', function (evt) {
    displayFeatureInfo(evt.pixel);
});






WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json";

//block  map style 
const blockMapStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: '#afaeb1'
    }),
    stroke: new ol.style.Stroke({
        color: '#a59f80',
        width: 2
    }),
    text: new ol.style.Text({
        font: '14px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: '#525255'
        }),
        placement: 'line',
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
        }),
    })
})

const pointStyle = new ol.style.Style({
    image: new ol.style.Icon({
        anchor: [1, 1],
        offset: [0, 3],
        src: '../image/hotel.png',
    }),
    text: new ol.style.Text({
        font: '12px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: '#ff3467'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
        }),
     
    })
})

//point  layer
let pointLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: '../data/hotels.json',
        format: new ol.format.GeoJSON()
    }),
    style: function (feature) {
        pointStyle.getText().setText(feature.get('NAME'));
        return pointStyle;
    }
});


let blockMapLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: '../data/label.json',
        format: new ol.format.GeoJSON()
    }),
    style: function (feature) {
        blockMapStyle.getText().setText(feature.get('NAME'));
        return blockMapStyle;
    }
});


let map = new ol.Map({
    layers: [blockMapLayer, pointLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.820787, 33.098294]),
        zoom: 17,
    }),
});









 

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
        color: '#f3b600'
    }),
    stroke: new ol.style.Stroke({
        color: 'rgba(255, 255, 255, 0.6)',
        width: 2
    }),
    text: new ol.style.Text({
        font: '16px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: '#990100'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
        }),
    })
})

//river style
const riverStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: '#4e81a5'
    }),
    stroke: new ol.style.Stroke({
        color: '#4e81a5',
        width: 2
    }),
    text: new ol.style.Text({
        font: '14px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: '#f00'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(255, 255, 255, 0.5)',
            width: 2
        }),
    })
})

let baseMapLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: '../data/europe.json',
        format: new ol.format.GeoJSON()
    }),
    style: function (feature) {
        baseMapStyle.getText().setText(feature.get('NAME'));
        return baseMapStyle;
    }
});

let riverLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: '../data/river.json',
        format: new ol.format.GeoJSON()
    }),
    style: function (feature) {
        riverStyle.getText().setText(feature.get('name'));
        return riverStyle;
    }
});

let map = new ol.Map({
    layers: [baseMapLayer, riverLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([18.79620, 50.55423]),
        zoom: 7,
    }),
});

 







WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json";

const worldstreets = new ol.mapsuite.VectorTileLayer(worldstreetsStyle,
    {
        apiKey: '73u5e1NSIPmm9eDIqf6pjh0DoW2nyH2A4oJfDJW4bJE~'      // please go to https://cloud.thinkgeo.com to create
    });

var pointLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: '../data/Frisco-school-poi.json',
        format: new ol.format.GeoJSON()
    }),
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(238,153,34,0.402)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 4,
            fill: new ol.style.Fill({
                color: '#ffcc33'
            })
        })
    })
});



let map = new ol.Map({
    layers: [worldstreets, pointLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.79620, 33.15423]),
        zoom: 12,
    }),
});



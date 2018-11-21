
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json";

const worldstreets = new ol.mapsuite.VectorTileLayer(worldstreetsStyle,
    {
        apiKey: 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~'      // please go to https://cloud.thinkgeo.com to create
    });

let pointLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: '../data/Frisco-school-poi.json',
        format: new ol.format.GeoJSON()
    }),
    style: new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0, 0],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: '../images/school.png'
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



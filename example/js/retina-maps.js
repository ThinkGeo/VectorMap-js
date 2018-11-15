WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});


let map1xLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png"
            + "?apiKey=73u5e1NSIPmm9eDIqf6pjh0DoW2nyH2A4oJfDJW4bJE~",// please go to https://cloud.thinkgeo.com to create
    }),
});

let map2xLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud.thinkgeo.com/api/v1/maps/raster/light/x2/3857/512/{z}/{x}/{y}.png"
            + "?apiKey=73u5e1NSIPmm9eDIqf6pjh0DoW2nyH2A4oJfDJW4bJE~",// please go to https://cloud.thinkgeo.com to create
        tileSize: 512,
        tilePixelRatio: 2
    }),
});


let map1x = new ol.Map({
    layers: [map1xLayer],
    target: 'map@1x',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.79620, 32.79423]),
        zoom: 4,
    }),
});

let map2x = new ol.Map({
    layers: [map2xLayer],
    target: 'map@2x',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.79620, 32.79423]),
        zoom: 4,
    }),
});
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

let imageryLabeLayer = new ol.mapsuite.VectorTileLayer("thinkgeo-world-streets-hybrid.json", {
    apiKey: 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~', // please go to https://cloud.thinkgeo.com to create
    visible:true
});

let imageryLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: 'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg'
    }),
});

let map =  new ol.Map({                         loadTilesWhileAnimating: true,                         loadTilesWhileInteracting: true,
    layers: [imageryLayer, imageryLabeLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.79620, 35.79423]),
        zoom: 5,
        minZoom: 3,
        maxZoom: 8
    }),
});
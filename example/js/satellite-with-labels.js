
//Load vector map icon font
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~' // please go to https://cloud.thinkgeo.com to create

//Label layer
let satelliteLabeLayer = new ol.mapsuite.VectorTileLayer("https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/transparent-background.json", {
    apiKey: apiKey 
});


//Satellite Layer
let satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `https://cloud.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg?apiKey=${apiKey}`,
        tileSize: 512
    }),
});

// Create map
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,

    //Add Layer
    layers: [satelliteLayer, satelliteLabeLayer],
    target: 'map',
    view: new ol.View({


        //Set the center of the map,
        center: ol.proj.fromLonLat([-96.79620, 32.79423]),//EPSG:4326 to EPSG:3857
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 3,
        progressiveZoom: false,
    }),
});

//Control map full screen
map.addControl(new ol.control.FullScreen());
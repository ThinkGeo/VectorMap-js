WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

 
const url = {
    light: 'https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png',
    dark: 'https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png'
}
const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~'

let light = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `${url.light}?apiKey=${apiKey}`,
        tileSize: 512,
    }),
    layerName: 'light'
});

let dark = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `${url.dark}?apiKey=${apiKey}`,
    }),
    visible: false,
    layerName: 'dark'
});

let map = new ol.Map({
    layers: [light, dark],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.79620, 32.79423]),
        zoom: 4,
        minZoom: 2
    })
});

document.getElementById('wrap').addEventListener('click', (e) => {
    const nodeList = document.querySelectorAll('#wrap div');
    for (let node of nodeList) {
        node.style.borderColor = '#ffffff';
    }
    if (e.target.nodeName == 'DIV') {
        e.target.style.borderColor = '#FF5722';
        chnageLayer(e);

    }
})


const chnageLayer = function (e) {
    let layers = map.getLayers().getArray();
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].get("layerName") == e.target.getAttribute("value")) {
            layers[i].setVisible(true);
        } else {
            layers[i].setVisible(false);
        }
    }
}

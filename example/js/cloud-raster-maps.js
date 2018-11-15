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
const apiKey = '73u5e1NSIPmm9eDIqf6pjh0DoW2nyH2A4oJfDJW4bJE~'

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

document.getElementById('btn-group').addEventListener('click', (e) => {
    const nodeList = document.querySelectorAll('#btn-group button');
    for (let node of nodeList) {
        node.style.backgroundColor = '#ffffff';
    }
    if (e.target.type == 'button') {
        e.target.style.backgroundColor = '#efefef';
        chnageLayer(e);
    }
})


const chnageLayer = function (e) {
    let layers = map.getLayers().getArray();
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].get("layerName") == e.target.value) {
            layers[i].setVisible(true);
        } else {
            layers[i].setVisible(false);
        }
    }
}


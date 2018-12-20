WebFont.load({
    custom: {
        families: ['vectormap-icons'],
        urls: ['https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css']
    }
});

const styleJson = {
    light: 'https://cdn.thinkgeo.com/worldstreets-styles/1.0.0-beta009/light.json',
    dark: 'https://cdn.thinkgeo.com/worldstreets-styles/1.0.0-beta009/dark.json'
}

const apiKey = 'Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~' // please go to https://cloud.thinkgeo.com to create

let light = new ol.mapsuite.VectorTileLayer(styleJson.light, {
    apiKey: apiKey,
    layerName: 'light'
});

let dark = new ol.mapsuite.VectorTileLayer(styleJson.dark, {
    apiKey: apiKey,
    visible: false,
    layerName: 'dark'
});


let map = new ol.Map({
    layers: [light, dark],
    target: 'map',
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.79620, 32.79423]),
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 3,
        minZoom: 2
    })
});

document.getElementById('wrap').addEventListener('click', (e) => {
    const nodeList = document.querySelectorAll('#wrap div');
    for (let node of nodeList) {
        node.style.borderColor = 'transparent';
    }
    if (e.target.nodeName == 'DIV') {
        e.target.style.borderColor = '#ffffff';
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






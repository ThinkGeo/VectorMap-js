
//Load vector map icon font
WebFont.load({
    custom: {
        families: ['vectormap-icons'],
        urls: ['https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css']
    }
});

const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~' // please go to https://cloud.thinkgeo.com to create

//Create layer with different source
const styleJson = {
    light: 'https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json',
    dark: 'https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/dark.json'
}


let light = new ol.mapsuite.VectorTileLayer(styleJson.light, {
    apiKey: apiKey,
    layerName: 'light'
});

let dark = new ol.mapsuite.VectorTileLayer(styleJson.dark, {
    apiKey: apiKey,
    visible: false,
    layerName: 'dark'
});

//Create map
let map = new ol.Map({

    //Add default layers
    layers: [light, dark],
    target: 'map',
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    view: new ol.View({

        //Set the center of the map,
        center: ol.proj.fromLonLat([-96.79620, 32.79423]), //EPSG:4326 to EPSG:3857
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 3,
        minZoom: 2
    })
});

//Control map full screen
map.addControl(new ol.control.FullScreen());

//Control Thumb style
document.getElementById('wrap').addEventListener('click', (e) => {
    const nodeList = document.querySelectorAll('geocoderResult a');
    
    for (let node of nodeList) {
        node.style.borderColor = 'transparent';
    }
    if (e.target.nodeName == 'DIV') {
        e.target.style.borderColor = '#ffffff';
        changeLayer(e);
    }
})

//Change layer to visible
const changeLayer = function (e) {
    let layers = map.getLayers().getArray();
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].get("layerName") == e.target.getAttribute("value")) {

            layers[i].setVisible(true);
        } else {
            layers[i].setVisible(false);
        }
    }
}






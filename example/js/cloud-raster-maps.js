 

const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';// please go to https://cloud.thinkgeo.com to create
let url = {
    light: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
    dark: `https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
    aerial: `https://cloud.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg?apiKey=${apiKey}`,
    transparentBackground: `https://cloud.thinkgeo.com/api/v1/maps/raster/transparent-background/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`
}

//Create layer with different source
let light = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: url.light,
        tileSize: 512,
    }),
  
    layerName: 'light'
});

let dark = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: url.dark,
        tileSize: 512,
    }),
    layerName: 'dark',
    visible: false,
});

let transparentBackground = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: url.transparentBackground,
        tileSize: 512,
    }),
    visible: false,
    layerName: 'transparentBackground'
});

let aerial = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: url.aerial,
        tileSize: 512,
    }),
    visible: false,
    layerName: 'aerial'
});


//Create map
let map = new ol.Map({
    layers: [dark, light, aerial, transparentBackground,],
    target: 'map',
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.79620, 32.79423]),
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 3,
        progressiveZoom: false,
        minZoom: 2
    })
});

map.addControl(new ol.control.FullScreen());

const applyAPIKey = document.getElementById("ckbApiKey");

//If no apikey set new source
const setSource = (url) => {
    let layers = map.getLayers().getArray();
    for (let i = 0; i < layers.length; i++) {
        layers[i].setSource(new ol.source.XYZ({
            url: url[`${layers[i].get("layerName")}`],
            tileSize: 512,
        }));

    }
}

//updated url
applyAPIKey.addEventListener('click', (e) => {
    if (applyAPIKey.getAttribute('checked') == 'checked') {
        applyAPIKey.setAttribute('checked', 'unchecked')
        url = {
            light: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png`,
            dark: `https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png`,
            aerial: `https://cloud.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg`,
            transparentBackground: `https://cloud.thinkgeo.com/api/v1/maps/raster/transparent-background/x1/3857/512/{z}/{x}/{y}.png`
        }
        setSource(url)


    } else {
        applyAPIKey.setAttribute('checked', 'checked')
        url = {
            light: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
            dark: `https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
            aerial: `https://cloud.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg?apiKey=${apiKey}`,
            transparentBackground: `https://cloud.thinkgeo.com/api/v1/maps/raster/transparent-background/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`
        }
        setSource(url)
    }

})


document.getElementById('wrap').addEventListener('click', (e) => {
    if (e.target.classList.contains('thumb')) {
        const nodeList = document.querySelectorAll('#wrap div');
        for (let node of nodeList) {
            node.style.borderColor = 'transparent';
        }
        if (e.target.nodeName == 'DIV') {
            e.target.style.borderColor = '#ffffff';
            changeLayer(e);
        }
    }
})

//Change layer to visible
const changeLayer = function (e) {
    let layers = map.getLayers().getArray();
    if (e.target.getAttribute("value") == 'hybrid') {
        for (let i = 0; i < layers.length; i++) {
            layers[i].setVisible(false);
        }
        transparentBackground.setVisible(true);
        aerial.setVisible(true);

    } else {
        for (let i = 0; i < layers.length; i++) {

            if (layers[i].get("layerName") == e.target.getAttribute("value")) {
                layers[i].setVisible(true);
            } else {
                layers[i].setVisible(false);
            }
        }
    }
}

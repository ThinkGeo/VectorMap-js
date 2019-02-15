

const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';// please go to https://cloud.thinkgeo.com to create

//Create layer with different source
const urlWithApikey = {
    light: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
    dark: `https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
    aerial: `https://cloud.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg?apiKey=${apiKey}`,
    transparentBackground: `https://cloud.thinkgeo.com/api/v1/maps/raster/transparent-background/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`
}

const urlwithoutApikey = {
    light: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png`,
    dark: `https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png`,
    aerial: `https://cloud.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg`,
    transparentBackground: `https://cloud.thinkgeo.com/api/v1/maps/raster/transparent-background/x1/3857/512/{z}/{x}/{y}.png`
}


let url = urlWithApikey

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

    //Add layers
    layers: [dark, light, aerial, transparentBackground,],
    target: 'map',
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    view: new ol.View({

        //Set the center of the map,
        center: ol.proj.fromLonLat([-96.79620, 32.79423]),//EPSG:4326 to EPSG:3857
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 3,
        progressiveZoom: false,
        minZoom: 2
    })
});

//Map full screen control
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

//Updated url
applyAPIKey.addEventListener('click', (e) => {
    if (applyAPIKey.getAttribute('checked') == 'checked') {
        applyAPIKey.setAttribute('checked', 'unchecked')
        url = urlWithoutApikey
        setSource(url)


    } else {
        applyAPIKey.setAttribute('checked', 'checked')
        url = urlWithApikey
        setSource(url)
    }

})

//Control Thumb style
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

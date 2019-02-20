
/*===========================================================================*/
// Raster Maps
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. Display Different Styles Of Maps 
/*===========================================================================*/



/*---------------------------------------------*/
// 1. ThinkGeo Cloud API Key
/*---------------------------------------------*/

// First, let's define our ThinkGeo Cloud API key, which we'll use to
// authenticate our requests to the ThinkGeo Cloud API.  Each API key can be
// restricted for use only from a given web domain or IP address.  To create your
// own API key, you'll need to sign up for a ThinkGeo Cloud account at
// https://cloud.thinkgeo.com.
const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';


/*---------------------------------------------*/
// 2. Map Control Setup
/*---------------------------------------------*/

// Now we'll create different layers with different data source. These layers 
// all use ThinkGeo Cloud Maps Raster Tile service to display a detailed map. 
// For more info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_raster_tiles

// Set different data source with apiKey.
const urlWithApikey = {
    light: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
    dark: `https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
    aerial: `https://cloud.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg?apiKey=${apiKey}`,
    transparentBackground: `https://cloud.thinkgeo.com/api/v1/maps/raster/transparent-background/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`
}

// Set different data source without apiKey. Watermark shows up as no keys are provided.
const urlWithoutApikey = {
    light: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png`,
    dark: `https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png`,
    aerial: `https://cloud.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg`,
    transparentBackground: `https://cloud.thinkgeo.com/api/v1/maps/raster/transparent-background/x1/3857/512/{z}/{x}/{y}.png`
}

let url = urlWithApikey

// Create different layers using different data source. 
// Light Map: light layer
// Dark Map: dark layer
// Imagery Map: aerial layer
// Hybrid Map: light layer + aerial layer
// Transparent Map: transparentBackground layer
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

// Create and initialize our raster map.
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,

    // Add our previously-defined ThinkGeo Cloud Raster Tile layers to the map.
    layers: [dark, light, aerial, transparentBackground],
    // States that the HTML tag with id="map" should serve as the container for our map.
    target: 'map',
    // Create a default view for the map when it starts up.
    view: new ol.View({

        // Center the map on the United States and start at zoom level 3.
        center: ol.proj.fromLonLat([-96.79620, 32.79423]),
        maxResolution: 40075016.68557849 / 512,
        progressiveZoom: false,
        zoom: 3,
        minZoom: 2,
        maxZoom: 19
    })
});

// Add a button to the map that lets us toggle full-screen display mode.
map.addControl(new ol.control.FullScreen());


/*---------------------------------------------*/
// 3. Display Different Styles Of Maps 
/*---------------------------------------------*/

// Now that we've set up our variable layers for map, we need to add event
// listener that let us toggle variable styles of map, and toggle maps with 
// watermarker or not.

// When click the "use API Key" button, reset the data source value.Then you can get
// the map with watermarker or without watermarker.
const setSource = (url) => {
    let layers = map.getLayers().getArray();
    for (let i = 0; i < layers.length; i++) {
        layers[i].setSource(new ol.source.XYZ({
            url: url[`${layers[i].get("layerName")}`],
            tileSize: 512,
        }));

    }
}

const applyAPIKey = document.getElementById("ckbApiKey");
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

// When click the different styles button, render the relevant style map.
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

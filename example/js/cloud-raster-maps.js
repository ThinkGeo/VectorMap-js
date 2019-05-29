/*===========================================================================*/
// Raster Maps
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. Changing the Map Style
//   4. Tile Loading Event Handlers
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

// Now we'll create different layers with different data sources. These layers 
// all use ThinkGeo Cloud Maps Raster Tile service to display a detailed map. 
// For more info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_raster_tiles

// This object defines the layer data sources that our map will use if the 
// "Use API Key" checkbox on the UI is checked.  Map tiles requested with a 
// valid API key will be clear with no watermarks.
const urlWithApikey = {
    light: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
    dark: `https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
    aerial: `https://cloud.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg?apiKey=${apiKey}`,
    transparentBackground: `https://cloud.thinkgeo.com/api/v1/maps/raster/transparent-background/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`
}

// This object defines the layer data sources that our map will use if the 
// "Use API Key" checkbox on the UI is unchecked.  Without an API key, map 
// tiles will still be returned, but will be watermarked with ThinkGeo's logo.
const urlWithoutApikey = {
    light: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png`,
    dark: `https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png`,
    aerial: `https://cloud.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg`,
    transparentBackground: `https://cloud.thinkgeo.com/api/v1/maps/raster/transparent-background/x1/3857/512/{z}/{x}/{y}.png`
}

// Because the UI defaults to "Use API Key" being checked, our code will 
// default to making tile requests with an API key.
let url = urlWithApikey

// Now let's create each actual map layer, using the data source URLs we 
// defined earlier.  We'll create the following layers:
//   1. light:  Street map with a light background and features.
//   2. dark:   Street map with a dark background and features.
//   3. aerial: Aerial imagery map with no street features or POIs.
//   4. transparentBackground: Just the streets and POIs with a transparent 
//      background.  Useful for displaying on top of the aerial layer, or
//      your own custom imagery layer.
// The "light" layer will be our default, so for the others, we'll set the
// "visible" property to false.
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

let aerial = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: url.aerial,
        tileSize: 512,
    }),
    layerName: 'aerial',
    visible: false
});

let transparentBackground = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: url.transparentBackground,
        tileSize: 512,
    }),
    layerName: 'transparentBackground',
    visible: false
});

// Create and initialize our raster map control.
let map = new ol.Map({    
	renderer:'webgl',
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
// 3. Changing the Map Style
/*---------------------------------------------*/

// Now that we've set up our variable layers for the map, we need to add an 
// event listener that lets us switch which layers are visible.  This has the 
// effect of letting the user change the style of the map with a single click.
// We will also handle clicks on the "Use API Key" checkbox, so that when the 
// API key is disabled, we'll request watermarked map tiles anonymously.

// This method sets the data source URL for each layer on the map according to 
// the object passed in.  Used for controlling whether the ApiKey parameter is 
// passed to the ThinkGeo Cloud tile endpoints or not.
const setSource = (url) => {
    let layers = map.getLayers().getArray();
    for (let i = 0; i < layers.length; i++) {
        layers[i].setSource(new ol.source.XYZ({
            url: url[`${layers[i].get("layerName")}`],
            tileSize: 512,
        }));
    }
}

// Handles clicks on the "Use API Key" checkbox.
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

// When the user clicks the different map style buttons, this method will 
// change the visible map layers to match the style they requested.
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

// This method actually applies the requested layer changes to the map.
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


/*---------------------------------------------*/
// 4. Tile Loading Event Handlers
/*---------------------------------------------*/

// These events allow you to perform custom actions when 
// a map tile encounters an error while loading.
const errorLoadingTile = () => {
    const errorModal = document.querySelector('#error-modal');
    if (errorModal.classList.contains('hide')) {
        // Show the error tips when Tile loaded error.
        errorModal.classList.remove('hide');
    }
}

const setLayerSourceEventHandlers = (layer) => {
    let layerSource = layer.getSource();
    layerSource.on('tileloaderror', function () {
        errorLoadingTile();
    });
}

setLayerSourceEventHandlers(light);
setLayerSourceEventHandlers(dark);
setLayerSourceEventHandlers(aerial);
setLayerSourceEventHandlers(transparentBackground);

document.querySelector('#error-modal button').addEventListener('click', () => {
    document.querySelector('#error-modal').classList.add('hide');
})

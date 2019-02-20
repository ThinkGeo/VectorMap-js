/*===========================================================================*/
// Vector Maps
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. ThinkGeo Map Icon Fonts
//   3. Map Control Setup
//   4. Display Different Styles Of Maps 
/*===========================================================================*/



/*---------------------------------------------*/
// 1. ThinkGeo Cloud API Key
/*---------------------------------------------*/

// First, let's define our ThinkGeo Cloud API key, which we'll use to
// authenticate our requests to the ThinkGeo Cloud API.  Each API key can be
// restricted for use only from a given web domain or IP address.  To create your
// own API key, you'll need to sign up for a ThinkGeo Cloud account at
// https://cloud.thinkgeo.com.
const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~'


/*---------------------------------------------*/
// 2. ThinkGeo Map Icon Fonts
/*---------------------------------------------*/

// Now we'll load the Map Icon Fonts using the WebFont loader. The loaded 
// Icon Fonts will be rendered as POI icons on the background layer. 
// For more info, see our wiki: 
// https://wiki.thinkgeo.com/wiki/thinkgeo_iconfonts 
WebFont.load({
    custom: {
        families: ['vectormap-icons'],
        urls: ['https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css']
    }
});


/*---------------------------------------------*/
// 3. Map Control Setup
/*---------------------------------------------*/

// Now, we'll create the two different styles of layers for our map. 
// The two styles of layers use ThinkGeo Cloud Maps Vector Tile service to 
// display the detailed light style street map and dark style street map.
// For more info, see our wiki: 
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles
let light = new ol.mapsuite.VectorTileLayer('https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json', {
    apiKey: apiKey,
    layerName: 'light'
});

let dark = new ol.mapsuite.VectorTileLayer('https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/dark.json', {
    apiKey: apiKey,
    visible: false,
    layerName: 'dark'
});

// Create and initialize our multi-style map.
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,

    // Add our two previously-defined ThinkGeo Cloud Vector Tile layers to the map.
    layers: [light, dark],
    // States that the HTML tag with id="map" should serve as the container for our map.
    target: 'map',
    // Create a default view for the map when it starts up.
    view: new ol.View({

        // Center the map on The United States and start at zoom level 3.
        center: ol.proj.fromLonLat([-96.79620, 32.79423]),
        maxResolution: 40075016.68557849 / 512,
        zoom: 3,
        minZoom: 2,
        maxZoom: 19
    })
});

// Add a button to the map that lets us toggle full-screen display mode.
map.addControl(new ol.control.FullScreen());


/*---------------------------------------------*/
// 4. Display Different Styles Of Maps 
/*---------------------------------------------*/

// When click the different styles button, render the relevant style map.
document.getElementById('wrap').addEventListener('click', (e) => {
    const nodeList = document.querySelectorAll(".thumb");
    
    for (let node of nodeList) {
        node.style.borderColor = 'transparent';
    }
    if (e.target.nodeName == 'DIV') {
        e.target.style.borderColor = '#ffffff';
        changeLayer(e);
    }
})

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






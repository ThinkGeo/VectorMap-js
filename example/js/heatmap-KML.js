/*===========================================================================*/
// Global Earthquake Distribution
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Display Heat Style Polygons
//   3. Map Control Setup
//   4. ThinkGeo Map Icon Fonts
//   5. Tile Loading Event Handlers
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
// 2. Display Heat Style Polygons
/*---------------------------------------------*/

// This next part sets up the heat style for the placemark on our map. As we 
// zoom out, the color of the placemarks that are close together will be deepened, 
// and these placemarks will be merged into one region. This heat map shows magnitude 
// of each earthquake in each placemark, with color-coded from weakest to strongest.

// Create heat map layer. It uses an xml format data, which is hosted on our server, 
// to display the heat layer.
let heatMapLayer = new ol.mapsuite.Heatmap({
    source: new ol.source.Vector({
        url: '../data/2012_Earthquakes_Mag5.xml',
        // Define the data format as KML.
        format: new ol.format.KML({
            extractStyles: false
        })
    }),
    // The blur size.
    blur: 15,
    // The radius size.
    radius: 10
});

// When add feature to the heatmap layer, 
heatMapLayer.getSource().on('addfeature', function (event) {
    // 2012_Earthquakes_Mag5.xml stores the magnitude of each earthquake in a
    // standards-violating <magnitude> tag in each Placemark.  We extract it from
    // the Placemark's name instead.
    let name = event.feature.get('name');
    let magnitude = parseFloat(name.substr(2));
    // Set weight style for every point according to magnitude.
    event.feature.set('weight', magnitude - 5);
});

/*---------------------------------------------*/
// 3. Map Control Setup
/*---------------------------------------------*/

// Now we'll create the base layer for our map.  The base layer uses the ThinkGeo
// Cloud Maps Vector Tile service to display a detailed street map.  For more
// info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles
let baseLayer = new ol.mapsuite.VectorTileLayer("https://cdn.thinkgeo.com/worldstreets-styles/3.0.0/light.json", {
    'apiKey': apiKey,
});

// This function will create and initialize our interactive map.
// We'll call it later when our POI icon font has been fully downloaded,
// which ensures that the POI icons display as intended.
let map;
let initializeMap = () => {
    map = new ol.Map({
        renderer: 'webgl',
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,

        // Add our previously-defined ThinkGeo Cloud Vector Tile layer to the map.
        layers: [baseLayer],
        // States that the HTML tag with id="map" should serve as the container for our map.
        target: 'map',
        // Create a default view for the map when it starts up.
        view: new ol.View({
            // Center the map on Oceania and start at zoom level 3.
            center: ol.proj.fromLonLat([149.704275, -15.037667]),
            maxResolution: 40075016.68557849 / 512,
            zoom: 3,
            minZoom: 2,
            maxZoom: 19
        })
    });

    // Add a button to the map that lets us toggle full-screen display mode.
    map.addControl(new ol.control.FullScreen());

    // Add the pre-defined heatmap layer to our map.
    map.addLayer(heatMapLayer);
}


/*---------------------------------------------*/
// 4. ThinkGeo Map Icon Fonts
/*---------------------------------------------*/

// Finally, we'll load the Map Icon Fonts using ThinkGeo's WebFont loader. 
// The loaded Icon Fonts will be used to render POI icons on top of the map's 
// background layer.  We'll initalize the map only once the font has been 
// downloaded.  For more info, see our wiki: 
// https://wiki.thinkgeo.com/wiki/thinkgeo_iconfonts 
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/2.0.0/vectormap-icons.css"]
    },
    // The "active" property defines a function to call when the font has
    // finished downloading.  Here, we'll call our initializeMap method.
    active: initializeMap
});


/*---------------------------------------------*/
// 5. Tile Loading Event Handlers
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

setLayerSourceEventHandlers(baseLayer);

document.querySelector('#error-modal button').addEventListener('click', () => {
    document.querySelector('#error-modal').classList.add('hide');
})
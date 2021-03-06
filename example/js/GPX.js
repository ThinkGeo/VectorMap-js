/*===========================================================================*/
// Work with GPX
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. GPX Setup
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
// 2. GPX Setup
/*---------------------------------------------*/

// Create another layer from a GPX format data file hosted on our server, this time to hold the style 
// for the GPX polygon and point. Then apply the styleJSON to GPX layer.

// For more info about StyleJSON, see our wiki:  
// https://thinkgeo.gitbooks.io/map-suite-stylejson-specification/content/

// For more info about Map Suite Portable Data Format, see our wiki: 
// https://wiki.thinkgeo.com/wiki/map_suite_portable_data_format_guide
const gpxStyleJson = {
    "id": "gpx-stylejson",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "variables": {},
    "styles": [{
        "id": "line",
        "style": [{
            "filter": "zoom>=1;zoom<=19",
            "line-color": "#00008B",
            "line-width": 3,
        }]
    },{
        "id": "point",
        "style": [{
            "filter": "zoom>=1;zoom<=19",
            "point-type": "symbol",
            "point-symbol-type": "circle",
            "point-outline-color": "#ed6c82",
            "point-outline-width": 2,
            "point-fill": "#990100",
            "point-size": 16
        }]
    }],
    "sources": [{
        "id": "data_source",
        "url": "../data/fells_loop.gpx",
        "type": "GPX"
    }],
    "layers": [{
        "id": "gpx_layer",
        "source": "data_source",
        "styles": [
            "line", "point"
        ]
    }]
}

// Create GPX layer by using the pre-defined StyleJSON.
let gpxVectorLayer = new ol.mapsuite.VectorLayer(gpxStyleJson, {
    multithread: false
})


/*---------------------------------------------*/
// 3. Map Control Setup
/*---------------------------------------------*/

// Now we'll create the base layer for our map. The light style of layers uses ThinkGeo Cloud 
// Maps Vector Tile service to display the detailed base map. For more info, see our wiki: 
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles 
let baseLayer = new ol.mapsuite.VectorTileLayer('https://cdn.thinkgeo.com/worldstreets-styles/3.0.0/light.json', {
    apiKey: apiKey,
    layerName: 'light'
});

// This function will create and initialize our interactive map.
// We'll call it later when our POI icon font has been fully downloaded,
// which ensures that the POI icons display as intended.
let initializeMap = function () {
    let map = new ol.Map({
        renderer: 'webgl',
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        // States that the HTML tag with id="map" should serve as the container for our map.
        target: 'map',
        // Add our previously-defined ThinkGeo Cloud Vector Tile layer and WKT layer to the map.
        layers: [
            baseLayer, gpxVectorLayer
        ],
        // Create a default view for the map when it starts up.
        view: new ol.View({
            // Center the map on Boston and start at zoom level 13.
            center: [-7916041.528716288, 5228379.045749711],
            maxResolution: 40075016.68557849 / 512,
            zoom: 13,
            minZoom: 1,
            maxZoom: 19
        })
    });

    // Add a button to the map that lets us toggle full-screen display mode.
    map.addControl(new ol.control.FullScreen());
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
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/2.0.0/vectormap-icons.css"],
		testStrings: {
			'vectormap-icons': '\ue001'
		}
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
/*===========================================================================*/
// Work with GPX
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. ThinkGeo Map Icon Fonts
//   3. GPX Setup
//   4. Map Control Setup
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
// 2. ThinkGeo Map Icon Fonts
/*---------------------------------------------*/

// Now we'll load the Map Icon Fonts using the WebFont loader. The loaded 
// Icon Fonts will be rendered as POI icons on the background layer. 
// For more info, see our wiki: 
// https://wiki.thinkgeo.com/wiki/thinkgeo_iconfonts 
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});


/*---------------------------------------------*/
// 3. GPX Setup
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
        "id": "Line",
        "style": [{
            "line-color": "	#00008B",
            "line-width": 3,
        }]
    }, {
        "id": "Point",
        "style": [{
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
            "Line", "Point"
        ]
    }]
}

// Create GPX layer by using the pre-defined StyleJSON.
let gpxVectorLayer = new ol.mapsuite.VectorLayer(gpxStyleJson, {
    multithread: false
})


/*---------------------------------------------*/
// 4. Map Control Setup
/*---------------------------------------------*/

// Now we'll create the base layer for our map. The light style of layers uses ThinkGeo Cloud 
// Maps Vector Tile service to display the detailed base map. For more info, see our wiki: 
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles 
let baseLayer = new ol.mapsuite.VectorTileLayer('https://cdn.thinkgeo.com/worldstreets-styles/1.0.0-beta009/light.json', {
    apiKey: apiKey,
    layerName: 'light'
});

// Create and initialize our map control.
let map = new ol.Map({
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
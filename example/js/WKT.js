/*===========================================================================*/
// Work with WKT
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. WKT Setup
//   3. Map Control Setup
//   4. ThinkGeo Map Icon Fonts
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
// 2. WKT Setup
/*---------------------------------------------*/

// Create another layer from a GeoJSON data file hosted on our server, this time to hold the color fill 
// for the WKT polygon. Then apply the styleJSON to WKT layer.

// For more info about StyleJSON, see our wiki:  
// https://thinkgeo.gitbooks.io/map-suite-stylejson-specification/content/

// For more info about Map Suite Portable Data Format, see our wiki: 
// https://wiki.thinkgeo.com/wiki/map_suite_portable_data_format_guide
const wktStyleJson = {
    "id": "wkt-stylejson",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "variables": {},
    "styles": [{
        "id": "wktpolygon",
        "style": [{
            "polygon-fill": "rgba(241,47,110,0.5)"
        }, ]
    }, ],
    "sources": [{
        "id": "data_source",
        "url": "../data/map.wkt",
        "type": "WKT",
        "dataProjection": "EPSG:4326",
        "featureProjection": "EPSG:3857"
    }],
    "layers": [{
        "id": "wkt_layer",
        "source": "data_source",
        "styles": [
            "wktpolygon"
        ]
    }]
}

// Create WKT layer by using the pre-defined StyleJSON.
let wktVectorLayer = new ol.mapsuite.VectorLayer(wktStyleJson, {
    multithread: false
})


/*---------------------------------------------*/
// 3. Map Control Setup
/*---------------------------------------------*/

// Now we'll create the base layer for our map. The light style of layers uses ThinkGeo Cloud 
// Maps Vector Tile service to display the detailed base map. For more info, see our wiki: 
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles 
let baseLayer = new ol.mapsuite.VectorTileLayer('https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json', {
    apiKey: apiKey,
    layerName: 'light'
});

// This function will create and initialize our interactive map.
// We'll call it later when our POI icon font has been fully downloaded,
// which ensures that the POI icons display as intended.
let initializeMap = function () {
    let map = new ol.Map({
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        // States that the HTML tag with id="map" should serve as the container for our map.
        target: 'map',
        // Add our previously-defined ThinkGeo Cloud Vector Tile layer and WKT layer to the map.
        layers: [
            baseLayer, wktVectorLayer,
        ],
        // Create a default view for the map when it starts up.
        view: new ol.View({
            // Center the map in Alabama and start at zoom level 6.
            center: ol.proj.fromLonLat([-86.79620, 32.79423]),
            maxResolution: 40075016.68557849 / 512,
            zoom: 6,
            minZoom: 1,
            maxZoom: 19,
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
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/2.0.0/vectormap-icons.css"]
    },
    // The "active" property defines a function to call when the font has
    // finished downloading.  Here, we'll call our initializeMap method.
    active: initializeMap
});
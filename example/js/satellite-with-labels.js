/*===========================================================================*/
// Hybrid Maps
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. ThinkGeo Map Icon Fonts
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

// This sample demonstrates a hybrid map: one that displays aerial imagery as 
// the background layer, and vector-based street data on top of that layer.
// This uses a combination of two ThinkGeo Cloud Maps services:
//    1. Cloud Maps Raster Tile service (for the aerial imagery)
//    2. Cloud Maps Vector Tile service (for the street data on top)
// For more info about these services, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_raster_tiles
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles

// Create the aerial background layer.
let rasterAerialLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `https://cloud.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg?apiKey=${apiKey}`,
        tileSize: 512
    }),
});

// Create the vector street map layer.
let vectorStreetsLayer = new ol.mapsuite.VectorTileLayer("https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/transparent-background.json", {
    apiKey: apiKey
});

// This function will create and initialize our interactive map.
// We'll call it later when our POI icon font has been fully downloaded,
// which ensures that the POI icons display as intended.
let initializeMap = function () {
    let map = new ol.Map({
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,

        // Add our previously-defined raster and vector tile layers to the map.
        layers: [rasterAerialLayer, vectorStreetsLayer],
        // States that the HTML tag with id="map" should serve as the container for our map.
        target: 'map',
        // Create a default view for the map when it starts up.
        view: new ol.View({

            // Center the map on the United States and start at zoom level 3.
            center: ol.proj.fromLonLat([-96.79620, 32.79423]),
            maxResolution: 40075016.68557849 / 512,
            progressiveZoom: false,
            zoom: 3,
            minZoom: 1,
            maxZoom: 19
        }),
    });

    // Add a button to the map that lets us toggle full-screen display mode.
    map.addControl(new ol.control.FullScreen());
}

/*---------------------------------------------*/
// 3. ThinkGeo Map Icon Fonts
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
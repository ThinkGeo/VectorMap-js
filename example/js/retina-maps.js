
/*===========================================================================*/
// Raster Maps(High Resolution)
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
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

// Now we'll create the base layer for our map. The base layer uses the ThinkGeo
// Cloud Maps Raster Tile service to display a detailed map. The resolution for 
// the requesting tile, “X1” and “X2” are available. “X1” is good enough for a 
// regular 96 dpi monitor while “X2” is good for high DPI display. Here we use 
// high resolution tiles for high DPI display. For more info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_raster_tiles
let map2xLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x2/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
        tileSize: 512,
        tilePixelRatio: 2
    }),
});

// Create and initialize our interactive map.
let map2x = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,

    // Add our previously-defined ThinkGeo Cloud High Resolution Raster Tile layer to the map.
    layers: [map2xLayer],
    // States that the HTML tag with id="map@2x" should serve as the container for our map.
    target: 'map@2x',
    // Create a default view for the map when it starts up.
    view: new ol.View({

        // Center the map on the United States and start at zoom level 3.
        center: ol.proj.fromLonLat([-96.79620, 32.79423]),
        maxResolution: 40075016.68557849 / 512,
        zoom: 3,
        minZoom: 1,
        maxZoom: 19,
        progressiveZoom: false,
    }),
});

// Add a button to the map that lets us toggle full-screen display mode.
map2x.addControl(new ol.control.FullScreen());
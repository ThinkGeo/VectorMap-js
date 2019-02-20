
/*===========================================================================*/
// Raster Maps (High Resolution)
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
// Cloud Maps Raster Tile service to display a detailed map, and demonstrates 
// how high-resolution tiles can be requested.  These tiles will look much 
// better on high-DPI displays like those found on mobile phones and tablets.
// 
// Available tile resolutions:
//   - x1: Standard resolution, suitable for 72-96 DPI displays.
//   - x2: Double resolution, suitable for mobiles and other high-DPI displays.
//
// For more info about our high-DPI support, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_raster_tiles

// Create a raster tile layer that specifies 512 x 512 tile size and "x2" 
// resolution in the URL.  In practice, this means the tiles we receive will be 
// double the requested size, so 1024 x 1024.
let tileResolution = 'x2';
let highDpiLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/${tileResolution}/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
        // The next two options must be set for proper display of high-DPI 
        // tiles. Each 1024 x 1024 tile will be displayed at 512 x 512 
        // which doubles the visible detail.
        tileSize: 512,
        tilePixelRatio: 2
    }),
});

// Create and initialize our interactive map.
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,

    // Add our previously-defined ThinkGeo Cloud High Resolution Raster Tile layer to the map.
    layers: [highDpiLayer],
    // States that the HTML tag with id="map@2x" should serve as the container for our map.
    target: 'map',
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
map.addControl(new ol.control.FullScreen());
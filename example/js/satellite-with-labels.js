/*===========================================================================*/
// Hybrid Maps
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
// 2. Map Control Setup
/*---------------------------------------------*/

// Now we'll create the base layer and label layer for our map.  The base layer uses the 
// ThinkGeo Cloud Maps Raster Tile service to display a detailed imagery map. The label layer uses the ThinkGeo 
// Cloud Maps Vector Tile service to display the detailed labels. For more info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_raster_tiles
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles

let satelliteLabeLayer = new ol.mapsuite.VectorTileLayer("https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/transparent-background.json", {
    apiKey: apiKey 
});

let satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `https://cloud.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg?apiKey=${apiKey}`,
        tileSize: 512
    }),
});

// Create and initialize our interactive map.
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,

    // Add our previously-defined ThinkGeo Cloud Vector and Raster Tile layers to the map.
    layers: [satelliteLayer, satelliteLabeLayer],
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
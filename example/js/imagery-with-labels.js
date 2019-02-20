/*===========================================================================*/
// Vector Maps on Custom Imagery
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
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
// 2. Map Control Setup
/*---------------------------------------------*/

// Now we'll create the base imagery layer and label layer for our map.  The base 
// imagery layer uses the data source from NASA to display the background layer. 
// The label layer uses the ThinkGeo Cloud Maps Vector Tile services to display the 
// detailed labels. It is optional to use the the ThinkGeo Cloud Maps Imagery Data 
// for the base imagery layers.  For more info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles
// https://wiki.thinkgeo.com/wiki/thinkgeo_offline_data_maps_imagery

// Create imagery label layer
let imageryLabeLayer = new ol.mapsuite.VectorTileLayer("https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/transparent-background.json", {
    apiKey: apiKey, 
    visible: true
});

//Create imagery layer
let imageryLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: 'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg' //Source from NASA
    }),
});

// Create and initialize our interactive map.
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    
    // Add our previously-defined ThinkGeo Cloud Vector Tile layer to the map.
    layers: [imageryLayer, imageryLabeLayer],
    // States that the HTML tag with id="map" should serve as the container for our map.
    target: 'map',
    // Create a default view for the map when it starts up.
    view: new ol.View({

        // Center the map on the United States and start at zoom level 3.
        center: ol.proj.fromLonLat([-96.79620, 35.79423]),
        maxResolution: 40075016.68557849 / 512,
        zoom: 3,
        minZoom: 3,
        maxZoom: 7,
    }),
});

// Add a button to the map that lets us toggle full-screen display mode.
map.addControl(new ol.control.FullScreen());
/*===========================================================================*/
// Work with WKT
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. ThinkGeo Map Icon Fonts
//   3. WKT Setup
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
        families: ['vectormap-icons'],
        urls: ['https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css']
    }
});


/*---------------------------------------------*/
// 3. WKT Setup
/*---------------------------------------------*/

// Create another layer from a GeoJSON data file hosted on our server, this time to hold the color fill 
// for the WKT polygon. Then apply the styleJSON to WKT layer.

// For more info about StyleJSON, see our wiki:  
// https://thinkgeo.gitbooks.io/map-suite-stylejson-specification/content/

// For more info about Map Suite Portable Data Format, see our wiki: 
// https://wiki.thinkgeo.com/wiki/map_suite_portable_data_format_guide
const wktStyleJson =
{
    "id": "wkt-stylejson",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "variables": {
    },
    "styles": [{
        "id": "wktpolygon",
        "style": [
            {
                "polygon-fill": "rgba(241,47,110,0.5)"
            },
        ]
    },
    ],
    "sources": [{
        "id": "data_source",
        "url": "../data/map.wkt",
        "type": "WKT",
        "dataProjection":"EPSG:4326",
        "featureProjection":"EPSG:3857"
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
// 4. Map Control Setup
/*---------------------------------------------*/

// Now we'll create the base layer for our map. The light style of layers uses ThinkGeo Cloud 
// Maps Vector Tile service to display the detailed base map. For more info, see our wiki: 
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles 
let baseLayer = new ol.mapsuite.VectorTileLayer('https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json', {
    apiKey: apiKey,
    layerName: 'light'
});

// Create and initialize our multi-style map.
let map =  new ol.Map({                         
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
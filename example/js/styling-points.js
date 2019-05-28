/*===========================================================================*/
// Render POIs
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Styling Points of Interest Layer
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
// 2. Styling Points of Interest Layer
/*---------------------------------------------*/

// This next part sets up the style for the POI points on our map. We use the point data 
// from a small GeoJSON file hosted on our servers, but you can load your own data from 
// any publicly-accessible server.  In the near future you'll be able to upload your
// data to the ThinkGeo Cloud and let us host it for you!
const geosjonStyle = {
    "id": "Frisco-school-poi",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "background": "#aac6ee",
    "variables": {},
    "styles": [{
            "id": "poi_icon",
            "point-type": "glyph",
            "point-glyph": "vectormap-icons",
            "point-fill": "#439c3c",
            "point-size": 36,
            "point-outline-color": "#ffffff",
            "point-outline-width": 3,
            "point-fill": "#ff6666",
            "point-mask-outline-width": 1,
            "point-glyph-mask-type": "circle",
            "point-glyph-mask-color": "#5dc33f",
            "style": [{
                "filter": "SUBTYPE=2",
                "point-fill": "#FF0000",
                "point-glyph-name": "\ue0aa"

            }, {
                "filter": "SUBTYPE=3",
                "point-fill": "#000080",
                "point-glyph-name": "\ue0a8"

            }, {
                "filter": "SUBTYPE=5",
                "point-fill": "#4B0080",
                "point-glyph-name": "\ue0ab"
            }, {
                "filter": "SUBTYPE=7",
                "point-fill": "#800000",
                "point-glyph-name": "\ue0ab"
            }]
        },
        {
            "id": "poi_name",
            "style": [{
                "text-name": "NAME",
                "text-wrap-width": 40,
                "text-fill": "#496588",
                "text-halo-fill": "rgba(255, 255, 255, 0.5)",
                "text-halo-radius": 2,
                "text-font": "oblique 600 10px Arial, Helvetica, sans-serif",
            }]
        }
    ],
    "sources": [{
        "id": "school_source",
        "url": "../data/Frisco-school-poi.geojson",
        "type": "GeoJSON",
        "dataProjection": "EPSG:3857",
        "featureProjection": "EPSG:4326"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "school_source",
        "styles": [
            "poi_icon", "poi_name"
        ]
    }]
}


/*---------------------------------------------*/
// 3. Map Control Setup
/*---------------------------------------------*/

// Install World Streets Styles: Here we use the light theme style to render our map. 
// We have several professionally-designed map themes for your application or project, 
// which can be downloaded and use it in your application for free.  
// For more information, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_stylejson
const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/3.0.0/light.json";

// Create the base layer for our map.
const baseLayer = new ol.mapsuite.VectorTileLayer(worldstreetsStyle, {
    apiKey: apiKey
});

// Next, we'll create the layer for our points of interest, using the geojsonStyle 
// we defined in Step 2.
let pointLayer = new ol.mapsuite.VectorLayer(geosjonStyle, {
    multithread: false
})

// This function will create and initialize our interactive map.
// We'll call it later when our POI icon font has been fully downloaded,
// which ensures that the POI icons display as intended.
let initializeMap = function () {
    let map = new ol.Map({
        renderer: 'webgl',
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        // Add our previously-defined ThinkGeo Cloud Vector Tile layer and POI points data layer to the map.
        layers: [baseLayer, pointLayer],
        // States that the HTML tag with id="map" should serve as the container for our map.
        target: 'map',
        // Create a default view for the map when it starts up.
        view: new ol.View({
            // Center the map on Frisco, TX and start at zoom level 13.
            center: ol.proj.fromLonLat([-96.79620, 33.15423]),
            maxResolution: 40075016.68557849 / 512,
            zoom: 13,
            minZoom: 1,
            maxZoom: 19
        }),
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
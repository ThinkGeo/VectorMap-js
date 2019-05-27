/*===========================================================================*/
// Transform Projection
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Default Polygon Setup
//   3. Map Control Setup
//   4. Projection Transformation Setup
//   5. Event Listeners
//   6. ThinkGeo Map Icon Fonts
//   7. Tile Loading Event Handlers
/*===========================================================================*/


/*---------------------------------------------*/
// 1. ThinkGeo Cloud API Key
/*---------------------------------------------*/

// First, let's define our ThinkGeo Cloud API key, which we'll use to
// authenticate our requests to the ThinkGeo Cloud API.  Each API key can be
// restricted for use only from a given web domain or IP address.  To create your
// own API key, you'll need to sign up for a ThinkGeo Cloud account at
// https://cloud.thinkgeo.com.
// const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';
const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~';


/*---------------------------------------------*/
// 2. Default Polygon Setup
/*---------------------------------------------*/

// Now, define a default area which is a rectangle around the ThinkGeo U.S. office park.  
const defaultWkt = "POLYGON((-96.81058934136763 33.129382039876546,-96.80844357415572 33.129382039876546,-96.80844357415572 33.12814213686314,-96.81058934136763 33.12814213686314,-96.81058934136763 33.129382039876546))";


/*---------------------------------------------*/
// 3. Map Control Setup
/*---------------------------------------------*/

// Now we'll create the base layer for our map.  The base layer uses the ThinkGeo
// Cloud Maps Vector Tile service to display a detailed street map.  For more
// info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles
const defaultLayer = new ol.mapsuite.VectorTileLayer('https://cdn.thinkgeo.com/worldstreets-styles/3.0.0/light.json', {
    apiKey: apiKey,
    layerName: 'light'
});

// Crreate the bounding box style.
const boundingBoxStyle = style = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: [0, 0, 255, 0.5],
        width: 1
    }),
    fill: new ol.style.Fill({
        color: [0, 0, 255, 0.1]
    })
})

// Set up the bounding box layer which created by the input wkt value.
const projectionLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        features: []
    }),
    style: boundingBoxStyle
});

// Create a default view for the map when it starts up.
const view = new ol.View({
    // Center the map on the United States and start at zoom level 2.
    center: ol.proj.fromLonLat([-96.79620, 32.79423]),
    maxResolution: 40075016.68557849 / 512,
    zoom: 3,
    minZoom: 2,
    maxZoom: 19
});

// This function will create and initialize our interactive map.
// We'll call it later when our POI icon font has been fully downloaded,
// which ensures that the POI icons display as intended.
let map;
const initializeMap = () => {
    map = new ol.Map({
        renderer: 'webgl',
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        layers: [defaultLayer, projectionLayer],
        target: 'map',
        view: view
    });
    
    // Add a button to the map that lets us toggle full-screen display mode.
    map.addControl(new ol.control.FullScreen());

    // Add the default wkt feature to map.
    addFeatureToMap(defaultWkt);
}


/*---------------------------------------------*/
// 4. Projection Transformation Setup
/*---------------------------------------------*/

// At this point we'll build up the methods and functionality that will actually perform 
// the Projection Transfromation. It uses the ThinkGeo Cloud and display the result in the 
// right text box, and at the same time, draw the corresponding feature on the map.

// Draw the corresponding feature on the map.


// This method will create the projection transformation feature, and add it to projectionLayer 
// which we create earlier. Fit the given geometry or extent based on the given boundingBox.
const addFeatureToMap = (wkt) => {
    const format = new ol.format.WKT();
    const feature = format.readFeature(wkt, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    });
    projectionLayer.getSource().addFeature(feature);
    view.fit(feature.getGeometry(), {
        padding: [20, 20, 20, 20]
    })
}

// We use thinkgeocloudclient.js, which is an open-source Javascript SDK for making 
// request to ThinkGeo Cloud Service. It simplifies the process of the code of request.

// We need to create the instance of Projection client and authenticate the API key.
const projectionClient = new tg.ProjectionClient(apiKey);

// This method performs the actual Transfrom Projection using the ThinkGeo Cloud. 
// By passing in the wkt value in the left text box, we can 
// get back a Spherical Mercator format wkt value.
const performTransform = (wkt) => {
    const fromProj = 4326;
    const toProj = 3857;
    projectionClient.projectForGeometry(wkt, fromProj, toProj, (status, res) => {
        if (status !== 200) {
            document.querySelector('.loading').classList.add('hide');
            if (res.data) {
                document.querySelector('.spherical-mercator textarea').value = `${res.status}: ${res.data.wkt}`;
            } else {
                errorLoadingTile();
            }
        } else {
            document.querySelector('.loading').classList.add('hide');
            document.querySelector('.spherical-mercator textarea').value = res.data.wkt;
            addFeatureToMap(wkt);
        }
    });
}


/*---------------------------------------------*/
// 5. Event Listeners
/*---------------------------------------------*/

// These event listeners tell the UI when it's time to execute all of the 
// code we've written.

document.addEventListener('DOMContentLoaded', () => {

    // This method will receive the WKT value from the left textarea. By passing them to 
    // performTransform to perform Projection Transform and show in the right text box.
    document.getElementById('transform').addEventListener('click', () => {
        projectionLayer.getSource().clear();
        document.querySelector('.loading').classList.remove('hide');
        document.querySelector('.spherical-mercator textarea').value = '';
        const wkt = document.querySelector('.decimal-degree textarea').value;
        performTransform(wkt);
    });
    document.querySelector('.decimal-degree textarea').value = defaultWkt;
})


/*---------------------------------------------*/
// 6. ThinkGeo Map Icon Fonts
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


/*---------------------------------------------*/
// 7. Tile Loading Event Handlers
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

setLayerSourceEventHandlers(defaultLayer);

document.querySelector('#error-modal button').addEventListener('click', () => {
    document.querySelector('#error-modal').classList.add('hide');
})
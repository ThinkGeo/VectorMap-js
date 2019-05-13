/*===========================================================================*/
// Chicago Crime - Hex Grid
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. Styling
//   4. Hex Grid Layer Setup
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

// Now we'll create the base layer for our map.  The base layer uses the ThinkGeo
// Cloud Maps Raster Tile service to display a detailed map and its the map style is dark.  For more
// info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_raster_tiles
let baseLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
        tileSize: 512,
    }),
});

// Create and initialize our interactive map.
let map = new ol.Map({
	renderer: 'webgl',
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    // Add our previously-defined ThinkGeo Cloud Raster Tile layer to the map.
    layers: [baseLayer],
    // States that the HTML tag with id="map" should serve as the container for our map.
    target: 'map',
    // Create a default view for the map when it starts up.
    view: new ol.View({
        // Center the map on Chicago and start at zoom level 10.
        maxResolution: 40075016.68557849 / 512,
        center: ol.proj.fromLonLat([-87.64620, 41.82623]),
        zoom: 10,
        minZoom: 1,
        maxZoom: 19,
        progressiveZoom: false,
    })
});

// Add a button to the map that lets us toggle full-screen display mode.
map.addControl(new ol.control.FullScreen());


/*---------------------------------------------*/
// 3. Styling
/*---------------------------------------------*/

// This part sets up the Hex Grid style. This display Chicago drug-related 
// crimes in 2016. The more crimes in a place the deeper the color of each 
// hex grid will be.
const createStyle = (f) => {
    let color;
    const xxl = 251;
    const xl = 150;
    const max = 100;
    const middle = 50
    const min = 1;
    if (f.get('features').length > xxl) {
        color = '#3d0401';
    } else if (f.get('features').length > xl && f.get('features').length < xxl) {
        color = '#910902';
    } else if (f.get('features').length > max && f.get('features').length < xl) {
        color = '#c40c02';
    } else if (f.get('features').length > middle && f.get('features').length < max) {
        color = '#e50e03';
    } else if (f.get('features').length > min && f.get('features').length < middle) {
        color = '#fd4a40';
    } else {
        color = '#fd6962';
    }
    let style = [new ol.style.Style({
        fill: new ol.style.Fill({
            color: color
        })
    })]
    return style;
}

/*---------------------------------------------*/
// 4. Hex Grid Layer Setup
/*---------------------------------------------*/

// This next step part sets up the Hex Grid Layer on our map. Now that we've set 
// up our map's base layer, we need to actually load the point data that will let 
// us visualize Chicago crimes on the map. We'll load it from a JSON file hosted 
// on our servers.
const getJson = (filePath) => {
    let readTextFile = new Promise(function (resolve, reject) {
        let rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", filePath, true);
        rawFile.onreadystatechange = function (ERR) {
            if (rawFile.readyState === 4) {
                if (rawFile.status == "200") {
                    resolve(rawFile.responseText);
                } else {
                    reject(new Error(ERR));
                }
            }
        }
        rawFile.send(null);
    });
    return readTextFile;
};

// Once the JSON file has been fully downloaded, just get the coordinates and create 
// features for the Hex Grid Layer.
getJson("../data/crime.json").then((data) => {
    let result = JSON.parse(data);
    let features = [];
    let source = new ol.source.Vector();
    for (let i = 0, length = result.length; i < length; i++) {
        // Create feature for each point.
        let coord = ol.proj.fromLonLat(result[i].geometry.coordinates);
        let feature = new ol.Feature(new ol.geom.Point(coord));
        feature.set('id', i);
        features.push(feature);
    }
    source.clear();
    source.addFeatures(features);
    // Call the createHexGridLayer method to create Hex Grid Layer and add it to our map.
    createHexGridLayer(source);
});

const createHexGridLayer = (source) => {
    // Set the hexagon source and size.
    let hexbin = new ol.source.HexBin({
        source: source, 
        size: 1000
    });

    // Create the hex grid layer using the pre-defined source and style.
    let hexGridlayer = new ol.layer.Vector({
        source: hexbin,
        opacity: 0.7,
        style: createStyle,
        renderMode: 'image'
    });

    // Add the Hex Grid Layer to our map.
    map.addLayer(hexGridlayer);
};
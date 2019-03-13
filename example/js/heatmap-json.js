/*===========================================================================*/
// Road Congestion Heatmap
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup 
//   3. Road Congestion Data Layer Setup
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
// Cloud Maps Raster Tile service to display a detailed background map.  For more
// info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_raster_tiles
let baseLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
        tileSize: 512,
    }),
});

// Now we'll create and initialize our interactive map.
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    // Add our previously-defined ThinkGeo Cloud Raster Tile layer to the map.
    layers: [baseLayer],
    // States that the HTML tag with id="map" should serve as the container for our map.
    target: 'map',
    // Create a default view for the map when it starts up.
    view: new ol.View({
        // Center the map on San Francisco and start at zoom level 12.
        center: ol.proj.fromLonLat([-122.444832, 37.759400]),
        maxResolution: 40075016.68557849 / 512,
        zoom: 12,
        minZoom: 2,
        maxZoom: 19,
        progressiveZoom: false
    })
});

// Add a button to the map that lets us toggle full-screen display mode.
map.addControl(new ol.control.FullScreen());

/*---------------------------------------------*/
// 3. Road Congestion Data Layer Setup
/*---------------------------------------------*/

// Now that we've set up our map's base layer, we need to actually load the point data layer that will let us
// visualize Road Congestion style on the map.  We'll load it from a small
// GeoJSON file hosted on our servers, but you can load your own data from any
// publicly-accessible server.  In the near future you'll be able to upload your
// data to the ThinkGeo Cloud and let us host it for you!

const getJson = () => {
    let readTextFile = new Promise(function (resolve, reject) {
        // Load the Road Congestion data from ThinkGeo's servers.
        let file = "../data/road_congestion.json";
        let rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function (ERR) {
            if (rawFile.readyState === 4) {
                if (rawFile.status == "200") {
                    resolve(rawFile.responseText);
                } else {
                    reject(new Error(ERR));
                }
            }
        };
        rawFile.send(null);
    });
    return readTextFile;
};

getJson().then((data) => {
    data = JSON.parse(data);
    let points = data.featuresArr;
    // Let's build up an array of features, one for each point in our dataset.
    let featuresArr = [];
    // For each feature in the JSON dataset, add it to the feature 
    // collection array and create a point shape.
    for (let i = 0; i < points.length; i++) {
        let coord = points[i].coordinate;

        let pointFeature = new ol.Feature({
            geometry: new ol.geom.Point(coord),
            // The weight value is between 0 and 1.
            weight: points[i].value / 100
        });
        featuresArr.push(pointFeature)
    }
    // Create a Heatmap Source that will enable us to display our data points 
    // as heatmap, and pass our array of features into it. 
    let vectorSource = new ol.source.Vector();
    vectorSource.addFeatures(featuresArr);

    // Create a Heatmap Layer whose source is our Road Congestion Source, and add it to our map.
    let heatmapLayer = new ol.layer.Heatmap({
        source: vectorSource,
        // Set Heatmap data blur size.
        blur: 15,
        // Set Heatmap data radius size.
        radius: 3,
        // Set Heatmap data color group.
        gradient: ['#00f', '#0ff', '#0f0', '#ff0', '#f00']
    });
    // Add the pre-defined layer to our map.
    map.addLayer(heatmapLayer);
})
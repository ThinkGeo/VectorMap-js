/*===========================================================================*/
// Precipitation Distribution
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. Precipitation Distribution Layer Setup
//   4. ThinkGeo Map Icon Fonts
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
// Cloud Maps Vector Tile service to display a detailed street map.  For more
// info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles
let baseLayer = new ol.mapsuite.VectorTileLayer("https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/dark.json", {
    'apiKey': apiKey,
});

// This function will create and initialize our interactive map.
// We'll call it later when our POI icon font has been fully downloaded,
// which ensures that the POI icons display as intended.
let map;
let initializeMap = function () {
    map = new ol.Map({
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        // Add our previously-defined ThinkGeo Cloud Vector Tile Layer to the map.
        layers: [baseLayer],
        // States that the HTML tag with id="map" should serve as the container for our map.
        target: 'map',
        // Create a default view for the map when it starts up.
        view: new ol.View({
            // Center the map on China and start at zoom level 3.
            center: [11877713.642017495, 3471206.770222437],
            maxResolution: 40075016.68557849 / 512,
            zoom: 3,
            minZoom: 1,
            maxZoom: 19,
            progressiveZoom: false,
        })
    });

    // Add a button to the map that lets us toggle full-screen display mode.
    map.addControl(new ol.control.FullScreen());

    // Add the pre-defined layer to our map.
    map.addLayer(precipitationDistributionLayer);
}


/*---------------------------------------------*/
// 3. Precipitation Distribution Layer Setup
/*---------------------------------------------*/

// Now that we've set up our map's base layer, we need to actually create 
// the precipitation distribution layer.

// Here we uses two styles to show the precipitation distribution layer.
// Set the style for precipitation distribution layer line and text.
let styleLineFunc = function (feature) {
    let color = feature.get("color");
    let text = feature.get("symbol");
    color = "rgba(" + color + ")";
    return new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: color,
            width: 2
        }),
        text: new ol.style.Text({
            text: text,
            placement: 'line',
            font: '20px  Calibri,sans-serif',
            fill: new ol.style.Fill({
                color: color,
            }),
            stroke: new ol.style.Stroke({
                color: '#fff',
                width: 2
            }),
        })
    })
};

// Set the style for filling the sparse space of the precipitation distribution layer.
let stylePlaneFunc = function (feature) {
    let color = feature.get("color");
    color = "rgba(" + color + ")";
    return new ol.style.Style({
        fill: new ol.style.Fill({
            color: color
        })
    })
};


// Load the data layer that will let us visualize China's precipitation distribution. 
// We'll load it from a small JSON file hosted on our servers.
let precipitationDistributionLayer;
const getJson = () => {
    let readTextFile = new Promise(function (resolve, reject) {
        // Load the China Rain Fall data from ThinkGeo's servers.
        let file = "../data/rainfall.json";
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
    result = JSON.parse(data);

    let geojson = {
        "type": "FeatureCollection",
        "totalFeatures": result.contours.length,
        // Let's build up an array of features, one for each point in our dataset.
        "features": []
    };

    // For each feature in the dataset, add it to the feature 
    // collection array and create a point shape.
    for (let i = 0; i < result.contours.length; i++) {
        let contour = result.contours[i];
        let coords = [];
        for (let j = 0; j < contour.latAndLong.length; j++) {
            let latlon = contour.latAndLong[j];
            coords.push(ol.proj.transform([latlon[1], latlon[0]], 'EPSG:4326', 'EPSG:3857'));
        }
        let feature = {
            "type": "Feature",
            "geometry_name": "geom",
            "geometry": {
                "type": "Polygon",
                "coordinates": [coords]
            },
            "properties": {
                "color": contour.color,
                "symbol": contour.symbol
            }
        };
        geojson.features.push(feature);
    }

    // Create a vector Source that will enable us to display our data points 
    // as map, and pass our array of features into it. 
    let vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(geojson)
    });

    // Create Precipitation Distribution Layer whose source is our China Rain Fall data, and add it to our map.
    precipitationDistributionLayer = new ol.layer.Vector({
        source: vectorSource,
        style: function (feature) {
            textStyle.getText().setText(feature.get('symbol'));
            return textStyle;
        }
    });

    // We set the Precipitation Distribution Layer's default style as spare space with color.
    precipitationDistributionLayer.setStyle(stylePlaneFunc);
    precipitationDistributionLayer.setOpacity(0.8);

    // Check the status of checkbox to switch the Precipitation Distribution Layer style.
    document.getElementById('checkbox').addEventListener('change', function () {
        if (document.getElementById('checkbox').checked) {
            precipitationDistributionLayer.setStyle(stylePlaneFunc);
        } else {
            precipitationDistributionLayer.setStyle(styleLineFunc);
        }
    })
})

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
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/2.0.0/vectormap-icons.css"]
    },
    // The "active" property defines a function to call when the font has
    // finished downloading.  Here, we'll call our initializeMap method.
    active: initializeMap
});
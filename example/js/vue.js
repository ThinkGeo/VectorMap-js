/*===========================================================================*/
// Vue.JS
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Load World Streets Style JSON File
//   3. Map Control Setup
//   4. Customize Map Style
//   5. Tile Loading Event Handlers
//   6. ThinkGeo Map Icon Fonts
//   7. Render Data to DOM
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
// 2. Load World Streets Style JSON File
/*---------------------------------------------*/

// Now we need to actually load the World Streets Style JSON file that will let us 
// visualize our light style map. This method will recieve a file path which is our 
// style JSON file be hosted, and send the request to get the data.
let json;
const getJson = (filePath) => {
    let readTextFile = new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType("application/json");
        xhr.open("GET", filePath, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.response);
                } else {
                    reject(new Error('Something goes wrong!'));
                }
            }
        }
        xhr.send(null);
    });
    return readTextFile;
}


/*---------------------------------------------*/
// 3. Map Control Setup
/*---------------------------------------------*/

// Now we'll create the base layer for our map.  The base layer uses the ThinkGeo
// Cloud Maps Vector Tile service to display a detailed street map.  For more
// info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles


// This function will create and initialize our interactive map.
// We'll call it later when our POI icon font has been fully downloaded,
// which ensures that the POI icons display as intended.
let map;
let layer;
const initializeMap = function () {
    // Here we use the light theme style to render our map. 
    // We have several professionally-designed map themes for your application or project, 
    // which can be downloaded and use it in your application for free. 
    // For more information, see our wiki:
    // https://wiki.thinkgeo.com/wiki/thinkgeo_stylejson 

    // Once we have got the style JSON file, store the data to a global 
    // variable(it will be used when we create the base layer and customize the map style) and initialize our map.
    getJson("../data/light.json").then((data) => {
        json = JSON.parse(data);

        // Create the base layer for our map.
        layer = new ol.mapsuite.VectorTileLayer(json, {
            'apiKey': apiKey
        });

        map = new ol.Map({
            renderer: 'webgl',
            oadTilesWhileAnimating: true,
            loadTilesWhileInteracting: true,
            // Add our previously-defined ThinkGeo Cloud Vector Tile layer to the map.
            layers: [layer],
            // States that the HTML tag with id="map" should serve as the container for our map.
            target: 'map',
            // Create a default view for the map when it starts up.
            view: new ol.View({
                // Center the map on Texas and start at zoom level 15.
                center: ol.proj.fromLonLat([-96.917754, 33.087878]),
                maxResolution: 40075016.68557849 / 512,
                zoom: 15,
                minZoom: 1,
                maxZoom: 19
            }),
        });

        // Add a button to the map that lets us toggle full-screen display mode.
        map.addControl(new ol.control.FullScreen());

        setLayerSourceEventHandlers(layer);
    })
}


/*---------------------------------------------*/
// 4. Customize Map Style
/*---------------------------------------------*/

// This next step is to update the style what we recived from users. 
// When using the styleJson file, you can customize the presentation 
// of the ThinkGeo map, changing the style of such elements as roads, 
// parks, building, points of pois and so on. Here, you can change the 
// poi size and water fill color to have a try. 

// This method will recieve the two changed style and update it to style JSON data.
const updateStyleJson = (poiSize, waterColor) => {
    let styles = json.styles;
    let stylesLength = styles.length;
    for (let i = 0; i < stylesLength; i++) {
        if (styles[i].id === 'poi_icon') {
            styles[i]['point-size'] = poiSize;
        } else if (styles[i].id === 'water') {
            styles[i]['polygon-fill'] = waterColor
        }
    }
    return json;
}

// This method will response to user's click action and call updateStyleJson method to 
// update style to json variable. Then update it to our map.
const handleRefresh = (poiSize, waterColor) => {
    // Update the json data.
    updateStyleJson(poiSize, waterColor)
    let layers = map.getLayers().getArray();
    // Remove the old style layer.
    map.removeLayer(layers[0]);
    // Create the new style layer and add it to our map.
    let newLayer = new ol.mapsuite.VectorTileLayer(json, {
        'apiKey': apiKey
    });

    setLayerSourceEventHandlers(newLayer);
    map.addLayer(newLayer);
}

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

const hideErrorTip = () => {
    document.querySelector('#error-modal').classList.add('hide');
}

// document.querySelector('#error-modal button').addEventListener('click', () => {
//     document.querySelector('#error-modal').classList.add('hide');
// })


/*---------------------------------------------*/
// 6. ThinkGeo Map Icon Fonts
/*---------------------------------------------*/

// Now we'll load the Map Icon Fonts using ThinkGeo's WebFont loader. 
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
// 7. Render Data to DOM
/*---------------------------------------------*/

// Finally, we need to actually render the data to DOM, then we'll see a reactive map.
const refresh = new Vue({
    el: '#panel',
    data: {
        poiSize: 50,
        waterColor: '#0000CD'
    },
    methods: {
        refresh: function () {
            handleRefresh(this.poiSize, this.waterColor)
        }
    }
})

const hideBtn = new Vue({
    el: '#error-modal',
    methods: {
        closeErrorTip: function () {
            hideErrorTip();
        }
    }
})
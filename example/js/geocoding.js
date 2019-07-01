/*===========================================================================*/
// Geocoding
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. Popup Setup
//   4. Geocoder Setup
//   5. Event Listeners
//   6. Tile Loading Event Handlers
/*===========================================================================*/


/*---------------------------------------------*/
// 1. ThinkGeo Cloud API Key
/*---------------------------------------------*/

// First, let's define our ThinkGeo Cloud API key, which we'll use to
// authenticate our requests to the ThinkGeo Cloud API.  Each API key can be
// restricted for use only from a given web domain or IP address.  To create your
// own API key, you'll need to sign up for a ThinkGeo Cloud account at
// https://cloud.thinkgeo.com.
const apiKey = 'HCGSaTIZsLE_4gh8RFuJ85--2m5KPE1lWfHVpYlS0jg~';
const apiKeyForBaseLayer = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';

/*---------------------------------------------*/
// 2. Map Control Setup
/*---------------------------------------------*/

// Now we'll create the base layer for our map.  The base layer uses the ThinkGeo
// Cloud Maps Raster Tile service to display a detailed street map.  For more
// info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_raster_tiles
let baseLayer = new ol.mapsuite.VectorTileLayer('https://cdn.thinkgeo.com/worldstreets-styles/3.0.0/dark.json', {
    apiKey: apiKeyForBaseLayer,
    layerName: 'dark'
});

// Create a default view for the map when it starts up.
let view = new ol.View({
    // Center the map on the United States and start at zoom level 3.
    center: ol.proj.fromLonLat([-96.79620, 32.79423]),
    maxResolution: 40075016.68557849 / 512,
    zoom: 3,
    minZoom: 2,
    maxZoom: 19
})

let map;
let geocodingLayer;
let initializeMap = () => {

    // Create and initialize our interactive map.
    map = new ol.Map({
        renderer: 'webgl',
        // Add our previously-defined ThinkGeo Cloud Raster Tile layer to the map.
        layers: [baseLayer],
        // States that the HTML tag with id="map" should serve as the container for our map.
        target: 'map',
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        // Add a default view for the map when it starts up.
        view: view
    });


    // The next part sets up the style for the geocoder layer.
    let styles = {
        boundingBox: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: [0, 0, 255, 0.5],
                width: 1
            }),
            fill: new ol.style.Fill({
                color: [0, 0, 255, 0.1]
            })
        }),
    }

    // Create the geocoder layer and use the pre-defined style for our geocoding layer and add it to map.
    geocodingLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: []
        }),
        style: function () {
            let style = styles['boundingBox'];
            return style;
        }
    });
    map.addLayer(geocodingLayer);

    // Add a button to the map that lets us toggle full-screen display mode.
    map.addControl(new ol.control.FullScreen());

    map.on("click", function (e) {
        var resultDiv = document.getElementById('geocoderResult');
        if (resultDiv) {
            resultDiv.innerText = ""
            focusIndex = -1;
        }
    })
}

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
// 3. Popup Setup
/*---------------------------------------------*/

// Now, we need to create the popup container for our location information. We'll create an 
// overlay which servers the popup container, and add it to our map. This popup panel will 
// show the place name and the map will pan to the address.
const container = document.getElementById('popup');
container.classList.remove('hidden');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

// Create the popup overlay.
let overlay = new ol.Overlay({
    element: container,
    autoPan: false,
});

// Add an event listener to the close icon located in the top right corner of the popup. 
// When click the 'x' icon, the popup box and geocoder layer will disappear.
closer.onclick = () => {
    overlay.setPosition(undefined);
    let source = geocodingLayer.getSource();
    source.clear();
    closer.blur();
    return false;
};

// When calling this method, we'll add the popup panel to map and show the address info in the box.
const addPopup = (tile, coordinates, address, label) => {
    overlay.setPosition(ol.proj.fromLonLat(coordinates));
    map.addOverlay(overlay);
    if (label) {
        content.innerHTML = `<h4>${tile}</h4><p class="address">${address}</p><p class="coodinates">${coordinates[1]},${coordinates[0]} (${label})</p>`
    }
    else {
        content.innerHTML = `<h4>${tile}</h4><p class="address">${address}</p><p class="coodinates">${coordinates[1]},${coordinates[0]}</p>`
    }
}


/*---------------------------------------------*/
// 4. Geocoder Setup
/*---------------------------------------------*/

// Let's add a list of addresses that will let users visualize the location of what you searched. Every time you 
// input the address name in the top inptut form, it'll send request to get the relavant places and show you 
// in a list. You can enter the up button and down button to choose the place you want to perfom Geocode.

// We use thinkgeocloudclient.js, which is an open-source Javascript SDK for making 
// request to ThinkGeo Cloud Service. It simplifies the process of the code of request.

// We need to create the instance of Geocoder client and authenticate the API key.
let geocodingClient = new tg.GeocodingClient(apiKey);
geocodingClient.baseUrls_ = ["https://gisservertest.thinkgeo.com"];
let results;
let resultsLength;
let geocoderResultNode = document.getElementById('geocoderResult');

// This method will receive the result addresses from ThinkGeo Cloud, and render these addresses to the list. At 
// the same time, it will get some usefull info and write them as the property of DOM element <a>. These information 
// will be used when we add the geocoder layer to our map later.
const renderResult = (locations) => {
    document.querySelector('.loading').classList.add('hidden');
    if (locations.length > 0) {
        resultsLength = locations.length;
        let str = '';
        let i = -1
        for (let item of locations) {
            i = i + 1;
            str += `<li><a   data-index=${i} > ${item.address} </a></li>`
        }
        geocoderResultNode.innerHTML = str;
    } else {
        geocoderResultNode.innerHTML = ''
    }
    results = locations;
}

// This method actually performs the Geocoder request. It uses our ThinkGeo Cloud Services to get back the addresses 
// related to your input address. It will return a collection of addresses that the number will less than 5, while 
// the MaxResults parameter is 5.
const geocoder = (val) => {
    document.querySelector('.loading').classList.remove('hidden');
    let opts = getGeocodingOptions();
    const callback = (status, res) => {
        focusIndex = -1;
        if (status !== 200) {
            errorLoadingTile();
        } else {
            let locations = res.data.locations;
            renderResult(locations);
        }
    };
    if (geocodingClient.xhr) {
        geocodingClient.xhr.abort();
        delete geocodingClient.xhr;
    }
    geocodingClient.on("sendingrequest", function (e) {
        this.xhr = e.xhr;
    })
    // Call the searchByPoint API to search the points by the input address.
    geocodingClient.searchByPoint(val, callback, opts);
    geocodingClient.un("sendingrequest")
}

const getGeocodingOptions = () => {
    // Get selected location types.
    var locationTypes = [];
    var selectedButtons = document.getElementsByClassName("selected");
    for (var i = 0; i < selectedButtons.length; i++) {
        locationTypes.push(selectedButtons[i].value);
    }
    // Get country code
    var countryCode = document.querySelector('#country-filter').value;
    // Get MaxResults
    var countLimit = document.querySelector('#count-limit').value;
    // Get Autocomplete
    var autocomplete = true;

    let opts = {
        LocationType: locationTypes.join(","),
        Countries: countryCode,
        MaxResults: countLimit,
        Autocomplete: autocomplete,
        // Defaults as true for VerboseResults to display geometry of Results
        VerboseResults: true
    };

    return opts;
}

// This method will create the address feature where you select, and add it to geocodingLayer which we create earlier.
// If the address is a street, slide the map over to the center point what we get back, otherwise, create a bounding box 
// polygon feature and add it to geocodinglayer. Fit the given geometry or extent based on the given boundingBox.
const renderMatchedPlacePolygon = (coordinatesX, coordinatesY, boundingBox, type, geometry) => {
    let source = geocodingLayer.getSource();
    source.clear();
    if (type === 'Street') {
        view.animate({
            center: ol.proj.fromLonLat([parseFloat(coordinatesX), parseFloat(coordinatesY)]),
            zoom: 18,
            duration: 0
        });
    } else {
        let format = new ol.format.WKT();
        let wktFeature = format.readFeature(geometry, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
        geocodingLayer.getSource().addFeature(wktFeature);
        wktFeature.set('type', 'boundingBox');
        view.fit(wktFeature.getGeometry(), {
            padding: [20, 20, 20, 20]
        })
    }
}


/*---------------------------------------------*/
// 5. Event Listeners
/*---------------------------------------------*/

// These event listeners tell the UI when it's time to execute all of the 
// code we've written.

// This method will receive the index number of which address you select, and get the 
// value we need from the element property. By passing them to renderMatchedPlacePolygon 
// and addPopup method to perform Geocoder and show the popup info panel.
let focusIndex = -1;

const searchPlace = (focusIndex) => {
    if (focusIndex < 0) { return; }

    let geocoderResult = document.querySelector('#geocoderResult');

    let geometry;
    let displayTitle;
    let displayAddress;
    let displayLabel;
    let coordinates;
    let boundingBox;
    let type;
    if (results) {
        let targetResult = results[focusIndex];
        if (targetResult) {
            // Geometry
            geometry = targetResult["geometry"];

            // coordinates
            var locationPoint = targetResult.locationPoint;
            coordinates = [parseFloat(locationPoint.x.toFixed(6)), parseFloat(locationPoint.y.toFixed(6))];


            // displayName and displayAddress
            var locationAddress = targetResult.address;
            var name = targetResult.name;
            var houseNumber = targetResult.addressComponents["housenumber"];
            var roadName = targetResult.addressComponents["street"];
            var titleArray = [];
            if (name) {
                titleArray.push(name);
            }
            if (houseNumber) {
                titleArray.push(houseNumber);
            }
            if (roadName) {
                titleArray.push(roadName);
            }
            displayTitle = titleArray.join(", ");

            if (locationAddress.startsWith(displayTitle)) {
                displayAddress = locationAddress.substring(displayTitle.length + 2);
            }
            else {
                displayAddress = locationAddress;
            }

            // displayLabel
            if (targetResult.properties) {
                displayLabel = targetResult.properties.label;
            }

            // boundingBox
            boundingBox = targetResult.boundingBox;
            // type 
            type = targetResult.type;
        }
    }

    renderMatchedPlacePolygon(coordinates[0], coordinates[1], boundingBox, type, geometry);
    addPopup(displayTitle, coordinates, displayAddress, displayLabel);
}

// Control the selected item UI.
const computedHighlitIndex = (dir) => {
    let geocoderResult = document.querySelector('#geocoderResult');
    if (geocoderResult.querySelector('.focus')) {
        geocoderResult.querySelector('.focus').classList.remove('focus');
    }

    if (focusIndex < 0) { return; }

    var selectedData = geocoderResult.querySelectorAll('a[data-index]')[focusIndex];
    if (selectedData != undefined) {
        selectedData.classList.add('focus');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Every time you input word into the input box, the value in it will be passed to 
    // geocoder method and perform the Geocoder services.
    let timer = null;
    let address = document.getElementById('address');

    address.addEventListener('click', () => {
        if ((navigator.userAgent.match(/(iOS|Android|iPhone)/i))) {
            document.querySelector(".ol-unselectable").style.display = 'none';
        } else if (document.querySelector(".ol-unselectable").style.display = 'none') {
            document.querySelector(".ol-unselectable").style.display = 'block';
        }
    });

    address.addEventListener('blur', () => {
        if ((navigator.userAgent.match(/(iOS|Android|iPhone)/i))) {
            document.querySelector(".ol-unselectable").style.display = 'block';
        }
    });

    address.addEventListener('input', () => {
        geocoderResult.se
        clearTimeout(timer);
        timer = setTimeout(() => {
            overlay.setPosition(undefined);
            let source = geocodingLayer.getSource();
            source.clear();
            let value = address.value;
            focusIndex = -1;
            if (value) {
                document.querySelector('.loading').classList.remove('hidden');
                geocoder(value);
            } else {
                geocoderResultNode.innerHTML = ''
            }
        }, 350);
    });

    // When you click the specific address, it'll perform Geocoder.
    document.getElementById('geocoderResult').addEventListener('click', (e) => {
        e = window.event || e;
        let target = e.target;
        if (target.nodeName == 'A') {
            focusIndex = Number(target.getAttribute('data-index'));
            computedHighlitIndex(focusIndex);
            searchPlace(focusIndex);
        }
        if ((navigator.userAgent.match(/(pad|iPad|iOS|Android|iPhone)/i))) {
            document.querySelector(".ol-unselectable").style.display = 'block';
            document.querySelector("#geocoderResult").style.display = 'none';
        }
    });

    // Everytime inputing the address, the ThinkGeo Cloud will return the relative 
    // address list and we'll show them below the input box. You can enter the up button 
    // and down button to choose the place. 
    document.body.addEventListener('keydown', (e) => {
        e = window.event || e;
        switch (e.keyCode) {
            case 38:
                // Up
                e.preventDefault();
                focusIndex -= 1;
                if (focusIndex === -1) {
                    focusIndex = resultsLength - 1;
                }
                computedHighlitIndex(focusIndex);
                searchPlace(focusIndex);

                if ((navigator.userAgent.match(/(pad|iPad|iOS|Android|iPhone)/i))) {
                    document.querySelector(".ol-unselectable").style.display = 'block';
                    document.querySelector("#geocoderResult").style.display = 'none';
                }
                break;
            case 40:
                // Down
                e.preventDefault();
                focusIndex += 1;
                if (focusIndex === resultsLength) {
                    focusIndex = 0;
                }
                computedHighlitIndex(focusIndex);
                searchPlace(focusIndex);

                if ((navigator.userAgent.match(/(pad|iPad|iOS|Android|iPhone)/i))) {
                    document.querySelector(".ol-unselectable").style.display = 'block';
                    document.querySelector("#geocoderResult").style.display = 'none';
                }
                break;
            case 13:
                // Enter
                if (focusIndex !== -1) {
                    searchPlace(focusIndex);
                } else {
                    focusIndex = -1;
                    let value = document.getElementById('address').value;
                    geocoder(value);
                }

                if ((navigator.userAgent.match(/(pad|iPad|iOS|Android|iPhone)/i))) {
                    document.querySelector(".ol-unselectable").style.display = 'block';
                    document.querySelector("#geocoderResult").style.display = 'none';
                }
                break;
            default:
                if ((navigator.userAgent.match(/(pad|iPad|iOS|Android|iPhone)/i))) {
                    document.querySelector("#geocoderResult").style.display = 'block';
                }
        }
    })
})

var searchProcess = function () {
    let address = document.getElementById('address');
    overlay.setPosition(undefined);
    let source = geocodingLayer.getSource();
    source.clear();
    focusIndex = -1;
    let value = address.value;
    if (value) {
        document.querySelector('.loading').classList.remove('hidden');
        geocoder(value);
    } else {
        geocoderResultNode.innerHTML = ''
    }
}

// selected locationtype changed
var locationTypeButtons = document.getElementsByClassName("location-type-button");
var locationTypeChanged = function (e) {
    if (this.classList.contains("selected")) {
        this.classList.remove("selected");
    }
    else {
        this.classList.add("selected");
    }
    searchProcess();
}
for (var i = 0; i < locationTypeButtons.length; i++) {
    locationTypeButtons[i].addEventListener("click", locationTypeChanged)
}

// Country Changed
var countryCodeSelect = document.getElementById("country-filter");
countryCodeSelect.addEventListener("change", searchProcess);

// Max Result Changed
var maxResult = document.getElementById("count-limit");
maxResult.addEventListener("change", searchProcess);

/*---------------------------------------------*/
// 6. Tile Loading Event Handlers
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

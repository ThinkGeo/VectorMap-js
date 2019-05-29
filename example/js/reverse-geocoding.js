/*===========================================================================*/
// Find Nearby Places
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. Reverse Geocoding Setup
//   4. Point Details Popup Bubble
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
const apiKey = "WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~";


/*---------------------------------------------*/
// 2. Map Control Setup
/*---------------------------------------------*/

// Here's where we set up our map.  We're going to create layers, styles, 
// and define our initial view when the page first loads.

// In this custom object, we're going to define two styles:
//   1. The appearance of the red marker icon for the best matched place.
//   2. The appearance of the blue circle indicating the search area.
let styles = {
    bestMatchLocation: new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: "../image/point.png"
        })
    }),
    searchRadius: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: [0, 0, 255, 0.5],
            width: 1
        }),
        fill: new ol.style.Fill({
            color: [0, 0, 255, 0.1]
        })
    })
};

// Create a Reverse Geocoding Layer for the map.  This layer will display icons 
// for each place found near the clicked location on the map.
const createReverseGeocodingLayer = function () {
    let vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: []
        }),

        // Depending on the type of place, show a different icon. For example,
        // restaurants will show a knife and fork symbol.
        style: function (feature) {
            let key = feature.get("type");
            let style = styles[key];
            if (!style) {
                style = new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [0.5, 1],
                        src: "../image/map-icons/" + key + ".png",
                        scale: 0.25
                    }),
                    text: new ol.style.Text({
                        font: "14px Arial",
                        text: "",
                        fill: new ol.style.Fill({
                            color: [0, 0, 0, 1]
                        }),
                        stroke: new ol.style.Stroke({
                            color: [255, 255, 255, 1],
                            width: 1
                        })
                    })
                });
                styles[key] = style;
            }
            let textStyle = style.getText();
            if (textStyle) {
                textStyle.setText(feature.get("text"));
            }

            return style;
        }
    });
    vectorLayer.set("name", "reverseGeocodingLayer");
    return vectorLayer;
};

// Now we'll create the base layer for our map. The base layer uses the ThinkGeo
// Cloud Maps Vector Tile service to display a detailed street map.  For more
// info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles
let light = new ol.mapsuite.VectorTileLayer("https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json", {
    apiKey: apiKey,
    layerName: "light"
});

// Create a default view for the map when it starts up.
let view = new ol.View({
    // Center the map on Frisco, TX and start at zoom level 16.
    center: ol.proj.fromLonLat([-96.804616, 33.120202]),
    maxZoom: 19,
    maxResolution: 40075016.68557849 / 512,
    zoom: 16
});

// This function will create and initialize our interactive map.
// We'll call it later when our POI icon font has been fully downloaded,
// which ensures that the POI icons display as intended.
let map;
let initializeMap = function () {
    map = new ol.Map({
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        // Add our previously-defined ThinkGeo Cloud Vector Tile layer to the map.
        layers: [light, (reverseGeocodingLayer = createReverseGeocodingLayer())],
        // States that the HTML tag with id="map" should serve as the container for our map.
        target: "map",
        view: view
    });

    // Add a button to the map that lets us toggle full-screen display mode.
    map.addControl(new ol.control.FullScreen());

    // Call the method to add Event Listeners to map.
    addEventListeners(map);
}

/*---------------------------------------------*/
// 3. Reverse Geocoding Setup
/*---------------------------------------------*/

// At this point we'll build up the methods and functionality that will  
// actually perform the reverse geocoding using the ThinkGeo Cloud and then 
// display the results on the map.

// We use thinkgeocloudclient.js, which is an open-source Javascript SDK for making 
// request to ThinkGeo Cloud Service. It simplifies the process of the code of request.

// We need to create the instance of ReverseGeocoding client and authenticate the API key.
let reverseGeocodingClient = new tg.ReverseGeocodingClient(apiKey);

// Define a list of the different types of places for which we have unique 
// marker icons that can be shown on the map.
const supportedMarkers = [
    "aeroway",
    "amenity",
    "barrier",
    "building",
    "education",
    "entertainment",
    "financial",
    "healthcare",
    "historic",
    "intersection",
    "leisure",
    "manmade",
    "natural",
    "others",
    "power",
    "road",
    "shop",
    "sports",
    "sustenance",
    "tourism",
    "transportation",
    "waterway"
];

// This method draws the best matching location on the map whenever a reverse 
// geocode is performed.  The best match is defined as the place closest to 
// the reverse geocoded coordinates, regardless of any other conditions.
const renderBestMatchLocation = function (place, coordinate, address) {
    if (place.data) {
        let wktReader = new ol.format.WKT();
        let feature = wktReader.readFeature(
            place.data.locationFeatureWellKnownText
        );
        if (feature.getGeometry().getType() !== "Point") {
            feature = new ol.Feature({
                geometry: new ol.geom.Point([coordinate[1], coordinate[0]])
            });
        }
        feature.set("type", "bestMatchLocation");
        feature.set("text", "");
        reverseGeocodingLayer.getSource().addFeature(feature);
        let addressArr = address.split(",");
        let length = addressArr.length;
        let coordinateTrans = ol.proj.transform(
            coordinate,
            "EPSG:3857",
            "EPSG:4326"
        );

        // Display the name, address and coordinates of the best match result 
        // in the box at the top center of the map.
        document.getElementById("floating-panel").innerHTML =
            '<p style="font-size:1.2rem;font-weight: bold;" >' +
            (addressArr[0] || "") +
            "</p>" +
            "<p>" +
            (addressArr[1] || "") +
            "," +
            (addressArr[length - 2] || "") +
            "</p>" +
            "<p>" +
            coordinateTrans[0].toFixed(4) +
            " , " +
            coordinateTrans[1].toFixed(4) +
            "</p>";
    }
};

// This method renders all of the places found in the vicinity of the reverse 
// geocoded coordinates.  These are points of interest belonging to different 
// categories, like amenities, sustenance, buildings, etc.
const renderNearbyResult = function (response) {
    for (let i = 0; i < response.length; i++) {
        let item = response[i].data;
        let feature;
        if (item.locationCategory === "Intersection") {
            feature = createFeature(item.location);
            feature.set("type", "intersection");
        } else {
            var marker = item.locationCategory.toLowerCase();
            if (!supportedMarkers.includes(item.locationCategory.toLowerCase())) {
                marker = "others";
            }
            feature = createFeature(item.locationFeatureWellKnownText);
            feature.set("type", marker);
        }
        feature.set("name", "nearbyFeature");
        reverseGeocodingLayer.getSource().addFeature(feature);
    }
};

// This method is used to create the actual map feature for each place result.
const createFeature = function (wkt) {
    let wktReader = new ol.format.WKT();
    let feature = wktReader.readFeature(wkt);
    if (feature.getGeometry().getType() !== "Point") {
        feature = new ol.Feature({
            geometry: new ol.geom.Point(
                ol.extent.getCenter(feature.getGeometry().getExtent())
            )
        });
    }
    return feature;
};

// When a reverse geocode is performed, we want to draw a circle on the map 
// that represents the area we queried for nearby locations.  This method 
// handles the drawing and positioning of that circle.
const renderSearchCircle = function (radius, coordinate) {
    let projection = view.getProjection();
    let resolutionAtEquator = view.getResolution();
    let center = coordinate;
    let pointResolution = ol.proj.getPointResolution(
        projection,
        resolutionAtEquator,
        center
    );
    let resolutionFactor = resolutionAtEquator / pointResolution;
    let radiusInMeter = radius * resolutionFactor;

    let feature = new ol.Feature({
        geometry: new ol.geom.Circle(center, radiusInMeter),
        type: "searchRadius"
    });
    reverseGeocodingLayer.getSource().addFeature(feature);
};

// This method performs the actual reverse geocode using the ThinkGeo Cloud. 
// By passing in the coordinates of the map location that was clicked, we can 
// get back a collection of places in the vicinity of that click, as well as 
// the closest matching address.  For more details, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_reverse_geocoding

const reverseGeocode = (coordinate, flag) => {
    let opts = {
        srid: 3857,
        searchRadius: 500,
        maxResults: 20,
        verboseResults: true,
    };
    const callback = (status, res) => {
        if (status !== 200) {
            errorLoadingTile();
            return;
        }
        if (res.data.bestMatchLocation) {
            let address = res.data.bestMatchLocation.data.address;
            if (flag) {
                renderBestMatchLocation(res.data.bestMatchLocation, coordinate, address);
                renderNearbyResult(res.data.nearbyLocations);
                renderSearchCircle(500, coordinate)
                view.animate({
                    center: coordinate,
                    duration: 2000
                });
            } else {
                popUp(address, coordinate)
            }
        } else {
            window.alert('No results be found');
        }
    }
    reverseGeocodingClient.searchPlaceByPoint(coordinate[1], coordinate[0], callback, opts);
}


/*---------------------------------------------*/
// 4. Point Details Popup Bubble
/*---------------------------------------------*/

// When you hover your mouse over a place on the map, we want to show 
// a popup bubble with the name and address of that place.  Here, we'll 
// set up the container element, markup and methods for that bubble.
const container = document.getElementById("popup");
container.classList.remove("hidden");
const content = document.getElementById("popup-content");
const closer = document.getElementById("popup-closer");

// Create an overlay for the map that will hold the popup bubble.
let overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 2000
    }
});

// Make the popup bubble disappear when its "X" button is clicked.
closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

// Assemble the HTML for the popup bubble.
const popUp = function (address, centerCoordinate) {
    let addressArr = address.split(",");
    overlay.setPosition(centerCoordinate);
    map.addOverlay(overlay);
    let length = addressArr.length;
    content.innerHTML =
        '<p style="font-size:1.3rem" >' +
        (addressArr[0] || "") +
        '</p><p style="margin-left:2px">' +
        (addressArr[1] || "") +
        "," +
        (addressArr[length - 2] || "") +
        "</p>" +
        "<p>" +
        (addressArr[4] || "") +
        "," +
        (addressArr[length - 1] || "") +
        "</p>";
};


/*---------------------------------------------*/
// 5. Event Listeners
/*---------------------------------------------*/

// These event listeners tell the UI when it's time to execute all of the 
// code we've written.

// We'll call it later when our map has been rendered.

// This listener gets the coordinates when you click on the map, and then 
// uses them to perform a reverse geocode with the ThinkGeo Cloud.
let addEventListeners = function (map) {
    map.addEventListener("click", function (evt) {
        let source = reverseGeocodingLayer.getSource();
        let coordinate = evt.coordinate;
        overlay.setPosition(undefined);
        source.clear();
        reverseGeocode(coordinate, true);
    });

    // This event listener will show the popup bubble we created, any time 
    // you hover your mouse over a location point on the map.
    let timer = null;
    map.addEventListener("pointermove", function (evt) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            let coordinate = evt.coordinate;
            let pixel = map.getPixelFromCoordinate(coordinate);
            map.forEachFeatureAtPixel(
                pixel,
                feature => {
                    if (feature.get("name") === "nearbyFeature") {
                        reverseGeocode(coordinate, false);
                    }
                }, {
                    layerFilter: layer => {
                        let name = layer.get("name");
                        if (name === "reverseGeocodingLayer") {
                            return true;
                        }
                        return false;
                    }
                }
            );
        }, 500);
    });
}


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

setLayerSourceEventHandlers(light);

document.querySelector('#error-modal button').addEventListener('click', () => {
    document.querySelector('#error-modal').classList.add('hide');
})
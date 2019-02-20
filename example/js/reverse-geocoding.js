/*===========================================================================*/
// Find Nearby Places
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. ThinkGeo Map Icon Fonts
//   3. Map Control Setup
//   4. Reverse Geocoding Setup
//   5. Point Details Popup Bubble
//   6. Event Listeners
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
// 2. ThinkGeo Map Icon Fonts
/*---------------------------------------------*/

// Now we'll load the Map Icon Fonts using the WebFont loader. The loaded 
// Icon Fonts will be rendered as POI icons on the background layer. 
// For more info, see our wiki: 
// https://wiki.thinkgeo.com/wiki/thinkgeo_iconfonts 
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});


/*---------------------------------------------*/
// 3. Map Control Setup
/*---------------------------------------------*/

// Here's where we set up our map.  We're going to create layers, styles, 
// and define our initial view when the page first loads.

// In this custom object, we're going to define two styles:
//   1. The appearance of the red marker icon for the best matched place.
//   2. The appearance of the blue circle indicating the search area.
let _styles = {
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
        fill: new ol.style.Fill({ color: [0, 0, 255, 0.1] })
    })
};

// Create a Reverse Geocoding Layer for the map.  Tihs layer will display icons 
// for each place found near the clicked location on the map.
const createReverseGeocodingLayer = function () {
    let vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({ features: [] }),

        // Depending on the type of place, show a different icon. For example,
        // restaurants will show a knife and fork symbol.
        style: function (feature) {
            let key = feature.get("type");
            let style = _styles[key];
            if (!style) {
                style = new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [0.5, 1],
                        src: "https://maps.thinkgeo.com/image/map-icon/" + key + ".png",
                        scale: 0.25
                    }),
                    text: new ol.style.Text({
                        font: "14px Arial",
                        text: "",
                        fill: new ol.style.Fill({ color: "black" }),
                        stroke: new ol.style.Stroke({ color: "white", width: 1 })
                    })
                });
                _styles[key] = style;
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

// Create and initialize our interactive map.
let map = new ol.Map({
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


/*---------------------------------------------*/
// 4. Reverse Geocoding Setup
/*---------------------------------------------*/

// At this point we'll build up the methods and functionality that will  
// actually perform the reverse geocoding using the ThinkGeo Cloud and then 
// display the results on the map.

// Define a list of the different types of places for which we have unique 
// marker icons that can be shown on the map.
const _supportedMarkers = [
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
            [coordinate[1], coordinate[0]],
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
            coordinateTrans[1].toFixed(4) +
            " , " +
            coordinateTrans[0].toFixed(4) +
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
            if (!_supportedMarkers.includes(item.locationCategory.toLowerCase())) {
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
const reverseGeocode = function (coordinate, flag) {
    const baseURL = "https://cloud.thinkgeo.com/api/v1/location/reverse-geocode/";
    let getURL = `${baseURL}${coordinate}?apikey=${apiKey}&SearchRadius=500&MaxResults=20&Srid=3857&VerboseResults=true`;

    let jqxhr = $.get(getURL, function (data) {
        if (data.data.bestMatchLocation) {
            let address = data.data.bestMatchLocation.data.address;
            if (flag) {
                renderBestMatchLocation(
                    data.data.bestMatchLocation,
                    coordinate,
                    address
                );
                renderNearbyResult(data.data.nearbyLocations);
                renderSearchCircle(500, [coordinate[1], coordinate[0]]);
                // When clicking on the map, slide the map over to the clicked point
                // over a duration of 500 milliseconds.
                view.animate({
                    center: [coordinate[1], coordinate[0]],
                    duration: 500
                });
            } else {
                popUp(address, [coordinate[1], coordinate[0]]);
            }
        } else {
            window.alert("No results found");
        }
    });

    // In case the ThinkGeo Cloud Reverse Geocoding service requests fails for 
    // any reason, display a message that something went wrong.
    jqxhr.fail(function (data) {
        window.alert(
            "Unable to reverse geocode that location. Please try again."
        );
    });
};


/*---------------------------------------------*/
// 5. Point Details Popup Bubble
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
// 6. Event Listeners
/*---------------------------------------------*/

// These event listeners tell the UI when it's time to execute all of the 
// code we've written.

// This listener gets the coordinates when you click on the map, and then 
// uses them to perform a reverse geocode with the ThinkGeo Cloud.
map.addEventListener("click", function (evt) {
    let source = reverseGeocodingLayer.getSource();
    let coordinate = evt.coordinate;
    overlay.setPosition(undefined);
    source.clear();
    reverseGeocode([coordinate[1], coordinate[0]], true);
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
                    reverseGeocode([coordinate[1], coordinate[0]], false);
                }
            },
            {
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

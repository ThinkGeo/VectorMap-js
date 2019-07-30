/*===========================================================================*/
// Place in 10 Driving Minutes
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. ThinkGeo Map Icon Fonts
//   4. Routing Setup
//   5. Reverse Geocoding Setup
//   6. Derive the Custom Class Drag
//   7. Event Listeners
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

// Here's where we set up our map.  We're going to create layers, styles, 
// and define our initial view when the page first loads.

// Now we'll create the base layer for our map.  The base layer uses the ThinkGeo
// Cloud Maps Vector Tile service to display a detailed street map.  For more
// info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles
const darkLayer = new ol.mapsuite.VectorTileLayer('https://cdn.thinkgeo.com/worldstreets-styles/3.0.0/dark.json', {
    apiKey: apiKey,
    layerName: 'dark'
});

// Create a default view for the map when it starts up.
let startInputCoord = [-96.809876, 33.128397];
const view = new ol.View({
    // Center the map on Boston and start at zoom level 8.
    center: ol.proj.fromLonLat(startInputCoord),
    maxResolution: 40075016.68557849 / 512,
    progressiveZoom: true,
    zoom: 11,
    minZoom: 2,
    maxZoom: 19
});

// This function will create and initialize our interactive map.
// We'll call it later when our POI icon font has been fully downloaded,
// which ensures that the POI icons display as intended.
let map;
let app = {};
let vectorSource, placeSource;
let popup;

const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');
const initializeMap = () => {
    map = new ol.Map({
        renderer: 'webgl',
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        // Add our previously-defined ThinkGeo Cloud Vector Tile layer to the map.
        layers: [darkLayer],
        // States that the HTML tag with id="map" should serve as the container for our map.
        target: document.getElementById('map'),
        view: view,
        // Add an interaction to map that allows drag point icon.
        interactions: ol.interaction.defaults().extend([new app.Drag()])
    });

    // Add the vector layer for showing the driving start icon.
    vectorSource = new ol.source.Vector();
    map.addLayer(new ol.layer.Vector({
        source: vectorSource
    }));
    showDrivingStartPoint();

    // Add the vector layer for showing the searched places.
    placeSource = new ol.source.Vector();
    map.addLayer(new ol.layer.Vector({
        source: placeSource
    }));

    // Create the popup for showing the information of place when mouse is hover on the icon.
    popup = new ol.Overlay({
        element: container,
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    });
    map.addOverlay(popup);

    /**
     * Add a click handler to hide the popup.
     * @return {boolean} Don't follow the href.
     */
    closer.onclick = function () {
        popup.setPosition(undefined);
        closer.blur();
        return false;
    };

    // display popup when click on the place icon.
    map.on('click', function (evt) {
        var feature = map.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                return feature;
            }, {
                layerFilter: (layer) => {
                    return !(layer instanceof ol.mapsuite.VectorTileLayer)
                }
            });
        if (feature && feature.getGeometry().getType() == 'Point') {
            var coordinates = feature.getGeometry().getCoordinates();
            popup.setPosition(coordinates);
            content.innerHTML = feature.get('content');
        }
    });

    // change mouse cursor as pointer when over icon.
    map.on('pointermove', function (e) {
        if (e.dragging) {
            return;
        }

        var pixel = map.getEventPixel(e.originalEvent);
        //var hit = map.hasFeatureAtPixel(pixel);
        var feature = map.forEachFeatureAtPixel(pixel,
            function (feature) {
                return feature;
            }, {
                layerFilter: (layer) => {
                    return !(layer instanceof ol.mapsuite.VectorTileLayer)
                }
            });
        if (feature && feature.getGeometry().getType() == 'Point') {
            map.getTarget().style.cursor = 'pointer';
        } else {
            map.getTarget().style.cursor = '';
        }
    });

    // Add an event lister which will shows when we right click on the map.
    map.getViewport().addEventListener('contextmenu', function (e) {
        let left, top;
        let clientWidth = document.documentElement.clientWidth;
        let clientHeight = document.documentElement.clientHeight;
        const contextmenu = document.querySelector('#ol-contextmenu');
        const contextWidth = 165;
        // Add an event lister which will shows when we right click on the map.
        let point = map.getEventCoordinate(e);
        left =
            e.clientX + contextWidth > clientWidth ? clientWidth - contextWidth : e.clientX;
        top =
            e.clientY + contextmenu.offsetHeight > clientHeight ?
            clientHeight - contextmenu.offsetHeight :
            e.clientY;

        contextmenu.style.left = left + 'px';
        contextmenu.style.top = top + 'px';
        startInputCoord = new ol.proj.transform(point, 'EPSG:3857', 'EPSG:4326');
        document.querySelector('#ol-contextmenu').classList.remove('hide');
    });

    // By default, perform the service-area request and then caluclate the places whthin the driving-area on the map.
    performRouting();
};

// Show the driving start icon on the map.
let pointFeature;
const showDrivingStartPoint = () => {
    pointFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(startInputCoord)),
        name: 'start'
    });
    pointFeature.setStyle(styles.point);
    vectorSource.addFeature(pointFeature)
}

/*---------------------------------------------*/
// 3. ThinkGeo Map Icon Fonts
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
// 4. Routing Setup
/*---------------------------------------------*/

// At this point we'll built up the methods and functionality that will  
// actually perform the routing using the ThinkGeo Cloud and then 
// display the results on the map.

// We use thinkgeocloudclient.js, which is an open-source Javascript SDK for making 
// request to ThinkGeo Cloud Service. It simplifies the process of the code of request.

// We need to create the instance of Routing client and authenticate the API key.
const routingClient = new tg.RoutingClient(apiKey);

// This method performs the actual routing using the ThinkGeo Cloud. 
// By passing the coordinates of the map location and some other options, we can 
// get back the service area as we send the request.  For more details, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_routing
let timer;
const errorMessage = document.querySelector('#error-message');
const performRouting = () => {
    placeSource.clear();
    popup.setPosition(undefined);
    vectorSource.getFeatures().some(feature => {
        if (feature.get('name') === 'polygon') {
            vectorSource.removeFeature(feature)
            return true
        }
    })
    // Show the loading animation.
    document.querySelector('.loading').classList.remove('hide');
    errorMessage.classList.remove('show');

    const callback = (status, response) => {
        let message;
        if (status === 200) {
            // Draw the calculated driving polygon on the map.
            let drivingPolygon = drawDrivingPolygon(response.data);

            // Search the places you are  intrested in within the driving polygon.
            searchPlaces(drivingPolygon);
        } else if (status === 410 || status === 401 || status === 400) {
            message = response.error ? response.error.message : (Object.keys(response.data).map(key => {
                return response.data[key];
            }) || "The request of calculating driving service area failed.");
        } else {
            message = 'The request of calculating driving service area failed.';
        }

        if (message) {
            errorMessage.querySelector('p').innerHTML = `${status}: ${message}`;
            errorMessage.classList.add('show');
            timer = setTimeout(() => {
                errorMessage.classList.remove('show');
            }, 5000)
        }
    }
    routingClient.getServiceArea(startInputCoord[1], startInputCoord[0], 10, callback, {
        gridSizeInMeters: 500
    });
}

const drawDrivingPolygon = (res) => {
    // project result from EPSG:4326 to EPSG:3857
    const drivingPolygon = (new ol.format.WKT()).readFeature(res.serviceAreas[0], {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    });
    drivingPolygon.setStyle(styles.polygon);
    drivingPolygon.set('name', 'polygon');
    vectorSource.addFeature(drivingPolygon);

    return drivingPolygon;
}

/*---------------------------------------------*/
// 5. Reverse Geocoding Setup
/*---------------------------------------------*/

// At this point we'll built up the methods and functionality that will  
// actually perform the routing using the ThinkGeo Cloud and then 
// display the results on the map.

// We use thinkgeocloudclient.js, which is an open-source Javascript SDK for making 
// request to ThinkGeo Cloud Service. It simplifies the process of the code of request.

// We need to create the instance of Reverse Geocoding client and authenticate the API key.
let reverseGeocodingClient = new tg.ReverseGeocodingClient(apiKey);

// This method performs the actual reverse geocoding using the ThinkGeo Cloud. 
// By passing the polygon wkt,  location types you want to return and some other options, we can 
// get back the places as we send the request.  For more details, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_reverse_geocoding
const searchPlaces = (drivingPolygon) => {
    if (reverseGeocodingClient.xhr) {
        reverseGeocodingClient.xhr.abort();
        delete reverseGeocodingClient.xhr;
    }
    reverseGeocodingClient.on("sendingrequest", function (e) {
        this.xhr = e.xhr;
    });

    // Show the searched places with specific icons on the map.
    const placeType = document.querySelector('#place-type').selectedOptions[0];
    const callback = (status, response) => {
        // Hide the loading animation.
        if (timer !== undefined && timer !== null) {
            clearTimeout(timer);
        }
        document.querySelector('.loading').classList.add('hide');

        // Deal with search place response.
        let message;
        if (status === 200) {
            showPlaces(response.data, placeType.innerText);
        } else if (status === 410 || status === 401 || status === 400) {
            message = response.error ? response.error.message : (Object.keys(response.data).map(key => {
                return response.data[key];
            }) || "The request of searching places in driving polygon failed.");
        } else {
            message = 'The request of searching places in driving polygon failed.';
        }

        if (message) {
            errorMessage.querySelector('p').innerHTML = `${status}: ${message}`;
            errorMessage.classList.add('show');
            timer = setTimeout(() => {
                errorMessage.classList.remove('show');
            }, 5000)
        }
    }

    let polygonWKT = (new ol.format.WKT()).writeGeometry(drivingPolygon.getGeometry().getPolygon(0));
    reverseGeocodingClient.searchPlaceInAdvance({
        wkt: polygonWKT,
        srid: 3857,
        locationCategories: 'common',
        locationTypes: placeType.value,
        maxResults: 500,
        searchRadius: 0
    }, callback);
    reverseGeocodingClient.un("sendingrequest");
}

const showPlaces = (res, placeType) => {
    for (let i = 1, l = res.nearbyLocations.length; i < l; i++) {
        let place = res.nearbyLocations[i].data;
        const coord = [place.locationPoint.pointX, place.locationPoint.pointY];
        let placeFeature = new ol.Feature({
            geometry: new ol.geom.Point(coord),
            content: `<div>
                        <big>${place.locationName}</big>
                        <small>(${place.locationType})</small>
                        <br/>
                        ${place.address.substring(place.address.indexOf(',') + 1, place.address.lastIndexOf(','))}
                    </div>`
        });

        let style;
        switch (placeType) {
            case 'Bar & Pub':
                style = styles.bar;
                break;
            case 'Restaurant':
                style = styles.restaurant;
                break;
            case 'Health Center':
                style = styles.health;
                break;
            case 'Hotel':
                style = styles.hotel;
                break;
            case 'Education Center':
                style = styles.school;
                break;
            case 'Supermarket':
                style = styles.grocery;
                break;
        }

        placeFeature.setStyle(style);
        placeSource.addFeature(placeFeature);
    }
}

// Perform the routing service area request and place search request when place type has changed.
document.querySelector('#place-type').addEventListener('change', function () {
    performRouting();
});


// In this custom object, we're going to define the styles of driving vehicle, searched places:
const styles = {
    // The icon of driving vehicle.
    point: new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            opacity: 1,
            crossOrigin: "Anonymous",
            src: '../image/vehicle.png',
            imgSize: [30, 30]
        }),
        zIndex: 2
    }),
    // The icon of place - bar, biergarten, pub.
    bar: new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            opacity: 1,
            crossOrigin: "Anonymous",
            src: '../image/place-icons/bar.png',
            imgSize: [32, 32]
        }),
        zIndex: 2
    }),
    // The icon of bbq, cafe, fast_food, food_court, restaurant.
    restaurant: new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            opacity: 1,
            crossOrigin: "Anonymous",
            src: '../image/place-icons/restaurant.png',
            imgSize: [32, 32]
        }),
        zIndex: 2
    }),
    // The icon of doctors, hospital, pharmacy.
    health: new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            opacity: 1,
            crossOrigin: "Anonymous",
            src: '../image/place-icons/health.png',
            imgSize: [32, 32]
        }),
        zIndex: 2
    }),
    // The icon of hotel, motel. 
    hotel: new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            opacity: 1,
            crossOrigin: "Anonymous",
            src: '../image/place-icons/hotel.png',
            imgSize: [32, 32]
        }),
        zIndex: 2
    }),
    // The icon of language_school, driving_school, music_school, school, kindergarten, university, college.
    school: new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            opacity: 1,
            crossOrigin: "Anonymous",
            src: '../image/place-icons/school.png',
            imgSize: [32, 32]
        }),
        zIndex: 2
    }),
    // The icon of supermarket.
    grocery: new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            opacity: 1,
            crossOrigin: "Anonymous",
            src: '../image/place-icons/grocery.png',
            imgSize: [32, 32]
        }),
        zIndex: 2
    }),
    // The polygon style of the driving area in a specific driving minutes.
    polygon: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(40, 132, 176, 0.3)'
        })
    })
}

/*---------------------------------------------*/
// 6. Derive the Custom Class Drag
/*---------------------------------------------*/

// Since we need to drag the point to change the destination or start location, 
// we have to make the point draggable. At this step, we derived the custom class Drag.
app.Drag = function () {
    ol.interaction.Pointer.call(this, {
        handleDownEvent: app.Drag.prototype.handleDownEvent,
        handleDragEvent: app.Drag.prototype.handleDragEvent,
        handleUpEvent: app.Drag.prototype.handleUpEvent
    });
    this.coordinate_ = null;
    this.feature_ = null;
};
ol.inherits(app.Drag, ol.interaction.Pointer);

// Function handling "down" events.
// If the function returns true then a drag sequence is started.
app.Drag.prototype.handleDownEvent = function (evt) {
    let map = evt.map;
    let feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        if (feature.get('name') === 'start') {
            startFeature = feature;
            return feature;
        }
    }, {
        layerFilter: (layer) => {
            return !(layer instanceof ol.mapsuite.VectorTileLayer)
        }
    });

    if (feature) {
        this.coordinate_ = evt.coordinate;
        this.feature_ = feature;
    }

    return !!feature;
};

// Function handling "drag" events. 
// This function is called on "move" events during a drag sequence.
app.Drag.prototype.handleDragEvent = function (evt) {
    let deltaX = evt.coordinate[0] - this.coordinate_[0];
    let deltaY = evt.coordinate[1] - this.coordinate_[1];

    let geometry = this.feature_.getGeometry();
    geometry.translate(deltaX, deltaY);
    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];
};

// Function handling "up" events.
// If the function returns false then the current drag sequence is stopped.
app.Drag.prototype.handleUpEvent = function (e) {
    const coord = this.feature_.getGeometry().getCoordinates();
    const featureType = this.feature_.get('name');
    let coord_ = [];
    switch (featureType) {
        case 'start':
            coord_ = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
            startInputCoord = coord_.slice();
            break;
    }
    performRouting();
    this.coordinate_ = null;
    this.feature_ = null;
    return false; // `false` to stop the drag sequence.

};


/*---------------------------------------------*/
// 7. Event Listeners
/*---------------------------------------------*/

// These event listeners tell the UI when it's time to execute all of the 
// code we've written.
document.addEventListener('DOMContentLoaded', function () {
    // Handle the click event when click the item in the customized context menu.
    document.querySelector('#ol-contextmenu').addEventListener('click', (e) => {
        e = window.event || e;
        const targetId = e.target.id;
        switch (targetId) {
            case 'add-start-point':
                document.querySelector('#ol-contextmenu').classList.add('hide');
                pointFeature.setGeometry(new ol.geom.Point(ol.proj.fromLonLat(startInputCoord)));
                performRouting();
                break;
        }
    });

    // Hide the context menu of the browsers when right click on the map.
    document.querySelector('#map').oncontextmenu = () => {
        return false;
    };

    // When click on the map, hide the context menut.
    document.querySelector('#map').onclick = (e) => {
        document.querySelector('#ol-contextmenu').classList.add('hide');
    };
})
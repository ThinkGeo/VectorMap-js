/*===========================================================================*/
// Get Service Area
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. ThinkGeo Map Icon Fonts
//   4. Routing Setup
//   5. UI control setup
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
let startInputCoord = [-71.06734129275898, 42.35059783495578];
const view = new ol.View({
    // Center the map on Boston and start at zoom level 8.
    center: ol.proj.fromLonLat(startInputCoord),
    maxResolution: 40075016.68557849 / 512,
    progressiveZoom: true,
    zoom: 8,
    minZoom: 2,
    maxZoom: 19
});

// This function will create and initialize our interactive map.
// We'll call it later when our POI icon font has been fully downloaded,
// which ensures that the POI icons display as intended.
let map;
let app = {};
let vectorSource;
const initializeMap = () => {
    map = new ol.Map({
        renderer: 'webgl',
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        // Add our previously-defined ThinkGeo Cloud Vector Tile layer to the map.
        layers: [darkLayer],
        // States that the HTML tag with id="map" should serve as the container for our map.
        target: 'map',
        view: view,
        // Add an interaction to map that allows drag point icon.
        interactions: ol.interaction.defaults().extend([new app.Drag()])
    });

    addRoutingPoint();
    performRouting();
    mobileCompatibility();
};

// In this custom object, we're going to define eight styles:
//   1. The appearance of the start point icon.
//   2. The appearance of the snap point icon.
//   3. The appearance of the service line.
// 	 4. The appearance of the service area.
const styles = {
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
    snap: new ol.style.Style({
        image: new ol.style.Circle({
            radius: 8,
            stroke: new ol.style.Stroke({
                color: '#000000ff',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: '#fffc24cc'
            })
        })
    }),
    line: [
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 3,
                color: 'rgba(0, 255, 158, 0.7)'
            })
        }),
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 3,
                color: 'rgba(205, 240, 45, 0.7)'
            })
        }),
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 3,
                color: 'rgba(240, 81, 45, 0.7)'
            })
        }),
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 3,
                color: 'rgba(230, 2, 1, 0.7)'
            })
        }),
    ],
    polygon: [
        new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(0, 255, 158, 0.7)'
            })
        }),
        new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(205, 240, 45, 0.7)'
            })
        }),
        new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(240, 81, 45, 0.7)'
            })
        }),
        new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(230, 2, 1, 0.7)'
            })
        })
    ]
}

// Do some compatibility on mible and IOS client.
const mobileCompatibility = () => {
    let left, top;
    let clientWidth = document.documentElement.clientWidth;
    let clientHeight = document.documentElement.clientHeight;
    const contextmenu = document.querySelector('#ol-contextmenu');
    const contextWidth = 165;

    // Add an event lister which will shows when we right clic on the map.
    map.getViewport().addEventListener('contextmenu', function (e) {
        hideOrShowContextMenu('show');
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
    })
}

// Create the routing layer and add it to map.
let pointFeature;
const addRoutingPoint = () => {
    vectorSource = new ol.source.Vector();
    routingLayer = new ol.layer.Vector({
        source: vectorSource
    });
    routingLayer.set('layerName', 'routing');
    map.addLayer(routingLayer);
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
let count = 0;
let timer;
const errorMessage = document.querySelector('#error-message');
const performRouting = () => {
    clear();
    // Show the loading animation.
    document.querySelector('.loading').classList.remove('hide');
    errorMessage.classList.remove('show');

    // Hide the drag tips.
    if (count === 0 || count === 1) {
        count++;
    } else if (count === 2) {
        const tipClass = document.querySelector('#instruction-tip').classList;
        tipClass.contains('hide') ? null : tipClass.add('hide');
    }

    // Get the params from panel and pass them to routingClient to perform our routing request.
    const serviceLimitsType = document.querySelector('#serivce-area .active').value;
    const travelDirection = document.querySelector('#drive-direction').value;
    const gridSizeInMeters = document.querySelector('#grid-size').value;
    const minuteLimit = [];
    const timeLimitInput = document.querySelectorAll('#drive-time-limit input');
    timeLimitInput.forEach(item => {
        minuteLimit.push(Number(item.value))
    })
    const distanceLimit = [];
    const distanceLimitInput = document.querySelectorAll('#drive-distance-limit input');
    distanceLimitInput.forEach(item => {
        distanceLimit.push(Number(item.value))
    })
    const timeLimit = document.querySelector('#drive-time-limit');
    const serviceLimits = timeLimit.classList.contains('hide') ? distanceLimit.join(',') : minuteLimit.join(',');
    const serviceAreaType = document.querySelector('#area-type').value;
    const contourGranularity = document.querySelector('#contour-granularity input').value;

    const options = {
        contourGranularity: contourGranularity,
        gridSizeInMeters: gridSizeInMeters,
        serviceAreaType: serviceAreaType,
        serviceLimits: serviceLimits,
        serviceLimitsType: serviceLimitsType,
        travelDirection: travelDirection
    };
    const callback = (status, response) => {
        if (timer !== undefined && timer !== null) {
            clearTimeout(timer);
        }
        document.querySelector('.loading').classList.add('hide');
        let message;
        if (status === 200) {
            drawAreas(response.data, serviceAreaType);
        } else if (status === 410 || status === 401 || status === 400) {
            message = response.error ? response.error.message : (Object.keys(response.data).map(key => {
                return response.data[key];
            }) || "Request failed");
        } else {
            message = 'Request failed.';
        }

        if (message) {
            errorMessage.querySelector('p').innerHTML = `${status}: ${message}`;
            errorMessage.classList.add('show');
            timer = setTimeout(() => {
                errorMessage.classList.remove('show');
            }, 5000)
        }
    }
    routingClient.getServiceArea(startInputCoord[1], startInputCoord[0], serviceLimits, callback, options);
}

// Draw the service area when we get the route result from server.
const drawAreas = (res, type) => {
    const areas = res.serviceAreas;
    const coordinate = res.waypoint.coordinate;
    const snapPoint = [coordinate.x, coordinate.y];

    // Add different service areas.
    for (let i = 0, l = areas.length; i < l; i++) {
        const wkt = areas[i];
        const format = new ol.format.WKT();
        const feature = format.readFeature(wkt, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
        feature.set('name', 'areas');
        const style = type === 'Linestring' ? styles.line[i] : styles.polygon[i];
        feature.setStyle(style);
        vectorSource.addFeature(feature);
    }

    // Add sanp point.
    const snapFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(snapPoint)),
        name: 'snap'
    });
    snapFeature.setStyle(styles.snap);
    vectorSource.addFeature(snapFeature);
}

// Remove the previous areas.
const clear = () => {
    const features = vectorSource.getFeatures();
    features.forEach(feature => {
        if (feature.get('name') === 'areas' || feature.get('name') === 'snap' || feature.get('name') === 'line') {
            vectorSource.removeFeature(feature);
        }
    })
}


/*---------------------------------------------*/
// 5. UI control setup
/*---------------------------------------------*/

// At this step, we create some methods to control the sample UI.

// This method controls the context menu to show or hide. When we 
// right click on the map, the context menu shows up, while we click 
// anywhere, the context menu will hide. 
const hideOrShowContextMenu = (visible) => {
    let contextmenu = document.querySelector('#ol-contextmenu');
    switch (visible) {
        case 'hide':
            contextmenu.classList.add('hide');
            break;
        case 'show':
            contextmenu.classList.remove('hide');
    }
};

// When we drag the start point, the coordinates of the start point 
// has been changed, so we have to update this coordinates to the left 
// sidebar input box.
let startInputEle;
const updateInputValue = (noFixed) => {
    const coord_ = startInputCoord.slice();
    startInputEle.setAttribute('data-origin', startInputCoord[1] + ', ' + startInputCoord[0]);
    if (noFixed) {
        startInputEle.value = coord_[1] + ', ' + coord_[0];
    } else {
        startInputEle.value = coord_[1].toFixed(6) + ', ' + coord_[0].toFixed(6);
    }
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
        handleMoveEvent: app.Drag.prototype.handleMoveEvent,
        handleUpEvent: app.Drag.prototype.handleUpEvent
    });
    this.coordinate_ = null;
    this.cursor_ = 'pointer';
    this.feature_ = null;
    this.previousCursor_ = undefined;
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

// Function handling "move" events. 
// This function is called on "move" events, also during a drag sequence
// (so during a drag sequence both the handleDragEvent function and this function are called).
app.Drag.prototype.handleMoveEvent = function (evt) {
    if (this.cursor_) {
        let map = evt.map;
        let feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
            return feature;
        });
        let element = evt.map.getTargetElement();
        if (feature) {
            if (element.style.cursor != this.cursor_) {
                this.previousCursor_ = element.style.cursor;
                element.style.cursor = this.cursor_;
            }
        } else if (this.previousCursor_ !== undefined) {
            element.style.cursor = this.previousCursor_;
            this.previousCursor_ = undefined;
        }
    }
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
            updateInputValue();
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
    // Update the input box value by the default coordinates. 
    startInputEle = document.querySelector('#startPoint');
    updateInputValue();
    // When click on the map, hide the context menut.
    document.querySelector('#map').onclick = () => {
        hideOrShowContextMenu('hide');
    };

	// Hide the context menu of the browsers when right click on the map.
    document.querySelector('#map').oncontextmenu = () => {
        return false;
    };

	// Handle the click event when click the item in the customized context menu.
    document.querySelector('#ol-contextmenu').addEventListener('click', (e) => {
        e = window.event || e;
        const targetId = e.target.id;
        switch (targetId) {
            case 'add-start-point':
                hideOrShowContextMenu('hide');
                performRouting();
                updateInputValue();
                pointFeature.setGeometry(new ol.geom.Point(ol.proj.fromLonLat(startInputCoord)));
                break;
            case 'clear':
                clear();
                break;
        }
    });

    // Update the service area options in left sidebar control panel.
    document.querySelector('#serivce-area').addEventListener('click', function (e) {
        e = window.event || e;
        target = e.srcElement || e.target;
        if (target.nodeName === 'BUTTON') {
            document.querySelector('#serivce-area .active').classList.remove('active');
            target.classList.add('active');
            if (target.value === 'Time') {
                document.querySelector('#drive-time-limit').classList.remove('hide');
                document.querySelector('#drive-distance-limit').classList.add('hide');
            } else {
                document.querySelector('#drive-distance-limit').classList.remove('hide');
                document.querySelector('#drive-time-limit').classList.add('hide');
            }
        }
    });

    // Perform the routing service area request when click the "Refresh" button in the left sidebar panel.
    document.querySelector('#refresh').addEventListener('click', function () {
        const coord = startInputEle.value.replace(/\s/g, '');
        let coor_ = coord.split(',');
        let coord_ = [Number(coor_[1]), Number(coor_[0])];
        pointFeature.setGeometry(new ol.geom.Point(ol.proj.fromLonLat(coord_)));
        startInputCoord = coord_.slice();
        updateInputValue(true);
        performRouting();
    })

    // Update the Driving Minute Limit input min or max attribute value when changing the input value.
    let timeLimitInputs = document.querySelectorAll('#drive-time-limit input');
    for (let i = 0; i < timeLimitInputs.length; i++) {
        timeLimitInputs[i].addEventListener('input', function (e) {
            let value = Number(e.target.value);
            if (i === 0) {
                timeLimitInputs[i + 1].setAttribute('min', value + 1)
            } else if (i === 1 || i === 2) {
                timeLimitInputs[i + 1].setAttribute('min', value + 1)
                timeLimitInputs[i - 1].setAttribute('max', value - 1)
            } else if (i === 3) {
                timeLimitInputs[i - 1].setAttribute('max', value - 1)
            }
        });
    }

    // Update the Driving Distance Limit input min or max attribute value when changing the input value.
    let disLimitInputs = document.querySelectorAll('#drive-distance-limit input');
    for (let i = 0; i < disLimitInputs.length; i++) {
        disLimitInputs[i].addEventListener('input', function (e) {
            let value = Number(e.target.value);
            if (i === 0) {
                disLimitInputs[i + 1].setAttribute('min', value + 1)
            } else if (i === 1 || i === 2) {
                disLimitInputs[i + 1].setAttribute('min', value + 1)
                disLimitInputs[i - 1].setAttribute('max', value - 1)
            } else if (i === 3) {
                disLimitInputs[i - 1].setAttribute('max', value - 1)
            }
        });
    }
})
/*===========================================================================*/
// Routing in North America
// Sample map by ThinkGeo
//
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. ThinkGeo Map Icon Fonts
//   4. Routing Setup
//   5. Routing Features Handler Setup
//   6. Result Rendering
//   7. Error Event Handlers
//   8. UI control setup
//   9. Derive the Custom Class Drag
//   10. Event Listeners
/*===========================================================================*/

/*---------------------------------------------*/
// 1. ThinkGeo Cloud API Key
/*---------------------------------------------*/

// First, let's define our ThinkGeo Cloud API key, which we'll use to
// authenticate our requests to the ThinkGeo Cloud API.  Each API key can be
// restricted for use only from a given web domain or IP address.  To create your
// own API key, you'll need to sign up for a ThinkGeo Cloud account at
// https://cloud.thinkgeo.com.
const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~';

/*---------------------------------------------*/
// 2. Map Control Setup
/*---------------------------------------------*/

// Here's where we set up our map.  We're going to create layers, styles,
// and define our initial view when the page first loads.

// In this custom object, we're going to define eight styles:
//   1. The appearance of the start point icon.
//   2. The appearance of the end point icon.
//   3. The appearance of the waypoint icon.
// 	 4. The appearance of the route line.
//   5. The appearance of the route line halo.
//   6. The appearance of the line of start point to snap point.
//   7. The appearance of the radius circle when hovering the segment route.
//   8. The appearance of the arrow when clicking the target segment route.
const styles = {
    start: new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.9],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            opacity: 1,
            crossOrigin: 'Anonymous',
            src: '../image/starting.png'
        })
    }),
    end: new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.9],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            opacity: 1,
            crossOrigin: 'Anonymous',
            src: '../image/ending.png'
        })
    }),
    mid: new ol.style.Style({
        image: new ol.style.Circle({
            radius: 10,
            fill: new ol.style.Fill({
                color: [255, 255, 255, 19]
            }),
            stroke: new ol.style.Stroke({
                color: [29, 93, 48, 1],
                width: 6
            })
        })
    }),
    line: new ol.style.Style({
        stroke: new ol.style.Stroke({
            width: 6,
            color: [34, 109, 214, 0.9]
        })
    }),
    line_halo: new ol.style.Style({
        stroke: new ol.style.Stroke({
            width: 10,
            lineCap: 'round',
            color: [34, 109, 214, 1]
        })
    }),
    walkLine: new ol.style.Style({
        stroke: new ol.style.Stroke({
            width: 2,
            lineDash: [5, 3],
            color: [34, 109, 214, 1]
        })
    }),
    resultRadius: new ol.style.Style({
        image: new ol.style.Circle({
            radius: 15,
            fill: new ol.style.Fill({
                color: [255, 102, 0, 0.4]
            }),
            stroke: new ol.style.Stroke({
                color: [255, 102, 0, 0.8],
                width: 1
            })
        })
    }),
    arrowLine: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: [10, 80, 18, 1],
            width: 6
        })
    })
};

// Now we'll create the base layer for our map.  The base layer uses the ThinkGeo
// Cloud Maps Vector Tile service to display a detailed street map.  For more
// info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles
const lightLayer = new ol.mapsuite.VectorTileLayer('https://cdn.thinkgeo.com/worldstreets-styles/3.0.0/light.json', {
    apiKey: apiKey,
    layerName: 'light'
});

// Create a default view for the map when it starts up.
const view = new ol.View({
    // Center the map on the United States and start at zoom level 3.
    center: ol.proj.fromLonLat([-96.7962, 42.79423]),
    maxResolution: 40075016.68557849 / 512,
    progressiveZoom: false,
    zoom: 3,
    minZoom: 2,
    maxZoom: 19
});

// This function will create and initialize our interactive map.
// We'll call it later when our POI icon font has been fully downloaded,
// which ensures that the POI icons display as intended.
let map;
let vectorSource;
let curCoord;
// Define a name space: app.
let app = {};
const initializeMap = () => {
    map = new ol.Map({
        renderer: 'webgl',
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        // Add our previously-defined ThinkGeo Cloud Vector Tile layer to the map.
        layers: [lightLayer],
        // States that the HTML tag with id="map" should serve as the container for our map.
        target: 'map',
        view: view,
        // Add an interaction to map that allows drag point icons.
        interactions: ol.interaction.defaults().extend([new app.Drag()])
    });

    addRoutingLayer();
    mobileCompatibility();

    // Add a "pointermove" listener to map which is when the pointer is moving over the start, end and mid point, the cursor should be "pointer" appearance.
    map.on('pointermove', function(e) {
        if (e.dragging) {
            return;
        }
        const pixel = map.getEventPixel(e.originalEvent);
        const options = {
            // Only find feature on the routing layer not the base vector tile layer.
            layerFilter: function(layer) {
                if (layer instanceof ol.layer.VectorTile) {
                    return false;
                }
                return true;
            }
        };
        const hit = map.hasFeatureAtPixel(pixel, options);
        let cursor = false;
        if (hit) {
            const features = map.getFeaturesAtPixel(pixel, options);
            features.some((feature) => {
                let featureName = feature.get('name');
                if (featureName === 'start' || featureName === 'end' || featureName === 'mid') {
                    cursor = true;
                    return true;
                }
            });
        } else {
            cursor = false;
        }
        map.getTargetElement().style.cursor = cursor ? 'pointer' : '';
    });
};

// Do some compatibility on mible and IOS client.
const mobileCompatibility = () => {
    let u = navigator.userAgent;
    const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
    const isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    let left, top;
    let clientWidth = document.documentElement.clientWidth;
    let clientHeight = document.documentElement.clientHeight;
    const contextmenu = document.querySelector('#ol-contextmenu');
    const insTip = document.querySelector('#instruction-tip');
    let timeOutEvent;
    const contextWidth = 165;

    // Show the right click context menu on different platform.
    if (isiOS) {
        map.getViewport().addEventListener('gesturestart', function(e) {
            clearTimeout(timeOutEvent);
            timeOutEvent = 0;
            return false;
        });

        map.getViewport().addEventListener('touchstart', function(e) {
            e.preventDefault();
            if (e.touches.length != 1) {
                clearTimeout(timeOutEvent);
                timeOutEvent = 0;
                return false;
            }
            timeOutEvent = setTimeout(function() {
                if (e.touches.length == 1) {
                    timeOutEvent = 0;
                    left =
                        e.changedTouches[0].clientX + contextWidth > clientWidth ?
                        clientWidth - contextWidth :
                        e.changedTouches[0].clientX;
                    top =
                        e.changedTouches[0].clientY + contextmenu.offsetHeight > clientHeight ?
                        clientHeight - contextmenu.offsetHeight :
                        e.changedTouches[0].clientY;
                    contextmenu.style.left = left + 'px';
                    contextmenu.style.top = top + 'px';
                    let point = map.getEventCoordinate(e);
                    curCoord = point;
                    hideOrShowContextMenu('show');
                    insTip.classList.add('gone');
                }
            }, 500);
        });

        map.getViewport().addEventListener('touchend', function(event) {
            clearTimeout(timeOutEvent);
            if (timeOutEvent != 0) {
                hideOrShowContextMenu('hide');
            }
            return false;
        });

        map.getViewport().addEventListener('touchmove', function(event) {
            clearTimeout(timeOutEvent);
            timeOutEvent = 0;
            return false;
        });
    } else {
        map.getViewport().addEventListener('contextmenu', (e) => {
            hideOrShowContextMenu('show');
            insTip.classList.add('gone');
            left = e.clientX + contextWidth > clientWidth ? clientWidth - contextWidth : e.clientX;
            top =
                e.clientY + contextmenu.offsetHeight > clientHeight ?
                clientHeight - contextmenu.offsetHeight :
                e.clientY;

            contextmenu.style.left = left + 'px';
            contextmenu.style.top = top + 'px';
            let point = map.getEventCoordinate(e);
            curCoord = point;
        });
    }

    // Show the mobile instruction tip on Android and IOS, and show pc tip on PC.
    if (isiOS || isAndroid) {
        document.querySelector('.mobile-tip').classList.remove('hide');
    } else {
        document.querySelector('.pc-tip').classList.remove('hide');
    }
};

// Create the routing layer and add it to map.
const addRoutingLayer = () => {
    vectorSource = new ol.source.Vector();
    let routingLayer = new ol.layer.Vector({
        source: vectorSource,
        layerName: 'routing'
    });
    map.addLayer(routingLayer);
};

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
        families: ['vectormap-icons'],
        urls: ['https://cdn.thinkgeo.com/vectormap-icons/2.0.0/vectormap-icons.css'],
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

// Get some items which we'll use to judge if we should perform the routing service or show error tips.
const findRoute = (showError) => {
    vectorSource.clear();
    hideOrShowResultBox('hide');
    const points = getAllPoints();
    const pointsLength = points.length;

    // Add the point which is not added to map.
    points.forEach((point, index) => {
        if (pointsLength - 1 === index) {
            type = 'end';
        } else if (0 === index) {
            type = 'start';
        } else {
            type = 'mid';
        }
        addPointFeature(type, point);
    });

    const inputsCount = document.querySelectorAll('.point input');
    if (points && points.length >= 2 && inputsCount.length === points.length) {
        performRouting();
    } else if (showError) {
        showErrorTip('Please input correct coordinates!');
    }
};

// This method performs the actual routing using the ThinkGeo Cloud.
// By passing the coordinates of the map location, we can
// get back a the route message as we send the request.  For more details, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_routing
const performRouting = () => {
    const points = getAllPoints();
    const inputsCount = document.querySelectorAll('.point input');
    if (points && points.length >= 2 && inputsCount.length === points.length) {
        hideErrorTip();
        document.querySelector('.loading').classList.remove('hide');

        const options = {
            turnByTurn: true,
            srid: 3857
        };

        const callback = (status, response) => {
            const result = document.querySelector('#result');
            if (status === 200) {
                result.classList.remove('error-on-mobile');
                document.querySelector('.loading').classList.add('hide');
                hideOrShowResultBox('show');
                handleResponse(response);
            } else {
                hideOrShowResultBox('show');
                document.querySelector('.loading').classList.add('hide');
                document.querySelector('#total').innerHTML = '';

                if (document.body.clientWidth <= 767) {
                    result.classList.add('error-on-mobile');
                }
                if (status === 400) {
                    const data = response.data;
                    let message = '';
                    Object.keys(data).forEach((key) => {
                        message = message + data[key] + '<br />';
                    });
                    result.querySelector('#boxes').innerHTML = `<div class="error-message">${message}</div>`;
                } else if (status === 401 || status === 410 || status === 404) {
                    result.querySelector('#boxes').innerHTML = `<div class="error-message">${response.error
						.message}</div>`;
                } else if (status === 'error') {
                    errorLoadingTile();
                } else {
                    result.querySelector('#boxes').innerHTML = `<div class="error-message">Request failed.</div>`;
                }
            }
        };

        const points_ = points.map((point) => {
            return {
                x: point[0],
                y: point[1]
            };
        });

        routingClient.getRoute(points_, callback, options);
    }
};

// Handle the response when we get the route result from server.
const handleResponse = (res) => {
    const data = res.data;
    const routes = data.routes[0];
    generateBox(routes);
    const waypointsCoord = data.waypoints.map((item) => {
        return [item.coordinate.y, item.coordinate.x];
    });
    addWalkLinesFeatures(waypointsCoord);
};

// Get the coordinates array from the input attribute -- data-origin.
const getCoordFromDataOrigin = (dataOriginValue) => {
    let value = dataOriginValue.split(',');
    if (value.length === 2) {
        return [Number(value[0]), Number(value[1])];
    } else {
        return [];
    }
};

// Get all the input points coordinates from the input group.
const getAllPoints = () => {
    let points = [];
    const allInputs = document.querySelectorAll('.point input');
    allInputs.forEach((input) => {
        const value = input.getAttribute('data-origin');
        value ? points.push(getCoordFromDataOrigin(value)) : null;
    });
    return points;
};

/*---------------------------------------------*/
// 5. Routing Features Handler Setup
/*---------------------------------------------*/

// This step we create several method for you to operate the features on the routing layer.
// Since all the preparation have been done, we need to do have some method to handle the
// features we have added to the map.

// Add point feature to map by passing the point name and coordinates.
const addPointFeature = (name, coord) => {
    if (name === 'start') {
        removeFeatureByName(name);
    } else if (name === 'end') {
        removeFeatureByName(name);
    }
    let feature = new ol.Feature({
        geometry: new ol.geom.Point(coord),
        name: name
    });
    feature.setStyle(styles[name]);
    vectorSource.addFeatures([feature]);
};

// Add the route line feature by passing the line wkt data from what we get from response.
const addRouteFeature = (wkt) => {
    const format = new ol.format.WKT();
    const routeFeature = format.readFeature(wkt);
    routeFeature.set('name', 'line');
    routeFeature.setStyle([styles.line, styles.line_halo]);
    vectorSource.addFeature(routeFeature);
};

// Add the lines from the point we start from to the nearest route.
const addWalkLinesFeatures = (waypointsCoord) => {
    let features = [];
    const points = getAllPoints();
    points.forEach((point, index) => {
        const feature = new ol.Feature({
            geometry: new ol.geom.LineString([point, waypointsCoord[index]]),
            name: 'line'
        });
        features.push(feature);
    });
    vectorSource.addFeatures(features);
};

// Add a radius circle the segment point where we hovering from.
const addResultRadius = (coord) => {
    removeFeatureByName('resultRadius');
    let center = coord;
    let resultRadiusFeature = new ol.Feature({
        geometry: new ol.geom.Point(center),
        name: 'resultRadius'
    });
    resultRadiusFeature.setStyle(styles.resultRadius);
    vectorSource.addFeature(resultRadiusFeature);
};

// Add the arrow icon when we zoom in to which segment route we click.
const addArrow = (penultCoord, lastCoord) => {
    removeFeatureByName('arrow');

    let feature = new ol.Feature({
        geometry: new ol.geom.Point(lastCoord),
        name: 'arrow'
    });

    const dx = lastCoord[0] - penultCoord[0];
    const dy = lastCoord[1] - penultCoord[1];

    const rotation = Math.atan2(dy, dx);

    const arrowStyle = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            crossOrigin: 'Anonymous',
            src: '../image/arrow.png',
            rotateWithView: true,
            rotation: -rotation
        })
    });

    feature.setStyle(arrowStyle);
    vectorSource.addFeature(feature);
};

// Add the arrow line when we zoom in to which segment route we click.
const addTurnLine = (penultCoord, lastCoord, lineSecondCoord) => {
    let feature = new ol.Feature({
        geometry: new ol.geom.LineString([penultCoord, lastCoord, lineSecondCoord]),
        name: 'line'
    });

    feature.setStyle(styles.arrowLine);
    vectorSource.addFeature(feature);
};

// Remove a point feature by passing the coordinates.
const removeFeatureByCoord = (coord) => {
    const features = vectorSource.getFeatures();
    features.some((feature) => {
        if (feature.getGeometry().getCoordinates().toString() === coord) {
            vectorSource.removeFeature(feature);
            return true;
        }
    });
};

// Remove the point or line features by passing the feature name.
const removeFeatureByName = (featureName) => {
    if (vectorSource) {
        const features = vectorSource.getFeatures();
        for (let i = 0, l = features.length; i < l; i++) {
            let feature = features[i];
            if (feature.get('name') === featureName) {
                vectorSource.removeFeature(feature);
            }
        }
    }
};

// Get the feature by feature's name.
const getFeatureByName = (name) => {
    let feature_;
    vectorSource.getFeatures().some((feature) => {
        if (feature.get('name') === name) {
            feature_ = feature;
            return true;
        }
    });
    return feature_;
};

// Get the feature by feature's coordinates.
const getFeatureByCoord = (coord) => {
    let feature;
    const features = vectorSource.getFeatures();
    features.some((f) => {
        if (f.getGeometry().getCoordinates().toString() === coord) {
            feature = f;
        }
    });
    return feature;
};

/*---------------------------------------------*/
// 6. Result Rendering
/*---------------------------------------------*/

// Since all we have got the result from server, we need to show the result in the left sidebar box.

// Calculate the coordinates what we use to draw the arrow lines by passing the two coordinates.
const lerp = (firstCoord, secondCoord) => {
    var resolution = view.getResolution();
    var x1 = firstCoord[0];
    var y1 = firstCoord[1];
    var x2 = secondCoord[0];
    var y2 = secondCoord[1];
    var length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / resolution;
    var x, y;

    if (length > 50) {
        var interpolate = 50 / length;
        var x = ol.math.lerp(x1, x2, interpolate);
        var y = ol.math.lerp(y1, y2, interpolate);

        return [x, y];
    }

    return secondCoord;
};

// Format the distance and duration data from what we get from response.
const formatDistanceAndDuration = (distance, duration) => {
    let distance_;
    let duration_;
    if (distance >= 1000) {
        distance_ = distance / 1000;
        distance_ = Math.round(distance_ * 10) / 10;
        distance_ = new Intl.NumberFormat().format(distance_);
        distance_ = distance_ + 'km';
    } else {
        distance_ = Math.round(distance * 10) / 10;
        distance_ = distance_ + 'm';
    }

    if (duration > 60) {
        let hours = parseInt(duration / 60);
        let min = Math.round(duration % 60);
        hours = new Intl.NumberFormat().format(hours);
        duration_ = `${hours}h ${min}min`;
    } else {
        duration_ = Math.round(duration * 10) / 10;
        duration_ = `${duration_}min`;
    }

    return {
        distance: distance_,
        duration: duration_
    };
};

// Create the sidebar result container and inner items once we have got the response from server.
const generateBox = (routes) => {
    let lastLinePoint;
    let firstLinePoint;
    const lineWkt = routes.geometry;
    let segments = routes.segments;
    let count = 0;

    let distance = Math.round(routes.distance * 100) / 100;
    let duration = Math.round(routes.duration * 100) / 100;
    let format = formatDistanceAndDuration(distance, duration);
    let warnings;
    if (routes.warnings) {
        let str = ``;
        Object.keys(routes.warnings).map((key) => {
            str += `${routes.warnings[key]}  `;
        });
        warnings = `<p class="warnings">${str} </p> `;
    } else {
        warnings = '';
    }

    let boxesDom = document.querySelector('#boxes');
    let totalDom = document.querySelector('#total');
    let total = `<span class='format-distance'>${format.distance}</span>
				 <span class='format-duration'>${format.duration}</span> 
				 ${warnings}
				  <button id='menu'></button>
				  <button id='closeMenu'></button>
				`;
    totalDom.innerHTML = total;
    boxesDom.innerHTML = '';
    addRouteFeature(lineWkt);
    let lastLinePenultCoord = [];
    let lastLineLastCoord = [];
    let isTurn = true;
    let polylineCoords = [];

    if (segments) {
        let segments_ = segments
            .map((item) => {
                let polyline = item.geometry;
                let polylineCoord = polyline.split('(')[1].split(')')[0].split(',');
                let secondPointFromStart = findSecondPointFromStart(polylineCoord);
                return secondPointFromStart ? item : false;
            })
            .filter((item) => item);

        segments_.forEach((item) => {
            count++;
            let polyline = item.geometry;
            let polylineCoord = polyline.split('(')[1].split(')')[0].split(',');
            let secondPointFromStart = findSecondPointFromStart(polylineCoord);
            let secondPointFromEnd = findSecondPointFromEnd(polylineCoord);

            let startCoord = polylineCoord[0];
            polylineCoords.push(polylineCoord);
            let instruction = item.instruction;
            const maneuverType = item.maneuverType;
            let format = formatDistanceAndDuration(item.distance, item.duration);
            distance = format.distance;
            duration = format.duration;
            let className;
            let warnStr;
            if (item.isToll) {
                warnStr = '<span class="warnings-small ">Toll road</span>';
            } else {
                warnStr = '';
            }
            isTurn = true;

            switch (maneuverType) {
                case 'turn-left':
                    className = `left`;
                    break;
                case 'sharp-left':
                    className = `sharp_left`;
                    break;
                case 'slightly-left':
                    className = `slight_left`;
                    break;
                case 'turn-right':
                    className = `right`;
                    break;
                case 'sharp-right':
                    className = `sharp_right`;
                    break;
                case 'slightly-right':
                    className = `slight_right`;
                    break;
                case 'straight-on':
                    className = `straight_on`;
                    isTurn = false;
                    break;
                case 'u-turn':
                    className = `turn-back`;
                    break;
                case 'start':
                    className = `start`;
                    isTurn = false;
                    break;
                case 'stop':
                    className = `end`;
                    isTurn = false;
                    break;
                case 'roundabout':
                    className = `around_circle_straight`;
                    break;
            }

            let boxInnerDom =
                count !== segments_.length ?
                `<span class="direction-wrap" ><i class="direction ${className}"></i></span><span title='${instruction}' class="instruction">${instruction}</span>
				<span class="distance">${distance}</span><span  class="duration">${duration}</span>${warnStr}` :
                `<span class="direction-wrap" ><i class="direction ${className}"></i></span><span class="instruction endPoint">${instruction}</span>`;
            let boxDom = document.createElement('DIV');
            boxDom.className = 'box';
            boxDom.id = count;
            if (count === 1) {
                firstLinePoint = startCoord.split(' ');
                firstLinePoint = [+firstLinePoint[0], +firstLinePoint[1]];

                let penult = secondPointFromEnd;
                penultPoint = penult.split(' ');
                penultPoint = [+penultPoint[0], +penultPoint[1]];

                let last = polylineCoord[polylineCoord.length - 1];
                lastPoint = last.split(' ');
                lastPoint = [+lastPoint[0], +lastPoint[1]];

                lastLinePenultCoord = penult;
                lastLineLastCoord = last;

                let penult_ = polylineCoord[0];
                penult_ = penult_.split(' ');

                let last_ = polylineCoord[1];
                let lastPoint_ = last_.split(' ');
                lastPoint_ = [+lastPoint_[0], +lastPoint_[1]];
            }

            if (count === segments_.length) {
                let endCoord = polylineCoord[polylineCoord.length - 1];
                lastLinePoint = endCoord.split(' ');
                lastLinePoint = [+lastLinePoint[0], +lastLinePoint[1]];
                boxDom.setAttribute('coord', endCoord);
            } else {
                boxDom.setAttribute('coord', startCoord);
            }

            if (count >= 2) {
                boxDom.setAttribute('lastLinePenultCoord', lastLinePenultCoord);
                boxDom.setAttribute('lastLineLastCoord', lastLineLastCoord);
                isTurn && boxDom.setAttribute('lineSecondCoord', secondPointFromStart);

                let penult = secondPointFromEnd;
                penultPoint = penult.split(' ');
                penultPoint = [+penultPoint[0], +penultPoint[1]];

                let last = polylineCoord[polylineCoord.length - 1];
                lastPoint = last.split(' ');
                lastPoint = [+lastPoint[0], +lastPoint[1]];

                lastLinePenultCoord = penult;
                lastLineLastCoord = last;
            }

            boxDom.setAttribute('instruction', instruction);
            boxDom.innerHTML = boxInnerDom;
            boxesDom.appendChild(boxDom);
        });
    } else {
        // The two points are too close to find the route, so there are no segments. We need to add start point and end point in the result box.
        let boxInnerDomStart = `<span class="direction-wrap" ><i class="direction start"></i></span><span title="Start" class="instruction">Start</span>
		<span class="distance">0 km</span><span  class="duration">0 min</span>`;
        let boxInnerDomEnd = `<span class="direction-wrap" ><i class="direction end"></i></span><span title="End" class="instruction">End</span>
		<span class="distance">0 km</span><span  class="duration">0 min</span>`;
        let boxDomStart = document.createElement('DIV');
        let boxDomEnd = document.createElement('DIV');
        boxDomStart.className = 'box';
        boxDomEnd.className = 'box';
        boxDomStart.innerHTML = boxInnerDomStart;
        boxDomEnd.innerHTML = boxInnerDomEnd;
        boxDomStart.setAttribute('coord', getAllPoints()[0].join(' '));
        boxDomEnd.setAttribute('coord', getAllPoints()[getAllPoints().length - 1].join(' '));
        boxesDom.appendChild(boxDomStart);
        boxesDom.appendChild(boxDomEnd);
    }

    if (document.body.clientWidth <= 767) {
        const result = document.getElementById('result');

        result.style.height = 60 + 'px';
        const menu = document.getElementById('menu');
        const closeMenu = document.getElementById('closeMenu');

        menu.addEventListener('click', () => {
            result.style.height = 240 + 'px';
            result.style.overflowY = 'auto';
            menu.style.display = 'none';
            closeMenu.style.display = 'inline-block';
        });

        closeMenu.addEventListener('click', () => {
            result.style.height = 60 + 'px';
            result.style.overflow = 'hidden';
            closeMenu.style.display = 'none';
            menu.style.display = 'inline-block';
        });
    }
};

// In order to draw the arrow or arrow line on the turn point, we need to find the points what we need.
const findSecondPointFromStart = (coordinates) => {
    for (let i = 0; i < coordinates.length - 1; i++) {
        if (coordinates[i + 1] != coordinates[i]) {
            return coordinates[i + 1];
        }
    }

    return false;
};

const findSecondPointFromEnd = (coordinates) => {
    for (let i = coordinates.length - 1; i > 0; i--) {
        if (coordinates[i - 1] != coordinates[i]) {
            return coordinates[i - 1];
        }
    }

    return false;
};

/*---------------------------------------------*/
// 7. Error Event Handlers
/*---------------------------------------------*/

// These events allow you to perform custom actions when
// a map tile encounters an error while loading.
const errorLoadingTile = () => {
    const errorModal = document.querySelector('#error-modal');
    if (errorModal.classList.contains('hide')) {
        // Show the error tips when Tile loaded error.
        errorModal.classList.remove('hide');
    }
};

const setLayerSourceEventHandlers = (layer) => {
    let layerSource = layer.getSource();
    layerSource.on('tileloaderror', function() {
        errorLoadingTile();
    });
};

setLayerSourceEventHandlers(lightLayer);

// When you are ready to perform a routing request, but some input boxes are empty. Then we'll show the
// input error tip, after 3000ms, we'l hide the error tip automatically.
let timer;
const showErrorTip = (content) => {
    if (timer) {
        clearTimeout(timer);
    }
    const tip = document.querySelector('#input-error');
    tip.querySelector('p').innerHTML = content;
    tip.classList.add('show');
    timer = setTimeout(function() {
        tip.classList.remove('show');
    }, 3000);
};

const hideErrorTip = () => {
    document.querySelector('#input-error').classList.remove('show');
};

/*---------------------------------------------*/
// 8. UI control setup
/*---------------------------------------------*/

// Get the last node from a collection nodes by passing the DOM selector.
const getLastNodeBySelector = (selector) => {
    const inputs = document.querySelectorAll(selector);
    return inputs[inputs.length - 1];
};

// When we click the clear item in the context menu, we'll mak all the input empty using this method.
const clearInputBox = () => {
    const inputs = document.querySelectorAll('.point input');
    inputs.forEach((input) => {
        input.setAttribute('data-origin', '');
        input.value = '';
    });
};

// When there are results, show the result box, otherwise, hide the result box.
const hideOrShowResultBox = (visible) => {
    const sidebar = document.querySelector('.sidebar');
    if(visible === 'show'){
        sidebar.classList.remove('empty');
        resetSidebarHeight();
    }else {
        sidebar.classList.add('empty');
    }
}

// Since add or delete the input box, the result box height will automatically
// change. Here, we use this method to refresh the result sidebar height.
const resetSidebarHeight = () => {
    const resultSidebar = document.querySelector('.sidebar');
    const topHeight = document.querySelector('.point').clientHeight + 30;
    resultSidebar.style.top = `${topHeight}px`;
};

// When click the add point button or the item of add route in the context menu,
// we'll add an input box in the sidebar input group.
const addInputBox = (coord) => {
    const inputs = document.querySelectorAll('#dragable-list input');
    if (inputs.length === 10) {
        showErrorTip('No more than 10 points.');
        return;
    }
    removeFeatureByName('line');
    removeFeatureByName('arrow');
    hideOrShowResultBox('hide');
    const lastPoint = getLastNodeBySelector('#dragable-list li');
    const lastInput = lastPoint.querySelector('input');
    const parent = document.querySelector('#dragable-list');

    const newNode = document.createElement('li');
    newNode.classList.add('via');
    let dataOrigin;
    let inputValue;
    if (coord) {
        dataOrigin = coord;
        let coord_ = new ol.proj.toLonLat(coord);
        inputValue = [coord_[1].toFixed(8), coord_[0].toFixed(8)];
    } else {
        dataOrigin = lastInput.getAttribute('data-origin');
        inputValue = lastInput.value;
        lastInput.value = '';
        lastInput.setAttribute('data-origin', '');
    }
    newNode.innerHTML = `
	<i class="drag"></i><label></label>
	<input value="${inputValue}" data-origin="${dataOrigin}" placeholder="To" />
	<span class=""></span>
	<a class="closer"></a>`;
    parent.insertBefore(newNode, lastPoint);
};

// Hide or show the context menu when we click or right click the map.
const hideOrShowContextMenu = (style) => {
    let contextmenu = document.querySelector('#ol-contextmenu');
    switch (style) {
        case 'hide':
            contextmenu.classList.add('hide');
            break;
        case 'show':
            contextmenu.classList.remove('hide');
    }
};

// We use this method to toggle switch icon or delete icon in the input group.
// Since we only show the switch icon when there are only start and end point
// input boxes, and for other instance, we hide this switch icon and show the
// delete icon after each input box.
const toggleCloserAndSwitch = () => {
    if (document.querySelectorAll('.point input').length === 2) {
        // There is no via node but only start and end input point. So we have to hide the hide icon of the input and show the switch icon.
        document.querySelectorAll('.closer').forEach((closer) => {
            closer.classList.add('hide');
        });
        document.querySelector('.switch').classList.remove('hide');
    } else {
        // When there are more than or equal to 1 via node, we need to show the closer icon and hide the switch icon.
        document.querySelectorAll('.closer').forEach((closer) => {
            closer.classList.remove('hide');
        });
        document.querySelector('.switch').classList.add('hide');
    }
};

/*---------------------------------------------*/
// 9. Derive the Custom Class Drag
/*---------------------------------------------*/

// Since we need to drag the point to change the destination or start location,
// we have to make the point draggable. At this step, we derived the custom class Drag.
let coordBeforeMove;
app.Drag = function() {
    ol.interaction.Pointer.call(this, {
        handleDownEvent: app.Drag.prototype.handleDownEvent,
        handleDragEvent: app.Drag.prototype.handleDragEvent,
        handleUpEvent: app.Drag.prototype.handleUpEvent
    });
    // Save the coordinates when the cursor click.
    this.coordinate_ = null;
    // Save the feature what cursor click at the beginnig.
    this.feature_ = null;
    this.timeEvent;
    this.flag_ = true;
};
ol.inherits(app.Drag, ol.interaction.Pointer);

// Function handling "down" events.
// If the function returns true then a drag sequence is started.
app.Drag.prototype.handleDownEvent = function(evt) {
    if (evt.dragging) {
        return;
    }
    hideOrShowContextMenu('hide');

    const options = {
        // Only find feature on the routing layer not the base vector tile layer.
        layerFilter: function(layer) {
            if (layer instanceof ol.layer.VectorTile) {
                return false;
            }
            return true;
        }
    };

    var map = evt.map;
    var feature = map.forEachFeatureAtPixel(
        evt.pixel,
        function(feature, layer) {
            clearTimeout(this.timeEvent);
            this.flag_ = true;
            let featureName = feature.get('name');
            if (featureName === 'start' || featureName === 'end' || featureName === 'mid') {
                coordBeforeMove = feature.getGeometry().getCoordinates();
                return feature;
            }
        },
        options
    );

    if (feature) {
        this.coordinate_ = evt.coordinate;
        this.feature_ = feature;
    }

    return !!feature;
};

// Function handling "drag" events.
// This function is called on "move" events during a drag sequence.
app.Drag.prototype.handleDragEvent = function(evt) {
    clearTimeout(this.timeEvent);
    this.timeEvent = 0;

    this.flag_ = true;

    var deltaX = evt.coordinate[0] - this.coordinate_[0];
    var deltaY = evt.coordinate[1] - this.coordinate_[1];

    var geometry = this.feature_.getGeometry();
    geometry.translate(deltaX, deltaY);
    const coord = geometry.getCoordinates();
    const coord_ = coord.slice();
    const featureType = this.feature_.get('name');
    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];
    const coordBeforeMove_ = coordBeforeMove.slice();

    this.timeEvent = setTimeout(function() {
        removeFeatureByName('line');
        hideOrShowResultBox('hide');
        removeFeatureByName('arrow');
        this.flag_ = false;
        // Update the corresponding input node value and data-origin attribute value.
        if (featureType === 'start' || featureType === 'end' || featureType === 'mid') {
            const inputs = document.querySelectorAll('.point input');
            let inputNode;
            Array.from(inputs).some((input) => {
                const inputOrigin = input.getAttribute('data-origin');
                if (inputOrigin === coordBeforeMove_.toString()) {
                    inputNode = input;
                    return true;
                }
            });
            if (inputNode) {
                coordBeforeMove = coord;
                inputNode.setAttribute('data-origin', coord);
                inputNode.value = [coord_[1].toFixed(8), coord_[0].toFixed(8)];
            }
        }
        performRouting();
        this.coordinate_ = null;
        this.feature_ = null;
        return false;
    }, 1000);
};

// Function handling "up" events.
// If the function returns false then the current drag sequence is stopped.
app.Drag.prototype.handleUpEvent = function(e) {
    clearTimeout(this.timeEvent);
    this.timeEvent = 0;
    if (this.flag_) {
        const featureType = this.feature_.get('name');
        const coord = this.feature_.getGeometry().getCoordinates();

        if (coord.toString() === coordBeforeMove.toString()) {
            return;
        }
        const coord_ = new ol.proj.toLonLat(coord);
        const coordBeforeMove_ = coordBeforeMove.slice();

        // Update the corresponding input node value and data-origin attribute value.
        if (featureType === 'start' || featureType === 'end' || featureType === 'mid') {
            const inputs = document.querySelectorAll('.point input');
            let inputNode;
            Array.from(inputs).some((input) => {
                const inputOrigin = input.getAttribute('data-origin');
                if (inputOrigin === coordBeforeMove_.toString()) {
                    inputNode = input;
                    return true;
                }
            });
            if (inputNode) {
                inputNode.setAttribute('data-origin', coord);
                inputNode.value = [coord_[1].toFixed(8), coord_[0].toFixed(8)];
            }
        }
        removeFeatureByName('line');
        removeFeatureByName('arrow');
        hideOrShowResultBox('hide');
        performRouting();
        this.coordinate_ = null;
        this.feature_ = null;
        return false;
    }
};

/*---------------------------------------------*/
// 10. Event Listeners
/*---------------------------------------------*/

// These event listeners tell the UI when it's time to execute all of the
// code we've written.

document.addEventListener('DOMContentLoaded', function() {
    // Hide the context menu of the browsers when right click on the map.
    document.querySelector('#map').oncontextmenu = () => {
        return false;
    };

    // Hide the coustom context-menu when click on the map.
    document.querySelector('#map').onclick = () => {
        hideOrShowContextMenu('hide');
    };

    // Handle the click event when click the item in the customized context menu.
    document.querySelector('#ol-contextmenu').addEventListener('click', (e) => {
        const target = e.target.id;
        switch (target) {
            case 'add-startpoint':
                addPointFeature('start', curCoord);
                hideOrShowContextMenu('hide');
                removeFeatureByName('line');
                removeFeatureByName('arrow');

                // Update the start input value and data-origin value.
                let startInput = document.querySelector('#dragable-list input');
                startInput.setAttribute('data-origin', curCoord);
                let curCoord_ = ol.proj.transform(curCoord, 'EPSG:3857', 'EPSG:4326');
                startInput.value = curCoord_[1].toFixed(8) + ', ' + curCoord_[0].toFixed(8);
                hideOrShowResultBox('hide');
                performRouting();

                break;
            case 'add-endpoint':
                addPointFeature('end', curCoord);
                hideOrShowContextMenu('hide');
                removeFeatureByName('line');
                removeFeatureByName('arrow');

                // Update the end input value and data-origin value.
                let endInput = getLastNodeBySelector('#dragable-list li').querySelector('input');
                endInput.setAttribute('data-origin', curCoord);
                let curEndCoord_ = new ol.proj.toLonLat(curCoord);
                endInput.value = curEndCoord_[1].toFixed(8) + ', ' + curEndCoord_[0].toFixed(8);
                hideOrShowResultBox('hide');
                performRouting();
                break;
            case 'context-add-point':
                addPointFeature('mid', curCoord);
                removeFeatureByName('line');
                removeFeatureByName('arrow');
                addInputBox(curCoord);
                toggleCloserAndSwitch();
                hideOrShowContextMenu('hide');
                document.querySelector('.switch').classList.add('hide');
                hideOrShowResultBox('hide');
                performRouting();
                break;
            case 'clear':
                vectorSource.clear();
                clearInputBox();
                const x = window.matchMedia('(max-width: 767px)');
                const result = document.querySelector('#result');
                if (x.matches) {
                    result.style.overflowY = 'hidden';
                    result.classList.remove('transition-height');
                    result.style.height = 0 + 'px';
                }
                hideOrShowContextMenu('hide');
                hideOrShowResultBox('hide');
                performRouting();
        }
    });

    // When the pointer is moving over the item in result box, then add
    // a colored circle to the target location.
    document.querySelector('#map').addEventListener('mouseover', (e) => {
        let target = e.target;
        let boxDom;
        if (target.nodeName === 'SPAN' && target.parentNode.classList.contains('box')) {
            boxDom = target.parentNode;
        } else if (target.classList.contains('box')) {
            boxDom = target;
        }
        if (boxDom !== undefined) {
            let attrCoord = boxDom.getAttribute('coord');
            attrCoord = attrCoord.split(' ');
            let coord = [Number(attrCoord[0]), Number(attrCoord[1])];
            addResultRadius(coord);
        } else {
            removeFeatureByName('resultRadius');
        }
    });

    // When click the item in the result box, zoom in to where you click
    // and show the turn arrow or turn arrow line.
    document.querySelector('#result').addEventListener('click', (e) => {
        let target = e.target;
        let boxDom;
        const nodeList = document.querySelectorAll('.box');
        nodeList.forEach((node) => {
            if (node.classList.contains('selectBox')) {
                node.classList.remove('selectBox');
            }
        });

        if (target.nodeName === 'SPAN' && target.parentNode.classList.contains('box')) {
            target.parentNode.classList.add('selectBox');
            boxDom = target.parentNode;
        } else if (target.classList.contains('box')) {
            target.classList.add('selectBox');
            boxDom = target;
        }

        if (boxDom !== undefined) {
            removeFeatureByName('resultRadius');
            let penult = boxDom.getAttribute('lastlinepenultcoord');
            if (penult) {
                penult = penult.split(' ');
                let penultCoord = [Number(penult[0]), Number(penult[1])];

                let last = boxDom.getAttribute('lastLineLastCoord');
                last = last.split(' ');
                let lastCoord = [Number(last[0]), Number(last[1])];

                addArrow(penultCoord, lastCoord);
            }
            let attrCoord = boxDom.getAttribute('coord');
            attrCoord = attrCoord.split(' ');
            let coord = [Number(attrCoord[0]), Number(attrCoord[1])];
            view.fit(new ol.geom.Point(coord), {
                padding: [20, 20, 20, 20],
                duration: 1000,
                maxZoom: 17,
                callback: function() {
                    let penult = boxDom.getAttribute('lastlinepenultcoord');
                    if (penult) {
                        penult = penult.split(' ');
                        let penultCoord = [Number(penult[0]), Number(penult[1])];

                        let last = boxDom.getAttribute('lastLineLastCoord');
                        last = last.split(' ');
                        let lastCoord = [Number(last[0]), Number(last[1])];

                        var lineSecondCoord = boxDom.getAttribute('lineSecondCoord');
                        if (lineSecondCoord) {
                            var stringCoords = lineSecondCoord.split(' ');
                            lineSecondCoord = [+stringCoords[0], +stringCoords[1]].slice();
                            var prevCoord = lerp(lastCoord, penultCoord);
                            var secondCoord = lerp(lastCoord, lineSecondCoord);
                            addArrow(lastCoord, secondCoord);
                            addTurnLine(prevCoord, lastCoord, secondCoord);
                        } else {
                            addArrow(penultCoord, lastCoord);
                        }
                    }
                }
            });
        }
    });

    // When there are only two points in the input group, we could switch
    // the points by clicking the switch icon, which means we could switch
    // the starting point and destination point.
    document.querySelector('.switch').addEventListener('click', () => {
        let startInput = document.querySelector('#dragable-list input');
        let endInput = getLastNodeBySelector('#dragable-list li').querySelector('input');

        // Switch input value
        let t = startInput.value;
        startInput.value = endInput.value;
        endInput.value = t;

        // Switch input data-origin value
        let tOrigin = startInput.getAttribute('data-origin');
        startInput.setAttribute('data-origin', endInput.getAttribute('data-origin'));
        endInput.setAttribute('data-origin', tOrigin);

        // Get coord from input data-origin.
        let startOrigin = startInput.getAttribute('data-origin');
        let endOrigin = endInput.getAttribute('data-origin');
        let startOrigin_ = getCoordFromDataOrigin(startOrigin);
        let endOrigin_ = getCoordFromDataOrigin(endOrigin);

        if (startOrigin_.length > 0 && endOrigin_.length > 0) {
            vectorSource.clear();
            hideOrShowResultBox('hide');
            addPointFeature('start', startOrigin_);
            addPointFeature('end', endOrigin_);
            performRouting();
        }
    });

    // Hide the error modals when clicking the "OK" button.
    document.querySelector('#error-modal button').addEventListener('click', () => {
        document.querySelector('#error-modal').classList.add('hide');
    });

    // Add an input box once clicked the "Add destination" button
    document.querySelector('#add-point').addEventListener('click', function() {
        removeFeatureByName('line');
        removeFeatureByName('arrow');
        hideOrShowResultBox('hide');
        const feature = getFeatureByName('end');
        if (feature) {
            feature.set('name', 'mid');
            feature.setStyle(styles.mid);
        }
        addInputBox();
    });

    // Delete the input box when clicking the deleting icon on the right of the input box.
    document.querySelector('.point').addEventListener('click', function(e) {
        e = window.event || e;
        const target = e.target;
        const classlist = target.classList;
        if (target === document.querySelector('.closer')) {
            // Delete the target input box(start point input).
            // Move the value and data-origin from second node to first node, and delete the second node.
            const first = target.parentNode;
            const second = document.querySelectorAll('.via')[0];
            const secondOrigin = second.querySelector('input').getAttribute('data-origin');
            first.querySelector('input').value = second.querySelector('input').value;
            first.querySelector('input').setAttribute('data-origin', secondOrigin);
            second.remove();
            removeFeatureByName('start');
            const feature = getFeatureByCoord(secondOrigin);
            if (feature) {
                feature.set('name', 'start');
                feature.setStyle(styles.start);
            }
        } else if (target === getLastNodeBySelector('.closer')) {
            // Delete the target input box(end point input).
            // Move the value and data-origin from penult node to last node, and delete the penult node.
            const last = target.parentNode;
            const allVias = document.querySelectorAll('.via');
            const penult = allVias[allVias.length - 1];
            const penultOrigin = penult.querySelector('input').getAttribute('data-origin');
            last.querySelector('input').value = penult.querySelector('input').value;
            last
                .querySelector('input')
                .setAttribute('data-origin', penult.querySelector('input').getAttribute('data-origin'));
            penult.remove();
            removeFeatureByName('end');
            const feature = getFeatureByCoord(penultOrigin);
            if (feature) {
                feature.set('name', 'end');
                feature.setStyle(styles.end);
            }
        } else if (classlist.contains('closer')) {
            // Delete the target input box(input in the middle).
            const parentNode = target.parentNode;
            let coord = parentNode.querySelector('input').getAttribute('data-origin');
            removeFeatureByCoord(coord);
            parentNode.remove();
        }

        if (classlist.contains('closer') || target.id === 'add-point') {
            toggleCloserAndSwitch();
            findRoute(false);
        }
    });

    // Update the input value to input attribute of "data-origin", which stores
    // the most accurate coordinates of the point.
    const updateDataOriginByInput = (inputNode, inputValue) => {
        if (inputValue) {
            let valueArr = inputValue.split(',');
            if (valueArr.length === 2) {
                let valueArr_ = [Number(valueArr[1]), Number(valueArr[0])]; // '12,13' => [13,12]
                inputNode.setAttribute('data-origin', new ol.proj.fromLonLat(valueArr_));
            } else {
                inputNode.setAttribute('data-origin', '');
            }
        } else {
            inputNode.setAttribute('data-origin', '');
        }
    };
    document.querySelector('.point').addEventListener('input', function(e) {
        e = window.event || e;
        const target = e.target;
        updateDataOriginByInput(target, target.value);
    });

    // When press enter, perform the routing request.
    document.querySelector('.point').addEventListener('keyup', function(e) {
        e = window.e || e;
        if (e.keyCode === 13) {
            const showError = true;
            findRoute(showError);
        }
    });

    // When click "go" button in the sidebar, performing the routing request.
    document.querySelector('#go').addEventListener('click', function() {
        const showError = true;
        findRoute(showError);
    });

    // In order to reorder the input group, we used a plugin to handle it.
    // When dragging end, we need to judge if we should perform the routing request.
    const handleDragEnd = () => {
        const inputs = document.querySelectorAll('#dragable-list input');
        const length = inputs.length;
        inputs.forEach((input, index) => {
            if (index === 0) {
                input.setAttribute('placeholder', 'Start');
            } else if (index === length - 1) {
                input.setAttribute('placeholder', 'Destination');
            } else {
                input.setAttribute('placeholder', 'To');
            }
        });

        const showError = false;

        // vectorSource.clear();
        // hideOrShowResultBox('hide');
        findRoute(showError);
    };

    // Create the draggable instance.
    Sortable.create(document.getElementById('dragable-list'), {
        handle: '.drag',
        onEnd: handleDragEnd,
        animation: 150,
        ghostClass: 'dragging'
    });
});
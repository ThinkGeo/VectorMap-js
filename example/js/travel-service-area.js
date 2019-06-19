let vectorSource;
let startInputCoord = [-71.06734129275898, 42.35059783495578];
let pointFeature;
let startInputEle;

const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';

const routingClient = new tg.RoutingClient(apiKey);

let app = {};

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

app.Drag.prototype.handleDownEvent = function (evt) {
    var map = evt.map;
    var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
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

app.Drag.prototype.handleDragEvent = function (evt) {
    var deltaX = evt.coordinate[0] - this.coordinate_[0];
    var deltaY = evt.coordinate[1] - this.coordinate_[1];

    var geometry = this.feature_.getGeometry();
    geometry.translate(deltaX, deltaY);
    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];
};

app.Drag.prototype.handleMoveEvent = function (evt) {
    if (this.cursor_) {
        var map = evt.map;
        var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
            return feature;
        });
        var element = evt.map.getTargetElement();
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

const darkLayer = new ol.mapsuite.VectorTileLayer('https://cdn.thinkgeo.com/worldstreets-styles/3.0.0/dark.json', {
    apiKey: apiKey,
    layerName: 'dark'
});

let map;
const view = new ol.View({
    center: ol.proj.fromLonLat(startInputCoord),
    maxResolution: 40075016.68557849 / 512,
    progressiveZoom: true,
    zoom: 8,
    minZoom: 2,
    maxZoom: 19
});


const initializeMap = () => {
    map = new ol.Map({
        renderer: 'webgl',
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        layers: [darkLayer],
        target: 'map',
        view: view,
        interactions: ol.interaction.defaults().extend([new app.Drag()])
    });

    addRoutingPoint(map);
    performRouting();

    let left, top;
    let clientWidth = document.documentElement.clientWidth;
    let clientHeight = document.documentElement.clientHeight;
    const contextmenu = document.querySelector('#ol-contextmenu');
    const contextWidth = 165;
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
};

const pointStyle = new ol.style.Style({
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
});

const snapStyle = new ol.style.Style({
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
});

const lineStyles = [
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
]

const polygonStyles = [
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
];

const updateInputValue = (noFixed) => {
    const coord_ = startInputCoord.slice();
    startInputEle.setAttribute('data-origin', startInputCoord[1] + ', ' + startInputCoord[0]);
    if (noFixed) {
        startInputEle.value = coord_[1] + ', ' + coord_[0];
    } else {
        startInputEle.value = coord_[1].toFixed(6) + ', ' + coord_[0].toFixed(6);
    }
}

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
    pointFeature.setStyle(pointStyle);
    vectorSource.addFeature(pointFeature)
}

const drawAreas = (res, type) => {
    const areas = res.serviceAreas;
    const coordinate = res.waypoint.coordinate;
    const snapPoint = [coordinate.x, coordinate.y];

    // Add areas
    for (let i = 0, l = areas.length; i < l; i++) {
        const wkt = areas[i];
        const format = new ol.format.WKT();
        const feature = format.readFeature(wkt, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
        feature.set('name', 'areas');
        const style = type === 'Linestring' ? lineStyles[i] : polygonStyles[i];
        feature.setStyle(style);
        vectorSource.addFeature(feature);
    }

    // Add sanp point
    const snapFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(snapPoint)),
        name: 'snap'
    });
    snapFeature.setStyle(snapStyle);
    vectorSource.addFeature(snapFeature);
}

let count = 0;
let timer;
const errorMessage = document.querySelector('#error-message');
const performRouting = () => {
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

    clear();

    // Get the params from panel.
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
        ContourGranularity: contourGranularity,
        GridSizeInMeters: gridSizeInMeters,
        ServiceAreaType: serviceAreaType,
        ServiceLimits: serviceLimits,
        ServiceLimitsType: serviceLimitsType,
        TravelDirection: travelDirection
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

// Remove the previous areas.
const clear = () => {
    const features = vectorSource.getFeatures();
    features.forEach(feature => {
        if (feature.get('name') === 'areas' || feature.get('name') === 'snap' || feature.get('name') === 'line') {
            vectorSource.removeFeature(feature);
        }
    })
}

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

document.addEventListener('DOMContentLoaded', function () {
    startInputEle = document.querySelector('#startPoint');
    document.querySelector('#map').onclick = () => {
        hideOrShowContextMenu('hide');
    };

    document.querySelector('#map').oncontextmenu = () => {
        return false;
    };

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

    updateInputValue();

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

    document.querySelector('#refresh').addEventListener('click', function () {
        const coord = startInputEle.value.replace(/\s/g, '');
        let coor_ = coord.split(',');
        let coord_ = [Number(coor_[1]), Number(coor_[0])];
        pointFeature.setGeometry(new ol.geom.Point(ol.proj.fromLonLat(coord_)));
        startInputCoord = coord_.slice();
        updateInputValue(true);
        performRouting();
    })

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
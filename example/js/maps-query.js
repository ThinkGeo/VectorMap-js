const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';
let mapsQueryClient = new tg.MapsQueryClient(apiKey);

let initMap = function () {
    let module = {
        _drawInteraction: undefined,
        removeDraw: undefined,
        startDraw: undefined,
        clearResults: undefined,
        showResults: undefined,
        drawnGeometry: undefined,
        drawn: undefined,
    };

    let baseMap = new ol.mapsuite.VectorTileLayer('https://cdn.thinkgeo.com/worldstreets-styles/3.0.0/dark.json', {
        apiKey: apiKey,
    });

    //set the wrapX of baseMap
    if (baseMap.geoSources &&
        baseMap.geoSources.worldstreets_source_test) {
        baseMap.geoSources.worldstreets_source_test.wrapX_ = false;
    }

    let view = new ol.View({
        center: [-10774373.86392731, 3864473.8864140143],
        zoom: 16.73,
        minZoom: 1,
    });

    let resultsStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: '#9d5125b2'
        }),
        stroke: new ol.style.Stroke({
            color: '#9d5125',
            width: 1,
        }),
        image: new ol.style.Circle({
            fill: new ol.style.Fill({
                color: '#9d5125',
            }),
            radius: 2,
        }),
    });
    let resultsSource = new ol.source.Vector({
        wrapX: false,
    });
    let resultsLayer = new ol.layer.Vector({
        source: resultsSource,
        style: resultsStyle,
    });

    let drawStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: '#2884b055'
        }),
        stroke: new ol.style.Stroke({
            color: '#2884b0',
            width: 1,
        }),
        image: new ol.style.Circle({
            fill: new ol.style.Fill({
                color: '#2884b0',
            }),
            radius: 2,
        }),
    });
    let drawSource = new ol.source.Vector({
        wrapX: false,
    });
    let drawLayer = new ol.layer.Vector({
        source: drawSource,
        style: drawStyle,
    });

    let map = new ol.Map({
        renderer: 'webgl',
        layers: [baseMap, drawLayer, resultsLayer],
        target: 'map',
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        view: view
    });

    let popup = document.querySelector('#mapPopup');
    let popupClose = popup.querySelector('.close-button');
    let popupContent = popup.querySelector('.content');

    let overlay = new ol.Overlay({
        element: popup,
        autoPan: false,
    });
    popupClose.addEventListener('click', function () {
        overlay.setPosition();
    });
    overlay.setMap(map);
    map.on('click', function (e) {
        overlay.setPosition();
        if (module._drawInteraction !== undefined) {
            return;
        }

        let clickedFeatures = map.getFeaturesAtPixel(e.pixel, {
            layerFilter: function (layer) {
                return layer === resultsLayer;
            },
            hitTolerance: 3
        });
        if (clickedFeatures && clickedFeatures.length > 0) {
            let nearestFeature = clickedFeatures[0];
            let properties = nearestFeature.getProperties();
            renderPopupContent(properties);
            overlay.setPosition(e.coordinate);
        }
    });

    let renderPopupContent = function (properties) {
        popupContent.innerHTML = '';
        let contentTable = document.createElement('table');
        Object.getOwnPropertyNames(properties).forEach(name => {
            if (typeof (properties[name]) !== 'string' || properties[name] === '') {
                return;
            }
            let tr = document.createElement('tr');
            let th = document.createElement('th');
            let td = document.createElement('td');
            th.innerText = name;
            td.innerText = properties[name];
            tr.appendChild(th);
            tr.appendChild(td);
            contentTable.appendChild(tr);
        });
        popupContent.appendChild(contentTable);
    };

    let measureTooltipDom = document.createElement('div');
    measureTooltipDom.classList.add('measure-tooltip');
    let measureTooltip = new ol.Overlay({
        element: measureTooltipDom,
        offset: [0, -5],
        positioning: 'bottom-center'
    });
    map.addOverlay(measureTooltip);

    let removeDraw = function () {
        if (module._drawInteraction !== undefined) {
            map.removeInteraction(module._drawInteraction);
            module._drawInteraction = undefined;
        }
    };

    let startDraw = function (geometryType) {
        let drawInteraction = new ol.interaction.Draw({
            source: drawSource,
            type: geometryType,
        });
        drawInteraction.on('drawstart', function (e) {
            drawSource.clear();
            module.drawnGeometry = undefined;
            let feature = e.feature;
            if (feature.getGeometry() instanceof ol.geom.Point) {
                let coordinate = feature.getGeometry().getCoordinates();
                measureTooltipDom.innerHTML = coordinate.map(value => value.toFixed(2));
                measureTooltip.setPosition(coordinate);
            } else {
                feature.getGeometry().on('change', function (e) {
                    let geometry = e.target;
                    let output;
                    let coordinate;
                    if (geometry instanceof ol.geom.Polygon || geometry instanceof ol.geom.MultiPolygon) {
                        coordinate = geometry.getInteriorPoint().getCoordinates();
                        let area = geometry.getArea();
                        if (area < 1000000) {
                            output = area.toFixed(0) + 'm<sup>2</sup>';
                        } else {
                            output = (area / 1000000).toFixed(2) + 'km<sup>2</sup>';
                        }
                    } else if (geometry instanceof ol.geom.LineString) {
                        coordinate = geometry.getLastCoordinate();
                        let length = geometry.getLength();
                        if (length < 1000) {
                            output = length.toFixed(0) + 'm';
                        } else {
                            output = (length / 1000).toFixed(2) + 'km';
                        }
                    }
                    measureTooltipDom.innerHTML = output;
                    measureTooltip.setPosition(coordinate);
                });
            }
        });
        drawInteraction.on('drawend', function (e) {
            let feature = e.feature;
            module.drawnGeometry = feature.getGeometry();
            if (typeof (module.drawn) === 'function') {
                module.drawn(feature);
            }
        });

        removeDraw();
        module._drawInteraction = drawInteraction;
        map.addInteraction(module._drawInteraction);
    };

    let clearResults = function () {
        resultsSource.clear();
    };

    let showResults = function (features) {
        clearResults();
        resultsSource.addFeatures(features);
    };

    module.removeDraw = removeDraw;
    module.startDraw = startDraw;
    module.clearResults = clearResults;
    module.showResults = showResults;

    return module;
};

let initQueryPanel = function (options) {
    let opts = options || {};
    let module = {
        _drawType: undefined,
        queryType: undefined,
        drawTypeChanged: opts.drawTypeChanged,
        queryClicked: opts.queryClicked,
    };

    Object.defineProperties(module, {
        drawType: {
            get: function () {
                return module._drawType;
            },
            set: function (value) {
                if (module._drawType !== value) {
                    let oldValue = module._drawType;
                    module._drawType = value;
                    if (typeof (module.drawTypeChanged) === 'function') {
                        module.drawTypeChanged(value, oldValue);
                    }

                    buttonGroup.querySelectorAll('button').forEach(function (button) {
                        let attribute = button.attributes['data-draw-type'];
                        let attributeValue = attribute === undefined ? undefined : attribute.value;
                        if (value === attributeValue) {
                            button.classList.add('active');
                        } else {
                            button.classList.remove('active');
                        }
                    });
                }
            }
        },
        layerName: {
            get: function () {
                return document.querySelector('#layerNameSelect').value;
            }
        },
        maxResults: {
            get: function () {
                return document.querySelector('#queryMaxResults').value;
            }
        },
        searchRadius: {
            get: function () {
                return document.querySelector('#searchRadiusInput').value;
            }
        },
        searchRadiusUnit: {
            get: function () {
                return document.querySelector('#searchRadiusUnitSelect').value;
            }
        },
        distance: {
            get: function () {
                return document.querySelector('#distanceInput').value;
            }
        },
        distanceUnit: {
            get: function () {
                return document.querySelector('#distanceUnitSelect').value;
            }
        }
    });

    let queryTypeSelect = document.querySelector('#queryTypeSelect');
    let queryTypeSelected = function () {
        let queryType = queryTypeSelect.value;

        if (queryType === 'nearest') {
            document.querySelector('#nearestQueryPanel').classList.remove('hidden');
        } else {
            document.querySelector('#nearestQueryPanel').classList.add('hidden');
        }

        if (queryType === 'within-distance') {
            document.querySelector('#distanceQueryPanel').classList.remove('hidden');
        } else {
            document.querySelector('#distanceQueryPanel').classList.add('hidden');
        }

        module.queryType = queryType;
    };
    queryTypeSelect.addEventListener('input', queryTypeSelected);
    queryTypeSelected();

    let buttonGroup = document.querySelector('#drawTypePanel .button-group');
    buttonGroup.addEventListener('click', function (e) {
        let target = e.target;
        if (target.tagName !== 'BUTTON') {
            return;
        }

        let attribute = target.attributes['data-draw-type'];
        module.drawType = attribute === undefined ? undefined : attribute.value;
    });

    document.querySelectorAll('#drawTypePanel .button-group button').forEach(function (button) {
        if (button.classList.contains('active')) {
            let attribute = button.attributes['data-draw-type'];
            module.drawType = attribute === undefined ? undefined : attribute.value;
        }
    });

    document.querySelector('#queryButton').addEventListener('click', function () {
        if (typeof (module.queryClicked) === 'function') {
            module.queryClicked.apply(this, arguments);
        }
    });

    document.querySelector('#queryCollapseButton').addEventListener('click', function () {
        document.querySelector('.query-panel').classList.toggle('collapsed');
    });

    return module;
};

let initMessage = function () {
    let module = {};
    module.warning = function (message) {
        showMessage(message, 'warning');
    };
    module.error = function (message) {
        showMessage(message, 'error');
    };

    let removeMessage = function (messageDom) {
        document.body.removeChild(messageDom);
    };

    let showMessage = function (message, style, delay) {
        delay = typeof (delay) === 'number' ? delay : 2000;
        let messageDom = document.createElement('div');
        messageDom.classList.add('alert-message');
        if (style) {
            messageDom.classList.add(style);
        }
        messageDom.innerHTML = message;

        document.body.appendChild(messageDom);

        let timeoutId = undefined;
        let delayRemoveMessage = () => {
            cancelRemoveMessage();
            timeoutId = setTimeout(() => {
                timeoutId = undefined;
                removeMessage(messageDom);
            }, delay);
        };
        let cancelRemoveMessage = () => {
            if (timeoutId !== undefined) {
                let timeoutIdToCancel = timeoutId;
                timeoutId = undefined;
                clearTimeout(timeoutIdToCancel);
            }
        };
        messageDom.addEventListener('mouseenter', function () {
            if (this === messageDom) {
                cancelRemoveMessage();
            }
        });
        messageDom.addEventListener('mouseleave', function () {
            if (this === messageDom) {
                delayRemoveMessage();
            }
        });

        delayRemoveMessage();
    };
    return module;
};

let messageModule = initMessage();
window.messageModule = messageModule;

const initializeMap = () => {

    let mapModule = initMap();
    let queryPanelModule = initQueryPanel({
        drawTypeChanged: function (newValue, oldValue) {
            if (newValue === undefined) {
                mapModule.removeDraw();
            } else {
                mapModule.startDraw(newValue);
            }
        },
    });

    queryPanelModule.queryClicked = function () {
        const queried = function (status, response) {
            if (status === 200 && response.error === undefined) {
                let responseFeatures = response.data.features;
                if (responseFeatures.length === 0) {
                    messageModule.warning('Your query returned no results. Try a different query type or query a different layer.');
                    mapModule.showResults([]);
                    return;
                }
                let wktReader = new ol.format.WKT();
                mapModule.showResults(responseFeatures.map(item => {
                    let feature = wktReader.readFeature(item.geometry);
                    feature.setProperties(item.attributes);
                    return feature;
                }));
                queryPanelModule.drawType = undefined;
            } else if (status >= 400 && status < 500) {
                if (response.data) {
                    let message;
                    Object.getOwnPropertyNames(response.data).forEach(function (value) {
                        response.data[value].forEach(function (value) {
                            if (message) {
                                message += ('<br>' + value);
                            } else {
                                message = value;
                            }
                        });
                    });
                    messageModule.warning(status + ': ' + message);
                }
            } else if (status >= 500) {
                messageModule.error(status + ': An unexpected problem was encountered.');
            }
        };

        if (mapModule.drawnGeometry === undefined) {
            messageModule.warning('Please draw a shape.');
        }
        let wktWriter = new ol.format.WKT();
        let targetShapeWkt = wktWriter.writeGeometry(mapModule.drawnGeometry);

        if (targetShapeWkt.length < 1500) {
            switch (queryPanelModule.queryType) {
                case 'within':
                    mapsQueryClient.getFeaturesWithin(queryPanelModule.layerName, targetShapeWkt, queried, {
                        srid: 3857,
                        maxResults: queryPanelModule.maxResults,
                        returnFeatureAttributes: true,
                        featureAttributesToReturn: undefined,
                    });
                    break;
                case 'containing':
                    mapsQueryClient.getFeaturesContaining(queryPanelModule.layerName, targetShapeWkt, queried, {
                        srid: 3857,
                        maxResults: queryPanelModule.maxResults,
                        returnFeatureAttributes: true,
                        featureAttributesToReturn: undefined,
                    });
                    break;
                case 'intersecting':
                    mapsQueryClient.getFeaturesIntersecting(queryPanelModule.layerName, targetShapeWkt, queried, {
                        srid: 3857,
                        maxResults: queryPanelModule.maxResults,
                        returnFeatureAttributes: true,
                        featureAttributesToReturn: undefined,
                    });
                    break;
                case 'overlapping':
                    mapsQueryClient.getFeaturesOverlapping(queryPanelModule.layerName, targetShapeWkt, queried, {
                        srid: 3857,
                        maxResults: queryPanelModule.maxResults,
                        returnFeatureAttributes: true,
                        featureAttributesToReturn: undefined,
                    });
                    break;
                case 'touching':
                    mapsQueryClient.getFeaturesTouching(queryPanelModule.layerName, targetShapeWkt, queried, {
                        srid: 3857,
                        maxResults: queryPanelModule.maxResults,
                        returnFeatureAttributes: true,
                        featureAttributesToReturn: undefined,
                    });
                    break;
                case 'nearest':
                    mapsQueryClient.getFeaturesNearest(queryPanelModule.layerName, targetShapeWkt, queried, {
                        searchRadius: queryPanelModule.searchRadius,
                        searchRadiusUnit: queryPanelModule.searchRadiusUnit,
                        srid: 3857,
                        maxResults: queryPanelModule.maxResults,
                        returnFeatureAttributes: true,
                        featureAttributesToReturn: undefined,
                    });
                    break;
                case 'within-distance':
                    mapsQueryClient.getFeaturesWithinDistance(queryPanelModule.layerName, targetShapeWkt, queried, {
                        distance: queryPanelModule.distance,
                        distanceUnit: queryPanelModule.distanceUnit,
                        srid: 3857,
                        maxResults: queryPanelModule.maxResults,
                        returnFeatureAttributes: true,
                        featureAttributesToReturn: undefined,
                    });
                    break;
            }
        } else {
            mapsQueryClient.getFeaturesCustom(queryPanelModule.layerName, targetShapeWkt, queryPanelModule.queryType, queried, {
                searchRadius: queryPanelModule.searchRadius,
                searchRadiusUnit: queryPanelModule.searchRadiusUnit,
                distance: queryPanelModule.distance,
                distanceUnit: queryPanelModule.distanceUnit,
                srid: 3857,
                maxResults: queryPanelModule.maxResults,
                returnFeatureAttributes: true,
                featureAttributesToReturn: undefined,
            });
        }
    };
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
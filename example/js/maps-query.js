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

    let baseMap = new ol.mapsuite.VectorTileLayer('https://cdn.thinkgeo.com/worldstreets-styles/1.0.0-beta009/dark.json', {
        apiKey: apiKey,
    });
    
    //set the wrapX of baseMap
    if (baseMap.geoSources
        && baseMap.geoSources.worldstreets_source_test) {
        baseMap.geoSources.worldstreets_source_test.wrapX_ = false;
    }

    let view = new ol.View({
        center: [843600.1261291262, 5933131.38691444],
        zoom: 3,
        minZoom: 1,
    });

    let resultsStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: '#ce917833'
        }),
        stroke: new ol.style.Stroke({
            color: '#ce9178',
            width: 1,
        }),
        image: new ol.style.Circle({
            fill: new ol.style.Fill({
                color: '#ce9178',
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
            color: '#1f6b7533'
        }),
        stroke: new ol.style.Stroke({
            color: '#1f6b75',
            width: 1,
        }),
        image: new ol.style.Circle({
            fill: new ol.style.Fill({
                color: '#1f6b75',
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
        layers: [baseMap, resultsLayer, drawLayer],
        target: 'map',
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        view: view
    });

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
            if(feature.getGeometry() instanceof ol.geom.Point){
                let coordinate = feature.getGeometry().getCoordinates();
                measureTooltipDom.innerHTML = coordinate.map(value => value.toFixed(2));
                measureTooltip.setPosition(coordinate);
            }else{
                feature.getGeometry().on('change', function(e){
                    let geometry = e.target;
                    let output;
                    let coordinate;
                    if (geometry instanceof ol.geom.Polygon || geometry instanceof ol.geom.MultiPolygon){
                        output = geometry.getArea().toFixed(2) + 'm<sup>2</sup>';
                        coordinate = geometry.getInteriorPoint().getCoordinates();
                    }else if(geometry instanceof ol.geom.LineString){
                        output = geometry.getLength().toFixed(2) + 'm';
                        coordinate = geometry.getLastCoordinate();
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
        drawType: undefined,
        queryType: undefined,
        drawTypeChanged: opts.drawTypeChanged,
        queryClicked: opts.queryClicked,
    };

    Object.defineProperties(module, {
        layerName: {
            get: function () {
                return document.querySelector('#layerNameSelect').value;
            }
        },
        useCustomQuery: {
            get: function () {
                return document.querySelector('#useCustomQueryCheckBox').checked;
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

    let getDrawTypeByElementId = function (elementId) {
        switch (elementId) {
        case 'notDrawInput':
            return undefined;
        case 'pointDrawInput':
            return 'Point';
        case 'polylineDrawInput':
            return 'LineString';
        case 'polygonDrawInput':
            return 'Polygon';
        }
    };

    let drawTypeRadiosClicked = function (e) {
        let elementId = e.srcElement.id;
        let checked = e.srcElement.checked;
        if (checked === true) {
            let oldValue = module.drawType;
            module.drawType = getDrawTypeByElementId(elementId);
            let newValue = module.drawType;
            if (oldValue !== newValue && typeof (module.drawTypeChanged) === 'function') {
                module.drawTypeChanged(newValue, oldValue);
            }
        }
    };

    document.querySelectorAll('#drawTypePanel input').forEach(function (element) {
        element.addEventListener('input', drawTypeRadiosClicked);
        if (element.checked === true) {
            module.drawType = getDrawTypeByElementId(element.id);
            if (typeof (module.drawTypeChanged) === 'function') {
                module.drawTypeChanged(module.drawType, null);
            }
        }
    });

    document.querySelector('#queryButton').addEventListener('click', function () {
        if (typeof (module.queryClicked) === 'function') {
            module.queryClicked.apply(this, arguments);
        }
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
        delay = typeof(delay) === 'number' ? delay : 2000;
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
            if (timeoutId !== undefined){
                let timeoutIdToCancel = timeoutId;
                timeoutId = undefined;
                clearTimeout(timeoutIdToCancel);
            }
        };
        messageDom.addEventListener('mouseenter', function(){
            if (this === messageDom){
                cancelRemoveMessage();
            }
        });
        messageDom.addEventListener('mouseleave', function(){
            if (this === messageDom){
                delayRemoveMessage();
            }
        });

        delayRemoveMessage();
    };
    return module;
};

let messageModule = initMessage();
window.messageModule = messageModule;
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
            let wktReader = new ol.format.WKT();
            mapModule.showResults(responseFeatures.map(item => wktReader.readFeature(item.geometry)));
        } else if (status >= 400 && status < 500) {
            if (response.data){
                let message;
                Object.getOwnPropertyNames(response.data).forEach(function(value){
                    response.data[value].forEach(function(value){
                        if (message){
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
    
    if (!queryPanelModule.useCustomQuery) {
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
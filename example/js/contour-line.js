/*===========================================================================*/
// Precipitation Distribution
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. Loading the Precipitation Distribution Layer
//   4. Line Chart Setup
//   5. Popup Setup
//   6. Event Listeners
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
const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';


/*---------------------------------------------*/
// 2. Map Control Setup
/*---------------------------------------------*/

// Now we'll create the base layer for our map.  The base layer uses the ThinkGeo
// Cloud Maps Raster Tile service to display a detailed street map.  For more
// info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_raster_tiles
let baseLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
        tileSize: 512
    })
});

// Create and initialize our interactive map.
let map = new ol.Map({
    renderer: 'webgl',
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    // Add our previously-defined ThinkGeo Cloud Raster Tile layer to the map.
    layers: [baseLayer],
    // States that the HTML tag with id="map" should serve as the container for our map.
    target: 'map',
    // Create a default view for the map when it starts up.

    view: new ol.View({
        // Center the map on the United States and start at zoom level 3.
        center: ol.proj.fromLonLat([-92.405729, 37.802898]),
        maxResolution: 40075016.68557849 / 512,
        zoom: 3,
        minZoom: 1,
        maxZoom: 19,
        progressiveZoom: false,
    })
});

// Add a button to the map that lets us toggle full-screen display mode.
map.addControl(new ol.control.FullScreen());


/*---------------------------------------------*/
// 3. Loading the Precipitation Distribution Layer
/*---------------------------------------------*/

// The next part sets up the Precipitation Distribution layer style for the points on our map, 
// and create the line chart at the bottom of the screen whose purpose is to show that the 
// majority of records being broken are old, long-standing records.  

// Define the break points which will be used in legend.
const legendLevels = [30, 50, 70, 90];

// Define different colors array which represents the varying degrees of precipitation.
const plotsColors = ["#86e4ff", "#0fcaff", "#009dca", "#006986", "#004153"];

// Create different layer styles for varying degrees of precipitation by passing a colors array. 
const createRainfullStyles = (colors) => {
    let styles = [];
    for (let i = 0, l = colors.length; i < l; i++) {
        let style = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: '#ffffffcc',
                    width: 1
                }),
                fill: new ol.style.Fill({
                    color: colors[i]
                })
            })
        })
        styles.push(style);
    }
    return styles;
}

let rainfullStyles = createRainfullStyles(plotsColors);

// Update the yAxes value when we read every feature.
const updateChartValue = (PreviousRecordAgeInDays, chartDataset) => {
    // Define the break points which will be used in line chart.
    const dividedDays = [1826, 3652, 7304, 14608];

    if (PreviousRecordAgeInDays < dividedDays[0]) {
        chartDataset.yAxes[0]++
    } else if (PreviousRecordAgeInDays < dividedDays[1]) {
        chartDataset.yAxes[1]++
    } else if (PreviousRecordAgeInDays < dividedDays[2]) {
        chartDataset.yAxes[2]++
    } else if (PreviousRecordAgeInDays < dividedDays[3]) {
        chartDataset.yAxes[3]++
    } else if (PreviousRecordAgeInDays > dividedDays[3]) {
        chartDataset.yAxes[4]++
    }
}

// Now that we've set up our map's base layer and the style for our point data layer, 
// we need to actually load the point data that will let us visualize the precipitation 
// on the map. We'll load it from a samll GeoJSON file hosted on our servers.
let rainfullLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: '../data/RainfallRecords_2018-03_to_2019-03.geojson',
        format: new ol.format.GeoJSON()
    }),
    style: (feature) => {
        // Set some properties for every feature.
        let value = feature.get("value");
        feature.set("type", "rainfull");
        feature.set("stationName", feature.get('stationName'));
        feature.set("date", feature.get('date'));
        feature.set("previousDate", feature.get('previousDate'));
        feature.set("value", value);
        feature.set("previousValue", feature.get('previousValue'));
        feature.set("difference", feature.get('difference'));

        // Set different styles for varying degrees of precipitation points.
        if (value < legendLevels[0]) {
            return rainfullStyles[0];
        } else if (value >= legendLevels[0] && value < legendLevels[1]) {
            return rainfullStyles[1];
        } else if (value >= legendLevels[1] && value < legendLevels[2]) {
            return rainfullStyles[2];
        } else if (value >= legendLevels[2] && value < legendLevels[3]) {
            return rainfullStyles[3];
        } else if (value >= legendLevels[3]) {
            return rainfullStyles[4];
        }
    }
});

// Add the Rainfull Layer which we defined earlier to our map.
map.addLayer(rainfullLayer);


/*---------------------------------------------*/
// 4. Line Chart Setup
/*---------------------------------------------*/

// Create the line chart at the bottom of the map.
const drawChart = () => {
    // Define some variables that will be used in the line chart or Precipitation Distribution layers.
    // Define the latitude and longtitude of the line chart.
    const chartDataset = {
        xAxes: ["<5", "5-10", "10-20", "20-40", ">40"],
        yAxes: [0, 0, 0, 0, 0]
    };
    let features = rainfullLayer.getSource().getFeatures();
    features.forEach((feature) => {
        let PreviousRecordAgeInDays = feature.get('PreviousRecordAgeInDays');
        updateChartValue(PreviousRecordAgeInDays, chartDataset);
    })
    let data = {
        "originaldata": [],
        "labels": chartDataset.xAxes,
        "datasets": [{
            "fill": false,
            "backgroundColor": "rgb(255, 159, 64)",
            "borderColor": "rgb(255, 159, 64)",
            "pointStrokeColor": "#fff",
            "pointHighlightFill": "#fff",
            "pointHighlightStroke": "rgba(151,187,205,1)",
            "data": chartDataset.yAxes
        }]
    };
    let chartCtx = document.getElementById('canvas').getContext('2d');
    let chart = new Chart(chartCtx, {
        type: 'line',
        data: data,
        options: {
            legend: {
                display: false
            },
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: false,
                text: ''
            },
            tooltips: {
                mode: 'nearest',
                intersect: false,
                displayColors: false,
                callbacks: {}
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    ticks: {
                        fontColor: '#ddd'
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Previous Record Age in Years'
                    },
                    gridLines: {
                        color: '#555'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Broken Records Numbers'
                    },
                    gridLines: {
                        color: '#555'
                    },
                    ticks: {
                        callback: function (value) {
                            if (Math.floor(value) === value) {
                                return value;
                            }
                        },
                        fontColor: '#ddd'
                    }
                }]
            }
        }
    });
};


/*---------------------------------------------*/
// 5. Popup Setup 
/*---------------------------------------------*/

// Now we need to create the popup container for our precipitation points. We'll create 
// an overlay which servers the popup container, and add it to our map. This popup panel 
// will show infomation about each station point.
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');

// Create the popup overlay.
const overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    offset: [-3, 5]
});

// This next part is to add the info to popup container.
let currentPixel;
const displayFeatureInfo = (e) => {
    let pixel = map.getEventPixel(e.originalEvent);
    currentPixel = pixel;
    let unit = document.getElementById('toggle-unit').getAttribute('data-unit');
    updatePopupBoxInfo(pixel, unit);
};


/*---------------------------------------------*/
// 6. Event Listeners
/*---------------------------------------------*/

// These event listeners tell the UI when it's time to execute all of the 
// code we've written.

// When we toggle the precipitation unit, we need to update the info in the popup.
const updatePopupBoxInfo = (pixel, unit) => {
    let feature = map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
    });

    if (feature && feature.get("type") === "rainfull") {
        let value = feature.get("value");
        let previousValue = feature.get("previousValue");
        let difference = feature.get("difference");

        if (unit === "in") {
            value = Math.round(value * 0.03937007874016 * 100000) / 100000;
            previousValue = Math.round(previousValue * 0.03937007874016 * 100000) / 100000;
            difference = Math.round(difference * 0.03937007874016 * 100000) / 100000;
        }

        let coord = feature.getGeometry().getCoordinates();
        content.innerHTML = `<p>Station Name: ${feature.get("stationName")}</p>
                             <p>Date: ${feature.get("date")}</p>
                             <p>Previous Date: ${feature.get("previousDate")}</p>
                             <p>Value: ${value} ${unit}</p>
                             <p>Previous Value: ${previousValue} ${unit}</p>
                             <p>Difference: ${difference} ${unit}</p>`;
        overlay.setPosition(coord)
        map.addOverlay(overlay)
    } else {
        map.removeOverlay(overlay);
    }
}
// When we toggle the precipitation unit, we need to update the info in the legend.
const updateLegendBoxInfo = (unit) => {
    let newLevels = legendLevels.slice(0);
    let currentUnit;
    if (unit === "in") {
        currentUnit = "inches";
        for (let i = 0, l = newLevels.length; i < l; i++) {
            newLevels[i] = Math.round(newLevels[i] * 0.03937007874016 * 100000) / 100000;
        }
    } else {
        currentUnit = "millimeters";
    }

    document.getElementsByClassName('level')[0].innerHTML = `&lt${newLevels[0]}`;
    document.getElementsByClassName('level')[1].innerHTML = `${newLevels[0]}-${newLevels[1]}`;
    document.getElementsByClassName('level')[2].innerHTML = `${newLevels[1]}-${newLevels[2]}`;
    document.getElementsByClassName('level')[3].innerHTML = `${newLevels[2]}-${newLevels[3]}`;
    document.getElementsByClassName('level')[4].innerHTML = `&gt${newLevels[3]}`;
    document.getElementsByClassName('unit')[0].innerHTML = currentUnit;
}

// When you click the buttons to toggle the precipitation unit, the info in legend and popup will be updated.
const toggleUnit = (e) => {
    let unit;
    switch (e.target.value) {
        case "Millimeters":
            unit = "mm";
            break;
        case "Inches":
            unit = "in";
            break;
        default:
            unit = "mm";
            break;
    }
    document.getElementById('toggle-unit').setAttribute('data-unit', unit);
    if (currentPixel !== undefined) {
        updatePopupBoxInfo(currentPixel, unit);
    }
    updateLegendBoxInfo(unit);
}

// Add event listeners to unit input elements.
const addEventToUnitInputEle = () => {
    let radioInput = document.querySelectorAll('input[type=radio]');
    for (let i = 0, l = radioInput.length; i < l; i++) {
        radioInput[i].addEventListener('change', (e) => {
            toggleUnit(e)
        });
    }
}

// Set the five item's color in legend.
const setColorForLegend = (colors) => {
    let legendItems = document.querySelectorAll('.legend i');
    for (let i = 0, l = legendItems.length; i < l; i++) {
        legendItems[i].style.backgroundColor = colors[i];
    }
}

window.addEventListener("load", () => {
    addEventToUnitInputEle();
    setColorForLegend(plotsColors);
});

// When click point on the map, a popup box will show up, which serve as the container of point info.
map.on('click', function (e) {
    if (e.dragging) {
        return;
    }
    displayFeatureInfo(e);
});

// When all features has been added to rainfullLayer source, we init the chart.
let chart = false;
let listenerKey = rainfullLayer.getSource().on('change', function () {
    if (rainfullLayer.getSource().getState() === 'ready') {
        if (!chart) {
            drawChart();
            chart = true;
        }
        rainfullLayer.getSource().un('change', listenerKey);
    }
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

setLayerSourceEventHandlers(baseLayer);

document.querySelector('#error-modal button').addEventListener('click', () => {
    document.querySelector('#error-modal').classList.add('hide');
})
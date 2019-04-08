const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';

let baseLayer = new ol.mapsuite.VectorTileLayer("https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/dark.json", {
    'apiKey': apiKey,
});
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    // Add our previously-defined ThinkGeo Cloud Vector Tile Layer to the map.
    layers: [baseLayer],
    // States that the HTML tag with id="map" should serve as the container for our map.
    target: 'map',
    // Create a default view for the map when it starts up.
    view: new ol.View({
        // Center the map on San Francisco - Coit Tower and start at zoom level 16.
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

let rainfullStyle1 = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
            color: '#ffffffcc',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: '#86e4ff'
        })
    })
});
let rainfullStyle2 = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
            color: '#ffffffcc',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: '#0fcaff'
        })
    })
});
let rainfullStyle3 = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
            color: '#ffffffcc',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: '#009dca'
        })
    })
});
let rainfullStyle4 = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
            color: '#ffffffcc',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: '#006986'
        })
    })
});
let rainfullStyle5 = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
            color: '#ffffffcc',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: '#004153'
        })
    })
});

let rainfullSource = new ol.source.Vector({
    url: '../data/RainfallRecords_2018-03_to_2019-03.geojson',
    format: new ol.format.GeoJSON()
});

let unit = 'mm';

let levels = [30, 50, 70, 90];
let rainfullLayer = new ol.layer.Vector({
    source: rainfullSource,
    style: (feature) => {
        let value = feature.get("value");
        feature.set("type", "rainfull");
        feature.set("stationName", feature.get('stationName'));
        feature.set("date", feature.get('date'));
        feature.set("previousDate", feature.get('previousDate'));
        feature.set("value", feature.get('value'));
        feature.set("previousValue", feature.get('previousValue'));
        feature.set("difference", feature.get('difference'));
        if (value < levels[0]) {
            return rainfullStyle1;
        } else if (value >= levels[0] && value < levels[1]) {
            return rainfullStyle2;
        } else if (value >= levels[1] && value < levels[2]) {
            return rainfullStyle3;
        } else if (value >= levels[2] && value < levels[3]) {
            return rainfullStyle4;
        } else if (value >= levels[3]) {
            return rainfullStyle5;
        }
    }
});

map.addLayer(rainfullLayer);


let container = document.getElementById('popup');
let content = document.getElementById('popup-content');
let overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    offset: [-3, 5]
});

let currentPixel;
let displayFeatureInfo = (e) => {
    let pixel = map.getEventPixel(e.originalEvent);
    currentPixel = pixel;
    updatePopupBoxInfo(pixel);
};

const updatePopupBoxInfo = (pixel) => {
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

map.on('click', function (e) {
    if (e.dragging) {
        return;
    }
    displayFeatureInfo(e);
});




const toggleUnit = (value) => {
    switch (value) {
        case "Millimeters":
            return "mm";
        case "Inches":
            return "in";
        default:
            return "mm";
    }
}

const updateLegendBoxInfo = (unit) => {
    let newLevels = levels.slice(0); // deep copy
    let currentUnit;
    if(unit === "in"){
        currentUnit = "inches";
        for (let i = 0, l = newLevels.length; i < l; i++) {
            newLevels[i] = Math.round(newLevels[i] * 0.03937007874016 * 100000) / 100000;
        }
    }else{
        currentUnit = "millimeters";
    }

    document.getElementsByClassName('level')[0].innerHTML = `&lt${newLevels[0]}`;
    document.getElementsByClassName('level')[1].innerHTML = `${newLevels[0]}-${newLevels[1]}`;
    document.getElementsByClassName('level')[2].innerHTML = `${newLevels[1]}-${newLevels[2]}`;
    document.getElementsByClassName('level')[3].innerHTML = `${newLevels[2]}-${newLevels[3]}`;
    document.getElementsByClassName('level')[4].innerHTML = `&gt${newLevels[3]}`;
    document.getElementsByClassName('unit')[0].innerHTML = currentUnit;
}

let radioInput = document.querySelectorAll('input[type=radio]');
for (let i = 0, l = radioInput.length; i < l; i++) {
    radioInput[i].addEventListener('change', (e) => {
        unit = toggleUnit(e.target.value);
        if(currentPixel !== undefined){
            updatePopupBoxInfo(currentPixel);
        }        
        updateLegendBoxInfo(unit);
    })
}
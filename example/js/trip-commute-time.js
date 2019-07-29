/*===========================================================================*/
// Average Commute Times
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. Commute Times Layer Setup
//   4. Displaying Commute Times Points Info
//   5. Tile Loading Event Handlers
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
        tileSize: 512,
    }),
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
        // Center the map on the United States and start at zoom level 4.
        center: ol.proj.fromLonLat([-99.097118, 38.915238]),
        maxResolution: 40075016.68557849 / 512,
        zoom: 4,
        minZoom: 2,
        maxZoom: 19,
        progressiveZoom: false,
    })
})

// Add a button to the map that lets us toggle full-screen display mode.
map.addControl(new ol.control.FullScreen());


/*---------------------------------------------*/
// 3. Commute Times Layer Setup
/*---------------------------------------------*/

// Now that we've set up our map's base layer, we need to actually create 
// the Average Commute Times Layer.

// Let's set up the Average Commute Times Layer style.
let minutesStyleFn = (f, res) => {
    let color, radius;
    let minute = f.get("minute")
    if (minute >= 23 && minute < 36) {
        color = '#20D5BA';
        radius = 3;
    } else if (minute >= 36 && minute < 42) {
        color = "#4ADD19";
        radius = 5
    } else if (minute >= 42 && minute < 48) {
        color = "#E7E427";
        radius = 7
    } else if (minute >= 48 && minute < 56) {
        color = "#E08B1C";
        radius = 9
    } else if (minute >= 56 && minute < 77) {
        color = "#E22510";
        radius = 11
    }
    return [new ol.style.Style({
        image: new ol.style.Circle({
            radius: f.get('radius') || radius,
            stroke: new ol.style.Stroke({
                color: "#fff",
                width: 0.5
            }),
            fill: new ol.style.Fill({
                color: color
            })
        })
    })];
};

// Load the data layer that will let us visualize the United States's Average Commute Times. 
// We'll load it from a small JSON file hosted on our servers.
const getJson = () => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        // Load the Average Commute Times data from ThinkGeo's servers.
        xhr.open("GET", "../data/cummute.json");
        xhr.send();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                resolve(xhr.responseText)
            }
        }
    })
}

let minutesLayer = null;
getJson().then((strData) => {
    let data = JSON.parse(strData);
    let vectorSource = new ol.source.Vector();
    let featuresArr = [];
    for (let i = 0; i < data.length; i++) {
        let coord = data[i].coordinate;
        coord = ol.proj.transform(coord, 'EPSG:4326', 'EPSG:3857');
        let pointFeature = new ol.Feature({
            geometry: new ol.geom.Point(coord),
            minute: data[i].minute * 2, // e.g. temperature
            name: data[i].name,
            featureType: "minuteFeature"
        });
        featuresArr.push(pointFeature);
    }
    vectorSource.addFeatures(featuresArr);
    minutesLayer = new ol.layer.Vector({
        source: vectorSource,
        style: minutesStyleFn,
        renderMode: 'image'
    });
    minutesLayer.set("layerName", "minutesLayer");
    minutesLayer.setVisible(true);
    map.addLayer(minutesLayer);
})

// Set Minutes Style for every cluster point. 
let animateI = document.querySelectorAll(".minutes i");
animateI.forEach((ele) => {
    ele.addEventListener("mouseover", (e) => {
        let min = e.target.getAttribute("data").split("-")[0];
        let max = e.target.getAttribute("data").split("-")[1];
        minutesLayer.getSource().getFeatures().forEach((feature) => {
            if (feature.get("minute") >= min && feature.get("minute") < max) {
                feature.set("radius", 13)
            }
        })

    })
    ele.addEventListener("mouseout", (e) => {
        minutesLayer.getSource().getFeatures().forEach((feature) => {
            feature.set("radius", null)
            feature.setStyle(minutesStyleFn)
        })
    })
})

/*---------------------------------------------*/
// 4. Displaying Commute Times Points Info
/*---------------------------------------------*/

// Let's add a info panel that will let users visualize the location and Average 
// Round Trip Commute Time each cluster point. When hovering over a cluster point, 
// we'll generate a info panel and display the lacation information in the info panel.

let container = document.getElementById('popup');
let content = document.getElementById('popup-content');
let overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    offset: [-3, 5]
});
let displayFeatureInfo = (evt) => {
    let pixel = map.getEventPixel(evt.originalEvent);
    let feature = map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
    }, {
        layerFilter: (layer) => {
            return !(layer instanceof ol.mapsuite.VectorTileLayer)
        }
    });
    if (feature && feature.get("featureType") === "minuteFeature") {
        let coord = feature.getGeometry().getCoordinates();
        content.innerHTML = `<p>
                    ${feature.get("name")}
                    </p><p>Round Drive Minutes:
                    ${feature.get("minute")}    
                        m</p>`;
        overlay.setPosition(coord)
        map.addOverlay(overlay)
    } else {
        map.removeOverlay(overlay);
    }
};

// When hovering over a cluster point, call the displayFeatureInfo function to generate 
// info panel and display the information.
map.on('pointermove', function (evt) {
    if (evt.dragging) {
        return;
    }
    displayFeatureInfo(evt);
});


/*---------------------------------------------*/
// 5. Tile Loading Event Handlers
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
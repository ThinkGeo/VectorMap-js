/*===========================================================================*/
// Education Achievement - Radar
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. Radar Chart Overlay Setup
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
// Cloud Maps Raster Tile service to display a detailed map and its the map style is dark.  For more
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
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    // Add our previously-defined ThinkGeo Cloud Raster Tile layer to the map.
    layers: [baseLayer],
    // States that the HTML tag with id="map" should serve as the container for our map.
    target: 'map',
    view: new ol.View({
        // Center the map on the United States and start at zoom level 4.
        center: ol.proj.fromLonLat([-95.940014, 38.931607]),
        maxResolution: 40075016.68557849 / 512,
        zoom: 4,
        minZoom: 1,
        maxZoom: 19
    })
});

// Add a button to the map that lets us toggle full-screen display mode.
map.addControl(new ol.control.FullScreen());


/*---------------------------------------------*/
// 3. Radar Chart Overlay Setup
/*---------------------------------------------*/

// This next part sets up the Radar Chart overlay on our map. On each Radar Chart, 
// we'll display the education achievement in major US cities for 2016, ages 25 and older.

// This method allows us to set the positon, value and style for every Radar Chart, then get a new overlay.
const createRadarOverlay = (id, data, pt) => {
    let lineStyle = {
        normal: {
            width: 2,
            opacity: 0.7
        }
    };
    let option = {
        backgroundColor: 'transparent',
        radar: {
            indicator: [{
                name: 'Grade School',
                fontSize: 8,
                max: 35
            }, {
                name: 'High School',
                max: 35
            }, {
                name: 'College 2+ Years',
                max: 35
            }, {
                name: 'College 4+ Years',
                max: 35
            }],
            shape: 'circle',
            radius: 40,

            splitNumber: 4,
            name: {
                textStyle: {
                    color: '#ffdf34',
                }
            },
            splitLine: {
                lineStyle: {
                    color: [
                        'rgba(238, 197, 102, 0.2)'
                    ].reverse()
                }
            },
            splitArea: {
                show: false
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(238, 197, 102, 0.5)'
                }
            }
        },
        series: [{
            name: 'Seattle',
            type: 'radar',
            lineStyle: lineStyle,
            data: data,
            symbol: 'none',
            areaStyle: {
                normal: {
                    opacity: 0.1
                }
            }
        }]
    };
    let chart = echarts.init(document.getElementById(id));
    chart.setOption(option);
    let overlay = new ol.Overlay({
        position: pt,
        positioning: 'center-center',
        element: document.getElementById(id),
        stopEvent: false
    });
    return overlay;
}

// Now that we've set up our map's base layer and the each overlay for our data, 
// we need to actually load the point data layer that will let us visualize Education 
// Achievement on the map. We'll load it from a small GeoJSON file hosted on our servers.
const getJson = (filePath) => {
    let readTextFile = new Promise(function (resolve, reject) {
        let rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", filePath, true);
        rawFile.onreadystatechange = function (ERR) {
            if (rawFile.readyState === 4) {
                if (rawFile.status == "200") {
                    resolve(rawFile.responseText);
                } else {
                    reject(new Error(ERR));
                }
            }
        }
        rawFile.send(null);
    });
    return readTextFile;
}

// Once the GeoJSON file has been fully downloaded, just get the value what you need and 
// pass it to our createRadarOverlay method to create its overlay. Then add the new 
// overlay to our map.
getJson('../data/educationLsee.geojson').then(function (data) {
    let stateArr = []
    let resultFeatures = JSON.parse(data)['features'];
    let length = resultFeatures.length;

    for (let i = 0; i < length; i++) {
        // Create the HTML tag which should serve as the container for each radar chart.
        let aqiDiv = document.createElement("div");
        aqiDiv.id = `educationChart${i}`;
        aqiDiv.style = "height:200px;width:430px";
        document.querySelector("#educationLayerChart").appendChild(aqiDiv);
        
        // Get the value what we need from the GeoJSON file data.
        let feature = resultFeatures[i];
        let item = feature['properties'];
        let coor = feature['geometry']['coordinates'];
        let bcav = item.Bcav;
        let Col = item.Col;
        let HS = item.HS;
        let UHSC = item.UHSC;

        // Set the captions and color for every piece of the pie chart.
        stateArr.push([]);
        stateArr[i].push({
            value: [UHSC, HS, Col, bcav, 1],
            name: 'Education',
            itemStyle: {
                normal: {
                    color: '#ffdf34'
                }
            }
        });
        let index = `educationChart${i}`;
        let educationOverlay = createRadarOverlay(index, stateArr[i], ol.proj.fromLonLat(coor));
        map.addOverlay(educationOverlay);
    }
})
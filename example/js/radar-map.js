//Load icon font
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/2.0.0/vectormap-icons.css"]
    }
});

const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';// please go to https://cloud.thinkgeo.com to create

const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/dark.json";

let worldStreetLayer = new ol.mapsuite.VectorTileLayer(worldstreetsStyle, {
    'apiKey': apiKey,
});

//Create map
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [worldStreetLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-95.940014, 38.931607]),
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 4
    })
});

//Control map full screen
map.addControl(new ol.control.FullScreen());

//Education layer
let educationLayer = (id, data, color, pt) => {
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
                    color: color,
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
    return new ol.Overlay({
        position: pt,
        positioning: 'center-center',
        element: document.getElementById(id),
        stopEvent: false
    });
}

//Create rader
for (let i = 0; i < 26; i++) {
    let aqiDiv = document.createElement("div");
    aqiDiv.id = `educationChart${i}`;
    aqiDiv.style = "height:200px;width:430px";
    document.querySelector("#educationLayerChart").appendChild(aqiDiv)
}

//Get geojson
const getJson = () => {
    let readTextFile = new Promise(function (resolve, reject) {
        let file = "../data/educationLsee.geojson";
        let rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
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

let stateArr = []
for (let index = 0; index < 26; index++) {
    stateArr.push([]);
}

//Set rader style
let textColor = "#ffdf34";
getJson().then(function (data) {
    let resultFeatures = JSON.parse(data)['features'];
    for (let i = 0, l = resultFeatures.length; i < l; i++) {
        let item = resultFeatures[i]['properties'];
        let coor = resultFeatures[i]['geometry']['coordinates'];
        let bcav = item.Bcav;
        let Col = item.Col;
        let HS = item.HS;
        let UHSC = item.UHSC;
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
        map.addOverlay(educationLayer(index, stateArr[i], textColor, ol.proj.fromLonLat(coor)));
    }
})


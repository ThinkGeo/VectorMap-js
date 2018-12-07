WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';

const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/dark.json";

let worldStreetLayer = new ol.mapsuite.VectorTileLayer(worldstreetsStyle, {
    'apiKey': apiKey,
});

let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [worldStreetLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-95.940014, 33.431607]),
        zoom: 5
    })
});


//AQI layer
let AQIlayer = (id, data, color, pt) => {
    var lineStyle = {
        normal: {
            width: 2,
            opacity: 0.7
        }
    };

    let option = {
        backgroundColor: 'transparent',
        radar: {
            indicator: [{
                name: 'AQI',
                fontSize: 8,
                max: 300
            }, {
                name: 'PM2.5',
                max: 250
            }, {
                name: 'PM10',
                max: 300
            }, {
                name: 'CO',
                max: 5
            }, {
                name: 'NO2',
                max: 200
            }, {
                name: 'SO2',
                max: 100
            }],
            shape: 'circle',
            radius: 50,

            splitNumber: 5,
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
            itemStyle: {
                normal: {
                    color: color
                }
            },
            areaStyle: {
                normal: {
                    opacity: 0.1
                }
            }
        }]
    };
    var chart = echarts.init(document.getElementById(id));
    chart.setOption(option);
    return new ol.Overlay({
        position: pt,
        positioning: 'center-center',
        element: document.getElementById(id),
        stopEvent: false
    });
}

for (let i = 0; i < 8; i++) {
    let aqiDiv = document.createElement("div");
    aqiDiv.id = `AQIChart${i}`;
    aqiDiv.style = "height:200px;width:200px";
    document.querySelector("#AQIChart").appendChild(aqiDiv)
}

// pie chart
var data1 = [
    [55, 9, 56, 0.46, 18, 6, 1],
    [25, 11, 21, 0.65, 120, 9, 2],
    [56, 7, 63, 0.3, 40, 5, 3],
    [33, 7, 29, 0.33, 16, 6, 4],
    [22, 8, 17, 0.48, 23, 10, 20],
    [39, 15, 300, 0.61, 29, 13, 21],
    [94, 69, 114, 2.08, 73, 39, 22],
    [99, 73, 110, 2.43, 76, 48, 23],
    [31, 12, 30, 0.5, 32, 16, 24],
    [42, 27, 43, 1, 150, 22, 25],
    [154, 117, 157, 3.05, 200, 58, 26],
    [46, 5, 49, 0.28, 10, 6, 31]
];
var data2 = [
    [26, 37, 27, 1.163, 300, 13, 1],
    [85, 62, 71, 1.195, 60, 8, 2],
    [91, 81, 104, 1.041, 56, 40, 10],
    [84, 39, 60, 0.964, 25, 11, 11],
    [77, 105, 178, 2.549, 64, 16, 14],
    [82, 92, 174, 3.29, 0, 13, 29],
    [300, 116, 188, 3.628, 101, 16, 30],
    [118, 50, 0, 1.383, 76, 11, 31]
];
var data3 = [
    [91, 45, 125, 0.82, 34, 23, 1],
    [106, 77, 114, 1.07, 55, 51, 7],
    [95, 69, 300, 1.28, 74, 50, 13],
    [116, 87, 131, 1.47, 84, 40, 14],
    [300, 57, 91, 0.85, 55, 31, 20],
    [87, 63, 101, 0.9, 56, 41, 21],
    [104, 77, 119, 1.09, 73, 48, 22],
    [93, 68, 96, 1.05, 79, 29, 28],
    [188, 143, 197, 1.66, 99, 51, 29],
    [174, 131, 174, 1.55, 108, 50, 30],
    [187, 143, 201, 1.39, 89, 53, 300]
    [174, 131, 174, 1.55, 108, 50, 30],
    [300, 187, 201, 1.39, 89, 0, 0]
];
var data4 = [
    [91, 45, 125, 0.82, 150, 23, 1],
    [300, 150, 114, 1.07, 120, 51, 7],
    [95, 69, 300, 1.28, 74, 50, 13],
    [116, 87, 131, 1.47, 84, 40, 14],
    [300, 57, 91, 0.85, 55, 31, 20],
    [87, 63, 101, 0.9, 56, 41, 21],
    [104, 77, 119, 1.09, 73, 48, 22],
    [300, 68, 96, 1.05, 150, 29, 28],
    [188, 143, 197, 1.66, 99, 51, 29],
    [174, 131, 174, 1.55, 108, 50, 30],
    [187, 143, 201, 1.39, 89, 53, 300]
    [174, 131, 174, 1.55, 108, 50, 30],
    [300, 187, 201, 1.39, 89, 0, 0]
];

map.addOverlay(AQIlayer("AQIChart0", data1, "#B3E4A1", ol.proj.fromLonLat([-117.954940, 34.053272])))
map.addOverlay(AQIlayer("AQIChart1", data2, "#F9713C", ol.proj.fromLonLat([-104.954682, 39.737331])))
map.addOverlay(AQIlayer("AQIChart2", data3, "rgb(238, 197, 102)", ol.proj.fromLonLat([-94.268418, 39.062423])))
map.addOverlay(AQIlayer("AQIChart3", data4, "#80AECC", ol.proj.fromLonLat([-96.465684, 32.806366])))
map.addOverlay(AQIlayer("AQIChart4", data2, "#D48265", ol.proj.fromLonLat([-95.586778, 29.535873])))
map.addOverlay(AQIlayer("AQIChart5", data3, "#C23531", ol.proj.fromLonLat([-77.569200, 38.857395])))
map.addOverlay(AQIlayer("AQIChart6", data4, "#38A700", ol.proj.fromLonLat([-84.204942, 33.724955])))
map.addOverlay(AQIlayer("AQIChart7", data2, "#FA00FA", ol.proj.fromLonLat([-87.412950, 41.902827])))
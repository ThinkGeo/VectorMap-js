WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const apiKey = 'Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~';

const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0-beta009/dark.json";

let worldStreetLayer = new ol.mapsuite.VectorTileLayer(worldstreetsStyle, {
    'apiKey': apiKey,
});

let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [worldStreetLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-95.940014, 38.431607]),
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 4
    })
});

//AQI layer
let AQIlayer = (id, data, color, pt) => {
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
                name: 'Under high school',
                fontSize: 8,
                max: 35
            }, {
                name: 'High school',
                max: 35
            }, {
                name: 'College',
                max: 35
            }, {
                name: 'Bachelor degree and above',
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
    let chart = echarts.init(document.getElementById(id));
    chart.setOption(option);
    return new ol.Overlay({
        position: pt,
        positioning: 'center-center',
        element: document.getElementById(id),
        stopEvent: false
    });
}

for (let i = 0; i < 26; i++) {
    let aqiDiv = document.createElement("div");
    aqiDiv.id = `AQIChart${i}`;
    aqiDiv.style = "height:200px;width:200px";
    document.querySelector("#AQIChart").appendChild(aqiDiv)
}

const getJson = () => {
    let readTextFile = new Promise(function (resolve, reject) {
        let file = "../data/education.geojson";
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

let stateArr = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    []
];
let textColor = "#60acfc";
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
                    color: '#B3E4A1'
                }
            }
        });
        let index = `pieChart${i}`;
        console.log(index);
        console.log(stateArr[i]);
        console.log(ol.proj.fromLonLat(coor));
        map.addOverlay(AQIlayer(index, stateArr[i], textColor, ol.proj.fromLonLat(coor)));
    }
})


// let data_colorado = [{
//     value: [36.1, 15.6, 13.1, 9.016, 1],
//     name: 'Less Than A High School Diploma',
//     itemStyle: {
//         normal: {
//             color: '#B3E4A1'
//         }
//     }
// }, {
//     value: [34.4, 26.5, 23.2, 21.726, 2],
//     name: 'High School Diploma Only',
//     itemStyle: {
//         normal: {
//             color: '#F9713C'
//         }
//     }
// }];

// let Illinois = [{
//     value: [37.1, 22.6, 18.1, 9.016, 1],
//     name: 'Less Than A High School Diploma',
//     itemStyle: {
//         normal: {
//             color: '#B3E4A1'
//         }
//     }
// }, {
//     value: [28.54, 26.5, 24.2, 8.726, 2],
//     name: 'High School Diploma Only',
//     itemStyle: {
//         normal: {
//             color: '#F9713C'
//         }
//     }
// }];

// let Georgia = [{
//     value: [30.1, 15.6, 14.1, 9.016, 1],
//     name: 'Less Than A High School Diploma',
//     itemStyle: {
//         normal: {
//             color: '#B3E4A1'
//         }
//     }
// }, {
//     value: [34.4, 22.5, 23.2, 8.726, 2],
//     name: 'High School Diploma Only',
//     itemStyle: {
//         normal: {
//             color: '#F9713C'
//         }
//     }
// }];


// let Dakota = [{
//     value: [30.1, 16.6, 13.1, 12.016, 1],
//     name: 'Less Than A High School Diploma',
//     itemStyle: {
//         normal: {
//             color: '#B3E4A1'
//         }
//     }
// }, {
//     value: [33.4, 26.5, 23.2, 9.726, 2],
//     name: 'High School Diploma Only',
//     itemStyle: {
//         normal: {
//             color: '#F9713C'
//         }
//     }
// }];

// let Texas = [{
//     value: [36.1, 20.6, 13.1, 7.016, 1],
//     name: 'Less Than A High School Diploma',
//     itemStyle: {
//         normal: {
//             color: '#B3E4A1'
//         }
//     }
// }, {
//     value: [34.4, 26.5, 23.2, 21.726, 2],
//     name: 'High School Diploma Only',
//     itemStyle: {
//         normal: {
//             color: '#F9713C'
//         }
//     }
// }];

// let Mexico = [{
//     value: [31.1, 15.6, 13.1, 9.016, 1],
//     name: 'Less Than A High School Diploma',
//     itemStyle: {
//         normal: {
//             color: '#B3E4A1'
//         }
//     }
// }, {
//     value: [35.2, 22.5, 25.2, 21.726, 2],
//     name: 'High School Diploma Only',
//     itemStyle: {
//         normal: {
//             color: '#F9713C'
//         }
//     }
// }];

// let textColor = "#60acfc";

// map.addOverlay(AQIlayer("AQIChart0", data_texas, textColor, ol.proj.fromLonLat([-96.770738, 32.774381])));
// map.addOverlay(AQIlayer("AQIChart1", data_california, textColor, ol.proj.fromLonLat([-120.372090, 37.513988])));
// map.addOverlay(AQIlayer("AQIChart2", data_florida, textColor, ol.proj.fromLonLat([-81.999302, 28.205514])));
// map.addOverlay(AQIlayer("AQIChart3", data_indiana, textColor, ol.proj.fromLonLat([-86.156413, 39.855513])));
// map.addOverlay(AQIlayer("AQIChart4", data_colorado, textColor, ol.proj.fromLonLat([-104.974733, 39.559846])));
// map.addOverlay(AQIlayer("AQIChart5", Illinois, textColor, ol.proj.fromLonLat([-88.132874, 39.683286])))
// map.addOverlay(AQIlayer("AQIChart5", Illinois, textColor, ol.proj.fromLonLat([-88.132874, 39.683286])))
// map.addOverlay(AQIlayer("AQIChart9", Georgia, textColor, ol.proj.fromLonLat([-84.754272, 34.126149])))
// map.addOverlay(AQIlayer("AQIChart8", Dakota, textColor, ol.proj.fromLonLat([-100.144579, 46.843928])))
// map.addOverlay(AQIlayer("AQIChart6", Texas, textColor, ol.proj.fromLonLat([-97.75, 30.266667])))
// console.log('mexico',Mexico);
// map.addOverlay(AQIlayer("AQIChart7", Mexico, textColor, ol.proj.fromLonLat([-105.22421, 35.58103])))
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~';

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
        center: ol.proj.fromLonLat([-95.940014, 33.431607]),
        zoom: 5
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
                name: '1970',
                fontSize: 8,
                max: 35
            }, {
                name: '1990',
                max: 35
            }, {
                name: '2000',
                max: 35
            }, {
                name: '2016',
                max: 35
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
    let chart = echarts.init(document.getElementById(id));
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
let data_texas = [{
    value: [52.6, 27.9, 24.3, 17.7, 1],
    name: 'Less Than A High School Diploma',
    itemStyle: {
        normal: {
            color: '#B3E4A1'
        }
    }
}, {
    value: [25.1, 25.6, 24.8, 25.087, 2],
    name: 'High School Diploma Only',
    itemStyle: {
        normal: {
            color: '#F9713C'
        }
    }
}];

let data_california = [{
    value: [37.4, 23.8, 23.2, 17.9, 1],
    name: 'Less Than A High School Diploma',
    itemStyle: {
        normal: {
            color: '#B3E4A1'
        }
    }
}, {
    value: [32.8, 22.3, 20.1, 20.587, 2],
    name: 'High School Diploma Only',
    itemStyle: {
        normal: {
            color: '#F9713C'
        }
    }
}]

let data_florida = [{
    value: [47.4, 25.6, 20.1, 12.824, 1],
    name: 'Less Than A High School Diploma',
    itemStyle: {
        normal: {
            color: '#B3E4A1'
        }
    }
}, {
    value: [30.7, 30.1, 28.7, 29.16, 2],
    name: 'High School Diploma Only',
    itemStyle: {
        normal: {
            color: '#F9713C'
        }
    }
}];

let data_indiana = [{
    value: [47.1, 24.4, 17.9, 11.924, 1],
    name: 'Less Than A High School Diploma',
    itemStyle: {
        normal: {
            color: '#B3E4A1'
        }
    }
}, {
    value: [36.1, 38.2, 37.2, 34.243, 2],
    name: 'High School Diploma Only',
    itemStyle: {
        normal: {
            color: '#F9713C'
        }
    }
}];

let data_colorado = [{
    value: [36.1, 15.6, 13.1, 9.016, 1],
    name: 'Less Than A High School Diploma',
    itemStyle: {
        normal: {
            color: '#B3E4A1'
        }
    }
}, {
    value: [34.4, 26.5, 23.2, 21.726, 2],
    name: 'High School Diploma Only',
    itemStyle: {
        normal: {
            color: '#F9713C'
        }
    }
}];

let textColor = "#60acfc";

map.addOverlay(AQIlayer("AQIChart0", data_texas, textColor, ol.proj.fromLonLat([-96.770738, 32.774381])));
map.addOverlay(AQIlayer("AQIChart1", data_california, textColor, ol.proj.fromLonLat([-120.372090, 37.513988])));
map.addOverlay(AQIlayer("AQIChart2", data_florida, textColor, ol.proj.fromLonLat([-81.999302, 28.205514])));
map.addOverlay(AQIlayer("AQIChart3", data_indiana, textColor, ol.proj.fromLonLat([-86.156413, 39.855513])));
map.addOverlay(AQIlayer("AQIChart4", data_colorado, textColor, ol.proj.fromLonLat([-104.974733, 39.559846])));
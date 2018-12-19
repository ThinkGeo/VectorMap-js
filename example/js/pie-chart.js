// base map layer


let satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png" +
            "?apiKey=v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~",
        tileSize: 512,
    }),
});

//creat map

let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [satelliteLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-95.940014, 36.031607]),
        zoom: 5
    })
});

// pie chart
let pieChartOvery = (id, data, pt) => {
    option = {
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        series: [{
            type: 'pie',
            radius: '40%',
            data: data,
            itemStyle: {
                emphasis: {
                    shadowBlur: 0,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
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

for (let i = 0; i < 12; i++) {
    let aqiDiv = document.createElement("div");
    aqiDiv.id = `pieChart${i}`;
    aqiDiv.style = "height:22vh;width:600px";
    document.querySelector("#pieChart").appendChild(aqiDiv)
}

//simulated data 
let California = [{
    value: 4572963,
    name: `< high school `,
    itemStyle: {
        color: '#fe0100',
    }
}, {
    value: 5260904,
    name: 'High school ',
    itemStyle: {
        color: '#f9ff00'
    }
}, {
    value: 7544058,
    name: `college or associate`,
    itemStyle: {
        color: '#a4e601'
    }
}, {
    value: 8176487,
    name: `> Bachelor's degree`,
    itemStyle: {
        color: '#1e86fe'
    }
}];
let Florida = [{
    value: 1807386,
    name: '< high school ',
    itemStyle: {
        color: '#fe0100'
    }
}, {
    value: 4111029,
    name: 'High school ',
    itemStyle: {
        color: '#f9ff00'
    }
}, {
    value: 0245476,
    name: `college or associate`,
    itemStyle: {
        color: '#a4e601'
    }
}, {
    value: 3929796,
    name: `> Bachelor's degree`,
    itemStyle: {
        color: '#1e86fe'
    }
}];
let Colorado = [{
    value: 323691,
    name: '< high school ',
    itemStyle: {
        color: '#fe0100'
    }
}, {
    value: 780033,
    name: 'High school ',
    itemStyle: {
        color: '#f9ff00'
    }
}, {
    value: 1096896,
    name: `college or associate`,
    itemStyle: {
        color: '#a4e601'
    }
}, {
    value: 1389730,
    name: `> Bachelor's degree`,
    itemStyle: {
        color: '#1e86fe'
    }
}];

let Illinois = [{
    value: 1008608,
    name: '< high school ',
    itemStyle: {
        color: '#fe0100'
    }
}, {
    value: 2287126,
    name: 'High school ',
    itemStyle: {
        color: '#f9ff00'
    }
}, {
    value: 2487681,
    name: `college or associate`,
    itemStyle: {
        color: '#a4e601'
    }
}, {
    value: 2834689,
    name: `> Bachelor's degree`,
    itemStyle: {
        color: '#1e86fe'
    }
}]

let Georgia = [{
    value: 932810,
    name: '< high school ',
    itemStyle: {
        color: '#fe0100'
    }
}, {
    value: 1850601,
    name: 'High school ',
    itemStyle: {
        color: '#f9ff00'
    }
}, {
    value: 1867961,
    name: `college or associate`,
    itemStyle: {
        color: '#a4e601'
    }
}, {
    value: 1938090,
    name: `> Bachelor's degree`,
    itemStyle: {
        color: '#1e86fe'
    }
}]

let Texas = [{
    value: 1008608,
    name: '< high school ',
    itemStyle: {
        color: '#fe0100'
    }
}, {
    value: 2287126,
    name: 'High school ',
    itemStyle: {
        color: '#f9ff00'
    }
}, {
    value: 24873681,
    name: `college or associate`,
    itemStyle: {
        color: '#a4e601'
    }
}, {
    value: 2834869,
    name: `> Bachelor's degree`,
    itemStyle: {
        color: '#1e86fe'
    }
}]

let Dakota = [{
    value: 38034,
    name: '< high school ',
    itemStyle: {
        color: '#fe0100'
    }
}, {
    value: 131086,
    name: 'High school ',
    itemStyle: {
        color: '#f9ff00'
    }
}, {
    value: 173933,
    name: `college or associate`,
    itemStyle: {
        color: '#a4e601'
    }
}, {
    value: 134554,
    name: `> Bachelor's degree`,
    itemStyle: {
        color: '#1e86fe'
    }
}]

let Mexico = [{
    value: 517458,
    name: '< high school ',
    itemStyle: {
        color: '#fe0100'
    }
}, {
    value: 1486051,
    name: 'High school ',
    itemStyle: {
        color: '#f9ff00'
    }
}, {
    value: 1268116,
    name: `college or associate`,
    itemStyle: {
        color: '#a4e601'
    }
}, {
    value: 1068062,
    name: `> Bachelor's degree`,
    itemStyle: {
        color: '#1e86fe'
    }
}]

map.addOverlay(pieChartOvery("pieChart0", California, ol.proj.fromLonLat([-119.23484, 35.675786])));
map.addOverlay(pieChartOvery("pieChart1", Florida, ol.proj.fromLonLat([-81.956835, 27.985804])))
map.addOverlay(pieChartOvery("pieChart2", Colorado, ol.proj.fromLonLat([-104.940303, 39.885961])))
map.addOverlay(pieChartOvery("pieChart3", Illinois, ol.proj.fromLonLat([-88.132874, 39.683286])))
map.addOverlay(pieChartOvery("pieChart4", Georgia, ol.proj.fromLonLat([-84.754272, 34.126149])))
map.addOverlay(pieChartOvery("pieChart5", Dakota, ol.proj.fromLonLat([-100.144579, 46.843928])))
map.addOverlay(pieChartOvery("pieChart6", Texas, ol.proj.fromLonLat([-97.75, 30.266667])))
map.addOverlay(pieChartOvery("pieChart7", Mexico, ol.proj.fromLonLat([-105.22421, 35.58103])))


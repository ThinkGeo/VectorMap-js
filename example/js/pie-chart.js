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
    name: 'Without a high school diploma ',
    itemStyle: {
        color: '#fe0100'
    }
}, {
    value: 5260904,
    name: 'High school diploma',
    itemStyle: {
        color: '#f9ff00'
    }
}, {
    value: 7544058,
    name: `college or associate's degree`,
    itemStyle: {
        color: '#a4e601'
    }
}, {
    value: 8176487,
    name: `Bachelor's degree or higher`,
    itemStyle: {
        color: '#1e86fe'
    }
}];
let data2 = [{
    value: 20,
    name: 'Without a high school diploma ',
    itemStyle: {
        color: '#fe0100'
    }
}, {
    value: 100,
    name: 'High school diploma',
    itemStyle: {
        color: '#f9ff00'
    }
}, {
    value: 120,
    name: `college or associate's degree`,
    itemStyle: {
        color: '#a4e601'
    }
}, {
    value: 135,
    name: `Bachelor's degree or higher`,
    itemStyle: {
        color: '#1e86fe'
    }
}];
let data3 = [{
    value: 20,
    name: 'Without a high school diploma ',
    itemStyle: {
        color: '#fe0100'
    }
}, {
    value: 100,
    name: 'High school diploma',
    itemStyle: {
        color: '#f9ff00'
    }
}, {
    value: 120,
    name: `college or associate's degree`,
    itemStyle: {
        color: '#a4e601'
    }
}, {
    value: 135,
    name: `Bachelor's degree or higher`,
    itemStyle: {
        color: '#1e86fe'
    }
}];

map.addOverlay(pieChartOvery("pieChart0", California, ol.proj.fromLonLat([-121.468926, 38.555605])));
map.addOverlay(pieChartOvery("pieChart1", data2, ol.proj.fromLonLat([-90.450611, 35.265961])))
// map.addOverlay(pieChartOvery("pieChart2", data1, ol.proj.fromLonLat([-119.23484, 35.675786])))
// map.addOverlay(pieChartOvery("pieChart3", data2, ol.proj.fromLonLat([-104.940303, 39.885961])))
// map.addOverlay(pieChartOvery("pieChart4", data3, ol.proj.fromLonLat([-75.640639, 39.725141])))
// map.addOverlay(pieChartOvery("pieChart5", data2, ol.proj.fromLonLat([-78.871259, 38.455187])))
// map.addOverlay(pieChartOvery("pieChart6", data1, ol.proj.fromLonLat([-81.956835, 27.985804])))
// map.addOverlay(pieChartOvery("pieChart7", data3, ol.proj.fromLonLat([-84.754272, 34.126149])))
// map.addOverlay(pieChartOvery("pieChart8", data3, ol.proj.fromLonLat([-122.447229, 37.765230])))
// map.addOverlay(pieChartOvery("pieChart9", data2, ol.proj.fromLonLat([-80.569200, 25.857395])))
// map.addOverlay(pieChartOvery("pieChart10", data1, ol.proj.fromLonLat([-98.813778, 28.468167])))
// map.addOverlay(pieChartOvery("pieChart11", data3, ol.proj.fromLonLat([-112.982554, 37.003582])))
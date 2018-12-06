WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~';

const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/dark.json";

let worldStreetLayer = new ol.mapsuite.VectorTileLayer(worldstreetsStyle, {
    'apiKey': apiKey,
});

let satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png" +
            "?apiKey=v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~",
        tileSize: 512,
    }),
});

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

    var chart = echarts.init(document.getElementById(id));
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
    aqiDiv.style = "height:22vh;width:32vh";
    document.querySelector("#pieChart").appendChild(aqiDiv)
}

//simulated data 
let data1 = [{
    value: 20,
    name: 'Chrome',
    itemStyle: {
        color: '#fe0100'
    }
}, {
    value: 100,
    name: 'IE9+',
    itemStyle: {
        color: '#f9ff00'
    }
}, {
    value: 120,
    name: 'IE8-',
    itemStyle: {
        color: '#a4e601'
    }
}, {
    value: 135,
    name: 'Safari',
    itemStyle: {
        color: '#1e86fe'
    }
}, {
    value: 300,
    name: 'Firefox',
    itemStyle: {
        color: '#75f0fd'
    }
}];
let data2 = [{
    value: 2000,
    name: 'Chrome',
    itemStyle: {
        color: '#fe0100'
    }
}, {
    value: 800,
    name: 'IE9+',
    itemStyle: {
        color: '#f9ff00'
    }
}, {
    value: 400,
    name: 'IE8-',
    itemStyle: {
        color: '#a4e601'
    }
}, {
    value: 135,
    name: 'Safari',
    itemStyle: {
        color: '#1e86fe'
    }
}, {
    value: 1200,
    name: 'Firefox',
    itemStyle: {
        color: '#75f0fd'
    }
}];
let data3 = [{
    value: 1850,
    name: 'Chrome',
    itemStyle: {
        color: '#fe0100'
    }
}, {
    value: 750,
    name: 'IE9+',
    itemStyle: {
        color: '#f9ff00'
    }
}, {
    value: 260,
    name: 'IE8-',
    itemStyle: {
        color: '#a4e601'
    }
}, {
    value: 200,
    name: 'Safari',
    itemStyle: {
        color: '#1e86fe'
    }
}, {
    value: 1000,
    name: 'Firefox',
    itemStyle: {
        color: '#75f0fd'
    }
}];

map.addOverlay(pieChartOvery("pieChart0", data1, ol.proj.fromLonLat([-117.954940, 34.053272])));
map.addOverlay(pieChartOvery("pieChart1", data2, ol.proj.fromLonLat([-104.954682, 39.737331])))
map.addOverlay(pieChartOvery("pieChart2", data1, ol.proj.fromLonLat([-94.268418, 39.062423])))
map.addOverlay(pieChartOvery("pieChart3", data2, ol.proj.fromLonLat([-96.465684, 32.806366])))
map.addOverlay(pieChartOvery("pieChart4", data3, ol.proj.fromLonLat([-95.586778, 29.535873])))
map.addOverlay(pieChartOvery("pieChart5", data2, ol.proj.fromLonLat([-77.569200, 38.857395])))
map.addOverlay(pieChartOvery("pieChart6", data1, ol.proj.fromLonLat([-84.204942, 33.724955])))
map.addOverlay(pieChartOvery("pieChart7", data3, ol.proj.fromLonLat([-87.412950, 41.902827])))

map.addOverlay(pieChartOvery("pieChart8", data3, ol.proj.fromLonLat([-122.447229, 37.765230])))
map.addOverlay(pieChartOvery("pieChart9", data2, ol.proj.fromLonLat([-80.569200, 25.857395])))
map.addOverlay(pieChartOvery("pieChart10", data1, ol.proj.fromLonLat([-93.204942, 44.324955])))
map.addOverlay(pieChartOvery("pieChart11", data3, ol.proj.fromLonLat([-93.0262950, 44.902827])))
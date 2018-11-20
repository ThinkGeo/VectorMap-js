WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const apiKey = '73u5e1NSIPmm9eDIqf6pjh0DoW2nyH2A4oJfDJW4bJE~';

const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json";

let worldStreetLayer = new ol.mapsuite.VectorTileLayer(worldstreetsStyle, {
    'apiKey': apiKey,
});

let satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png"
            + "?apiKey=73u5e1NSIPmm9eDIqf6pjh0DoW2nyH2A4oJfDJW4bJE~",
        tileSize: 512,
    }),
});

let map = new ol.Map({
    layers: [satelliteLayer],
    target: 'map',
    view: new ol.View({
        center: [11877713.642017495, 4671206.770222437],
        zoom: 4
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
            name: 'Browser',
            type: 'pie',
            radius: '22%',
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

for (let i = 0; i < 8; i++) {
    let aqiDiv = document.createElement("div");
    aqiDiv.id = `pieChart${i}`;
    aqiDiv.style = "height:22vh;width:30vh";
    document.querySelector("#pieChart").appendChild(aqiDiv)
}

//simulated data 
let data1 = [{
    value: 20,
    name: 'Chrome'
}, {
    value: 100,
    name: 'IE9+'
}, {
    value: 120,
    name: 'IE8-'
}, {
    value: 135,
    name: 'Safari'
}, {
    value: 300,
    name: 'Firefox'
}];
let data2 = [{
    value: 800,
    name: 'Chrome'
}, {
    value: 500,
    name: 'IE9+'
}, {
    value: 100,
    name: 'IE8-'
}, {
    value: 300,
    name: 'Safari'
}, {
    value: 200,
    name: 'Firefox'
}];
let data3 = [{
    value: 335,
    name: 'Chrome'
}, {
    value: 500,
    name: 'IE9+'
}, {
    value: 225,
    name: 'IE8-'
}, {
    value: 300,
    name: 'Safari'
}, {
    value: 1000,
    name: 'Firefox'
}];

map.addOverlay(pieChartOvery("pieChart0", data1, ol.proj.fromLonLat([-117.954940, 34.053272])));
map.addOverlay(pieChartOvery("pieChart1", data2, ol.proj.fromLonLat([-104.954682, 39.737331])))
map.addOverlay(pieChartOvery("pieChart2", data1, ol.proj.fromLonLat([-94.268418, 39.062423])))
map.addOverlay(pieChartOvery("pieChart3", data2, ol.proj.fromLonLat([-96.465684, 32.806366])))
map.addOverlay(pieChartOvery("pieChart4", data3, ol.proj.fromLonLat([-95.586778, 29.535873])))
map.addOverlay(pieChartOvery("pieChart5", data2, ol.proj.fromLonLat([-77.569200, 38.857395])))
map.addOverlay(pieChartOvery("pieChart6", data1, ol.proj.fromLonLat([-84.204942, 33.724955])))
map.addOverlay(pieChartOvery("pieChart7", data3, ol.proj.fromLonLat([-87.412950, 41.902827])))
map.getView().setZoom(5);
map.getView().setCenter(ol.proj.fromLonLat([-100.940014, 40.431607]));
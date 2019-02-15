// Base map layer
let satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png" +
            "?apiKey=WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~",
        tileSize: 512,
    }),
});

//Create map
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [satelliteLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-95.940014, 37.331607]),
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 4,
        progressiveZoom: false,
    })
});
map.addControl(new ol.control.FullScreen());
// Pie chart
let pieChartOvery = (id, data, pt) => {
    option = {
        tooltip: {
            trigger: 'item',
            formatter: "{b} : {d}%"
        },
        series: [{
            type: 'pie',
            radius: '60%',
            data: data,
               label: {
                normal: {
                    show: false,
                }
            },
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

//Create pie chart layer
for (let i = 0; i < 26; i++) {
    let aqiDiv = document.createElement("div");
    aqiDiv.id = `pieChart${i}`;
    aqiDiv.style = "height:100px;width:100px";
    document.querySelector("#pieChart").appendChild(aqiDiv)
}

//Get data
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

let stateArr = [];

for (let index = 0; index < 26; index++) {
    stateArr.push([]);
}

//Set pie chart style
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
            value: UHSC,
            name: `Grade School `,
            itemStyle: {
                color: '#fe0100',
            }
        });
        stateArr[i].push({
            value: HS,
            name: ' High School ',
            itemStyle: {
                color: '#f9ff00'
            }
        });
        stateArr[i].push({
            value: Col,
            name: `College 2+ Years`,
            itemStyle: {
                color: '#a4e601'
            }
        });
        stateArr[i].push({
            value: bcav,
            name: `College 4+ Years`,
            itemStyle: {
                color: '#1e86fe'
            }
        });

        let index = `pieChart${i}`;
        map.addOverlay(pieChartOvery(index, stateArr[i], ol.proj.fromLonLat(coor)));
    }
})
//Load vector map icon font
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/2.0.0/vectormap-icons.css"]
    }
});

const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';// please go to https://cloud.thinkgeo.com to create

const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/dark.json";

//  Base map layer
let worldStreetLayer = new ol.mapsuite.VectorTileLayer(worldstreetsStyle, {
    'apiKey': apiKey,
});

//Create  map
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [worldStreetLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.79620, 38.79423]),
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 4,
        minZoom: 2
    })
});

//Control map full screen
map.addControl(new ol.control.FullScreen());

//Process the data
let xhr = new XMLHttpRequest();
xhr.open("GET", "../data/scatter.json");
xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
        let data = JSON.parse(xhr.responseText)
        var convertData = function (data) {
            var res = [];
            for (var i = 0; i < data.length; i++) {
                res.push({
                    name: data[i].name,
                    value: data[i].coordinate.concat(data[i].value)
                });

            }
            return res;
        };

        //style options
        var option = {
            title: {
                left: 'center',
                textStyle: {
                    color: '#fff'
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: function (obj) {
                    return `${obj.data.value[2]} Milli­metres`
                },

            },
            openlayers: {},
            series: [
                {
                    name: 'Milli­metres',
                    type: 'scatter',
                    data: convertData(data),
                    symbolSize: function (val) {
                        return val[2] / 40;
                    },
                    label: {
                        normal: {
                            formatter: '{b}',
                            position: 'right',
                            show: false
                        },
                        emphasis: {
                            show: true
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#7FFF00'
                        }
                    }
                },
                {
                    name: 'Top 5',
                    type: 'effectScatter',
                    data: convertData(data.sort(function (a, b) {
                        return b.value - a.value;
                    }).slice(0, 5)),
                    symbolSize: function (val) {
                        return val[2] /40;
                    },
                    showEffectOn: 'render',
                    rippleEffect: {
                        brushType: 'stroke'
                    },
                    hoverAnimation: true,
                    label: {
                        normal: {
                            formatter: '{b}',
                            position: 'right',
                            show: true
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#76EE00',
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }
                    },
                    zlevel: 1
                }]
        };


        var echartslayer = new ol3Echarts(option, {
            hideOnMoving: false,
            hideOnZooming: false,
            forcedPrecomposeRerender: true
        })
        echartslayer.appendTo(map)
    }
}
xhr.send();
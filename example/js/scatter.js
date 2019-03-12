/*===========================================================================*/
// Average Precipitation
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. Setup Average Precipitation Layer
//   4. ThinkGeo Map Icon Fonts
/*===========================================================================*/


/*---------------------------------------------*/
// 1. ThinkGeo Cloud API Key
/*---------------------------------------------*/

// First, let's define our ThinkGeo Cloud API key, which we'll use to
// authenticate our requests to the ThinkGeo Cloud API.  Each API key can be
// restricted for use only from a given web domain or IP address.  To create your
// own API key, you'll need to sign up for a ThinkGeo Cloud account at
// https://cloud.thinkgeo.com.
const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';


/*---------------------------------------------*/
// 2. Map Control Setup
/*---------------------------------------------*/

// Now we'll create the base layer for our map. The base map layer uses the 
// ThinkGeo Cloud Maps Vector Tile service to display a detailed map. For more
// info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles 
let baseLayer = new ol.mapsuite.VectorTileLayer("https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/dark.json", {
    'apiKey': apiKey,
});

// This function will create and initialize our interactive map.
// We'll call it later when our POI icon font has been fully downloaded,
// which ensures that the POI icons display as intended.
let map;
const initializeMap = function () {
    map = new ol.Map({
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        // Add our previously-defined ThinkGeo Cloud Vector Tile Layer to the map.
        layers: [baseLayer],
        // Create a default view for the map when it starts up.
        target: 'map',
        view: new ol.View({
            // Center the map on the United States and start at zoom level 4.
            center: ol.proj.fromLonLat([-96.79620, 38.79423]),
            maxResolution: 40075016.68557849 / 512,
            zoom: 4,
            minZoom: 2,
            maxZoom: 19
        })
    });

    // Add a button to the map that lets us toggle full-screen display mode.
    map.addControl(new ol.control.FullScreen());

    // Add the pre-defined echarts layer to our map.
    echartslayer.appendTo(map)
}

/*---------------------------------------------*/
// 3. Setup Average Precipitation Layer
/*---------------------------------------------*/

// Now we'll create the Average Precipitation layer which will let us visualize 
// the Average Precipitation statistics on the map. We'll load the data from a 
// small JSON file hosted on our servers.

let echartslayer;
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
            series: [{
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
                        return val[2] / 40;
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
                }
            ]
        };

        echartslayer = new ol3Echarts(option, {
            hideOnMoving: false,
            hideOnZooming: false,
            forcedPrecomposeRerender: true
        })
    }
}
xhr.send();


/*---------------------------------------------*/
// 4. ThinkGeo Map Icon Fonts
/*---------------------------------------------*/

// Finally, we'll load the Map Icon Fonts using ThinkGeo's WebFont loader. 
// The loaded Icon Fonts will be used to render POI icons on top of the map's 
// background layer.  We'll initalize the map only once the font has been 
// downloaded.  For more info, see our wiki: 
// https://wiki.thinkgeo.com/wiki/thinkgeo_iconfonts 
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/2.0.0/vectormap-icons.css"]
    },
    // The "active" property defines a function to call when the font has
    // finished downloading.  Here, we'll call our initializeMap method.
    active: initializeMap
});
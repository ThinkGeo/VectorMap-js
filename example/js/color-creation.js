/*===========================================================================*/
// Generate Color Themes
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. Request Color Scheme Data 
/*===========================================================================*/

/*---------------------------------------------*/
// 1. ThinkGeo Cloud API Key
/*---------------------------------------------*/

// First, let's define our ThinkGeo Cloud API key, which we'll use to
// authenticate our requests to the ThinkGeo Cloud API.  Each API key can be
// restricted for use only from a given web domain or IP address.  To create your
// own API key, you'll need to sign up for a ThinkGeo Cloud account at
// https://cloud.thinkgeo.com.
const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~'


/*---------------------------------------------*/
// 2. Map Control Setup
/*---------------------------------------------*/

// Now we'll create the layers for our map. The base layer uses 
// the custom style to display color polygons. The base layer uses a 
// small GeoJSON file hosted on our servers, but you can load your 
// own data from any publicly-accessible server. In the near future you'll be able to upload your
// data to the ThinkGeo Cloud and let us host it for you!

// Create the base layer style.
const baseMapStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: 'rgba(256, 256, 256, 1)',
        width: 1
    }),
    text: new ol.style.Text({
        font: '16px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: '#990100'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
        }),
    })
})

// Apply the base style to base map layer. 
let baseMapLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: '../data/world-population.geo.json',
        format: new ol.format.GeoJSON()
    }),
    style: function (feature) {
        baseMapStyle.getText().setText(feature.get('NAME'));

        return baseMapStyle;
    }
});

// Create the color layer.
let colorLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: '../data/world-population.geo.json',
        format: new ol.format.GeoJSON(),
    })
})

// Create and initialize our interactive map.
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    // Add our previously-defined ThinkGeo Cloud Vector Tile layers to the map.
    layers: [colorLayer, baseMapLayer],
    // States that the HTML tag with id="map" should serve as the container for our map.
    target: 'map',
    // Create a default view for the map when it starts up.
    view: new ol.View({
        // Center the map on Europe and start at zoom level 4.
        center: ol.proj.fromLonLat([18.79620, 50.55423]),
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 4,
    }),
});

// Add a button to the map that lets us toggle full-screen display mode.
map.addControl(new ol.control.FullScreen());

// Set new style of when the color data changed. 
const updateStyle = (outputData) => {
    let styles = {
        'XXXS': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[19]}`
            })
        }),
        'XXS': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[17]}`
            })
        }),
        'XS': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[15]}`
            })
        }),
        'S': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[13]}`
            })
        }),
        'M': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[11]}`
            }),
        }),
        'L': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[9]}`
            }),
        }),
        'XL': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[7]}`
            })
        }),
        'XXL': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[5]}`
            })
        }),
        'XXXL': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[3]}`
            })
        }),
        'XXXXL': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[0]}`
            })
        }),

    }
    //Style divided by population
    const layerStyle = function (feature) {
        let population = Number(feature.get('POP2005'))
        if (population < 10000) {
            return styles.XXXS
        } else if (population > 10000 && population < 50000) {
            return styles.XXS
        } else if (population > 50000 && population < 100000) {
            return styles.XS
        } else if (population > 100000 && population < 500000) {
            return styles.S
        } else if (population > 500000 && population < 1000000) {
            return styles.M
        } else if (population > 1000000 && population < 5000000) {
            return styles.L
        } else if (population > 5000000 && population < 10000000) {
            return styles.XL
        } else if (population > 10000000 && population < 50000000) {
            return styles.XXL
        } else if (population > 50000000 && population < 100000000) {
            return styles.XXXL
        } else if (population > 100000000) {
            return styles.XXXXL
        } else {
            return styles.XXL
        }
    }
    colorLayer.setStyle(layerStyle)
}


/*---------------------------------------------*/
// 3. Request Color Scheme Data 
/*---------------------------------------------*/

// Then, let's define our base url, which we'll use to request the colors scheme data. We use 
// the ThinkGeo Cloud Maps Colors services to response the request. 

const baseURL = 'https://cloud.thinkgeo.com/api/v1/color/scheme/';

//Render data
const renderData = (data) => {
    let outputData = []
    if (data) {
        if (data.data.colors) {
            outputData = data.data.colors;
        } else {
            data.data.forEach(function (val) {
                outputData = outputData.concat(val.colors)
            });
        }
    }
    updateStyle(outputData)
}

// Send the request and update the response data to map.
const getResponse = () => {
    let options = {
        category: $('select#category option:selected').val(),
        radio: $('input:radio:checked').val(),
        color: $('#color').val(),
        numbur: 20,
    }
    let getURL

    if (options.radio == 'random') {
        getURL = `${baseURL}${options.category}/${options.radio}/${options.numbur}?apikey=${apiKey}`
    } else {
        getURL = `${baseURL}${options.category}/${options.color}/${options.numbur}?apikey=${apiKey}`
    }

    let jqxhr = $.get(getURL, function (data) {
        if (data.status == 'success') {
            renderData(data)
        }
    });

    jqxhr.fail(function (data) {
        window.alert('No results');
    })

}

// Set default color theme when the page load for the first time.
window.onload = function a() {
    let defaultData = ["641615", "7C1B1A", "93201F", "AB2624", "C22B28", "D43533", "D94D4A", "65153C", "7C1A4A", "931F58", "AB2567", "C22A75", "D33583", "D84C91", "641563", "7C1A7A", "931F91", "AB24A9", "C228C0", "D433D1"]
    updateStyle(defaultData)
    // When click the 'generate' button, set new style according to what the user input.
    document.getElementById('generate').addEventListener('click', (e) => {
        getResponse()
    })
}


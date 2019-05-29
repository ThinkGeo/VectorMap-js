/*===========================================================================*/
// Generate Color Themes
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. Generating a New Color Scheme
//   4. Page Load and Event Listeners
//   5. Tile Loading Event Handlers
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

// Now we'll create the layers for our map.  To keep things simple, 
// we're going to display a simple base map of European countries from a 
// GeoJSON file we're hosting on a publicly-accessible server.  Then we'll
// add a color layer that will fill in the countries with a family of similar 
// colors gathered from the ThinkGeo Cloud Color Service.  For more details 
// about that service, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_colors

// Create a simple base style for the base layer that will outline the 
// countries in white and display their names in red text.
let baseMapStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#fff',
        width: 1
    }),
    text: new ol.style.Text({
        font: '16px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: '#fff'
        }),
        stroke: new ol.style.Stroke({
            color: "rgba(0,0,0,0.65)",
            width: 3
        }),
    })
})

// Create a base map layer from the European countries GeoJSON, and then
// apply our simple base style to it. 
let baseMapLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: '../data/world-population.geojson',
        format: new ol.format.GeoJSON()
    }),
    style: function (feature) {
        baseMapStyle.getText().setText(feature.get('NAME'));
        return baseMapStyle;
    }
});

// Create another layer from the European countries GeoJSON, this time to hold 
// the color fill for each country. We won't apply any styling to it right now;
// that will happen in Section 3: Generating a New Color Scheme.
let colorLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: '../data/world-population.geojson',
        format: new ol.format.GeoJSON(),
    })
})

// Create and initialize our interactive map.
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    // Add our previously-defined layers to the map.
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


/*---------------------------------------------*/
// 3. Generating a New Color Scheme
/*---------------------------------------------*/

// The ThinkGeo Cloud Color service allows you to easily generate themes of 
// similar colors based on the strategy of your choice, including analogous, 
// complementary, qualitative and more.  With ThinkGeo Cloud Color, all of 
// your maps will gain an eye-catching flair.  For details, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_colors

// We use thinkgeocloudclient.js, which is an open-source Javascript SDK for making 
// request to ThinkGeo Cloud Service. It simplifies the process of the code of request.

// Create the ColorClient by passing apiKey.
let ColorClient = new tg.ColorClient(apiKey);

// This method asks the ThinkGeo Cloud Color service to generate a new color 
// scheme based on the input parameters -- color family type, random or 
// specific base color, etc.
const getColorSchemeResult = () => {
    const categoryColor = document.getElementById('category');
    let isRandom = document.getElementById('colorRandom').checked;
    let category = categoryColor.options[categoryColor.selectedIndex].value;
    let options = {
        numberOfColors: 10,
    }

    // If you want to get back a color family based on a specific color, we'll add a property 
    // called "color" and assign the color value to it. 
    if (!isRandom) {
        options['color'] = document.getElementById('colorPicker').value
    }

    // According to the color family type you chose, we'll call the responding Api to process the code of request. 
    switch (category) {
        case 'analogous':
            ColorClient.getColorsInAnalogousFamily(options, function (status, response) {
                renderData(status, response)
            });
            break;
        case 'complementary':
            ColorClient.getColorsInComplementaryFamily(options, function (status, response) {
                renderData(status, response)
            });
            break;
        case 'contrasting':
            ColorClient.getColorsInContrastingFamily(options, function (status, response) {
                renderData(status, response)
            });
            break;
        case 'qualitative':
            ColorClient.getColorsInQualityFamily(options, function (status, response) {
                renderData(status, response)
            });
            break;
        case 'sequential':
            ColorClient.getColorsInHueFamily(options, function (status, response) {
                renderData(status, response)
            });
            break;
        case 'triad':
            ColorClient.getColorsInTriadFamily(options, function (status, response) {
                renderData(status, response)
            });
            break;
        case 'tetrad':
            ColorClient.getColorsInTetradFamily(options, function (status, response) {
                renderData(status, response)
            });
            break;
        default:
            ColorClient.getColorsInAnalogousFamily(options, function (status, response) {
                renderData(status, response)
            });
    }
}

// This method takes the output of the getColorScheme method and applies it 
// to our map via a custom updateStyle method, which we'll define next.
const renderData = (status, data) => {
    if (status == 403 || status === 'error') {
        errorLoadingTile();
    }
    let outputData = [];
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

// This method allows us to assign colors to the countries of Europe based on 
// their population.  The population metadata lives in the GeoJSON file 
// that we loaded onto our map.
const updateStyle = (outputData) => {
    // Set up a series of style classes (From XXXS to XXXXL) and map each one 
    // to an element from an array of colors, passed in as "outputData".
    let styles = {
        'XXXS': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[9]}`
            })
        }),
        'XXS': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[8]}`
            })
        }),
        'XS': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[7]}`
            })
        }),
        'S': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[6]}`
            })
        }),
        'M': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[5]}`
            }),
        }),
        'L': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[4]}`
            }),
        }),
        'XL': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[3]}`
            })
        }),
        'XXL': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[2]}`
            })
        }),
        'XXXL': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[1]}`
            })
        }),
        'XXXXL': new ol.style.Style({
            fill: new ol.style.Fill({
                color: `#${outputData[0]}`
            })
        }),
    }

    // Assign each range of country populations to one of our style classes.
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
// 4. Page Load and Event Listeners
/*---------------------------------------------*/

// Define a default color scheme to be applied to the map the first time the 
// page loads. Additionally, here we attach an event listener to the "Generate" 
// button that will call out to the ThinkGeo Cloud and get a new color scheme, 
// then apply it to the map.
window.onload = function a() {
    let defaultData = [
        "993333",
        "A63C3C",
        "B24747",
        "B65A5A",
        "BA6E6E",
        "BE8181",
        "C39494",
        "C8A5A5",
        "CFB6B6",
        "D6C5C5"
    ];
    updateStyle(defaultData)
    // When click the 'generate' button, set new style according to what the user input.
    document.getElementById('generate').addEventListener('click', () => {
        getColorSchemeResult()
    })
}



/*---------------------------------------------*/
// 5. Tile Loading Event Handlers
/*---------------------------------------------*/

// These events allow you to perform custom actions when 
// a map tile encounters an error while loading.
const errorLoadingTile = () => {
    const errorModal = document.querySelector('#error-modal');
    if (errorModal.classList.contains('hide')) {
        // Show the error tips when Tile loaded error.
        errorModal.classList.remove('hide');
    }
}

document.querySelector('#error-modal button').addEventListener('click', () => {
    document.querySelector('#error-modal').classList.add('hide');
})
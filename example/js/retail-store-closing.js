/*===========================================================================*/
// U.S. Retail Store Closings 2019
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. Styling
//   4. Event Listeners
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

// Now we'll create different layers with different data sources. These layers 
// all use ThinkGeo Cloud Maps Raster Tile service to display a detailed map. 
// For more info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_raster_tiles

// Let's create each actual map layer using the different data sources URLs. We'll create the following layers: 
//   1. light:  Street map with a light background and features.
//   2. dark:   Street map with a dark background and features.
//   3. aerial: Aerial imagery map with no street features or POIs.
//   4. transparentBackground: Just the streets and POIs with a transparent 
//      background.  Useful for displaying on top of the aerial layer, or
//      your own custom imagery layer.
// The "light" layer will be our default, so for the others, we'll set the
// "visible" property to false.
let baseLightLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
        tileSize: 512
    }),
    layerName: 'light',
    visible: true
});

let baseDarkLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
        tileSize: 512
    }),
    layerName: 'dark',
    visible: false
});

let baseAerialLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `https://cloud.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg?apiKey=${apiKey}`,
        tileSize: 512
    }),
    layerName: 'aerial',
    visible: false
});

let baseTransparentLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `https://cloud.thinkgeo.com/api/v1/maps/raster/transparent-background/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
        tileSize: 512
    }),
    layerName: 'transparent',
    visible: false
});

// Create a default view for the map when it starts up.
let view = new ol.View({
    // Center the map on the United States and start at zoom level 3.
    center: ol.proj.fromLonLat([-96.8366345, 38.9203765]),
    maxResolution: 40075016.68557849 / 512,
    progressiveZoom: false,
    zoom: 3,
    minZoom: 2,
    maxZoom: 19
});

// Create and initialize our raster map control.
let map = new ol.Map({
    renderer: 'webgl',
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    // Add our previously-defined ThinkGeo Cloud Raster Tile layers to the map.
    layers: [baseLightLayer, baseDarkLayer, baseAerialLayer, baseTransparentLayer],
    // States that the HTML tag with id="map" should serve as the container for our map.
    target: 'map',
    // Add the default view to the map when it starts up.
    view: view
});


// Add a button to the map that lets us toggle full-screen display mode.
map.addControl(new ol.control.FullScreen());


/*---------------------------------------------*/
// 3. Styling
/*---------------------------------------------*/

// This next part sets up the stores layer style for the points on our map.  As we
// zoom out, points that are close together will be clustered, or grouped, into a
// single point.  On each clustered point, we'll display the number of individual
// points belonging to that cluster.

// This next part sets up the stores layers style for the points on our map. The each 
// store location is displayed as a colored circle, as we zoom in to zoom level 4, the 
// colored circle will be replaced as the store chain's logo. Accordingly, as we zoom 
// out to zoom level 3, the store chain's logo will be replaced by colored circle.

// Set the five stores chain's colored circle style.
let searsStyle = new ol.style.Style({
    image: new ol.style.Circle({
        radius: view.getZoom() * 2,
        stroke: new ol.style.Stroke({
            color: '#ffffffcc',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: '#002c65'
        })
    })
});

let kmartStyle = new ol.style.Style({
    image: new ol.style.Circle({
        radius: view.getZoom() * 2,
        stroke: new ol.style.Stroke({
            color: '#ffffffcc',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: '#cd1314'
        })
    })
});

let familyDollarStyle = new ol.style.Style({
    image: new ol.style.Circle({
        radius: view.getZoom() * 2,
        stroke: new ol.style.Stroke({
            color: '#ffffffcc',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: '#eb8f2d'
        })
    })
});

let lowesStyle = new ol.style.Style({
    image: new ol.style.Circle({
        radius: view.getZoom() * 2,
        stroke: new ol.style.Stroke({
            color: '#ffffffcc',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: '#004a90'
        })
    })
});

let macysStyle = new ol.style.Style({
    image: new ol.style.Circle({
        radius: view.getZoom() * 2,
        stroke: new ol.style.Stroke({
            color: '#000000cc',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: '#ffffff'
        })
    })
});

let lifewayStyle = new ol.style.Style({
    image: new ol.style.Circle({
        radius: view.getZoom() * 2,
        stroke: new ol.style.Stroke({
            color: '#ffffffcc',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: '#a52170'
        })
    })
});

// Set the five stores chain's logo style.
let searsIconStyle = new ol.style.Style({
    image: new ol.style.Icon({
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        opacity: 1,
        src: '../image/sears_logo_200_outline_10.png'
    })
});

let kmartIconStyle = new ol.style.Style({
    image: new ol.style.Icon({
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        opacity: 1,
        src: '../image/kmart_logo_200_outline_10.png'
    })
});

let familyDollarIconStyle = new ol.style.Style({
    image: new ol.style.Icon({
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        opacity: 1,
        src: '../image/family_dollar_logo_200_outline_10.png'
    })
});

let lowesIconStyle = new ol.style.Style({
    image: new ol.style.Icon({
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        opacity: 1,
        src: '../image/lowes_logo_200_outline_10.png'
    })
});

let macysIconStyle = new ol.style.Style({
    image: new ol.style.Icon({
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        opacity: 1,
        src: '../image/macys_logo_200_outline_10.png'
    })
});

let lifewayIconStyle = new ol.style.Style({
    image: new ol.style.Icon({
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        opacity: 1,
        src: '../image/lifeway_logo_200_outline_10.png'
    })
});

// Create the five store chain's Vetor Sources and add them to the corresponding 
// layers, using five GeoJSON files hosted on our servers.
let searsSource = new ol.source.Vector({
    url: '../data/Sears.geojson',
    format: new ol.format.GeoJSON()
});

let searsLayer = new ol.layer.Vector({
    source: searsSource,
    style: searsStyle
});

let kmartSource = new ol.source.Vector({
    url: '../data/Kmart.geojson',
    format: new ol.format.GeoJSON()
});

let kmartLayer = new ol.layer.Vector({
    source: kmartSource,
    style: kmartStyle
});

let familyDollarSource = new ol.source.Vector({
    url: '../data/Family_Dollar.geojson',
    format: new ol.format.GeoJSON()
});

let familyDollarLayer = new ol.layer.Vector({
    source: familyDollarSource,
    style: familyDollarStyle
});

let lowesSource = new ol.source.Vector({
    url: '../data/Lowes.geojson',
    format: new ol.format.GeoJSON()
});

let lowesLayer = new ol.layer.Vector({
    source: lowesSource,
    style: lowesStyle
});

let macysSource = new ol.source.Vector({
    url: '../data/Macys.geojson',
    format: new ol.format.GeoJSON()
});

let macysLayer = new ol.layer.Vector({
    source: macysSource,
    style: macysStyle
});

let lifewaySource = new ol.source.Vector({
    url: '../data/Lifeway.geojson',
    format: new ol.format.GeoJSON()
});

let lifewayLayer = new ol.layer.Vector({
    source: lifewaySource,
    style: lifewayStyle
});

// Add the five pre-defined layers to our map.  
map.addLayer(searsLayer);
map.addLayer(kmartLayer);
map.addLayer(lowesLayer);
map.addLayer(lifewayLayer);
map.addLayer(familyDollarLayer);
map.addLayer(macysLayer);


/*---------------------------------------------*/
// 4. Event Listeners
/*---------------------------------------------*/

// These event listeners tell the UI when it's time to execute all of the 
// code we've written.

// This method will get the image icon's scale value.
const getIconScale = (zoomLevel) => {
    let minScale = 0.09;
    let maxScale = 0.35;
    let iconScale = (zoomLevel + 1) ** 2 / 1.5 * 0.003;

    if (iconScale < minScale) iconScale = minScale;
    else if (iconScale > maxScale) iconScale = maxScale;
    return iconScale;
};

// This method will change the points style from colored circle to store logo image.
const changeColoredCircleToLogo = () => {
    // Change every feature's style.
    let searsFeatures = searsLayer.getSource().getFeatures();
    let kmartFeatures = kmartLayer.getSource().getFeatures();
    let familyDollarFeatures = familyDollarLayer.getSource().getFeatures();
    let lowesFeatures = lowesLayer.getSource().getFeatures();
    let macysFeatures = macysLayer.getSource().getFeatures();
    let lifewayFeatures = lifewayLayer.getSource().getFeatures();
    for (let i = 0, l = searsFeatures.length; i < l; i++) {
        let searsFeature = searsFeatures[i];
        searsFeature.setStyle(searsIconStyle);
    }
    for (let i = 0, l = kmartFeatures.length; i < l; i++) {
        let kmartFeature = kmartFeatures[i];
        kmartFeature.setStyle(kmartIconStyle);
    }
    for (let i = 0, l = familyDollarFeatures.length; i < l; i++) {
        let familyDollarFeature = familyDollarFeatures[i];
        familyDollarFeature.setStyle(familyDollarIconStyle);
    }
    for (let i = 0, l = lowesFeatures.length; i < l; i++) {
        let lowesFeture = lowesFeatures[i];
        lowesFeture.setStyle(lowesIconStyle);
    }
    for (let i = 0, l = macysFeatures.length; i < l; i++) {
        let macysFeature = macysFeatures[i];
        macysFeature.setStyle(macysIconStyle);
    }
    for (let i = 0, l = lifewayFeatures.length; i < l; i++) {
        let lifewayFeature = lifewayFeatures[i];
        lifewayFeature.setStyle(lifewayIconStyle);
    }

    // Switch out the little color squares on the legend for small versions of the store logos.
    let colorSquares = document.querySelectorAll('.legend li');
    for (let i = 0, l = colorSquares.length; i < l; i++) {
        let item = colorSquares[i];
        let square = item.querySelector('i');
        let style = square.style;
        style.backgroundColor = 'transparent';
        style.borderWidth = 0;
        style.width = '1.2rem';
        style.height = '1.2rem';
        switch (item.className) {
            case 'sears':
                style.backgroundImage =
                    "url('../image/sears_logo_200_outline_10.png')";
                break;
            case 'kmart':
                style.backgroundImage =
                    "url('../image/kmart_logo_200_outline_10.png')";
                break;
            case 'familydollar':
                style.backgroundImage =
                    "url('../image/family_dollar_logo_200_outline_10.png')";
                break;
            case 'lowes':
                style.backgroundImage =
                    "url('../image/lowes_logo_200_outline_10.png')";
                break;
            case 'macys':
                style.backgroundImage =
                    "url('../image/macys_logo_200_outline_10.png')";
                break;
            case 'lifeway':
                style.backgroundImage =
                    "url('../image/lifeway_logo_200_outline_10.png')";
                break;
        }
    }
}

// This method will change the points style from logo image to colored circle.
const changeLogoToColoredCircle = () => {
    // Switch out the little color squares on the legend for small versions of the store logos.
    let squares = document.querySelectorAll('.legend i');
    squares.forEach((square) => {
        let bgColor = square.getAttribute('data-bg-color');
        let style = square.style;
        style.backgroundColor = bgColor;
        style.borderWidth = '1px';
        style.backgroundImage = '';
        style.width = '0.6rem';
        style.height = '0.6rem';
    });

    let searsFeatures = searsLayer.getSource().getFeatures();
    let kmartFeatures = kmartLayer.getSource().getFeatures();
    let familyDollarFeatures = familyDollarLayer.getSource().getFeatures();
    let lowesFeatures = lowesLayer.getSource().getFeatures();
    let macysFeatures = macysLayer.getSource().getFeatures();
    let lifewayFeatures = lifewayLayer.getSource().getFeatures();
    for (let i = 0, l = searsFeatures.length; i < l; i++) {
        let searsFeature = searsFeatures[i];
        searsFeature.setStyle(searsStyle);
    }
    for (let i = 0, l = kmartFeatures.length; i < l; i++) {
        let kmartFeature = kmartFeatures[i];
        kmartFeature.setStyle(kmartStyle);
    }
    for (let i = 0, l = familyDollarFeatures.length; i < l; i++) {
        let familyDollarFeature = familyDollarFeatures[i];
        familyDollarFeature.setStyle(familyDollarStyle);
    }
    for (let i = 0, l = lowesFeatures.length; i < l; i++) {
        let lowesFeature = lowesFeatures[i];
        lowesFeature.setStyle(lowesStyle);
    }
    for (let i = 0, l = macysFeatures.length; i < l; i++) {
        let macysFeature = macysFeatures[i];
        macysFeature.setStyle(macysStyle);
    }
    for (let i = 0, l = lifewayFeatures.length; i < l; i++) {
        let lifewayFeature = lifewayFeatures[i];
        lifewayFeature.setStyle(lifewayStyle);
    }
}

// This method will modify each points colored circle's radius value.
const changePointStyleRadius = (zoom) => {
    searsStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: zoom * 2,
            stroke: new ol.style.Stroke({
                color: '#ffffffcc',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: '#002c65'
            })
        })
    });

    kmartStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: zoom * 2,
            stroke: new ol.style.Stroke({
                color: '#ffffffcc',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: '#cd1314'
            })
        })
    });

    familyDollarStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: zoom * 2,
            stroke: new ol.style.Stroke({
                color: '#ffffffcc',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: '#eb8f2d'
            })
        })
    });

    lowesStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: zoom * 2,
            stroke: new ol.style.Stroke({
                color: '#ffffffcc',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: '#004a90'
            })
        })
    });

    macysStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: zoom * 2,
            stroke: new ol.style.Stroke({
                color: '#000000cc',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: '#ffffff'
            })
        })
    });

    lifewayStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: zoom * 2,
            stroke: new ol.style.Stroke({
                color: '#ffffffcc',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: '#a52170'
            })
        })
    });
}

// Add an event listener to map. Once the the zoom level has changed, we need 
// to judge that if we should change the point style from colored circle to store 
// logo, or from store logo to colored circle.

// Define a variable that refer to the condition if we should change the point style.
let changeToLogo = false;
map.getView().on('change:resolution', function () {
    let zoom = view.getZoom();
    if (zoom >= 4) {
        // If the zoom level is greater than or equal to 4, the logo icon should get bigger as we zoom in.
        let iconScale = getIconScale(zoom);
        searsIconStyle.getImage().setScale(iconScale);
        kmartIconStyle.getImage().setScale(iconScale);
        familyDollarIconStyle.getImage().setScale(iconScale);
        lowesIconStyle.getImage().setScale(iconScale);
        macysIconStyle.getImage().setScale(iconScale);
        lifewayIconStyle.getImage().setScale(iconScale);
        if (changeToLogo) {
            // If it's time for to change the point style from colored circle to store logo. We'll reset the 
            // If it's time for to change the point style from colored circle to store logo. We'll reset the 
            // If it's time for to change the point style from colored circle to store logo. We'll reset the 
            // changeToLogo to false, which means even we are at a zoom greater than 4, but we have no need to 
            // changeToLogo to false, which means even we are at a zoom greater than 4, but we have no need to 
            // changeToLogo to false, which means even we are at a zoom greater than 4, but we have no need to 
            // change the circle to logo, because we already have done.
            changeToLogo = false;
            // Call the method to change point colored circle to logo image.
            changeColoredCircleToLogo();
        }
    } else {
        // If we are at a zoom level less than 4, we have to reset the changeToLogo to true, and reset the points style.
        changeToLogo = true;
        changePointStyleRadius(zoom);
        changeLogoToColoredCircle();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // When click any of the items in the top right legend, the target layer will be removed from map or be added to map.
    document.getElementsByClassName('legend')[0].addEventListener('change', (e) => {
        e = window.event || e;
        if (e.target.checked) {
            switch (e.target.id) {
                case 'sears_checkbox':
                    map.addLayer(searsLayer);
                    break;
                case 'kmart_checkbox':
                    map.addLayer(kmartLayer);
                    break;
                case 'family_dollar_checkbox':
                    map.addLayer(familyDollarLayer);
                    break;
                case 'lowes_checkbox':
                    map.addLayer(lowesLayer);
                    break;
                case 'macys_checkbox':
                    map.addLayer(macysLayer);
                    break;
                case 'lifeway_checkbox':
                    map.addLayer(lifewayLayer);
                    break;
            }
        } else {
            switch (e.target.id) {
                case 'sears_checkbox':
                    map.removeLayer(searsLayer);
                    break;
                case 'kmart_checkbox':
                    map.removeLayer(kmartLayer);
                    break;
                case 'family_dollar_checkbox':
                    map.removeLayer(familyDollarLayer);
                    break;
                case 'lowes_checkbox':
                    map.removeLayer(lowesLayer);
                    break;
                case 'macys_checkbox':
                    map.removeLayer(macysLayer);
                    break;
                case 'lifeway_checkbox':
                    map.removeLayer(lifewayLayer);
                    break;
            }
        }
    });

    // You can change the base map style by clicking the button group on the left of legend panel.
    document.getElementsByClassName('map-btn-group')[0].addEventListener('click', (e) => {
        e = window.event || e;
        let target = e.target;
        let value = target.value;
        document.getElementsByClassName('current')[0].classList.remove('current');
        target.classList.add('current');
        switch (value) {
            case 'light':
                baseLightLayer.setVisible(true);
                baseDarkLayer.setVisible(false);
                baseAerialLayer.setVisible(false);
                baseTransparentLayer.setVisible(false);
                break;
            case 'dark':
                baseLightLayer.setVisible(false);
                baseDarkLayer.setVisible(true);
                baseAerialLayer.setVisible(false);
                baseTransparentLayer.setVisible(false);
                break;
            case 'hybrid':
                baseLightLayer.setVisible(false);
                baseDarkLayer.setVisible(false);
                baseAerialLayer.setVisible(true);
                baseTransparentLayer.setVisible(true);
                break;
        }
    });
});
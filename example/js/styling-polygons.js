/*===========================================================================*/
// Style Polygons from GeoJSON
// Sample map by ThinkGeo
// 
//   1. Map Control Setup
//   2. Highlight Control Setup
//   3. Event Listeners
/*===========================================================================*/


/*---------------------------------------------*/
// 1. Map Control Setup
/*---------------------------------------------*/

// First, we need to create the basemap, which dispaly the country land(polygon), country boundary(line)
// and country names(point). 

// Here we create StyleJSON for the data.
// For more info about the StyleJSON, see our wiki: 
// https://wiki.thinkgeo.com/wiki/thinkgeo_stylejson
const baseMapStyleJson = {
    "id": "base",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#044061",
    "styles": [{
            "id": "country",
            "style": [{
                "filter": "zoom>=0;zoom<=18;",
                "polygon-fill": "#004881"
            }]
        },
        {
            "id": "country_boundary",
            "style": [{
                "filter": "zoom>=0;zoom<=18;",
                "line-width": 0.6,
                "line-color": "#019fd4",
            }]
        }, {
            "id": "country_name",
            "style": [{
                "text-name": "name",
                "text-fill": "#ffff28",
                "text-wrap-width": 10,
                "text-spacing": 1,
                "style": [{
                    "filter": "zoom>=0;zoom<=18;",
                    "text-font": "14px Calibri,sans-serif",
                }]
            }]
        }
    ],
    "sources": [{
        "id": "data_source",
        "url": "../data/countries.json",
        "type": "GeoJSON"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "data_source",
        "styles": [
            "country", "country_boundary", "country_name"
        ]
    }]
};

// Set up the layer uses the pre-defined style.
let baseMapLayer = new ol.mapsuite.VectorLayer(baseMapStyleJson, {
    multithread: false
});

// Create and initialize our custom map.
let map = new ol.Map({
	renderer: 'webgl',
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    // Add our previously-defined layer to the map.
    layers: [baseMapLayer],
    // States that the HTML tag with id="map" should serve as the container for our map.
    target: 'map',
    // Create a default view for the map when it starts up.
    view: new ol.View({
        center: ol.proj.fromLonLat([2.570481, 26.927630]),
        maxResolution: 40075016.68557849 / 512,
        zoom: 2,
        minZoom: 0,
        maxZoom: 19
    }),
});

// Add a button to the map that lets us toggle full-screen display mode.
map.addControl(new ol.control.FullScreen());


/*---------------------------------------------*/
// 2. Highlight Control Setup
/*---------------------------------------------*/

// Now, we are going to set up the highlight control. We'll create another layer for our map.

// In this custom object, we're going to define three styles:
//   1. The appearance of the region which we are hovering over.
//   2. The appearance of the boundary which country we are hovering over.
//   3. The appearance of the country name which we are hovering over.
// Highlight style
const highlightStyle = new ol.style.Style({
    // Set the country land fill color.
    fill: new ol.style.Fill({
        color: '#f4755d'
    }),
    // Set the country boundary line color and width.
    stroke: new ol.style.Stroke({
        color: '#627ce3',
        width: 2
    }),
    // Set the country name style.
    text: new ol.style.Text({
        font: '14px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: 'rgb(103, 183, 220)'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
        })
    })
});

// This method is to make the country name wrap when it is too long.
const stringDivider = (str, width, spaceReplacer) => {
    if (str.length > width) {
        var p = width;
        while (p > 0 && (str[p] != ' ' && str[p] != '-')) {
            p--;
        }
        if (p > 0) {
            var left;
            if (str.substring(p, p + 1) == '-') {
                left = str.substring(0, p + 1);
            } else {
                left = str.substring(0, p);
            }
            var right = str.substring(p + 1);
            return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
        }
    }
    return str;
};

// Then, create the highlight layer uses the pre-defined highlight style.
let highlightLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: function (feature) {
        highlightStyle.getText().setText(stringDivider(feature.get('name'), 10, '\n'));
        return highlightStyle;
    }
});

// This method add the highlight feature or remove the highlight feature. While 
// one country has a highlight style, and the pointer begin to move to another 
// country, then this method will remove the highlight style from the former
// country and add highlight style to the new country which the pointer at.
let highlight;
const highlightLayerControl = function (pixel) {
    let feature = map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
    });

    if (feature !== highlight) {
        if (highlight) {
            highlightLayer.getSource().removeFeature(highlight);
        }
        if (feature) {
            highlightLayer.getSource().addFeature(feature);
        }
        highlight = feature;
    }
};


/*---------------------------------------------*/
// 3. Event Listeners
/*---------------------------------------------*/

// These event listeners tell the UI when it's time to execute all of the 
// code we've written.

// This listener will update the country style when you move pointer from one
// country to another.
map.on('pointermove', function (evt) {
    if (evt.dragging) {
        return;
    }
    let pixel = map.getEventPixel(evt.originalEvent);
    highlightLayerControl(pixel);
});

// This listener will update the country style when you click on one country.
map.on('click', function (evt) {
    highlightLayerControl(evt.pixel);
});
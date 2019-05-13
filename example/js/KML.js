/*===========================================================================*/
// Style Polygons from KML
// Sample map by ThinkGeo
// 
//   1. KML Layer Setup
//   2. Map Control Setup
/*===========================================================================*/


/*---------------------------------------------*/
// 1. KML Layer Setup
/*---------------------------------------------*/

// Create another layer from a KML format data file hosted on our server, this time to hold the style 
// for the KML polygon, line and point. Then apply the styleJSON to KML layer.

// For more info about StyleJSON, see our wiki:  
// https://thinkgeo.gitbooks.io/map-suite-stylejson-specification/content/

// For more info about Map Suite Portable Data Format, see our wiki: 
// https://wiki.thinkgeo.com/wiki/map_suite_portable_data_format_guide
const geosjonStyle = {
    "id": "kml-stylejson",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "variables": {},
    "styles": [{
            "id": "country",
            "style": [{
                "line-color": "#635B5A",
                "line-width": 1
            }]
        },
        {
            "id": "state",
            "style": [{
                    "filter": "name='South Dakota,Tennessee,Texas,Utah,Vermont,Virginia,Washington,West Virginia,Wisconsin,Wyoming'",
                    "style": [{
                        "polygon-fill": "#4c79c1"
                    }]
                },
                {
                    "filter": "name='Alabama,Alaska,Arizona,Arkansas,California,Colorado,Connecticut,Delaware,District of Columbia,Florida,Georgia,Hawaii,Idaho,Illinois,Indiana,Iowa,Kansas,Kentucky,Louisiana,Maine,Maryland'",
                    "style": [{
                        "polygon-fill": "rgb(121, 166, 238)"
                    }]
                },
                {
                    "filter": "name='Massachusetts,Michigan,Minnesota,Mississippi,Missouri,Montana,Nebraska,Nevada,New Hampshire,New Jersey,New Mexico,New York,North Carolina,North Dakota,Ohio,Oklahoma,Oregon,Pennsylvania,Rhode Island,South Carolina'",
                    "style": [{
                        "polygon-fill": "#25529a"
                    }]
                }
            ]
        },
        {
            "id": "state_name",
            "style": [{
                "text-name": "name",
                "text-wrap-width": 20,
                "text-fill": "#496588",
                "text-halo-fill": "#b1dff5",
                "text-halo-radius": 2,
                "style": [{
                    "filter": "zoom>=0;zoom<=19;",
                    "text-font": "oblique 600 16px Arial, Helvetica, sans-serif"
                }]
            }]
        }
    ],
    "sources": [{
        "id": "data_source",
        "url": "../data/map.kml",
        "type": "KML"
    }],
    "layers": [{
        "id": "states_layer",
        "source": "data_source",
        "styles": ["state", "country", "state_name"]
    }]
};

// Create KML layer by using the pre-defined StyleJSON.
let kmlLayer = new ol.mapsuite.VectorLayer(geosjonStyle, {
    multithread: false
});

/*---------------------------------------------*/
// 2. Map Control Setup
/*---------------------------------------------*/

// Now, we'll set up the map control and add the pre-defined layer to map.

// Create and initialize our map control.
let map = new ol.Map({
	renderer: 'webgl',
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    // States that the HTML tag with id="map" should serve as the container for our map.
    target: "map",
    // Add our previously-defined KML layer to the map.
    layers: [kmlLayer],
    // Create a default view for the map when it starts up.
    view: new ol.View({
        // Center the map on the United States and start at zoom level 4.
        center: ol.proj.fromLonLat([-96.7962, 37.79423]),
        maxResolution: 40075016.68557849 / 512,
        zoom: 4,
        minZoom: 1,
        maxZoom: 19
    })
});

// Add a button to the map that lets us toggle full-screen display mode.
map.addControl(new ol.control.FullScreen());
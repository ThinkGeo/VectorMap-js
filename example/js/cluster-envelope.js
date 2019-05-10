/*===========================================================================*/
// Chicago Crime - Clustered Points
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. Styling
//   4. Loading the Chicago Crime Data Layer
//   5. Displaying Cluster Polygons
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

// Now we'll create the base layer for our map.  The base layer uses the ThinkGeo
// Cloud Maps Raster Tile service to display a detailed street map.  For more
// info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_raster_tiles
let defaultLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
        tileSize: 512,
    }),
});

// Create and initialize our interactive map.
let map = new ol.Map({
	renderer:'webgl',
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,

    // Add our previously-defined ThinkGeo Cloud Raster Tile layer to the map.
    layers: [defaultLayer],
    // States that the HTML tag with id="map" should serve as the container for our map.
    target: 'map',
    // Create a default view for the map when it starts up.
    view: new ol.View({

        // Center the map on Chicago, IL and start at zoom level 12.
        center: ol.proj.fromLonLat([-87.640620, 41.75423]),
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 12,
        progressiveZoom: false,

    })
})

// Add a button to the map that lets us toggle full-screen display mode.
map.addControl(new ol.control.FullScreen());


/*---------------------------------------------*/
// 3. Styling
/*---------------------------------------------*/

// This next part sets up the clustering style for the points on our map.  As we
// zoom out, points that are close together will be clustered, or grouped, into a
// single point.  On each clustered point, we'll display the number of individual
// points belonging to that cluster.
let styleCache = {};
const getStyle = function (feature, resolution) {

    // Set up an array of different point styles that change depending on how
    // many individual points are part of the cluster.
    let size = feature.get('features').length;
    let style = styleCache[size];

    // Divide our clustered point styles into five different classes, each a 
    // different color.  Colors are defined as R,G,B values.
    if (!style) {
        let color;
        const xxl = 100;
        const xl = 50;
        const max = 20;
        const middle = 10;
        const min = 1;
        if (size > xxl) {
            color = '61,4,1';
        } else if (size > xl && size < xxl || size == xxl) {
            color = '196,12,2';
        } else if (size > max && size < xl || size == xl) {
            color = '215,116,9';
        } else if (size > middle && size < max || size == max) {
            color = '248, 128, 0';
        } else if (size > min && size < middle || size == middle) {
            color = "248, 192, 0";
        } else {
            color = "128, 192, 64";
        }

        // Display clusters as larger circles the more points they contain.
        let radius = Math.max(8, Math.min(size * 1.5, 20));

        // Create the actual Style object that will be applied to our map's point data layer.
        style = styleCache[size] = [

            // Display each point with an outer "halo" circle that has 40% opacity.
            // This is just for some visual flair.
            new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius + 3,
                    stroke: new ol.style.Stroke({
                        color: "rgba(" + color + ",0.4)",
                        width: 4
                    })
                })
            }),
            new ol.style.Style({
                // Display each point as a filled circle with 80% opacity, using the color 
                // appropriate for its size.
                image: new ol.style.Circle({
                    radius: radius,
                    fill: new ol.style.Fill({
                        color: "rgba(" + color + ",0.8)"
                    })
                }),
                // On the circle, show the number of component points in the cluster.
                text: new ol.style.Text({
                    text: size.toString(),
                    fill: new ol.style.Fill({
                        color: '#000'
                    })
                })
            })
        ];
    }

    return style;
};


/*---------------------------------------------*/
// 4. Loading the Chicago Crime Data Layer
/*---------------------------------------------*/

// Now that we've set up our map's base layer and the style for our point data
// layer, we need to actually load the point data layer that will let us
// visualize Chicago crime statistics on the map.  We'll load it from a small
// GeoJSON file hosted on our servers, but you can load your own data from any
// publicly-accessible server.  In the near future you'll be able to upload your
// data to the ThinkGeo Cloud and let us host it for you!

const getJson = () => {
    let readTextFile = new Promise(function (resolve, reject) {
        // Load the Chicago crime point data from ThinkGeo's servers.
        // The data was originally sourced from https://catalog.data.gov/dataset.
        let file = "../data/crime.json";
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
        };
        rawFile.send(null);
    });
    return readTextFile;
};

// Let's build up an array of features, one for each point in our dataset.
let features = [];
let clusterLayer;
getJson().then((data) => {
    let result = JSON.parse(data);

    // For each feature in the Chicago GeoJSON dataset, create a point shape.
    for (let i = 0, length = result.length; i < length; i++) {
        let point = ol.proj.fromLonLat(result[i].geometry.coordinates);
        features[i] = new ol.Feature(new ol.geom.Point(point));
        features[i].set('id', i);
    }

    // Create a Cluster Source that will enable us to display our data points 
    // as clusters, and pass our array of features into it.  Here, spacerDistance 
    // is the number of pixels of space to maintain between each cluster.
    let spacerDistance = 40;
    let clusterSource = new ol.source.Cluster({
        distance: spacerDistance,
        source: new ol.source.Vector()
    });
    clusterSource.getSource().clear();
    clusterSource.getSource().addFeatures(features);

    // Create an Animated Cluster Layer whose source is our Cluster Source, 
    // and then add it to our map.
    clusterLayer = new ol.layer.AnimatedCluster({
        name: 'Cluster',
        source: clusterSource,
        style: getStyle
    });
    map.addLayer(clusterLayer);
});


/*---------------------------------------------*/
// 5. Displaying Cluster Polygons
/*---------------------------------------------*/

// Let's add another layer that will let users visualize the area each cluster
// point covers. When hovering over a cluster point, we'll generate and display a
// polygon that encompasses all points in the cluster using the Convex Hull
// geometric function.

let vector = new ol.layer.Vector({
    source: new ol.source.Vector()
});
vector.setMap(map);

// Enable mouse hover interaction on our map.
let hover = new ol.interaction.Hover({
    cursor: "pointer",
    layerFilter: function (l) {
        return l === clusterLayer;
    }
});
map.addInteraction(hover);

// When the mouse enters a cluster point, generate and display a polygon 
// that encompasses all of its component points.
hover.on("enter", function (e) {
    let h = e.feature.get("convexHull");
    if (!h) {
        let cluster = e.feature.get("features");
        // calculate polygon (convex hull)
        if (cluster && cluster.length) {
            let c = [];
            for (let i = 0, f; f = cluster[i]; i++) {
                c.push(f.getGeometry().getCoordinates());
            }
            h = ol.coordinate.convexHull(c);
            e.feature.get("convexHull", h);
        }
    }
    vector.getSource().clear();
    if (h.length > 2)
        vector.getSource().addFeature(new ol.Feature(new ol.geom.Polygon([h])));
});

// When the mouse exits a cluster point, remove its polygon.
hover.on("leave", function (e) {
    vector.getSource().clear();
});
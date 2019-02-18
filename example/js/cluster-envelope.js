const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~' // please go to https://cloud.thinkgeo.com to create

//Create default layer
let defaultLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
        tileSize: 512,
    }),
});

//Create map
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,

    //Add default layers
    layers: [defaultLayer],
    target: 'map',
    view: new ol.View({

        //Make Chicago the center of the map
        center: ol.proj.fromLonLat([-87.640620, 41.75423]),
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 12,
        progressiveZoom: false,

    })
})

//Map full screen control
map.addControl(new ol.control.FullScreen());

let styleCache = {};
// Style for the clusters
const getStyle = function (feature, resolution) {

    // Define different styles according to the length of feature
    let size = feature.get('features').length;
    let style = styleCache[size];

    //Define the color division criteria
    if (!style) {
        let color;
        const xxl = 100;
        const xl = 50;
        const max = 20;
        const middle = 10
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

        //Define the radius criteria
        let radius = Math.max(8, Math.min(size * 1.5, 20));
        style = styleCache[size] = [new ol.style.Style({
            image: new ol.style.Circle({
                radius: radius + 3,
                stroke: new ol.style.Stroke({
                    color: "rgba(" + color + ",0.4)",
                    width: 4
                })
            })
        }),

        //Set the style
        new ol.style.Style({
            image: new ol.style.Circle({
                radius: radius,
                fill: new ol.style.Fill({
                    color: "rgba(" + color + ",0.8)"
                })
            }),
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
}

//Read data file
const getJson = () => {
    let readTextFile = new Promise(function (resolve, reject) {

        //Can be replaced with your local data or network data
        let file = "../data/crime.json"; //The data source is https://catalog.data.gov/dataset and the data is preprocessed
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

// Add Clustered  features
let features = [];
let clusterLayer;
getJson().then((data) => {
    let result = JSON.parse(data);
    for (let i = 0, length = result.length; i < length; i++) {
        let point = ol.proj.fromLonLat(result[i].geometry.coordinates);
        features[i] = new ol.Feature(new ol.geom.Point(point));
        features[i].set('id', i);
    }

    // Cluster Source
    let spacerDistance=40
    let clusterSource = new ol.source.Cluster({

        //The spacing between clusters
        distance: spacerDistance,
        source: new ol.source.Vector()
    });
    clusterSource.getSource().clear();
    clusterSource.getSource().addFeatures(features);

    // Animated cluster layer
    clusterLayer = new ol.layer.AnimatedCluster({
        name: 'Cluster',
        source: clusterSource,
        style: getStyle
    });
    map.addLayer(clusterLayer);
});

// Add hover interaction that draw polygon (convex hull) area of the points that were used to build the cluster point.

// New layer
let vector = new ol.layer.Vector({
    source: new ol.source.Vector()
})
vector.setMap(map);

//Define new hover interactions
let hover = new ol.interaction.Hover({
    cursor: "pointer",
    layerFilter: function (l) {
        return l === clusterLayer;
    }
});
map.addInteraction(hover);

//Mousemove
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
    if (h.length > 2) vector.getSource().addFeature(new ol.Feature(new ol.geom.Polygon([h])));
});

//Mouseleave
hover.on("leave", function (e) {
    vector.getSource().clear();
});
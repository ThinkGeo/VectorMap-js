const menuData = [{
    dataTarget: 'base-Maps',
    styleName: 'Base Maps',
    subitems: [{
        comments: "Example of  using  mapsuite.VectorTileLayer",
        title: 'Cloud Vector Maps',
        htmlPath: './html/cloud-vector-maps.html',
        jsPath: './js/cloud-vector-maps.js'
    }, {
        comments: 'Example of  using cloud raster source',
        title: 'Cloud Raster Maps',
        htmlPath: './html/cloud-raster-maps.html',
        jsPath: './js/cloud-raster-maps.js'
    }, {
        comments: 'Example of  satellite map with labels using stylejson ',
        title: 'Satellite with Labels ',
        htmlPath: './html/satellite-with-labels.html',
        jsPath: './js/satellite-with-labels.js'
    }, {
        comments: 'Example of imagery map with labels using stylejson',
        title: 'Imagery with Labels  ',
        htmlPath: './html/imagery-with-labels.html',
        jsPath: './js/imagery-with-labels.js'
    }, {
        comments: 'Example of Retina / HiDPI mercator tiles (512x512px) available as XYZ.',
        title: 'Retina Maps ',
        htmlPath: './html/retina-maps.html',
        jsPath: './js/retina-maps.js'
    }
    ]
}, {
    dataTarget: 'statistics',
    styleName: 'Statistics',
    subitems: [{
        comments: 'Global seismic distribution map in 2012',
        title: 'Heatmap with KML',
        htmlPath: './html/heatmap-KML.html',
        jsPath: './js/heatmap-KML.js'
    }, {
        comments: 'Map of pedestrian flow in hangzhou subway',
        title: 'Heatmap with GeoJSON',
        htmlPath: './html/heatmap-json.html',
        jsPath: './js/heatmap-json.js'
    }, {
        comments: 'Rainfall distribution in China at 17:00 on oct 16 , 2018',
        title: 'Contour Line',
        htmlPath: './html/contour-line.html',
        jsPath: './js/contour-line.js'
    }, {
        comments: 'Rainfall distribution in China at 17:00 on oct 16 , 2018',
        title: 'Contour Plane',
        htmlPath: './html/contour-plane.html',
        jsPath: './js/contour-plane.js'
    }, {
        comments: "PM2.5 in China's major cities",
        title: 'Scatter',
        htmlPath: './html/scatter.html',
        jsPath: './js/scatter.js'
    }, {
        comments: 'Browser share analysis for some U.S. states',
        title: 'Pie Chart',
        htmlPath: './html/pie-chart.html',
        jsPath: './js/pie-chart.js'
    }, {
        comments: 'Atmospheric analysis in some states of the United States',
        title: 'AQI Radar',
        htmlPath: './html/AQI-radar.html',
        jsPath: './js/AQI-radar.js'
    }, {
        comments: 'This example shows how to do clustering on point features.',
        title: 'Cluster Envelope',
        htmlPath: './html/cluster-envelope.html',
        jsPath: './js/cluster-envelope.js'
    }, {
        comments: 'ol.source.HexBin aggregates features on hexagonal grid. Hexagonal binning (heatmaps) provide a convenient way to visualize density.',
        title: 'Hexagon',
        htmlPath: './html/hexagon.html',
        jsPath: './js/hexagon.js'
    }, {
        comments: 'Average round trip commute time',
        title: 'Average Round Trip Commute Time',
        htmlPath: './html/trip-commute-time.html',
        jsPath: './js/trip-commute-time.js'
    }]
}, {
    dataTarget: 'styling',
    styleName: 'Styling',
    subitems: [{
        comments: 'Styling Points with Map Suite StyleJSON ',
        title: 'Styling Points',
        htmlPath: './html/styling-points.html',
        jsPath: './js/styling-points.js'
    }, {
        comments: 'Styling Lines with Map Suite StyleJSON',
        title: 'Styling Lines',
        htmlPath: './html/styling-lines.html',
        jsPath: './js/styling-lines.js'
    }, {
        comments: 'Styling Polygons with Map Suite StyleJSON',
        title: 'Styling Polygons',
        htmlPath: './html/styling-polygons.html',
        jsPath: './js/styling-polygons.js'
    }, {
        comments: 'Styling Label with Map Suite StyleJSON',
        title: 'Labeling Features',
        htmlPath: './html/labeling-features.html',
        jsPath: './js/labeling-features.js'
    }, {
        comments: 'Uses an overlay to create a popup.',
        title: 'Marking Places',
        htmlPath: './html/marking-places.html',
        jsPath: './js/marking-places.js'
    }]
}, {
    dataTarget: 'vector-data',
    styleName: 'Vector Data',
    subitems: [{
        comments: 'Example of vector data with Map Suite StyleJSON.',
        title: 'Vector Tile',
        htmlPath: './html/vector-tile.html',
        jsPath: './js/vector-tile.js'
    }, {
        comments: 'Example of GeoJSON features with Map Suite StyleJSON.',
        title: 'GeoJSON ',
        htmlPath: './html/geojson.html',
        jsPath: './js/geojson.js'
    }, {
        comments: 'Example of KML features with Map Suite StyleJSON.',
        title: 'KML ',
        htmlPath: './html/KML.html',
        jsPath: './js/KML.js'
    }, {
        comments: 'Example of WFS features with Map Suite StyleJSON.',
        title: 'WFS ',
        htmlPath: './html/WFS.html',
        jsPath: './js/WFS.js'
    }, {
        comments: 'Example of WKT features with Map Suite StyleJSON.',
        title: 'WKT ',
        htmlPath: './html/WKT.html',
        jsPath: './js/WKT.js'
    }, {
        comments: 'Example of GPX features with Map Suite StyleJSON.',
        title: 'GPX ',
        htmlPath: './html/GPX.html',
        jsPath: './js/GPX.js'
    }, {
        comments: 'Different coordinate systems display maps',
        title: 'Projection ',
        htmlPath: './html/projection.html',
        jsPath: './js/projection.js'
    }]
}, {
    dataTarget: 'thinkGeo-cloud',
    styleName: 'ThinkGeo Cloud',
    subitems: [{
        comments: 'Get the elevation of points along a line.',
        title: 'Elevation along Path ',
        htmlPath: './html/elevation.html',
        jsPath: './js/elevation.js'
    }, {
        comments: 'Reverse geocode a point.',
        title: 'Reverse Geocoding',
        htmlPath: './html/reverse-geocoding.html',
        jsPath: './js/reverse-geocoding.js'
    }, {
        comments: 'Get a family of colors based on different options.',
        title: 'Color Utilities ',
        htmlPath: './html/color-creation.html',
        jsPath: './js/color-creation.js'
    }]
}, {
    dataTarget: 'JavaScript-frameworks',
    styleName: 'JavaScript Frameworks',
    subitems: [{
        comments: 'Support the JQuery',
        title: 'JQuery',
        htmlPath: './html/jquery.html',
        jsPath: './js/Jquery.js'
    }, {
        comments: 'Support the Angular',
        title: 'Angular ',
        htmlPath: './html/angular.html',
        jsPath: './js/angular/angular.js'
    }, {
        comments: 'Support the React JS',
        title: 'React JS',
        htmlPath: './html/react.html',
        jsPath: './js/react.js'
    }, {
        comments: 'Support the React Vue.JS',
        title: 'Vue.JS',
        htmlPath: './html/vue.html',
        jsPath: './js/vue.js'
    }]
},];
export default menuData;
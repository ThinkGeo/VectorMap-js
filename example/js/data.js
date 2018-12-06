const menuData = [{
    dataTarget: 'base-Maps',
    styleName: 'Base Maps',
    subitems: [{
        comments: "A set of beautiful Open Map Styles for vector tiles to generate a beautiful vector-based map in browsers and on mobile devices.",
        title: 'Cloud Vector Maps',
        htmlPath: './html/cloud-vector-maps.html',
        jsPath: './js/cloud-vector-maps.js'
    }, {
        comments: 'Shows how to consume the raster-tile based services from any providers via XYZ, WMS, WMTS etc.',
        title: 'Cloud Raster Maps',
        htmlPath: './html/cloud-raster-maps.html',
        jsPath: './js/cloud-raster-maps.js'
    }, {
        comments: 'Shows how to draw the labels from Vector Tile and overlap them correctly on the top of a satallite map.',
        title: 'Satellite with Labels ',
        htmlPath: './html/satellite-with-labels.html',
        jsPath: './js/satellite-with-labels.js'
    }, {
        comments: 'Overlapping the labels from Vector tile on global light map at night since 2012, it helps dig geography, polulation and more. ',
        title: 'Imagery with Labels  ',
        htmlPath: './html/imagery-with-labels.html',
        jsPath: './js/imagery-with-labels.js'
    }, {
        comments: 'Displays basemaps at higher resolutions on retina devices. In this example, the map tiles are requested with \'@2x\' parameter.',
        title: 'Retina Maps ',
        htmlPath: './html/retina-maps.html',
        jsPath: './js/retina-maps.js'
    }]
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
        comments: 'Styling Frisco school poi with Map Suite StyleJSON ',
        title: 'Styling Points',
        htmlPath: './html/styling-points.html',
        jsPath: './js/styling-points.js'
    }, {
        comments: 'Styling rivers of europe with Map Suite StyleJSON',
        title: 'Styling Lines',
        htmlPath: './html/styling-lines.html',
        jsPath: './js/styling-lines.js'
    }, {
        comments: 'Styling polygons with Map Suite StyleJSON',
        title: 'Styling Polygons',
        htmlPath: './html/styling-polygons.html',
        jsPath: './js/styling-polygons.js'
    }, {
        comments: 'Styling Label of Frisco block  with Map Suite StyleJSON',
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
        comments: 'Example of GeoJSON features with labels.',
        title: 'GeoJSON ',
        htmlPath: './html/geojson.html',
        jsPath: './js/geojson.js'
    }, {
        comments: 'Rendering KML with a vector source.',
        title: 'KML ',
        htmlPath: './html/KML.html',
        jsPath: './js/KML.js'
    }, {
        comments: 'EThis example loads new features from GeoServer WFS.',
        title: 'WFS ',
        htmlPath: './html/WFS.html',
        jsPath: './js/WFS.js'
    }, {
        comments: 'Create features from geometries in WKT (Well Known Text) format..',
        title: 'WKT ',
        htmlPath: './html/WKT.html',
        jsPath: './js/WKT.js'
    }, {
        comments: 'Example of using the GPX source..',
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
        comments: `Get the elevation of points along a line on <a href="https://cloud.thinkgeo.com/login.html">Thinkgeo  Cloud Service</a>.`,
        title: 'Elevation along Path ',
        htmlPath: './html/elevation.html',
        jsPath: './js/elevation.js'
    }, {
        comments: 'Reverse geocode a point <a href="https://cloud.thinkgeo.com/login.html">Thinkgeo  Cloud Service</a>.',
        title: 'Reverse Geocoding',
        htmlPath: './html/reverse-geocoding.html',
        jsPath: './js/reverse-geocoding.js'
    }, {
        comments: 'Get a family of colors based on different options <a href="https://cloud.thinkgeo.com/login.html">Thinkgeo  Cloud Service</a>.',
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
}, ];
export default menuData;
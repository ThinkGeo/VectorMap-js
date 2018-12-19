const menuData = [{
    dataTarget: 'thinkGeo-cloud-maps',
    styleName: 'ThinkGeo Cloud Maps',
    subitems: [{
        comments: "A set of beautiful Open Map Styles for vector tiles to generate a beautiful vector-based map in browsers and on mobile devices.",
        title: 'Vector Maps',
        htmlPath: './html/cloud-vector-maps.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/BGXGrb',
        jsPath: './js/cloud-vector-maps.js'
    }, {
        comments: 'Shows how to consume the raster-tile based services from any providers via XYZ, WMS, WMTS etc.',
        title: 'Raster Maps',
        htmlPath: './html/cloud-raster-maps.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/vQoQMQ',
        jsPath: './js/cloud-raster-maps.js'
    }, {
        comments: 'Shows how to draw the labels from Vector Tile and overlap them correctly on the top of a hybrid map.',
        title: 'Hybrid Maps',
        htmlPath: './html/satellite-with-labels.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/KrObdg',
        jsPath: './js/satellite-with-labels.js'
    }, {
        comments: 'Displays basemaps at higher resolutions on retina devices. In this example, the map tiles are requested with \'@2x\' parameter.',
        title: 'Raster Maps (High Resolution)',
        htmlPath: './html/retina-maps.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/NEQeXR',
        jsPath: './js/retina-maps.js'
    }, {
        comments: 'Overlapping the labels from Vector tile on global light raster map from NASA at night since 2012, it helps dig geography, polulation and more. ',
        title: 'Vector Maps on Custom Imagery',
        htmlPath: './html/imagery-with-labels.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/aQePBG',
        jsPath: './js/imagery-with-labels.js'
    }]
}, {
    dataTarget: 'ThinkGeo-cloud-services',
    styleName: 'ThinkGeo Cloud Services',
    subitems: [{
        comments: `Get the elevation of points along a line on <a href="https://cloud.thinkgeo.com/login.html">Thinkgeo  Cloud Service</a>.`,
        title: 'Get Elevation Along Path',
        htmlPath: './html/elevation.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/mabbKm',
        jsPath: './js/elevation.js'
    }, {
        comments: 'Reverse geocode a point <a href="https://cloud.thinkgeo.com/login.html">Thinkgeo  Cloud Service</a>.',
        title: 'Find Nearby Places',
        htmlPath: './html/reverse-geocoding.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/gZYOae',
        jsPath: './js/reverse-geocoding.js'
    }, {
        comments: 'Get a family of colors based on different options <a href="https://cloud.thinkgeo.com/login.html">Thinkgeo  Cloud Service</a>.',
        title: 'Generate Color Themes',
        htmlPath: './html/color-creation.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/ZVzEgL',
        jsPath: './js/color-creation.js'
    },
    {
        comments: 'Get a family of colors based on different options <a href="https://cloud.thinkgeo.com/login.html">Thinkgeo  Cloud Service</a>.',
        title: "Find an Address in the US",
        htmlPath: './html/find-address.html',
        codePenUrl: '#',
        jsPath: './js/find-address.js'
    }]
}, {
    dataTarget: 'display-your-data',
    styleName: 'Display Your Data',
    subitems: [{
        comments: 'Styling Frisco school poi with Map Suite StyleJSON ',
        title: 'Render POIs',
        htmlPath: './html/styling-points.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/PxMrdV',
        jsPath: './js/styling-points.js'
    }, {
        comments: 'This example loads new features from GeoServer WFS.',
        title: 'Work with WFS ',
        htmlPath: './html/WFS.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/KrOjYV',
        jsPath: './js/WFS.js'
    }, {
        comments: 'Create features from geometries in WKT (Well Known Text) format..',
        title: 'Work with WKT ',
        htmlPath: './html/WKT.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/ZmgdgL',
        jsPath: './js/WKT.js'
    }, {
        comments: 'Example of using the GPX source..',
        title: 'Work with GPX ',
        htmlPath: './html/GPX.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/LXwwPm',
        jsPath: './js/GPX.js'
    }]
}, {
    dataTarget: 'designing-with-styleJSON',
    styleName: 'Designing with StyleJSON',
    subitems: [{
        comments: 'Example of vector data with Map Suite StyleJSON.',
        title: 'Style ThinkGeo Maps',
        htmlPath: './html/vector-tile.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/XyvLxp',
        jsPath: './js/vector-tile.js'
    }, {
        comments: 'Styling rivers of europe with Map Suite StyleJSON',
        title: 'Style Lines',
        htmlPath: './html/styling-lines.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/VVoJGx',
        jsPath: './js/styling-lines.js'
    },
    {
        comments: 'Example of GeoJSON features with labels.',
        title: 'Style GeoJSON  ',
        htmlPath: './html/geojson.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/MzNMze',
        jsPath: './js/geojson.js'
    }, {
        comments: 'Styling polygons with Map Suite StyleJSON',
        title: 'Style Polygons',
        htmlPath: './html/styling-polygons.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/qQezZR',
        jsPath: './js/styling-polygons.js'
    }, {
        comments: 'Rendering KML with a vector source.',
        title: 'Style KML ',
        htmlPath: './html/KML.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/EOqBMv',
        jsPath: './js/KML.js'
    }, {
        comments: 'Styling Label of Frisco block  with Map Suite StyleJSON',
        title: 'Labeling Features',
        htmlPath: './html/labeling-features.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/MzNMqy',
        jsPath: './js/labeling-features.js'
    }]
}, {
    dataTarget: 'popular-use-cases',
    styleName: 'Popular Use Cases',
    subitems: [{
        comments: 'The distribution of global earthquake above 5 till 2012 is graphically presentated with heat map. The data is read from a *.kml file.',
        title: 'Global Earthquake Distribution',
        htmlPath: './html/heatmap-KML.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/jQgXxm',
        jsPath: './js/heatmap-KML.js'
    }, {
        comments: 'The statistics of road congestion is graphically presentated with heat map. The data is read from a geojson file. ',
        title: 'Road Congestion Heatmap',
        htmlPath: './html/heatmap-json.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/aQePxX',
        jsPath: './js/heatmap-json.js'
    }, {
        comments: 'The statistics of rainfall distribution in China at 17:00 on oct 16, 2018 is converted into isoline map. ',
        title: 'Precipitation Distribution',
        htmlPath: './html/contour-line.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/gQVqbw',
        jsPath: './js/contour-line.js'
    }, {
        comments: "A bubble map show average total yearly precipitation for each the US state.",
        title: 'Scatter',
        htmlPath: './html/scatter.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/qQevoP',
        jsPath: './js/scatter.js'
    }, {
        comments: 'Educational attainment for adults age 25 and older for the U.S., States, and counties, 2012-2016.',
        title: 'Pie Chart',
        htmlPath: './html/pie-chart.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/gQVEZq',
        jsPath: './js/pie-chart.js'
    }, {
        comments: 'The analysis of atmospheric in some states of the United States are geographically shown up. ',
        title: 'AQI Radar',
        htmlPath: './html/AQI-radar.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/EOqJyQ',
        jsPath: './js/AQI-radar.js'
    }, {
        comments: 'An example shows how to display huge point data on the map with cluster strategy.',
        title: 'Cluster Envelope',
        htmlPath: './html/cluster-envelope.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/RqXORO',
        jsPath: './js/cluster-envelope.js'
    }, {
        comments: 'Features in data are aggregated on hexagonal grid. Hexagonal binning (heatmaps) provide a convenient way to visualize density.',
        title: 'Hexagon',
        htmlPath: './html/hexagon.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/VVoOvL',
        jsPath: './js/hexagon.js'
    }, {
        comments: 'The statistics of average round trip commute time in cities of United States.',
        title: 'Commute time in the US',
        htmlPath: './html/trip-commute-time.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/KrOLdo',
        jsPath: './js/trip-commute-time.js'
    }]
}, {
    dataTarget: 'JavaScript-frameworks',
    styleName: 'JavaScript Frameworks',
    subitems: [{
        comments: 'Support the JQuery',
        title: 'JQuery',
        htmlPath: './html/jquery.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/dwbPoq',
        jsPath: './js/Jquery.js'
    }, {
        comments: 'Support the Angular',
        title: 'Angular ',
        htmlPath: './html/angular.html',
        codePenUrl: '',
        jsPath: './js/angular/angular.js'
    }, {
        comments: 'Support the React JS',
        title: 'React JS',
        htmlPath: './html/react.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/pqzvRR',
        jsPath: './js/react.js'
    }, {
        comments: 'Support the React Vue.JS',
        title: 'Vue.JS',
        htmlPath: './html/vue.html',
        codePenUrl: 'https://codepen.io/thinkgeo/pen/VqZYWg',
        jsPath: './js/vue.js'
    }]
},];
export default menuData
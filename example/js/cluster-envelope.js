 const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~';

 let satelliteLayer = new ol.layer.Tile({
     source: new ol.source.XYZ({
         url: "https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png" +
             "?apiKey=v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~",
         tileSize: 512,
     }),
 });

 let map = new ol.Map({
     loadTilesWhileAnimating: true,
     loadTilesWhileInteracting: true,
     layers: [satelliteLayer],
     target: 'map',
     view: new ol.View({
         center: ol.proj.fromLonLat([-96.79620, 38.79423]),
         zoom: 5,
         progressiveZoom: false,

     })
 })

 let styleCache = {};

 const getStyle = function (feature, resolution) {
     let size = feature.get('features').length;
     let style = styleCache[size];
     if (!style) {
         let color = size > 8 ? "248, 128, 0" : size > 2 ? "248, 192, 0" : "128, 192, 64";
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


 // Add 2000 features
 let ext = map.getView().calculateExtent(map.getSize());
 let features = [];
 let getJson = () => {
     let readTextFile = new Promise(function (resolve, reject) {
         let file = "../data/GeocodingResult.JSON";
         var rawFile = new XMLHttpRequest();
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

 getJson().then((data) => {
     let result = JSON.parse(data);
     for (let i = 0, length = result.length; i < length; i++) {
         let point = ol.proj.fromLonLat(result[i].coordinate);
         features[i] = new ol.Feature(new ol.geom.Point(point));
         features[i].set('id', i);
     }

    //  for (let i = 0; i < 2000; ++i) {
    //      features[i] = new ol.Feature(new ol.geom.Point([ext[0] + (ext[2] - ext[0]) * Math.random(), ext[1] + (ext[3] - ext[1]) * Math.random()]));
    //      features[i].set('id', i);
    //  }

     // Cluster Source
     let clusterSource = new ol.source.Cluster({
         distance: 40,
         source: new ol.source.Vector()
     });
     clusterSource.getSource().clear();
     clusterSource.getSource().addFeatures(features);

     // Animated cluster layer
     let clusterLayer = new ol.layer.AnimatedCluster({
         name: 'Cluster',
         source: clusterSource,
         style: getStyle
     });
     map.addLayer(clusterLayer);
 });

 //   for (let i = 0; i < 2000; ++i) {
 //       features[i] = new ol.Feature(new ol.geom.Point([ext[0] + (ext[2] - ext[0]) * Math.random(), ext[1] + (ext[3] - ext[1]) * Math.random()]));
 //       features[i].set('id', i);
 //   }
 //   clusterSource.getSource().clear();
 //   clusterSource.getSource().addFeatures(features);

 // Add over interaction that draw hull in a layer
 let vector = new ol.layer.Vector({
     source: new ol.source.Vector()
 })
 vector.setMap(map);

 let hover = new ol.interaction.Hover({
     cursor: "pointer",
     layerFilter: function (l) {
         return l === clusterLayer;
     }
 });
 map.addInteraction(hover);
 hover.on("enter", function (e) {
     let h = e.feature.get("convexHull");
     if (!h) {
         let cluster = e.feature.get("features");
         // calculate convex hull
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
 hover.on("leave", function (e) {
     vector.getSource().clear();
 });
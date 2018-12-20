let satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png"
            + "?apiKey=Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~",
        tileSize: 512,
    }),
});

let vectorSource = new ol.source.Vector();

$.ajax({
    type: "get",
    url: "../data/hangzhou-tracks.json",
    success: function (data) {
        var points = [].concat.apply([], data.map(function (track) {
            return track.map(function (seg) {
                return seg.coord.concat([1]);
            });
        }));
        let map =  new ol.Map({                         
            loadTilesWhileAnimating: true,                         
            loadTilesWhileInteracting: true,
            layers: [satelliteLayer],
            target: 'map',
            view: new ol.View({
                center: ol.proj.fromLonLat([120.10886859566, 30.235956526643]),
                maxZoom: 19,maxResolution: 40075016.68557849 / 512,zoom: 13,
                minZoom: 2,
                progressiveZoom: false,

            })
        });
        var vectorSource = new ol.source.Vector()
        var featuresArr = [];
        for (let i = 0; i < points.length; i++) {
            let coord = points[i].slice(0, 2);
            //The latitude and longitude are converted to xy coordinates

            coord = ol.proj.transform(coord, 'EPSG:4326', 'EPSG:3857');
            // coord = map.getPixelFromCoordinate(coord)

            var pointFeature = new ol.Feature({
                geometry: new ol.geom.Point(coord),
                weight: 20 // e.g. temperature
            });
            featuresArr.push(pointFeature)
        }
        vectorSource.addFeatures(featuresArr);
        let heatMapLayer = new ol.layer.Heatmap({
            source: vectorSource,
            blur: 15,
            radius: 6,
            gradient: ['#00f', '#0ff', '#0f0', '#ff0', '#f00']
        });
        map.addLayer(heatMapLayer)
    }
})


WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~';

const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json";

let worldStreetLayer = new ol.mapsuite.VectorTileLayer(worldstreetsStyle, {
    'apiKey': apiKey,
});

let satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png"
            + "?apiKey=v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~",
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
        let map = new ol.Map({
            layers: [satelliteLayer],
            target: 'map',
            view: new ol.View({
                center: ol.proj.fromLonLat([120.15886859566, 30.235956526643]),
                zoom: 14,
                minZoom: 2
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


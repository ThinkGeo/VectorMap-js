WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~';

const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/dark.json";

let worldStreetLayer = new ol.mapsuite.VectorTileLayer(worldstreetsStyle, {
    'apiKey': apiKey,
});

let satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png"
            + "?apiKey=v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~",
        tileSize: 512,
    }),
});

let map = new ol.Map({
    layers: [satelliteLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-99.097118, 38.915238]),
        zoom: 5,
        minZoom: 2
    })
})

let getHeatmapJson = (url) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest;
        xhr.open("GET", url);

        xhr.send();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                resolve(xhr.responseText)
            }
        }
    })
}
let minutesLayer = null;
let minutesStyleFn = (f, res) => {
    let color, radius;
    let minute = f.get("minute")
    if (minute >= 23 && minute < 36) {
        color = '#20D5BA';
        radius = 3;
    } else if (minute >= 36 && minute < 42) {
        color = "#4ADD19";
        radius = 5
    } else if (minute >= 42 && minute < 48) {
        color = "#E7E427";
        radius = 7
    } else if (minute >= 48 && minute < 56) {
        color = "#E08B1C";
        radius = 9
    } else if (minute >= 56 && minute < 77) {
        color = "#E22510";
        radius = 11
    }
    return [new ol.style.Style({
        image: new ol.style.Circle({
            radius: f.get('radius') || radius,
            stroke: new ol.style.Stroke({
                color: "#fff",
                width: 0.5
            }),
            fill: new ol.style.Fill({
                color: color
            })
        })
    })];
};
getHeatmapJson("../data/cummute.json").then((strData) => {
    let data = JSON.parse(strData);
    let vectorSource = new ol.source.Vector();
    let featuresArr = [];
    for (let i = 0; i < data.length; i++) {
        let coord = data[i].coordinate;
        coord = ol.proj.transform(coord, 'EPSG:4326', 'EPSG:3857');
        let pointFeature = new ol.Feature({
            geometry: new ol.geom.Point(coord),
            minute: data[i].minute * 2, // e.g. temperature
            name: data[i].name,
            featureType: "minuteFeature"
        });
        featuresArr.push(pointFeature);
    }
    vectorSource.addFeatures(featuresArr);
    minutesLayer = new ol.layer.Vector({
        source: vectorSource,
        style: minutesStyleFn,
        renderMode: 'image'
    });
    minutesLayer.set("layerName", "minutesLayer");
    minutesLayer.setVisible(true);
    map.addLayer(minutesLayer);
})
let animateI = document.querySelectorAll(".minutes i");
animateI.forEach((ele) => {
    ele.addEventListener("mouseover", (e) => {
        let min = e.target.getAttribute("data").split("-")[0];
        let max = e.target.getAttribute("data").split("-")[1];
        minutesLayer.getSource().getFeatures().forEach((feature) => {
            if (feature.get("minute") >= min && feature.get("minute") < max) {
                feature.set("radius", 13)
            }
        })

    })
    ele.addEventListener("mouseout", (e) => {
        minutesLayer.getSource().getFeatures().forEach((feature) => {
            feature.set("radius", null)
            feature.setStyle(minutesStyleFn)
        })
    })
})
let container = document.getElementById('popup');
let content = document.getElementById('popup-content');
let overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    offset: [-3, 5]
});
let displayFeatureInfo = (evt) => {
    let pixel = map.getEventPixel(evt.originalEvent);
    let feature = map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
    });
    if (feature && feature.get("featureType") === "minuteFeature") {
        let coord = feature.getGeometry().getCoordinates();
        content.innerHTML = `<p>
                    ${feature.get("name")}
                    </p><p>Round Drive Minutes:
                    ${feature.get("minute")}    
                        m</p>`;
        overlay.setPosition(coord)
        map.addOverlay(overlay)
    } else {
        map.removeOverlay(overlay);
    }
};
map.on('pointermove', function (evt) {
    if (evt.dragging) {
        return;
    }
    displayFeatureInfo(evt);
});
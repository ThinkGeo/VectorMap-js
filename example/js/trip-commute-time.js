// base map layer

let satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png"
            + "?apiKey=Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~",
        tileSize: 512,
    }),
});

//creat map

let map =  new ol.Map({                         
    loadTilesWhileAnimating: true,                         
    loadTilesWhileInteracting: true,
    layers: [satelliteLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-99.097118, 38.915238]),
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 4,
        minZoom: 2,
        progressiveZoom: false,
    })
})
map.addControl(new ol.control.FullScreen());
//get data

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

//add interaction

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
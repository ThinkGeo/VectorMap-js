WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

let layer = new ol.mapsuite.VectorTileLayer('../data/light.json', {
    'apiKey': 'Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~'
});

let map = new ol.Map({
    oadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [layer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.820787, 33.098294]),
        maxZoom: 19,maxResolution: 40075016.68557849 / 512,zoom: 15,
    }),
});

let getJson = () => {
    let readTextFile = new Promise(function (resolve, reject) {
        let file = "../data/light.json";
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

let json

getJson().then((data) => {
    json = JSON.parse(data);
})

const updatedWater = (poiSize, waterColor, buildingColor) => {
    let styles = json.styles;
    let stylesLength = styles.length;
    for (let i = 0; i < stylesLength; i++) {
        if (styles[i].id === 'poi_icon') {
            styles[i]['point-size'] = poiSize;
        } else if (styles[i].id === 'water') {
            styles[i]['polygon-fill'] = waterColor
        } else if (styles[i].id === 'building') {
            styles[i]['polygon-fill'] = buildingColor;
        }
    }
    return json;
}

const clickRefresh = (json) => {
    let layers = map.getLayers().getArray();
    map.removeLayer(layers[0]);
    let newLayer = new ol.mapsuite.VectorTileLayer(json, {
        'apiKey': 'Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~'
    });
    map.addLayer(newLayer);
}

new Vue({
    el: '#lines',
    data: {
        poiSize: 50,
        waterColor: '#0000CD',
        buildingColor: '#FFD700'
    },
    methods: {
        refresh: function () {
            let json = updatedWater(this.poiSize, this.waterColor, this.buildingColor);
            clickRefresh(json)
        }
    }
})
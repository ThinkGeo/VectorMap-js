const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';

let layer = new ol.mapsuite.VectorTileLayer('../data/light.json', {
    'apiKey': apiKey
});

let map;
let initializeMap = function () {
    map = new ol.Map({
        oadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        layers: [layer],
        target: 'map',
        view: new ol.View({
            center: ol.proj.fromLonLat([-96.917754, 33.087878]),
            maxResolution: 40075016.68557849 / 512,
            zoom: 15,
            minZoom: 1,
            maxZoom: 19
        }),
    });

    map.addControl(new ol.control.FullScreen());
}

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

let json;

getJson().then((data) => {
    json = JSON.parse(data);
})

//Updated map style
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

//Refresh
const clickRefresh = (json) => {
    let layers = map.getLayers().getArray();
    map.removeLayer(layers[0]);
    let newLayer = new ol.mapsuite.VectorTileLayer(json, {
        'apiKey': apiKey
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

WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/2.0.0/vectormap-icons.css"]
    },
    // The "active" property defines a function to call when the font has
    // finished downloading.  Here, we'll call our initializeMap method.
    active: initializeMap
});
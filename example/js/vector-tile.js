 
//Load icon font
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ['https://cdn.thinkgeo.com/vectormap-icons/2.0.0-beta004/vectormap-icons.css']
    }
});

//create default layer
let layer = new ol.mapsuite.VectorTileLayer('../data/vectortils_gray.json', {
    'apiKey': 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~'
});

//create map
let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [layer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-77.043745, 38.895620]),
        maxZoom: 19,
        maxResolution: 40075016.68557849 / 512,
        zoom: 15,
        minZoom: 2,
    }),
});

//Full screen interaction
map.addControl(new ol.control.FullScreen());

//load geojson file
let getJson = () => {
    let readTextFile = new Promise(function (resolve, reject) {
        let file = "../data/vectortils_gray.json";
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

//Parses a JSON string
let stylejson;
getJson().then((data) => {
    stylejson = JSON.parse(data);
})

//Updated style json by user input value
const updateStyleJson = (poiSize, waterColor, buildingColor, placement) => {
    let styles = stylejson.styles;
    let stylesLength = styles.length;
    for (let i = 0; i < stylesLength; i++) {
        if (styles[i].id === 'poi_icon') {
            styles[i]['point-size'] = poiSize;
        } else if (styles[i].id === 'water') {
            styles[i]['polygon-fill'] = '#'+waterColor
        } else if (styles[i].id === 'building') {
            styles[i]['polygon-fill'] = '#'+buildingColor
        } else if (styles[i].filter.match("layerName='road_name'")) {
            switch (placement) {
                case 'Line':
                    styles[i]['text-force-horizontal-for-line'] = false;
                    break;
                case 'Point':
                    styles[i]['text-force-horizontal-for-line'] = true;
                    styles[i]['text-spacing'] = 5;
                    styles[i]['text-min-distance'] = 5;
                    styles[i]['text-min-padding'] = 5;
                    break;
                default:
                    return;
            }
        }
    }
    //Add layer with new style json
    let layers = map.getLayers().getArray();
    map.removeLayer(layers[0]);
    let newLayer = new ol.mapsuite.VectorTileLayer(stylejson, {
        'apiKey': 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~'
    });
    map.addLayer(newLayer);
}

document.getElementById('generate').addEventListener('click',(generate)=>{
    let userInput={
        poiSize: document.getElementById('poiSize').value,
        waterColor: document.getElementById('water-color').value,
        buildingColor: document.getElementById('building-color').value,
        placement: document.getElementById('placement').value,
    }

    updateStyleJson(userInput.poiSize, userInput.waterColor, userInput.buildingColor, userInput.placement)
})
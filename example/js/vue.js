WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

let layer = new ol.mapsuite.VectorTileLayer('../data/light.json', {
    'apiKey': 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~'
});

let map = new ol.Map({
    oadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [layer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.820787, 33.098294]),
        zoom: 17,
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
    console.log(json)
})



new Vue({
    el: '#lines',
    data: {
        fontSize: 12,
        fontFamily: 'Calibri',
        fillColor: '#525255',
        placement: 'line'
    },
    methods: {
        refresh: function () {
            let text = blockMapStyle.getText();
            text.setFont(`${this.fontSize}px ${this.fontFamily},sans-serif`);
            text.getFill().setColor(this.fillColor);
            text.setPlacement(this.placement);
            blockMapLayer.setStyle(blockMapStyle);
        }
    }
})
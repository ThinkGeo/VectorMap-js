WebFont.load({
    custom: {
        families: ['vectormap-icons'],
        urls: ['https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css']
    }
});

const apiKey = 'Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~' // please go to https://cloud.thinkgeo.com to create

//layer style
let _styles = {
    bestMatchLocation: new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: '../image/point.png',
        })
    }),
    boundingBox: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: [0, 0, 255, 0.5],
            width: 1
        }),
        fill: new ol.style.Fill({ color: [0, 0, 255, 0.1] })
    }),
}

//creat result layer
const createGeocodingLayer = function () {
    let vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({ features: [] }),
        style: function (feature) {
            let key = feature.get('type');
            let style = _styles[key];
            return style;
        }
    });
    vectorLayer.set('name', 'geocodingLayer');
    return vectorLayer;
};


//render base map 
let baseMap = new ol.mapsuite.VectorTileLayer('https://cdn.thinkgeo.com/worldstreets-styles/1.0.0-beta009/light.json', {
    apiKey: apiKey,
});

let view = new ol.View({
    center: ol.proj.fromLonLat([-96.79620, 32.79423]),
    maxZoom: 19,
    maxResolution: 40075016.68557849 / 512,
    zoom: 3,
    minZoom: 2
})

let map = new ol.Map({
    layers: [baseMap, geocodingLayer = createGeocodingLayer()],
    target: 'map',
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    view: view
});


const geocoderResultNode = document.getElementById('geocoderResult');
const renderResult = ({ locations }) => {
    if (locations.length > 0) {
        let str = '';
        for (const item of locations) {
            str += `<li><a href="#" data-coordinatesX=${item.locationPoint.pointX} data-coordinatesY=${item.locationPoint.pointY}   data-boundingBox="${item.boundingBox}"> ${item.address} </a></li>`
        }
        geocoderResultNode.innerHTML = str
    } else {
        geocoderResultNode.innerHTML = `<li><a href="#">no result</a></li>`
    }
}

const renderBestMatchLoaction = (coordinatesX, coordinatesY, boundingBox) => {
    coordinates = [parseFloat(coordinatesX),parseFloat(coordinatesY)]
    let feature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(coordinates)),
        type: 'bestMatchLocation'
    });
    view.animate({
        center:  ol.proj.fromLonLat(coordinates),
        zoom:14,
        duration: 2000
    });
    geocodingLayer.getSource().addFeature(feature);
}

//Geocoder address
const geocoder = (val) => {
    const baseURL = 'https://cloud.thinkgeo.com/api/v1/location/geocode/';
    let url = `${baseURL}${val}?apikey=${apiKey}&MaxResults=5`;
    const time = 5000;
    let timeout = false;
    let request = new XMLHttpRequest();
    let timer = setTimeout(() => {
        timeout = true;
        request.abort();
    }, time);
    request.open("GET", url);

    request.onreadystatechange = () => {
        if (request.readyState !== 4) {
            return;
        }
        if (timeout) {
            return;
        }
        clearTimeout(timer);
        if (request.status === 200) {
            let data = JSON.parse(request.response).data;
            renderResult(data)
        }
    };
    request.send(null);
}

//User interaction
const address = document.getElementById('address')
address.addEventListener('change', () => {
    let value = address.value;
    geocoderResultNode.innerHTML = ''
    if (value) {
        geocoder(value)
    } else {
        geocoderResultNode.innerHTML = `<li><a href="#">Enter the address</a></li>`
    }
})

document.getElementById('geocoderResult').addEventListener('click', (e) => {
    let target = e.target;
    console.log(target.nodeName)
    if (target.nodeName == 'A') {
        let boundingBox = target.getAttribute('data-boundingBox');
        let coordinatesX = target.getAttribute('data-coordinatesX');
        let coordinatesY = target.getAttribute('data-coordinatesY');
        renderBestMatchLoaction(coordinatesX, coordinatesY, boundingBox)
    }
})


document.querySelector('#geocoder input').focus()
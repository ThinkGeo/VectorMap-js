WebFont.load({
    custom: {
        families: ['vectormap-icons'],
        urls: ['https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css']
    }
});

const apiKey = 'Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~' // please go to https://cloud.thinkgeo.com to create

//layer style
let _styles = {
    boundingBox: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: [0, 0, 255, 0.5],
            width: 1
        }),
        fill: new ol.style.Fill({ color: [0, 0, 255, 0.1] })
    }),
}


let focusIndex = null;
let resultsLength;

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

//render result

//   Elements that make up the popup.
const container = document.getElementById('popup');
container.classList.remove('hidden');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

let overlay = new ol.Overlay({
    element: container,
    autoPan: false,

});

closer.onclick = function () {
    overlay.setPosition(undefined);
    let source = geocodingLayer.getSource();
    source.clear();
    closer.blur();
    return false;
};

const popUp = function (address, coordinates, type) {
    overlay.setPosition(ol.proj.fromLonLat(coordinates));
    map.addOverlay(overlay);
    content.innerHTML = `<p class="address">${address}</p><p class="coodinates">${coordinates[1]},${coordinates[0]}</p>`
}

const geocoderResultNode = document.getElementById('geocoderResult');

const renderResult = ({ locations }) => {
    document.querySelector('.loading').classList.add('hidden');
    if (locations.length > 0) {
        resultsLength = locations.length;
        let str = '';
        let i = -1
        for (const item of locations) {
          
            i = i + 1;
            str += `<li><a data-coordinatesX=${(item.locationPoint.pointX).toFixed(6)} data-coordinatesY=${(item.locationPoint.pointY).toFixed(6)} data-index=${i}   data-boundingBox="${item.boundingBox}"" data-type=${item.locationType}> ${item.address} </a></li>`
        }
        geocoderResultNode.innerHTML = str;
    } else {
        geocoderResultNode.innerHTML = ''
    }
}

const renderBestMatchLoaction = (coordinatesX, coordinatesY, boundingBox, address, type) => {
    overlay.setPosition(undefined);
    let source = geocodingLayer.getSource();
    source.clear();
    coordinates = [parseFloat(coordinatesX), parseFloat(coordinatesY)];

    let format = new ol.format.WKT();
    let wktFeature = format.readFeature(boundingBox, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    });
    geocodingLayer.getSource().addFeature(wktFeature);
    if (type === 'Street') {
        view.animate({
            center: ol.proj.fromLonLat([parseFloat(coordinatesX), parseFloat(coordinatesY)]),
            zoom: 18,
            duration: 0
        });

    } else {
        wktFeature.set('type', 'boundingBox');
        view.fit(wktFeature.getGeometry(), {
            padding: [20, 20, 20, 20]
        })
    }

    popUp(address, coordinates, type);
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
            document.querySelector('.loading').classList.add('hidden');
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

//Tool function
const removeClass = () => {
    const nodeList = document.querySelectorAll('#geocoderResult a');
    for (let node of nodeList) {
        node.classList.remove('focus');
    }
}

const obtainParameter = (target) => {
    let boundingBox = target.getAttribute('data-boundingBox');
    let coordinatesX = target.getAttribute('data-coordinatesX');
    let coordinatesY = target.getAttribute('data-coordinatesY');
    let address = target.innerText;
    let type = target.getAttribute('data-type');
    renderBestMatchLoaction(coordinatesX, coordinatesY, boundingBox, address, type)
}

const compareFocusIndex = (flag) => {
    const nodeList = document.querySelectorAll('#geocoderResult a');
    for (let node of nodeList) {
        if (Number(node.getAttribute('data-index')) == focusIndex) {
            if (flag) {
                node.classList.add('focus');
                return
            } else {
                address.value = node.innerText;
                geocoderResultNode.innerHTML = '';
                obtainParameter(node)
            }
        }
    }
}

const moveFocus = (dir) => {
    removeClass()
    if (document.querySelector('.loading').classList.contains('hidden')) {
        if (focusIndex == null || focusIndex == resultsLength - 1) {
            focusIndex = 0
        } else if (focusIndex == -1) {
            focusIndex = resultsLength - 1
        } else {
            focusIndex = focusIndex + dir
        }
    }
    compareFocusIndex(true)
}

//User interaction
let timer = null;
const address = document.getElementById('address')
address.addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        overlay.setPosition(undefined);
        let source = geocodingLayer.getSource();
        source.clear();
        let value = address.value;
        focusIndex = null;
        if (value) {
            document.querySelector('.loading').classList.remove('hidden');
            geocoder(value)
        } else {
            geocoderResultNode.innerHTML = ''
        }
    }, 200);
})
document.getElementById('geocoderResult').addEventListener('click', (e) => {
    let target = e.target;
    if (target.nodeName == 'A') {
        removeClass();
        address.value = target.innerText;
        geocoderResultNode.innerHTML = '';
        focusIndex = Number(target.getAttribute('data-index'));
        obtainParameter(target)
    }
})
 
document.body.addEventListener('keydown', (e) => {
    switch (e.keyCode) {
        //up
        case 38:
            e.preventDefault();
            moveFocus(-1);
            break;
        // down
        case 40:
            e.preventDefault();
            moveFocus(1);
            break;
        case 13:
            if (focusIndex !== null) {
                compareFocusIndex(false)
            }
            break;
    }
})
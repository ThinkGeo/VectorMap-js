const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';
let currentPoint = [-77.0617786, 38.8947822];

if (!navigator.geolocation) {
    document.getElementsByClassName('your-location')[0].classList.add('hide');
}

let image = new Image();

const loading = document.getElementsByClassName('loading')[0];
const btnGroups = document.getElementsByClassName('btn-group')[0];
btnGroups.addEventListener('click', (e) => {
    const target = e.target;
    if (target.nodeName === "BUTTON") {
        const location = target.getAttribute('data-location');
        switch (location) {
            case 'your-location':
                navigator.geolocation.getCurrentPosition(showPosition, showError);
                break;
            case 'london':
                currentPoint = [-0.131833, 51.508734];
                getWmsMap(currentPoint);
                break;
            case 'newyork':
                currentPoint = [-73.975499, 40.725948];
                getWmsMap(currentPoint);
                break;
            case 'washington':
                currentPoint = [-77.0617786, 38.8947822];
                getWmsMap(currentPoint);
                break;
        }
    }
})

const showPosition = (position) => {
    currentPoint = [position.coords.longitude, position.coords.latitude];
    getWmsMap(currentPoint);
}

const showError = (error) => { //can't use the location information
    loading.classList.add('hide');
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert(`Couldn’t get a map of your location because permission was denied.`);
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.")
            break;
    }
}

const getWmsMap = (coord) => {
    image.setAttribute('src', '');
    loading.classList.remove('hide');
    const type = document.querySelector('.travel-row select').selectedOptions[0].value;
    let layers = 'WorldStreets';
    const xycoord = ol.proj.transform(coord, 'EPSG:4326', 'EPSG:3857');
    const width = locationImage.offsetWidth;
    const height = locationImage.offsetHeight;
    const size = [width, height];
    const center = xycoord;
    const resolution = 611.49622628141;
    bbox = getForViewAndSize(center, resolution, 0, size);
    const url = `https://cloud.thinkgeo.com/api/v1/maps/wms?Request=GetMap&Service=WMS&Layers=${layers}&Styles=${type}&Format=IMAGE%2FPNG&Transparent=true&Version=1.1.1&Width=${width}&Height=${height}&Srs=EPSG%3A3857&BBOX=${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}&apikey=${apiKey}`;
    image.src = url;
}

const view = new ol.View({
    center: ol.proj.fromLonLat([-96.79620, 32.79423]),
    zoom: 8,
    minZoom: 2,
    maxZoom: 19
})

const getForViewAndSize = (center, resolution, rotation, size, opt_extent) => {
    var dx = resolution * size[0] / 2;
    var dy = resolution * size[1] / 2;
    var cosRotation = Math.cos(rotation);
    var sinRotation = Math.sin(rotation);
    var xCos = dx * cosRotation;
    var xSin = dx * sinRotation;
    var yCos = dy * cosRotation;
    var ySin = dy * sinRotation;
    var x = center[0];
    var y = center[1];
    var x0 = x - xCos + ySin;
    var x1 = x - xCos - ySin;
    var x2 = x + xCos - ySin;
    var x3 = x + xCos + ySin;
    var y0 = y - xSin - yCos;
    var y1 = y - xSin + yCos;
    var y2 = y + xSin + yCos;
    var y3 = y + xSin - yCos;
    return createOrUpdate(
        Math.min(x0, x1, x2, x3), Math.min(y0, y1, y2, y3),
        Math.max(x0, x1, x2, x3), Math.max(y0, y1, y2, y3),
        opt_extent);
}

const createOrUpdate = (minX, minY, maxX, maxY, opt_extent) => {
    if (opt_extent) {
        opt_extent[0] = minX;
        opt_extent[1] = minY;
        opt_extent[2] = maxX;
        opt_extent[3] = maxY;
        return opt_extent;
    } else {
        return [minX, minY, maxX, maxY];
    }
}

getWmsMap(currentPoint);

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#locationImage').appendChild(image);
    document.querySelector('.travel-row select').addEventListener('change', function () {
        getWmsMap(currentPoint);
    })
});

image.onload = () => {
    loading.classList.add('hide');
};
image.onerror = () => {
    loading.classList.add('hide');
};
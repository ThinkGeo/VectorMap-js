const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';

if (!navigator.geolocation) {
    document.getElementsByClassName('your-location')[0].classList.add('hide');
}

let image = new Image();
document.querySelector('#locationImage').appendChild(image);

const loading = document.getElementsByClassName('loading')[0];
const btnGroups = document.getElementsByClassName('btn-group')[0];
btnGroups.addEventListener('click', (e) => {
    const target = e.target;
    if (target.nodeName === "BUTTON") {
        image.setAttribute('src', '');
        loading.classList.remove('hide');
        const location = target.getAttribute('data-location');
        switch (location) {
            case 'your-location':
                navigator.geolocation.getCurrentPosition(showPosition, showError);
                break;
            case 'london':
                getWmsMap([-0.131833, 51.508734], 8);
                break;
            case 'newyork':
                getWmsMap([-73.975499, 40.725948], 8);
                break;
            case 'washington':
                getWmsMap([-77.0617786, 38.8947822], 8);
                break;
        }
    }
})

const showPosition = (position) => {
    let coord = [position.coords.longitude, position.coords.latitude];
    getWmsMap(coord, 8);
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

const getWmsMap = (coord_) => {
    const xycoord = ol.proj.transform(coord_, 'EPSG:4326', 'EPSG:3857');
    const width = locationImage.offsetWidth;
    const height = locationImage.offsetHeight;
    const size = [width, height];
    const center = xycoord;
    const resolution = 611.49622628141;
    bbox = getForViewAndSize(center, resolution, 0, size);
    const url = `https://cloud.thinkgeo.com/api/v1/maps/wms?Request=GetMap&Service=WMS&Layers=WorldStreets&Styles=light&Format=IMAGE%2FPNG&Transparent=true&Version=1.1.1&Width=${width}&Height=${height}&Srs=EPSG%3A3857&BBOX=${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}&apikey=${apiKey}`;
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

getWmsMap([-77.0617786, 38.8947822], 8);

image.onload = () => { 
    loading.classList.add('hide');
};
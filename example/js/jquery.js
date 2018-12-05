WebFont.load({
    custom: {
        families: ['vectormap-icons'],
        urls: ['https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css']
    }
});


const styleJson = {
    light: 'https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json',
}
const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~'

let light = new ol.mapsuite.VectorTileLayer(styleJson.light, {
    apiKey: apiKey,
    layerName: 'light'
});

let view = new ol.View({
    center: ol.proj.fromLonLat([-96.804616, 33.120202]),
    zoom: 16,
})

let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [light],
    target: 'map',
    view: view
});


//   Elements that make up the popup.

const container = document.getElementById('popup');
container.classList.remove('hidden');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

let overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 2000
    }
});

closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

const popUp = function (address, centerCoordinate) {
    view.animate({
        center: centerCoordinate,
        duration: 2000
    });
    let addressArr = address.split(",");
    overlay.setPosition(centerCoordinate);
    map.addOverlay(overlay);
    let length = addressArr.length;
    content.innerHTML = '<p>' + (addressArr[0] || '') + ' ,' + '</p><p style="margin-left:2px">' + (addressArr[1] || '') + ',' + (addressArr[length - 2] || '') + (addressArr[4] || '') + ',' + (addressArr[length - 1] || '') + '</p>'
}

const reverseGeocode = function (coordinate) {


    const baseURL = 'https://cloud.thinkgeo.com/api/v1/location/reverse-geocode/';
    let getURL = `${baseURL}${coordinate}?apikey=${apiKey}&Srid=3857`;

    let jqxhr = $.get(getURL, function (data) {
        if (data.data.bestMatchLocation) {
            let address = data.data.bestMatchLocation.data.address;

            popUp(address, coordinate)

        } else {
            window.alert('No results found');
        }
    });

    jqxhr.fail(function (data) {
        window.alert('The decimal degree latitude value you provided was out of range.');
    })
}

map.addEventListener('click', function (evt) {
    let coordinate = evt.coordinate
    reverseGeocode(coordinate)
});
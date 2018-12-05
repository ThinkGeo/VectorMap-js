const styleJson = {
    light: 'https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json',
}
const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~'

let light = new ol.mapsuite.VectorTileLayer(styleJson.light, {
    apiKey: apiKey,
    layerName: 'light'
});

let view = new ol.View({
    center: ol.proj.fromLonLat([2.294792, 48.858561]),
    zoom: 15,
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
        center: ol.proj.fromLonLat([centerCoordinate[1], centerCoordinate[0]]),
        duration: 2000
    });
    console.log(address)
    let addressArr = address.split(",");
    console.log(addressArr)
    overlay.setPosition(ol.proj.fromLonLat([centerCoordinate[1], centerCoordinate[0]]));
    map.addOverlay(overlay)
    let length = addressArr.length
    content.innerHTML = '<p>' + (addressArr[0] || '') + ' ,' + '</p><p style="margin-left:2px">' + (addressArr[1] || '') + ',' + (addressArr[length - 2] || '') + (addressArr[4] || '') +','+ (addressArr[length - 1] || '') + '</p>'
}

const reverseGeocode = function () {
    let coordStr = document.getElementById('latlng').value;
    let centerCoordinate = [];
    if (coordStr.length > 0) {
        coordStr.split(",").forEach(function (item) {
            centerCoordinate.push(Number(item));
        });
    } else {
        $("#latlng").attr("placeholder").split(",").forEach(function (item) {
            centerCoordinate.push(Number(item));
        });
    }
    const baseURL = 'https://cloud.thinkgeo.com/api/v1/location/reverse-geocode/';
    let getURL = `${baseURL}${centerCoordinate[1]},${centerCoordinate[0]}?apikey=${apiKey}&Srid=4326`;

    let jqxhr = $.get(getURL, function (data) {
        if (data.data.bestMatchLocation) {
            let address = data.data.bestMatchLocation.data.address;

            popUp(address, centerCoordinate)

        } else {
            window.alert('No results found');
        }
    });

    jqxhr.fail(function (data) {
        window.alert('The decimal degree latitude value you provided was out of range.');
    })
}


document.getElementById('submit').addEventListener('click', function () {
    reverseGeocode()
});


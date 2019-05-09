const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';

const defaultLayer = new ol.mapsuite.VectorTileLayer('https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json', {
    apiKey: apiKey,
    layerName: 'light'
});

const view = new ol.View({
    center: ol.proj.fromLonLat([-96.79620, 32.79423]),
    maxResolution: 40075016.68557849 / 512,
    zoom: 3,
    minZoom: 2,
    maxZoom: 19
});
let timer;
let map;
const container = document.getElementById('popup');
const closer = document.getElementsByClassName('popup-closer')[0];
const overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    offset: [-13, 9]
});
closer.onclick = () => {
    overlay.setPosition(undefined);
};

const initializeMap = () => {
    map = new ol.Map({
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        layers: [defaultLayer],
        target: 'map',
        view: view
    });
    map.addControl(new ol.control.FullScreen());
    map.addOverlay(overlay);
    map.on('click', (e) => {
        overlay.setPosition(undefined);
        let coord = e.coordinate;
        let lonLatCoord = ol.proj.toLonLat(coord);
        getTimeZone(lonLatCoord, coord);
    });
}

const getTimeZone = (lonLatCoord, coord) => {
    const url = `https://cloud.thinkgeo.com/api/v1/timezones/${lonLatCoord[1]},${lonLatCoord[0]}?apiKey=${apiKey}`;
    const xhr = new XMLHttpRequest();
    const errorMessage = document.getElementById('error-message');
    xhr.open('get', url, true);
    xhr.send();
    xhr.onreadystatechange = () => {
        const errorModal = document.querySelector('#error-modal');
        errorModal.classList.add('hide');
        if (xhr.readyState === 4) {
            const res = JSON.parse(xhr.response);
            if (xhr.status === 200) {
                errorModal.classList.add('hide');
                errorMessage.classList.remove('show');
                const res = JSON.parse(xhr.response)
                const data = res.data;
                let localMoment = moment(data.currentLocalTime);
                let utcMoment = moment.utc(data.currentUtcTime);
                let utcOffsetHours = parseFloat(data.offsetSeconds) / 60 / 60;
                let offsetString = utcOffsetHours > 0 ? '+' + utcOffsetHours.toString() : utcOffsetHours.toString();

                document.querySelector('#popup-content').innerHTML = `
                <p><label>Time Zone: </label> ${data.timezone}</p>
                <p><label>Country: </label> ${data.countryName}</p>
                <p><label>Country Code: </label> ${data.countryCode}</p>
                <p><label>Comment: </label> ${data.comment}</p>
                <p><label>Current Local Time: </label> ${localMoment.format('MMM D, YYYY h:mm:ss A')}</p>                
                <p><label>Current UTC Time: </label> ${utcMoment.format('MMM D, YYYY h:mm:ss A')}</p>                
                <p><label>UTC Offset: </label> ${offsetString}</p>`;

                overlay.setPosition(coord);
            }
            if (xhr.status === 404) {
                if (timer !== undefined && timer !== null) {
                    clearTimeout(timer);
                }
                errorMessage.classList.add('show');
                timer = setTimeout(() => {
                    errorMessage.classList.remove('show');
                }, 5000)
            } else if (xhr.status === 401) {
                errorModal.classList.remove('hide');
                const messageHtml = `Your ThinkGeo Cloud API key is either unauthorized or missing.  Please check the API key being used and ensure it has access to the ThinkGeo Cloud services you are requesting.  You can create and manage your API keys at <a href="https://cloud.thinkgeo.com">https://cloud.thinkgeo.com</a>.`
                document.querySelector('#error-modal p').innerHTML = messageHtml;
            } else if (xhr.status === 403) {
                errorModal.classList.remove('hide');
                const messageHtml = `This ThinkGeo Cloud API key cannot be used.  Make sure you have changed the API key in this sample’s source code to a key from your own ThinkGeo Cloud account.  You can create and manage your API keys at <a href="https://cloud.thinkgeo.com">https://cloud.thinkgeo.com</a>.`
                document.querySelector('#error-modal p').innerHTML = messageHtml;
            }
        }
    }
}

WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/2.0.0/vectormap-icons.css"]
    },
    active: initializeMap
});

document.querySelector('#error-modal button').addEventListener('click', () => {
    document.querySelector('#error-modal').classList.add('hide');
})
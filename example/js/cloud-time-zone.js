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
        if(timer !== undefined && timer !== null){
            clearTimeout(timer);
        }
        overlay.setPosition(undefined);
        const coord = e.coordinate;
        getTimeZone(coord)
    });
}

const getTimeZone = (coord) => {
    const url = `https://cloud.thinkgeo.com/api/v1/timezones/${coord[1]},${coord[0]}?apiKey=${apiKey}&Srid=3857`;
    const xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.send();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 ) {
            if(xhr.status === 200){
                const res = JSON.parse(xhr.response)
                const data = res.data;
                document.querySelector('#popup-content').innerHTML = `
                <p><label>Timezone: </label> ${data.timezone}</p>
                <p><label>CountryName: </label> ${data.countryName}</p>
                <p><label>CountryCode: </label> ${data.countryCode}</p>
                <p><label>Comment: </label> ${data.comment}</p>
                <p><label>CurrentLocalTime: </label> ${data.currentLocalTime}</p>
                <p><label>CurrentUtcTime: </label> ${data.currentUtcTime}</p>
                <p><label>OffsetSeconds: </label> ${data.offsetSeconds}</p>`;
                overlay.setPosition(coord);
            }else if(xhr.status === 404){
                document.getElementById('error-message').classList.add('show');
                timer = setTimeout(()=>{
                    document.getElementById('error-message').classList.remove('show');
                },5000)
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
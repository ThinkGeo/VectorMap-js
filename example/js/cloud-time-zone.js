/*===========================================================================*/
// Get Time Zone for a Point
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. Tile Loading Event Handlers
//   4. Popup Setup
//   5. Time Zoom Performing Setup
//   6. ThinkGeo Map Icon Fonts
//   7. Event Listeners
/*===========================================================================*/


/*---------------------------------------------*/
// 1. ThinkGeo Cloud API Key
/*---------------------------------------------*/

// First, let's define our ThinkGeo Cloud API key, which we'll use to
// authenticate our requests to the ThinkGeo Cloud API.  Each API key can be
// restricted for use only from a given web domain or IP address.  To create your
// own API key, you'll need to sign up for a ThinkGeo Cloud account at
// https://cloud.thinkgeo.com.
const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';


/*---------------------------------------------*/
// 2. Map Control Setup
/*---------------------------------------------*/

// Now we'll create the base layer for our map.  The base layer uses the ThinkGeo
// Cloud Maps Vector Tile service to display a detailed street map.  For more
// info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles
let defaultLayer = new ol.mapsuite.VectorTileLayer('https://cdn.thinkgeo.com/worldstreets-styles/3.0.0/light.json', {
    apiKey: apiKey,
    layerName: 'light'
});

// Create a default view for the map when it starts up.
const view = new ol.View({
    // Center the map on the United States and start at zoom level 3.
    center: ol.proj.fromLonLat([-96.79620, 32.79423]),
    maxResolution: 40075016.68557849 / 512,
    zoom: 3,
    minZoom: 2,
    maxZoom: 19
});

// This function will create and initialize our interactive map.
// We'll call it later when our POI icon font has been fully downloaded,
// which ensures that the POI icons display as intended.
let map;
let clickCoord;
const initializeMap = () => {
    map = new ol.Map({
        renderer: 'webgl',
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        // Add our previously-defined ThinkGeo Cloud Vector Tile layer to the map.
        layers: [defaultLayer],
        // States that the HTML tag with id="map" should serve as the container for our map.
        target: 'map',
        view: view
    });
    // Add a button to the map that lets us toggle full-screen display mode.
    map.addControl(new ol.control.FullScreen());

    // Add a overlay panel to the map when click the map.
    map.addOverlay(overlay);
    map.on('click', (e) => {
        overlay.setPosition(undefined);
        clickCoord = e.coordinate;
        let lonLatCoord = ol.proj.toLonLat(clickCoord);
        // When click the map, perform our Time Zone service to get the time info.
        getTimeZone(lonLatCoord);
    });
}


/*---------------------------------------------*/
// 3. Tile Loading Event Handlers
/*---------------------------------------------*/

// These events allow you to perform custom actions when 
// a map tile starts loading, finishes loading successfully, 
// or encounters an error while loading.
const errorLoadingTile = (e) => {
    const errorModal = document.querySelector('#error-modal');
    if (errorModal.classList.contains('hide')) {
        // Set up a error tips when Tile loaded error.
        errorModal.classList.remove('hide');
        const messageHtml = `Your ThinkGeo Cloud API key is either unauthorized or missing.  Please check the API key being used and ensure it has access to the ThinkGeo Cloud services you are requesting.  You can create and manage your API keys at <a href="https://cloud.thinkgeo.com">https://cloud.thinkgeo.com</a>.`
        document.querySelector('#error-modal p').innerHTML = messageHtml;
    }
}

const setLayerSourceEventHandlers = (layer) => {
    let layerSource = layer.getSource();
    layerSource.on('tileloaderror', function (e) {
        errorLoadingTile(e);
    });
    layer.setSource(layerSource);
    return layer;
}

defaultLayer = setLayerSourceEventHandlers(defaultLayer);

/*---------------------------------------------*/
// 4. Popup Setup
/*---------------------------------------------*/

// Now, we need to create the popup container for our time zone data information. We'll create an 
// overlay which servers the popup container, and add it to our map. This popup panel will 
// show the infomation that we get from Time Zone service.
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


/*---------------------------------------------*/
// 5. Time Zoom Performing Setup
/*---------------------------------------------*/

// At this point we'll build up the methods and functionality that will  
// actually perform the Time Zone using the ThinkGeo Cloud and then 
// display the results on the popup.

// We use thinkgeocloudclient.js, which is an open-source Javascript SDK for making 
// request to ThinkGeo Cloud Service. It simplifies the process of the code of request.

// We need to create the instance of Time Zone client and authenticate the API key.
const tzClient = new tg.TimeZoneClient(apiKey);

// This method will recieve a coordinates array in decimal degreee. When 
// you click somewhere on the map, we'll call this method to perform Time Zone service.
let timer;
const getTimeZone = (lonLatCoord) => {
    const errorMessage = document.getElementById('error-message');
    const errorModal = document.querySelector('#error-modal');
    errorModal.classList.add('hide');
    tzClient.getTimeZoneByCoordinate(lonLatCoord[1], lonLatCoord[0], function (status, res) {
        if (status === 200) {
            errorModal.classList.add('hide');
            errorMessage.classList.remove('show');
            const data = res.data;
            let localMoment = moment(data.currentLocalTime);
            let utcMoment = moment.utc(data.currentUtcTime);
            let utcOffsetHours = parseFloat(data.offsetSeconds) / 60 / 60;
            let offsetString = utcOffsetHours > 0 ? '+' + utcOffsetHours.toString() : utcOffsetHours.toString();

            // Render the result that we go from server to popup.
            document.querySelector('#popup-content').innerHTML = `
                    <p><label>Time Zone: </label> ${data.timezone}</p>
                    <p><label>Country: </label> ${data.countryName}</p>
                    <p><label>Country Code: </label> ${data.countryCode}</p>
                    <p><label>Comment: </label> ${data.comment}</p>
                    <p><label>Current Local Time: </label> ${localMoment.format('MMM D, YYYY h:mm:ss A')}</p>                
                <p><label>Current Local Time: </label> ${localMoment.format('MMM D, YYYY h:mm:ss A')}</p>                
                    <p><label>Current Local Time: </label> ${localMoment.format('MMM D, YYYY h:mm:ss A')}</p>                
                    <p><label>Current UTC Time: </label> ${utcMoment.format('MMM D, YYYY h:mm:ss A')}</p>                
                <p><label>Current UTC Time: </label> ${utcMoment.format('MMM D, YYYY h:mm:ss A')}</p>                
                    <p><label>Current UTC Time: </label> ${utcMoment.format('MMM D, YYYY h:mm:ss A')}</p>                
                    <p><label>UTC Offset: </label> ${offsetString}</p>`;

            overlay.setPosition(clickCoord);
        }
        // Set up a error tips when there is no time zone data is available for that location.
        if (status === 404) {
            if (timer !== undefined && timer !== null) {
                clearTimeout(timer);
            }
            errorMessage.classList.add('show');
            timer = setTimeout(() => {
                errorMessage.classList.remove('show');
            }, 5000)
        }

    })
}


/*---------------------------------------------*/
// 6. ThinkGeo Map Icon Fonts
/*---------------------------------------------*/

// Finally, we'll load the Map Icon Fonts using ThinkGeo's WebFont loader. 
// The loaded Icon Fonts will be used to render POI icons on top of the map's 
// background layer.  We'll initalize the map only once the font has been 
// downloaded.  For more info, see our wiki: 
// https://wiki.thinkgeo.com/wiki/thinkgeo_iconfonts 
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/2.0.0/vectormap-icons.css"]
    },

    // The "active" property defines a function to call when the font has
    // finished downloading.  Here, we'll call our initializeMap method.
    active: initializeMap
});


/*---------------------------------------------*/
// 7. Event Listeners
/*---------------------------------------------*/

// These event listeners tell the UI when it's time to execute all of the 
// code we've written.

// This method actually applies the requested that closing the error message box.
document.querySelector('#error-modal button').addEventListener('click', () => {
    document.querySelector('#error-modal').classList.add('hide');
})
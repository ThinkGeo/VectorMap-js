/*===========================================================================*/
// JQuery
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. Popup Overlay Setup
//   4. Reverse Geocoding Setup
//   5. Event Listeners
//   6. Tile Loading Event Handlers
/*===========================================================================*/

/*---------------------------------------------*/
// 1. ThinkGeo Cloud API Key
/*---------------------------------------------*/

// First, let's define our ThinkGeo Cloud API key, which we'll use to
// authenticate our requests to the ThinkGeo Cloud API.  Each API key can be
// restricted for use only from a given web domain or IP address.  To create your
// own API key, you'll need to sign up for a ThinkGeo Cloud account at
// https://cloud.thinkgeo.com.
const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~'


/*---------------------------------------------*/
// 2. Map Control Setup
/*---------------------------------------------*/

// Now we'll create the base layer for our map.  The base layer uses the ThinkGeo
// Cloud Maps Raster Tile service to display a detailed street map.  For more
// info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_raster_tiles
let baseLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
        tileSize: 512,
    }),
});

// Create and initialize our interactive map.
let map = new ol.Map({
	renderer: 'webgl',
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    // Add our previously-defined ThinkGeo Cloud Raster Tile layer to the map.
    layers: [baseLayer],
    // States that the HTML tag with id="map" should serve as the container for our map.
    target: 'map',
    // Create a default view for the map when it starts up.
    view: new ol.View({
        // Center the map on Frisco, TX and start at zoom level 16.
        center: ol.proj.fromLonLat([-96.804616, 33.120202]),
        maxResolution: 40075016.68557849 / 512,
        zoom: 16,
        minZoom: 1,
        maxZoom: 19
    })
});

// Add a button to the map that lets us toggle full-screen display mode.
map.addControl(new ol.control.FullScreen());


/*---------------------------------------------*/
// 3. Popup Overlay Setup
/*---------------------------------------------*/

// This next part sets up the popup container for the information that we 
// get from the location you click.

// We need to get the DOM container.
const container = $('#popup');
const content = $('#popup-content');
const closer = $('#popup-closer');

// Create the Overlay for our map and add the DOM Nodes to its container. 
// So that we can control the info panel on our map.
let overlay = new ol.Overlay({
    element: container.get(0)
});

// This method recieve the Best Matched Location and coordnate to style the 
const showPopUp = (bestMatchLocation, centerCoordinate) => {
    if (bestMatchLocation) {
        let address = bestMatchLocation.data.address;
        // When clicking on the map, slide the map over to the clicked point
        // over a duration of 2000 milliseconds.
        map.getView().animate({
            center: centerCoordinate,
            duration: 2000
        });
        let addressArr = address.split(",");
        overlay.setPosition(centerCoordinate);
        map.addOverlay(overlay);
        let length = addressArr.length;
        content.html('<p>' + (addressArr[0] || '') + '</p><p>' + (addressArr[1] || '') + ',' + (addressArr[length - 2] || '') + '</p>' + '<p>' + (addressArr[4] || '') + ',' + (addressArr[length - 1] || '') + '</p>')
    } else {
        window.alert('No results');
    }
}


/*---------------------------------------------*/
// 4. Reverse Geocoding Setup
/*---------------------------------------------*/

// This method performs the actual reverse geocode using the ThinkGeo Cloud. 
// By passing in the coordinates of the map location that was clicked, we can 
// get back closest matching address of that click, as well as 
// a collection of places in the vicinity.  For more details, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_reverse_geocoding

// We use thinkgeocloudclient.js, which is an open-source Javascript SDK for making 
// request to ThinkGeo Cloud Service. It simplifies the process of the code of request.

// We need to create the instance of ReverseGeocoding client and authenticate the API key.
let reverseGeocodingClient = new tg.ReverseGeocodingClient(apiKey);

const getReverseGeocoding = (coordinate) => {
    let opts = {
        'srid': 3857
    }
    const callback = (status, res) => {
        if (status !== 200) {
            if(res.error){
                alert(res.error.message);
            }else{
                alert(res.status + '\n' + res.data.pointX + '\n' + res.data.pointY);
            }
        } else {
            let bestMatchLocation = res.data.bestMatchLocation;
            showPopUp(bestMatchLocation, coordinate)
        }
    }
    reverseGeocodingClient.searchPlaceByPoint(coordinate[1], coordinate[0], callback, opts);
}


/*---------------------------------------------*/
// 5. Event Listeners
/*---------------------------------------------*/

// These event listeners tell the UI when it's time to execute all of the 
// code we've written.

// This listener will let the Popup Overlay disapear once you clicked the "close" 
// icon on the top right corner of the popup panel.
closer.on('click', () => {
    overlay.setPosition(undefined);
})

// This listener gets the coordinates when you click on the map, and then uses them 
// to perform a reverse geocode with the ThinkGeo Cloud. Once the reverse geocode 
// result has been recieved, show up the popup panel.
map.addEventListener('click', (evt) => {
    let coordinate = evt.coordinate;
    getReverseGeocoding(coordinate);
});


/*---------------------------------------------*/
// 6. Tile Loading Event Handlers
/*---------------------------------------------*/

// These events allow you to perform custom actions when 
// a map tile encounters an error while loading.
const errorLoadingTile = () => {
    const errorModal = $('#error-modal');
    if (errorModal.hasClass('hide')) {
        // Show the error tips when Tile loaded error.
        errorModal.removeClass('hide');
    }
}

const setLayerSourceEventHandlers = (layer) => {
    let layerSource = layer.getSource();
    layerSource.on('tileloaderror', function () {
        errorLoadingTile();
    });
}

setLayerSourceEventHandlers(baseLayer);

$('#error-modal button').on('click', () => {
    $('#error-modal').addClass('hide');
})
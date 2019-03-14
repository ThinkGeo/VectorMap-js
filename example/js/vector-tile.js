 /*===========================================================================*/
 // Style ThinkGeo Maps
 // Sample map by ThinkGeo
 // 
 //   1. ThinkGeo Cloud API Key
 //   2. Map Control Setup
 //   3. Updating Style Setup
 //   4. Event Listeners
 //   5. ThinkGeo Map Icon Fonts
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

 // Now we'll create the layer for our map. The layer uses the ThinkGeo Cloud 
 // Maps Vector Tile service to display a detailed map.  For more info, see our wiki:
 // https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles 
 let layer = new ol.mapsuite.VectorTileLayer('../data/vectortils_gray.json', {
     'apiKey': apiKey
 });

 // This function will create and initialize our interactive map.
 // We'll call it later when our POI icon font has been fully downloaded,
 // which ensures that the POI icons display as intended.
 let map;
 let initializeMap = function () {
     map = new ol.Map({
         loadTilesWhileAnimating: true,
         loadTilesWhileInteracting: true,
         // Add our previously-defined ThinkGeo Cloud Vector Tile layer to the map.
         layers: [layer],
         // States that the HTML tag with id="map" should serve as the container for our map.
         target: 'map',
         // Create a default view for the map when it starts up.
         view: new ol.View({
             // Center the map on the Washington and start at zoom level 15.
             center: ol.proj.fromLonLat([-77.043745, 38.895620]),
             maxResolution: 40075016.68557849 / 512,
             zoom: 15,
             minZoom: 2,
             maxZoom: 19
         }),
     });

     // Add a button to the map that lets us toggle full-screen display mode.
     map.addControl(new ol.control.FullScreen());
 }


 /*---------------------------------------------*/
 // 3. Updating Style Setup
 /*---------------------------------------------*/

 // Next, we have to get one copy of the StyleJSON file data. Then we can modify some 
 // styles to create a new one. Then we could apply the new StyleJSON to a new 
 // style layer.

 // Read a StyleJSON file data and assign the value to the variable -- stylejson.
 const getJson = () => {
     let readTextFile = new Promise(function (resolve, reject) {
         let file = "../data/vectortils_gray.json";
         var rawFile = new XMLHttpRequest();
         rawFile.overrideMimeType("application/json");
         rawFile.open("GET", file, true);
         rawFile.onreadystatechange = function (ERR) {
             if (rawFile.readyState === 4) {
                 if (rawFile.status == "200") {
                     resolve(rawFile.responseText);
                 } else {
                     reject(new Error(ERR));
                 }
             }
         }
         rawFile.send(null);
     });
     return readTextFile;
 }

 // Parse the JSON string, constructing the JavaScript value described by the string.
 let stylejson;
 getJson().then((data) => {
     stylejson = JSON.parse(data);
    // Once the styleJSON data has been downloaded, call the addRefreshListener 
    // method that user can custom the map style by click the Refresh button.
     addRefreshListener();
 })

 // This method update the StyleJSON value by what user input.
 const updateStyleJson = (poiSize, waterColor, buildingColor, placement) => {
     let styles = stylejson.styles;
     let stylesLength = styles.length;
     for (let i = 0; i < stylesLength; i++) {
         if (styles[i].id === 'poi_icon') {
             styles[i]['point-size'] = poiSize;
         } else if (styles[i].id === 'water') {
             styles[i]['polygon-fill'] = '#' + waterColor
         } else if (styles[i].id === 'building') {
             styles[i]['polygon-fill'] = '#' + buildingColor
         } else if (styles[i].filter.match("layerName='road_name'")) {
             switch (placement) {
                 case 'Line':
                     styles[i]['text-force-horizontal-for-line'] = false;
                     break;
                 case 'Point':
                     styles[i]['text-force-horizontal-for-line'] = true;
                     styles[i]['text-spacing'] = 5;
                     styles[i]['text-min-distance'] = 5;
                     styles[i]['text-min-padding'] = 5;
                     break;
                 default:
                     return;
             }
         }
     }
     // Remove the old style layer.
     let layers = map.getLayers().getArray();
     map.removeLayer(layers[0]);
     // Create a new style layer and add it to the map.
     let newLayer = new ol.mapsuite.VectorTileLayer(stylejson, {
         'apiKey': apiKey
     });
     map.addLayer(newLayer);
 }


 /*---------------------------------------------*/
 // 4. Event Listeners
 /*---------------------------------------------*/

 // These event listeners tell the UI when it's time to execute all of the 
 // code we've written.

 // This listener will get the values from the input boxes when you click the 
 // "refresh" button, and then uses them to update the map style. We'll call 
 // this method once the styleJson data has been completely dowloaded.
 const addRefreshListener = () => {
     document.getElementById('refresh').addEventListener('click', (e) => {
         let userInput = {
             poiSize: document.getElementById('poiSize').value,
             waterColor: document.getElementById('water-color').value,
             buildingColor: document.getElementById('building-color').value,
             placement: document.getElementById('placement').value,
         }

         updateStyleJson(userInput.poiSize, userInput.waterColor, userInput.buildingColor, userInput.placement)
     })
 }


 /*---------------------------------------------*/
 // 5. ThinkGeo Map Icon Fonts
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
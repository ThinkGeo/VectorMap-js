import { Component, AfterViewInit } from '@angular/core';
import { color } from 'openlayers';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements AfterViewInit {
    private json;
    private updatedstyle;
    private clickRefresh;
    waterColors = ['#0000CD', '#4169E1', '#0000FF', '#1E90FF'];
    defaultWaterColor = this.waterColors[0];
    parkColors = ['#25ff00', '#25ff00', '#a29708', '#fe6c00'];
    defaultParkColor = this.parkColors[0]
    defaultSize = 30
    constructor() {

    }

    ngAfterViewInit() {
        // We need to define our ThinkGeo Cloud API key, which we'll use to
        // authenticate our requests to the ThinkGeo Cloud API.  Each API key can be
        // restricted for use only from a given web domain or IP address.  To create your
        // own API key, you'll need to sign up for a ThinkGeo Cloud account at
        // https://cloud.thinkgeo.com.

        // Then we'll create the base layer for our map.  The base layer uses the ThinkGeo
        // Cloud Maps Vector Tile service to display a detailed street map.  For more
        // info, see our wiki:
        // https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles
        let layer = new (<any>ol).mapsuite.VectorTileLayer('../assets/data/light.json', {
            'apiKey': 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~'
        });


        // Create and initialize our interactive map.
        let map = new ol.Map({
            loadTilesWhileInteracting: true,
            // Add our previously-defined ThinkGeo Cloud Vector Tile layer to the map.
            layers: [layer],
            // States that the HTML tag with id="map" should serve as the container for our map.
            target: 'map',
            // Create a default view for the map when it starts up.
            view: new ol.View({
                // Center the map on The Colony, TX and start at zoom level 15.
                center: ol.proj.fromLonLat([-96.917754, 33.087878]),
                maxZoom: 19,
                maxResolution: 40075016.68557849 / 512,
                zoom: 15,
            }),
        });

        // Now we need to actually load the World Streets Style JSON file that will let us 
        // visualize our light style map. This method will recieve a file path which is our 
        // style JSON file be hosted, and send the request to get the data.
        let getJson = () => {
            let readTextFile = new Promise(function (resolve, reject) {
                let file = "../assets/data/light.json";
                var rawFile = new XMLHttpRequest();
                rawFile.overrideMimeType("application/json");
                rawFile.open("GET", file, true);
                rawFile.onreadystatechange = function (ERR) {
                    if (rawFile.readyState === 4) {
                        resolve(rawFile.responseText);
                    }
                }
                rawFile.send(null);
            });
            return readTextFile;
        }

        // Once we have got the style JSON file, store the data to a global variable(it will be 
        // </any>used when we create the base layer and customize the map style).
        getJson().then((data) => {
            this.json = data;
            this.json = JSON.parse(this.json);
        })


        // This next step is to update the style what we recived from users. 
        // When using the styleJson file, you can customize the presentation 
        // of the ThinkGeo map, changing the style of such elements as roads, 
        // parks, building, points of pois and so on. Here, you can change the 
        // poi size and water fill color to have a try. 

        // This method will recieve the two changed style and update it to style JSON data.
        this.updatedstyle = (poiSize, waterColor, parkColor) => {
            let styles = this.json.styles;
            let stylesLength = styles.length;
            for (let i = 0; i < stylesLength; i++) {
                if (styles[i].id === 'poi_icon') {
                    styles[i]['point-size'] = poiSize;
                } else if (styles[i].id === 'water') {
                    styles[i]['polygon-fill'] = waterColor
                } else if (styles[i].id === 'landcover') {
                    let length = styles[i]['style'].length;
                    for (let j = 0; j < length; j++) {
                        let innerStyle = styles[i]['style'];
                        if (innerStyle[j]['filter'] === "class='park'") {
                            innerStyle[j]['polygon-fill'] = parkColor;
                        }
                    }
                }
            }
            return this.json;
        }

        // This method will response to user's click action and call updatedstyle method to 
        // update style to json variable. Then update it to our map.
        this.clickRefresh = (json) => {
            let layers = map.getLayers().getArray();
            map.removeLayer(layers[0]);
            let newLayer = new (<any>ol).mapsuite.VectorTileLayer(json, {
                'apiKey': 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~'
            });
            map.addLayer(newLayer);
        }

    }

    refresh(formValue: formValueConfig): void {
        this.json = this.updatedstyle(formValue.poiSize || 30, formValue.waterColor || '#0000CD', formValue.parkColor || '#fe6c00');
        this.clickRefresh(this.json)
    }
}

interface formValueConfig {
    poiSize?: number,
    waterColor?: string,
    parkColor?: string
};


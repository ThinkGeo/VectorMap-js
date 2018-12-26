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

        let layer = new (<any>ol).mapsuite.VectorTileLayer('../assets/data/light.json', {
            'apiKey': 'Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~'
        });

        let map = new ol.Map({
            loadTilesWhileInteracting: true,
            layers: [layer],
            target: 'map',
            view: new ol.View({
                center: ol.proj.fromLonLat([-96.917754, 33.087878]),
                maxZoom: 19,
                maxResolution: 40075016.68557849 / 512,
                zoom: 15,
            }),
        });

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

        getJson().then((data) => {
            this.json = data;
            this.json = JSON.parse(this.json);
        })

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

        this.clickRefresh = (json) => {
            let layers = map.getLayers().getArray();
            map.removeLayer(layers[0]);
            let newLayer = new (<any>ol).mapsuite.VectorTileLayer(json, {
                'apiKey': 'Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~'
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


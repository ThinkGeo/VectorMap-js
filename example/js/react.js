let streetMap;

function renderStreetMap() {
    let layer = new ol.mapsuite.VectorTileLayer('../data/light.json', {
        'apiKey': 'Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~'
    });

    streetMap = new ol.Map({
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        layers: [layer],
        target: 'map',
        view: new ol.View({
            center: ol.proj.fromLonLat([-77.043745, 38.889020]),
            maxZoom: 19,
            maxResolution: 40075016.68557849 / 512,
            zoom: 14,
            minZoom: 2,
          
        }),
    });
}
class StreetMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            parkColor: '#a7da7a59',
            placement: 'Line',
            maskType: 'Circle',
            poiSize: '40',
            json: {
                styles: []
            },
            newLayer: ''
        };
        this.clickRefresh = this.clickRefresh.bind(this);
        this.parkFillColorHandleChange = this.parkFillColorHandleChange.bind(this);
        this.placementHandleChange = this.placementHandleChange.bind(this);
        this.maskTypeHandleChange = this.maskTypeHandleChange.bind(this);
        this.poiSizeHandleChange = this.poiSizeHandleChange.bind(this);
        this.getJson = this.getJson.bind(this);
    }

    componentDidMount() {
        renderStreetMap();
        this.getJson().then((data) => {
            this.setState({
                json: JSON.parse(data)
            });
        });
    }

    parkFillColorHandleChange(event) {
        this.setState({
            parkColor: event.target.value
        });
    }

    placementHandleChange(event) {
        this.setState({
            placement: event.target.value
        });
    }

    maskTypeHandleChange(event) {
        this.setState({
            maskType: event.target.value
        });
    }

    poiSizeHandleChange(event) {
        this.setState({
            poiSize: event.target.value
        });
    }

    getJson() {
        let readTextFile = new Promise(function (resolve, reject) {
            let file = "../data/light.json";
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

    clickRefresh() {
        let layers = streetMap.getLayers().getArray();
        streetMap.removeLayer(layers[0]);
        let newLayer = new ol.mapsuite.VectorTileLayer(this.state.json, {
            'apiKey': 'Yy6h5V0QY4ua3VjqdkJl7KTXpxbKgGlFJWjMTGLc_8s~'
        });
        streetMap.addLayer(newLayer);
    }

    changePlacement() {
        let styles = this.state.json.styles;
        let stylesLength = styles.length;
        for (let i = 0; i < stylesLength; i++) {
            if (styles[i].filter.match("layerName='road_name'")) {
                switch (this.state.placement) {
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
    }

    changeParkColor() {
        let styles = this.state.json.styles;
        let stylesLength = styles.length;
        for (let i = 0; i < stylesLength; i++) {
            if (styles[i].id === 'landcover') {
                let length = styles[i]['style'].length;
                for (let j = 0; j < length; j++) {
                    let innerStyle = styles[i]['style'];
                    if (innerStyle[j]['filter'] === "class='park'") {
                        innerStyle[j]['polygon-fill'] = this.state.parkColor;
                    }
                }
            }
        }
    }

    changeMaskType() {
        let styles = this.state.json.styles;
        let stylesLength = styles.length;
        for (let i = 0; i < stylesLength; i++) {
            if (styles[i].id === 'road_number') {
                styles[i]['text-mask-type'] = this.state.maskType;
            }
        }
    }

    changePoiSize() {
        let styles = this.state.json.styles;
        let stylesLength = styles.length;
        for (let i = 0; i < stylesLength; i++) {
            if (styles[i].id === 'poi_icon') {
                styles[i]['point-size'] = this.state.poiSize;
            }
        }
    }

    render() {
        this.changePlacement();
        this.changeParkColor();
        this.changeMaskType();
        this.changePoiSize();

        return (
            <div id="mapWrap">
                <div id="map"></div>
                <div className="controlPanel">
                    <div>
                        <label>
                            Road Name Placement:
                        </label>
                        <select onChange={this.placementHandleChange}>
                            <option value="Line">Line</option>
                            <option value="Point">Point</option>
                        </select>
                    </div>

                    <div>
                        <label>
                            Road Number Mask Type:
                        </label>
                        <select onChange={this.maskTypeHandleChange}>
                            <option value="Circle">Circle</option>
                            <option value="Rectangle">Rectangle</option>
                            <option value="Default">Default</option>
                            <option value="RoundedCorners">RoundedCorners</option>
                            <option value="RoundedEnds">RoundedEnds</option>
                        </select>
                    </div>

                    <div>
                        <label>
                            Park Color:
                        </label>
                        <select onChange={this.parkFillColorHandleChange}>
                            <option value="#a7da7a59">#a7da7a59</option>
                            <option value="#25ff00">#25ff00</option>
                            <option value="#4ea440">#4ea440</option>
                            <option value="#a29708">#a29708</option>
                            <option value="#fe6c00">#fe6c00</option>
                        </select>
                    </div>

                    <div>
                        <label>
                            POI Size:
                        </label>
                        <input type="number" value={this.state.poiSize} onChange={this.poiSizeHandleChange} />
                    </div>

                    <div className="refresh-btn">
                        <button onClick={this.clickRefresh}>Refresh</button>
                    </div>
                </div>
            </div>
        )
    }
}
ReactDOM.render(<StreetMap />, document.getElementById('root'));
let streetMap;

function renderStreetMap() {
    WebFont.load({
        custom: {
            families: ["vectormap-icons"],
            urls: ['https://cdn.thinkgeo.com/vectormap-icons/2.0.0-beta004/vectormap-icons.css']
        }
    });

    let layer = new ol.mapsuite.VectorTileLayer('../data/light.json', {
        'apiKey': 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~'
    });

    streetMap =  new ol.Map({                         loadTilesWhileAnimating: true,                         loadTilesWhileInteracting: true,
        layers: [layer],
        target: 'map',
        view: new ol.View({
            center: ol.proj.fromLonLat([-73.413148, 40.736301]),
            zoom: 15,
            minZoom: 2,
            maxZoom: 19
        }),
    });
}
class StreetMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            countryNameHalo: 'rgba(255, 255, 255, 0.5)',
            fontFamily:'Oblique',
            maskType: 'Rectangle',
            poiSize:'22',
            json: {
                styles: []
            },
            newLayer:''
        };
        this.clickRefresh = this.clickRefresh.bind(this);
        this.countryNameHaloHandleChange = this.countryNameHaloHandleChange.bind(this);
        this.marineNameFontFamilyHandleChange = this.marineNameFontFamilyHandleChange.bind(this);
        this.maskTypeHandleChange = this.maskTypeHandleChange.bind(this);
        this.poiSizeHandleChange = this.poiSizeHandleChange.bind(this);
        this.getJson = this.getJson.bind(this);
    }

    componentDidMount() {
        renderStreetMap();
        this.getJson().then((data)=>{
            this.setState({
                json: JSON.parse(data)
            });
        });
    }

    countryNameHaloHandleChange(event) {
        this.setState({countryNameHalo: event.target.value});
    }

    marineNameFontFamilyHandleChange(event){
        this.setState({fontFamily: event.target.value});
    }

    maskTypeHandleChange(event){
        this.setState({maskType: event.target.value});
    }

    poiSizeHandleChange(event){
        this.setState({poiSize: event.target.value});
    }

    getJson(){
        let readTextFile = new Promise(function(resolve, reject){
            let file = "../data/light.json";
            var rawFile = new XMLHttpRequest();
            rawFile.overrideMimeType("application/json");
            rawFile.open("GET", file, true);
            rawFile.onreadystatechange = function (ERR) {
                if(rawFile.readyState === 4){
                    if(rawFile.status == "200"){
                        resolve(rawFile.responseText);
                    }else{
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
            'apiKey': 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~'
        });
        streetMap.addLayer(newLayer);
    }

    changeFontStyle(){
        let styles = this.state.json.styles;
        let stylesLength = styles.length;
        for (let i = 0; i < stylesLength; i++) {
            if (styles[i].id === 'marine_name') {
                for(let j = 0; j < styles[i]['style'].length; j++){
                    let inStyleArr = styles[i]['style'][j].style;
                    for(let k = 0; k < inStyleArr.length; k++){
                        inStyleArr[k]['text-font'] = `${this.state.fontFamily} 600 12px Arial, Helvetica, sans-serif`;
                    }
                }
            }
        }
    }

    changeCountryNameColor(){
        let styles = this.state.json.styles;
        let stylesLength = styles.length;
        for (let i = 0; i < stylesLength; i++) {
            if (styles[i].id === 'country_name') {
                styles[i]['text-halo-fill'] = this.state.countryNameHalo;
            }
        }
    }

    changeMaskType(){
        let styles = this.state.json.styles;
        let stylesLength = styles.length;
        for (let i = 0; i < stylesLength; i++) {
            if (styles[i].id === 'road_number') {
                styles[i]['text-mask-type'] = this.state.maskType;
            }
        }
    }

    changePoiSize(){
        let styles = this.state.json.styles;
        let stylesLength = styles.length;
        for (let i = 0; i < stylesLength; i++) {
            if (styles[i].id === 'poi_icon') {
                styles[i]['point-size'] = this.state.poiSize;
            }
        }
    }

    render() { 
        this.changeFontStyle();
        this.changeCountryNameColor();
        this.changeMaskType();
        this.changePoiSize();

        return (
            <div id="mapWrap">
                <div id="map"></div>
                <div className="controlPanel">
                    <div>
                        <label>
                            Marine Name Font-Style:
                        </label>
                        <select onChange={this.marineNameFontFamilyHandleChange}>
                            <option value="Oblique">Oblique</option>
                            <option value="Normal">Normal</option>
                        </select>
                    </div>

                    <div>
                        <label>
                            Road Number Mask-Type:
                        </label>
                        <select onChange={this.maskTypeHandleChange}>
                            <option value="Rectangle">Rectangle</option>
                            <option value="Default">Default</option>
                            <option value="RoundedCorners">RoundedCorners</option>
                            <option value="RoundedEnds">RoundedEnds</option>
                            <option value="Circle">Circle</option>
                        </select>
                    </div>

                    <div>
                        <label>
                            Country Name Halo-Color:
                        </label>
                        <input type="text" value={this.state.countryNameHalo} onChange={this.countryNameHaloHandleChange} />
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
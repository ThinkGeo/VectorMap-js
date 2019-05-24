/*===========================================================================*/
// React JS
// Sample map by ThinkGeo
//
//   1. ThinkGeo Cloud API Key
//   2. Map Control Setup
//   3. Component State Updates
//   4. Map Style Updates
//   5. Update React DOM
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

let map;

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
			newLayer: '',
			errorMessage: 'hide'
		};
		this.clickRefresh = this.clickRefresh.bind(this);
		this.parkFillColorHandleChange = this.parkFillColorHandleChange.bind(this);
		this.placementHandleChange = this.placementHandleChange.bind(this);
		this.maskTypeHandleChange = this.maskTypeHandleChange.bind(this);
		this.poiSizeHandleChange = this.poiSizeHandleChange.bind(this);
		this.getJson = this.getJson.bind(this);
		this.closeErrorTip = this.closeErrorTip.bind(this);
		this.errorLoadingTile = this.errorLoadingTile.bind(this);
		this.setLayerSourceEventHandlers = this.setLayerSourceEventHandlers.bind(this);
	}

	/*---------------------------------------------*/
	// 2. Map Control Setup
	/*---------------------------------------------*/

	// If component has been mounted (inserted to the DOM tree), send request
	// to get our WorldStreetsStyle JSON file. Once the JSON file has been fully
	// downloaded, then create and initialize our interactive map.

	getJson(filePath) {
		let readTextFile = new Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.overrideMimeType('application/json');
			xhr.open('GET', filePath, true);
			xhr.onreadystatechange = function(ERR) {
				if (xhr.readyState === 4) {
					if (xhr.status == '200') {
						resolve(xhr.responseText);
					} else {
						reject(new Error(ERR));
					}
				}
			};
			xhr.send(null);
		});
		return readTextFile;
	}

	// This function recieves the style JSON data to create our colorful map.
	renderStreetMap = (json) => {
		// Here we'll create the base layer for our map.  The base layer uses the ThinkGeo
		// Cloud Maps Vector Tile service to display a detailed street map.  For more
		// info, see our wiki:
		// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles
		let layer = new ol.mapsuite.VectorTileLayer(json, {
			apiKey: apiKey
		});

		// This function will create and initialize our map.
		// We'll call it later when our POI icon font has been fully downloaded,
		// which ensures that the POI icons display as intended.
		let initializeMap = function() {
			map = new ol.Map({
				renderer: 'webgl',
				loadTilesWhileAnimating: true,
				loadTilesWhileInteracting: true,
				layers: [ layer ],
				target: 'map',
				view: new ol.View({
					center: ol.proj.fromLonLat([ -77.043745, 38.88902 ]),
					maxZoom: 19,
					maxResolution: 40075016.68557849 / 512,
					zoom: 14,
					minZoom: 2
				})
			});

			map.addControl(new ol.control.FullScreen());
		};

		// Now, we'll load the Map Icon Fonts using ThinkGeo's WebFont loader.
		// The loaded Icon Fonts will be used to render POI icons on top of the map's
		// background layer.  We'll initalize the map only once the font has been
		// downloaded.  For more info, see our wiki:
		// https://wiki.thinkgeo.com/wiki/thinkgeo_iconfonts
		WebFont.load({
			custom: {
				families: [ 'vectormap-icons' ],
				urls: [ 'https://cdn.thinkgeo.com/vectormap-icons/2.0.0/vectormap-icons.css' ]
			},
			// The "active" property defines a function to call when the font has
			// finished downloading.  Here, we'll call our initializeMap method.
			active: initializeMap
		});

		this.setLayerSourceEventHandlers(layer);
	};

	// These events allow you to perform custom actions when
	// a map tile encounters an error while loading.
	errorLoadingTile() {
		this.setState({
			errorMessage: 'show'
		});
	}

	setLayerSourceEventHandlers(layer) {
		const layerSource = layer.getSource();
		const showError = this.errorLoadingTile;
		layerSource.on('tileloaderror', function() {
			showError();
		});
	};

	// This is a hook function that let us get the JSON file and create map once the
	// component has been mounted.
	componentDidMount() {
		this.getJson('https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json').then((data) => {
			// Chedule updates to the component local json state.
			this.setState({
				json: JSON.parse(data)
			});

			// Call the function to create our map.
			this.renderStreetMap(this.state.json);
		});
	}

	/*---------------------------------------------*/
	// 3. Component State Updates
	/*---------------------------------------------*/

	// Once the value in the control panel has changed, update it to our component state.
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

	/*---------------------------------------------*/
	// 4. Map Style Updates
	/*---------------------------------------------*/

	// When the uses clicked the Refresh button, these method will be called to
	// update all changed styles to map.
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

	// Once the Refresh button has been clicked, update custom styles to our map.
	clickRefresh() {
		this.changePlacement();
		this.changeParkColor();
		this.changeMaskType();
		this.changePoiSize();
		let layers = map.getLayers().getArray();
		// Remove the old style layer.
		map.removeLayer(layers[0]);
		// Create new layer for our map using the new style data.
		let newLayer = new ol.mapsuite.VectorTileLayer(this.state.json, {
			apiKey: apiKey
		});
		this.setLayerSourceEventHandlers(newLayer);
		map.addLayer(newLayer);
	}

	closeErrorTip() {
		this.setState({
			errorMessage: 'hide'
		});
	}

	/*---------------------------------------------*/
	// 5. Update React DOM
	/*---------------------------------------------*/

	// After all the settings we have done, it's time to update the DOM tree.
	render() {
		return (
			<div id="mapWrap">
				{/* This <div> is the container into which our map control will be loaded. */}
				<div id="map">
					{/* Set up a control panel for the map that we'll change the style of the map. */}
					<div className="controlPanel">
						<div>
							<label> Road Name Placement: </label>
							<select onChange={this.placementHandleChange}>
								<option value="Line"> Line </option> <option value="Point"> Point </option>
							</select>
						</div>
						<div>
							<label> Road Number Mask Type: </label>
							<select onChange={this.maskTypeHandleChange}>
								<option value="Circle"> Circle </option> <option value="Rectangle"> Rectangle </option>
								<option value="Default"> Default </option>
								<option value="RoundedCorners"> RoundedCorners </option>
								<option value="RoundedEnds"> RoundedEnds </option>
							</select>
						</div>
						<div>
							<label> Park Color: </label>
							<select onChange={this.parkFillColorHandleChange}>
								<option value="#a7da7a59"> #a7da7a59 </option> <option value="#25ff00"> #25ff00</option>
								<option value="#4ea440"> #4ea440</option>
								<option value="#a29708"> #a29708 </option> <option value="#fe6c00"> #fe6c00 </option>
							</select>
						</div>
						<div>
							<label> POI Size: </label>
							<input type="number" value={this.state.poiSize} onChange={this.poiSizeHandleChange} />
						</div>
						<div className="refresh-btn">
							<button onClick={this.clickRefresh}> Refresh </button>
						</div>
					</div>

					{/* Set up error message tip.*/}
					<div id="error-modal" className={this.state.errorMessage === 'hide' ? 'hide' : ''}>
						<div className="modal-content">
							<p>
								We're having trouble communicating with the ThinkGeo Cloud. Please check the API key
								being used in this sample's JavaScript source code, and ensure it has access to the
								ThinkGeo Cloud services you are requesting. You can create and manage your API keys at
								<a href="https://cloud.thinkgeo.com" target="_blank" rel="noopener">
									https://cloud.thinkgeo.com
								</a>.
							</p>
							<button onClick={this.closeErrorTip}>OK</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
ReactDOM.render(<StreetMap />, document.getElementById('root'));

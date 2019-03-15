let selectedWaypoint;
let chartCtx;
let drawLineButton;
let wayPointNumRange;

const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';

let defaultClient = GisServerApis.ApiClient.instance;
defaultClient.basePath = 'https://cloud.thinkgeo.com';
let APIKey = defaultClient.authentications['API Key'];
APIKey.apiKey = apiKey;

const urls = {
	light: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
	dark: `https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
	aerial: `https://cloud.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg?apiKey=${apiKey}`,
	transparentBackground: `https://cloud.thinkgeo.com/api/v1/maps/raster/transparent-background/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`
};

let lightLayer = new ol.layer.Tile({
	source: new ol.source.XYZ({
		url: urls.light,
		tileSize: 512
	}),
	layerName: 'light',
	visible: false
});

let darkLayer = new ol.layer.Tile({
	source: new ol.source.XYZ({
		url: urls.dark,
		tileSize: 512
	}),
	layerName: 'dark',
	visible: false
});

let aerialLayer = new ol.layer.Tile({
	source: new ol.source.XYZ({
		url: urls.aerial,
		tileSize: 512
	}),
	layerName: 'aerial',
	visible: true
});

let transparentBackgroundLayer = new ol.layer.Tile({
	source: new ol.source.XYZ({
		url: urls.transparentBackground,
		tileSize: 512
	}),
	layerName: 'transparentBackground',
	visible: true
});

const wkts = {
	place1: 'LINESTRING(-13626205.692956349 4551708.736638038,-13626195.839745672 4551699.182009503,-13626193.74967068 4551687.537305975,-13626201.811388507 4551674.996856023,-13626214.35183846 4551662.754988211,-13626226.892288413 4551648.721627549,-13626231.968184823 4551636.479759738,-13626232.266766964 4551623.342145502,-13626226.59370627 4551608.114456273,-13626214.949002743 4551588.70661706,-13626200.019895656 4551563.327135012,-13626186.882281419 4551540.336310098,-13626178.521981452 4551522.719963735,-13626173.1475029 4551510.776678066,-13626164.48862079 4551497.340481687,-13626158.815560097 4551494.653242412,-13626148.663767276 4551508.985185215,-13626155.232574396 4551513.463917341,-13626160.009888664 4551522.421381594,-13626159.41272438 4551527.497278003,-13626165.981531497 4551533.767502979,-13626169.86309934 4551545.412206507,-13626169.86309934 4551555.563999327,-13626157.62123153 4551561.535642161)',

	place2: 'LINESTRING(-12359831.643855993 4167388.583607652,-12358190.636404995 4167794.6553204176)',

	place3: 'LINESTRING(-13552189.568676393 5907435.731019847,-13551272.32433697 5909939.0436961865,-13550909.248452617 5911391.347233605,-13550202.205940979 5911945.515688673,-13550679.93736776 5913990.2061953,-13551444.307650613 5915461.618989791,-13551520.744678898 5916684.611442354,-13552762.846388532 5917334.326182777,-13552533.535303677 5917831.166866631,-13553183.2500441 5918136.914979772,-13554024.057355236 5918041.368694415)',

	place4: 'LINESTRING(-12772636.98108149 4302695.261286651,-12772742.081995381 4302618.824258366,-12772894.956051951 4302461.172887527,-12773086.048622664 4302078.987746102,-12773157.708336681 4301739.798433086,-12773124.267136807 4301333.726720321,-12772775.523195256 4299876.645868635)'
};

const drawLineControl = function (opt_options) {
	const options = opt_options || {};
	const button = document.createElement('button');
	const element = document.createElement('div');
	element.className = 'drawline ol-unselectable ol-control';
	element.appendChild(button);
	ol.control.Control.call(this, {
		element: element,
		target: options.target
	});
};

ol.inherits(drawLineControl, ol.control.Control);


let styles = {
	waypoint: new ol.style.Style({
		image: new ol.style.Circle({
			radius: 3,
			snapToPixel: false,
			fill: new ol.style.Fill({
				color: 'black'
			}),
			stroke: new ol.style.Stroke({
				color: 'white',
				width: 1
			})
		})
	}),
	'waypoint-selected': new ol.style.Style({
		image: new ol.style.Icon({
			anchor: [0.5, 1],
			src: '../image/waypoint.png'
		})
	}),
	start: new ol.style.Style({
		image: new ol.style.Icon({
			anchor: [0.5, 1],
			src: '../image/start.png'
		})
	}),
	end: new ol.style.Style({
		image: new ol.style.Icon({
			anchor: [0.5, 1],
			src: '../image/end.png'
		})
	}),
	route: new ol.style.Style({
		stroke: new ol.style.Stroke({
			width: 2,
			color: [181, 232, 88]
		})
	})
};

let lineLayer = new ol.layer.Vector({
	source: new ol.source.Vector(),
	style: function (feature) {
		let type = feature.get('type');
		return styles[type];
	}
});

let map = new ol.Map({
	controls: ol.control.defaults({
		attributionOptions: {
			collapsible: false
		}
	}).extend([new drawLineControl()]),
	layers: [darkLayer, lightLayer, aerialLayer, transparentBackgroundLayer, lineLayer],
	target: 'map',
	view: new ol.View({
		center: ol.proj.fromLonLat([-122.405729, 37.802898]),
		maxResolution: 40075016.68557849 / 512,
		zoom: 16,
		minZoom: 1,
		maxZoom: 19,
		progressiveZoom: false
	})
});

map.addControl(new ol.control.FullScreen());

map.addInteraction(
	new ol.interaction.DragPan({
		condition: function (event) {
			return event.originalEvent.ctrlKey;
		}
	})
);

let elevationApiInstance = new GisServerApis.ElevationApi();
let lineFeature;
let opts = {
	srid: 3857,
	numberOfSegments: wayPointNumRange ? wayPointNumRange.value : 15,
	elevationUnit: 'Feet',
	intervalDistanceUnit: 'Feet'
};

const getWaypoints = (data) => {
	let labels = [];
	let values = [];
	for (let i = 0, l = data.length; i < l; i++) {
		labels.push(i + 1);
		values.push(data[i].elevation);
	}
	return {
		originaldata: data,
		labels: labels,
		datasets: [{
			fill: false,
			backgroundColor: 'rgb(255, 159, 64)',
			borderColor: 'rgb(255, 159, 64)',
			pointStrokeColor: '#fff',
			pointHighlightFill: '#fff',
			pointHighlightStroke: 'rgba(151,187,205,1)',
			data: values
		}]
	};
};

const getGrades = (error, res, wkt) => {
	let grades = [];
	if (error) {
		console.error(error);
	} else {
		for (let i = 0; i < res.data.length; i++) {
			let grade = res.data[i].grade;
			grades.push(grade);
		}
	}

	elevationApiInstance.getElevationOfLineV1(wkt, opts, (error, res) => {
		getElevation(error, res, wkt, grades)
	});
}

const getElevation = (error, res, wkt, grades) => {
	let format = new ol.format.WKT();
	if (error) {
		console.log(error);
	} else {
		let geom = format.readGeometry(wkt);
		let coordinates = geom.getLastCoordinate();
		let endFeature = new ol.Feature({
			geometry: new ol.geom.Point(coordinates),
			type: 'end'
		})
		lineLayer.getSource().addFeature(endFeature);
		for (let i = 0, l = res.data.length; i < l; i++) {
			let item = res.data[i];
			let start = res.data[0];
			let waypoint = format.readFeature(item.wellKnownText);
			let startpoint = format.readFeature(start.wellKnownText);
			startpoint.set('type', 'start');
			waypoint.set('type', 'waypoint');
			lineLayer.getSource().addFeature(startpoint);
			lineLayer.getSource().addFeature(waypoint);
		}
		let waypoints = getWaypoints(res.data);
		drawChart(waypoints, grades);
	}
}

const drawElevationByLine = (feature, wkt) => {
	if (feature) {
		let line = feature.getGeometry();
		if (line.getLength() > 20000) {
			window.alert('The line is too long. Please re-enter!');
			feature.set('type', null);
			map.removeInteraction(
				new ol.interaction.Draw({
					source: lineLayer.getSource(),
					type: 'LineString'
				})
			);
			removeLine();
			removeChart();
		} else {
			feature.set('type', 'route');
			let format = new ol.format.WKT();
			let wkt = format.writeGeometry(feature.getGeometry());
			elevationApiInstance.getGradeOfLineV1(wkt, opts, (error, res) => {
				getGrades(error, res, wkt)
			});
		}
	} else {
		let format = new ol.format.WKT();
		let geom = format.readGeometry(wkt);
		lineFeature = new ol.Feature({
			geometry: geom,
			type: 'route'
		});
		lineLayer.getSource().addFeature(lineFeature);
		elevationApiInstance.getGradeOfLineV1(wkt, opts, (error, res) => {
			getGrades(error, res, wkt)
		});
	}
};

const removeLine = () => {
	let source = lineLayer.getSource();
	source.clear();
};



let draw;
const createDrawInteraction = () => {
	draw = new ol.interaction.Draw({
		source: lineLayer.getSource(),
		type: 'LineString'
	});

	draw.on('drawstart', function () {
		removeLine();
		removeChart();
	});

	draw.on('drawend', function (feature) {
		lineFeature = feature.feature;
		drawElevationByLine(lineFeature, null);
	});
}

createDrawInteraction();

const activateDrawing = () => {
	removeLine();
	removeChart();
	selectedWaypoint = null;
	map.addInteraction(draw);

	let buttonClasslist = drawLineButton.getElementsByTagName('button')[0].classList;
	buttonClasslist.add('on');
	document.getElementsByClassName('map-tip')[0].classList.add('visible');
}

const deactivateDrawing = () => {
	removeLine();
	removeChart();
	map.removeInteraction(draw);

	let buttonClasslist = drawLineButton.getElementsByTagName('button')[0].classList;
	buttonClasslist.remove('on');
	document.getElementsByClassName('map-tip')[0].classList.remove('visible');
}



let chart;
const drawChart = (data, grades) => {
	selectedWaypoint = null;
	if (chart) {
		chart.destroy();
	}
	chart = new Chart(chartCtx, {
		type: 'line',
		data: data,
		options: {
			legend: {
				display: false
			},
			responsive: true,
			maintainAspectRatio: false,
			title: {
				display: false,
				text: ''
			},
			tooltips: {
				mode: 'index',
				intersect: false,
				displayColors: false,
				callbacks: {
					label: function (tooltipItem, data) {
						let label = data.datasets[tooltipItem.datasetIndex].label || '';
						if (label) {
							label += ': ';
						}
						let elevation = data.originaldata[tooltipItem.index];
						if (grades == null) {
							label += 'Elevation: ' + elevation.elevation + 'ft';
						} else {
							label +=
								'Elevation: ' + elevation.elevation + 'ft' + '  grade: ' + grades[tooltipItem.index];
						}
						if (selectedWaypoint) {
							lineLayer.getSource().removeFeature(selectedWaypoint);
						}
						let wkt = new ol.format.WKT();
						selectedWaypoint = wkt.readFeature(elevation.wellKnownText);
						selectedWaypoint.set('type', 'waypoint-selected');
						lineLayer.getSource().addFeature(selectedWaypoint);
						return label;
					}
				}
			},
			hover: {
				mode: 'nearest',
				intersect: true
			},
			scales: {
				xAxes: [{
					display: true,
					ticks: {
						fontColor: "#ddd",
					},
					scaleLabel: {
						display: false,
						labelString: 'Distance(KM)'
					},
					gridLines: {
						color: "#555",
					},
				}],
				yAxes: [{
					display: true,
					scaleLabel: {
						display: true,
						labelString: 'Elevation(ft)'
					},
					gridLines: {
						color: "#555",
					},
					ticks: {
						callback: function (value) {
							if (Math.floor(value) === value) {
								return value;
							}
						},
						fontColor: "#ddd",
					}
				}]
			}
		}
	});
};

const removeChart = () => {
	drawChart(null);
}



const changeMapStyle = (e) => {
	let layers = map.getLayers().getArray();
	if (e.target.getAttribute('value') == 'hybrid') {
		for (let i = 0; i < layers.length; i++) {
			layers[i].setVisible(false);
		}
		layers[4].setVisible(true);
		transparentBackgroundLayer.setVisible(true);
		aerialLayer.setVisible(true);
	} else {
		for (let i = 0; i < layers.length; i++) {
			if (layers[i].get('layerName') == e.target.getAttribute('value')) {
				layers[i].setVisible(true);
			} else {
				layers[i].setVisible(false);
			}
			layers[4].setVisible(true);
		}
	}
};

const drawPreDefinedLine = (wkt, coord, zoom) => {
	map.getView().animate({
		center: ol.proj.fromLonLat(coord),
		zoom: zoom
	});
	drawElevationByLine(null, wkt);
}


document.addEventListener('DOMContentLoaded', () => {
	chartCtx = document.getElementById('chartContainer').getContext('2d');
	drawLineButton = document.getElementsByClassName('drawline')[0];
	wayPointNumRange = document.getElementById('samples-number');

	drawLineButton.addEventListener('click', () => {
		activateDrawing();
	})

	wayPointNumRange.addEventListener('change', (e) => {
		e = window.event || e;
		removeLine();
		removeChart();
		selectedWaypoint = null;
		if (lineFeature) {
			drawElevationByLine(lineFeature, null);
			lineFeature.set('type', 'route');
			lineLayer.getSource().addFeature(lineFeature);
		} else {
			let place = document.getElementById('places').value;
			let format = new ol.format.WKT();
			let geom = format.readGeometry(wkts[place]);
			let feature = new ol.Feature({
				geometry: geom,
				type: 'route'
			});

			drawElevationByLine(feature, null);
			feature.set('type', 'route');
			lineLayer.getSource().addFeature(feature);
		}
	})

	document.getElementsByClassName('buttonDraw')[0].addEventListener('click', () => {
		activateDrawing();
	})

	document.getElementsByClassName('style-btn-group')[0].addEventListener('click', (e) => {
		e = window.event || e;
		let target = e.target;
		if (target.nodeName == 'BUTTON') {
			changeMapStyle(e);
			let buttons = target.parentNode.getElementsByTagName('button');
			for (let i = 0, l = buttons.length; i < l; i++) {
				let classlist = buttons[i].classList;
				if (buttons[i] === target) {
					classlist.add('current');
				} else {
					classlist.remove('current');
				}

			}
		}
	})

	document.getElementsByClassName('info')[0].addEventListener('click', (e) => {
		e = window.event || e;
		if (e.target === document.getElementsByClassName('info')[0]) {
			let content = e.target.getElementsByTagName('p')[0];
			let contentClassList = content.classList;
			if (contentClassList.contains('hide')) {
				contentClassList.remove('hide');
			} else {
				contentClassList.add('hide');
			}
		}
	})

	document.getElementsByClassName('close')[0].addEventListener('click', (e) => {
		e = window.event || e;
		let parentNode = e.target.parentNode;
		parentNode.classList.add('hide');
	})

	document.getElementById('places').addEventListener('change', (e) => {
		e = window.event || e;
		deactivateDrawing();
		switch (e.target.value) {
			case 'place1':
				drawPreDefinedLine(wkts.place1, [-122.405729, 37.802898], 16);
				break;
			case 'place2':
				drawPreDefinedLine(wkts.place2, [-111.022344, 35.027376], 13);
				break;
			case 'place3':
				drawPreDefinedLine(wkts.place3, [-121.747991, 46.820717], 11);
				break;
			case 'place4':
				drawPreDefinedLine(wkts.place4, [-114.743227, 36.008127], 13);
				break;
		}
	})

	drawPreDefinedLine(wkts.place1, [-122.405729, 37.802898], 16);
	drawChart();
})
/*===========================================================================*/
// Get Elevation Along Path
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
//   2. Define Global Variable
//   3. Map Control Setup
//   4. Elevation Setup
//   5. Chart Setup
//   6. Event Listeners
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
// 2. Define Global Variable
/*---------------------------------------------*/

// Next, we need to define some global variable which will be used later.
let selectedWaypoint;
let chartCtx;
let drawLineButton;
let wayPointNumRange;

// Thes wkts object defines our four pre-defined palce's coordinates in a Well-Known Text 
// format. You can choose them in the select form input to show defferent Elevation instance.
const wkts = {
	place1: 'LINESTRING(-13626205.692956349 4551708.736638038,-13626195.839745672 4551699.182009503,-13626193.74967068 4551687.537305975,-13626201.811388507 4551674.996856023,-13626214.35183846 4551662.754988211,-13626226.892288413 4551648.721627549,-13626231.968184823 4551636.479759738,-13626232.266766964 4551623.342145502,-13626226.59370627 4551608.114456273,-13626214.949002743 4551588.70661706,-13626200.019895656 4551563.327135012,-13626186.882281419 4551540.336310098,-13626178.521981452 4551522.719963735,-13626173.1475029 4551510.776678066,-13626164.48862079 4551497.340481687,-13626158.815560097 4551494.653242412,-13626148.663767276 4551508.985185215,-13626155.232574396 4551513.463917341,-13626160.009888664 4551522.421381594,-13626159.41272438 4551527.497278003,-13626165.981531497 4551533.767502979,-13626169.86309934 4551545.412206507,-13626169.86309934 4551555.563999327,-13626157.62123153 4551561.535642161)',

	place2: 'LINESTRING(-12359831.643855993 4167388.583607652,-12358190.636404995 4167794.6553204176)',

	place3: 'LINESTRING(-13552189.568676393 5907435.731019847,-13551272.32433697 5909939.0436961865,-13550909.248452617 5911391.347233605,-13550202.205940979 5911945.515688673,-13550679.93736776 5913990.2061953,-13551444.307650613 5915461.618989791,-13551520.744678898 5916684.611442354,-13552762.846388532 5917334.326182777,-13552533.535303677 5917831.166866631,-13553183.2500441 5918136.914979772,-13554024.057355236 5918041.368694415)',

	place4: 'LINESTRING(-12772636.98108149 4302695.261286651,-12772742.081995381 4302618.824258366,-12772894.956051951 4302461.172887527,-12773086.048622664 4302078.987746102,-12773157.708336681 4301739.798433086,-12773124.267136807 4301333.726720321,-12772775.523195256 4299876.645868635)'
};

/*---------------------------------------------*/
// 3. Map Control Setup
/*---------------------------------------------*/

// Now we'll create different layers with different data sources. These layers 
// all use ThinkGeo Cloud Maps Raster Tile service to display a detailed map. 
// For more info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_raster_tiles

// This urls object defines the layer data sources that our map will use. Map tiles 
// requested with a valid API key will be clear with no watermarks. Without an API 
// key, map tiles will still be returned, but will be watermarked with ThinkGeo's logo.
const urls = {
	light: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
	dark: `https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
	aerial: `https://cloud.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg?apiKey=${apiKey}`,
	transparentBackground: `https://cloud.thinkgeo.com/api/v1/maps/raster/transparent-background/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`
};

// Now let's create each actual map layer, using the data source URLs we 
// defined earlier.  We'll create the following layers:
//   1. light:  Street map with a light background and features.
//   2. dark:   Street map with a dark background and features.
//   3. aerial: Aerial imagery map with no street features or POIs.
//   4. transparentBackground: Just the streets and POIs with a transparent 
//      background.  Useful for displaying on top of the aerial layer, or
//      your own custom imagery layer.
// The "aerial" and transparentBackground layer will be our default, so for the others, we'll 
// set the "visible" property to false.
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

// Let's define the style of the start point, end point, waypoint, waypoint which be selected and the line style.
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

// Create the line layer using the pre-defined style and add it to our map later.
let lineLayer = new ol.layer.Vector({
	source: new ol.source.Vector(),
	style: function (feature) {
		// According to the feature type, we need to create different style for every feature.
		let type = feature.get('type');
		return styles[type];
	}
});

// Inherit the Drawing Control method into ourselves. 
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

// Create and initialize our raster map control.
let map = new ol.Map({
	// Add draw contorl to the map that let us draw lines when click the button.
	controls: ol.control
		.defaults({
			attributionOptions: {
				collapsible: false
			}
		})
		.extend([new drawLineControl()]),
	// Add our previously-defined ThinkGeo Cloud Raster Tile layers to the map.
	layers: [darkLayer, lightLayer, aerialLayer, transparentBackgroundLayer, lineLayer],
	// States that the HTML tag with id="map" should serve as the container for our map.
	target: 'map',
	// Create a default view for the map when it starts up.
	view: new ol.View({
		// Center the map on San Francisco - Coit Tower and start at zoom level 16.
		center: ol.proj.fromLonLat([-122.405729, 37.802898]),
		maxResolution: 40075016.68557849 / 512,
		zoom: 16,
		minZoom: 1,
		maxZoom: 19,
		progressiveZoom: false
	})
});

// Add a button to the map that lets us toggle full-screen display mode.
map.addControl(new ol.control.FullScreen());

// Create the interaction that allow us drawing geometries on our map.
let draw;
draw = new ol.interaction.Draw({
	// Add the draw feature to lineLayer which we defined earlier.
	source: lineLayer.getSource(),
	// Define the drawing feature type as "LineString", which meas we can draw lines on the map.
	type: 'LineString'
});

// Add an event listener to the map, that is when drawing start, empty the lines drawn earlier and 
// destroy the chart we created before. So there is always one line on the map once we started to draw a line.
draw.on('drawstart', () => {
	removeLine();
	removeChart();
});

// Add another event listener to the map, that is when drawing end, passing the line feature we drawn and 
// send the request to ThinkGeo Cloud to get the elevation results.
draw.on('drawend', (feature) => {
	lineFeature = feature.feature;
	drawElevationByLine(lineFeature);
});

// This method will activate the draw action and update the UI of button in the top right corner.
const activateDrawing = () => {
	removeLine();
	removeChart();
	map.addInteraction(draw);

	let buttonClasslist = drawLineButton.getElementsByTagName('button')[0].classList;
	buttonClasslist.add('on');
	document.getElementsByClassName('map-tip')[0].classList.add('visible');
};

// This method will deactivate the draw action and update the UI of button in the top right corner.
const deactivateDrawing = () => {
	removeLine();
	removeChart();
	map.removeInteraction(draw);

	let buttonClasslist = drawLineButton.getElementsByTagName('button')[0].classList;
	buttonClasslist.remove('on');
	document.getElementsByClassName('map-tip')[0].classList.remove('visible');
};

// When calling this method, the sources will be removed from lineLayer.
const removeLine = () => {
	let source = lineLayer.getSource();
	source.clear();
};


/*---------------------------------------------*/
// 4. Elevation Setup
/*---------------------------------------------*/

// Now we need to actually perfom the Elevation using the ThinkGeo Cloud Services. By passing the 
// WKT format geometries that was drawn, we can get back the grade (slope) of a line, optionally 
// split into segments. Then, we can send another request by passig the WKT fomrat geometries and 
// some other options to ThinkGeo Cloud, and get the elevation of points along the line.

// We use thinkgeocloudclient.js, which is an open-source Javascript SDK for making 
// request to ThinkGeo Cloud Service. It simplifies the process of the code of request.

// We need to create the instance of Elevation client and authenticate the API key.
let elevationClient = new tg.ElevationClient(apiKey);

// Declare the feature of the line that we add to map. 
let lineFeature;

// Define the options when we send request to ThinkGeo Cloud.
let opts = {
	srid: 3857,
	numberOfSegments: wayPointNumRange ? wayPointNumRange.value : 15,
	elevationUnit: 'Feet',
	intervalDistanceUnit: 'Feet'
};

// This method will return the waypoints data source and styles.
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

// This method is the callback method, which will recieve the results of grade (slope) of the line, 
// which split into segments. Then by passing the grades, we can draw it in the chart.
const getGrades = (res, wkt) => {
	let grades = [];
	for (let i = 0; i < res.data.length; i++) {
		let grade = res.data[i].grade;
		grades.push(grade);
	}

	opts['wkt'] = wkt;

	// Send request to get back the elevation of points along the line.
	elevationClient.getElevationOfLine(opts, (status, res) => {
		if (status == 403) {
			alert(res.error.message);
		} else {
			getElevation(res, wkt, grades);
		}
	});
};

// This method recieves the result that get back from ThinkGeo Cloud and render the result to our map. 
// Each points will be styled by different styles and added into lineLayer(defined earlier).
const getElevation = (res, wkt, grades) => {
	let format = new ol.format.WKT();
	// Get the last points and set its type as end.
	let geom = format.readGeometry(wkt);
	let lastCoordinates = geom.getLastCoordinate();
	let endFeature = new ol.Feature({
		geometry: new ol.geom.Point(lastCoordinates),
		type: 'end'
	});
	lineLayer.getSource().addFeature(endFeature);
	// Set the different style for every points.
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
	// By passing the waypoints, we can draw the grade line in the chart.
	let waypoints = getWaypoints(res.data);
	drawChart(waypoints, grades);
};

// This method will recive the feature we drawn. It judges if the line is too long, if it does, we 
// need to tell user to redraw a shorter line. If the line lenght is receivable, send the request 
// to perform elevation.
const drawElevationByLine = (feature) => {
	let line = feature.getGeometry();
	if (line.getLength() > 20000) {
		window.alert('The line is too long. Please re-enter!');
		removeLine();
		removeChart();
	} else {
		feature.set('type', 'route');
		let format = new ol.format.WKT();
		let wkt = format.writeGeometry(feature.getGeometry());
		opts['numberOfSegments'] = wayPointNumRange.value;
		opts['wkt'] = wkt;
		elevationClient.getGradeOfLine(opts, (status, res) => {
			if (status == 403) {
				alert(res.error.message);
			} else {
				getGrades(res, wkt);
			}
		});
	}
};

// When select the preset paths in the bottom right corner panel, 
const drawPreDefinedLine = (wkt, coord, zoom) => {
	map.getView().animate({
		center: ol.proj.fromLonLat(coord),
		zoom: zoom
	});

	let format = new ol.format.WKT();
	let geom = format.readGeometry(wkt);
	lineFeature = new ol.Feature({
		geometry: geom
	});
	lineLayer.getSource().addFeature(lineFeature);
	drawElevationByLine(lineFeature);
};

/*---------------------------------------------*/
// 5. Chart Setup
/*---------------------------------------------*/

// Since we have got the elevation and grade data, we need to perfom the data and render it on the chart.
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
						let index = tooltipItem.index;
						let label = data.datasets[tooltipItem.datasetIndex].label || '';
						if (label) {
							label += ': ';
						}
						let elevation = data.originaldata[index];
						if (grades == null) {
							label += 'Elevation: ' + elevation.elevation + 'ft';
						} else {
							label +=
								'Elevation: ' + elevation.elevation + 'ft' + '  grade: ' + grades[index];
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
						fontColor: '#ddd'
					},
					scaleLabel: {
						display: false,
						labelString: 'Distance(KM)'
					},
					gridLines: {
						color: '#555'
					}
				}],
				yAxes: [{
					display: true,
					scaleLabel: {
						display: true,
						labelString: 'Elevation(ft)'
					},
					gridLines: {
						color: '#555'
					},
					ticks: {
						callback: function (value) {
							if (Math.floor(value) === value) {
								return value;
							}
						},
						fontColor: '#ddd'
					}
				}]
			}
		}
	});
};

// This method will make the chart be empty.
const removeChart = () => {
	drawChart(null);
};


/*---------------------------------------------*/
// 6. Event Listeners
/*---------------------------------------------*/

// These event listeners tell the UI when it's time to execute all of the 
// code we've written.

// This method actually applies the requested layer style changes to the map.
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

document.addEventListener('DOMContentLoaded', () => {
	chartCtx = document.getElementById('chartContainer').getContext('2d');
	drawLineButton = document.getElementsByClassName('drawline')[0];
	wayPointNumRange = document.getElementById('samples-number');

	// This listener will activate the drawing action when click the draw line button in the top right corner.
	drawLineButton.addEventListener('click', () => {
		activateDrawing();
	});

	// This listener gets the number of smaples and passing the value to perform elevation.
	wayPointNumRange.addEventListener('change', (e) => {
		e = window.event || e;
		removeLine();
		removeChart();
		selectedWaypoint = null;
		if (lineFeature) {
			lineLayer.getSource().addFeature(lineFeature);
			drawElevationByLine(lineFeature);
		} else {
			let place = document.getElementById('places').value;
			let format = new ol.format.WKT();
			let geom = format.readGeometry(wkts[place]);
			lineFeature = new ol.Feature({
				geometry: geom,
				type: 'route'
			});
			lineLayer.getSource().addFeature(lineFeature);
			drawElevationByLine(lineFeature);
		}
	});

	// This listener will activate the drawing action when click the Draw New Path button in the bottom right panel.
	document.getElementsByClassName('buttonDraw')[0].addEventListener('click', () => {
		activateDrawing();
	});

	// When click the different styles button, render the relevant style map.
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
	});

	// When click the info icon button, show the information about Number of Samples.
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
	});

	// When click the close icon button, the info container will be hidden.
	document.getElementsByClassName('close')[0].addEventListener('click', (e) => {
		e = window.event || e;
		let parentNode = e.target.parentNode;
		parentNode.classList.add('hide');
	});

	// When select the different paths, draw different paths.
	document.getElementById('places').addEventListener('change', (e) => {
		e = window.event || e;
		deactivateDrawing();
		switch (e.target.value) {
			case 'place1':
				drawPreDefinedLine(wkts.place1, [-122.405729, 37.802898], 16);
				break;
			case 'place2':
				drawPreDefinedLine(wkts.place2, [-111.022344, 35.027376], 14);
				break;
			case 'place3':
				drawPreDefinedLine(wkts.place3, [-121.747991, 46.820717], 11);
				break;
			case 'place4':
				drawPreDefinedLine(wkts.place4, [-114.743227, 36.008127], 13);
				break;
		}
	});

	// Draw the default line and init chart.
	drawPreDefinedLine(wkts.place1, [-122.405729, 37.802898], 16);
	drawChart();
});
var selectedWaypoint;
var chart;
var chartCtx;
var styles;
var draw;
var samplesNumber;
var interval;
var intervalLine;
var intervalDistanceUnit = 'Feet';

const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';

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

	place3: 'LINESTRING(-13552189.568676393 5907435.731019847,-13551272.32433697 5909939.0436961865,-13550909.248452617 5911391.347233605,-13550202.205940979 5911945.515688673,-13550679.93736776 5913990.2061953,-13551444.307650613 5915461.618989791,-13551520.744678898 5916684.611442354,-13552762.846388532 5917334.326182777,-13552533.535303677 5917831.166866631,-13553183.2500441 5918136.914979772,-13554024.057355236 5918041.368694415)'
};

window.app = {};
const app = window.app;

//Draw Line
app.drawLineControl = function (opt_options) {
	const options = opt_options || {};
	const button = document.createElement('button');
	button.className = 'on';
	const element = document.createElement('div');
	element.className = 'drawline ol-unselectable ol-control';
	element.appendChild(button);
	ol.control.Control.call(this, {
		element: element,
		target: options.target
	});
};

ol.inherits(app.drawLineControl, ol.control.Control);

$(function () {
	var defaultClient = GisServerApis.ApiClient.instance;
	defaultClient.basePath = 'https://cloud.thinkgeo.com';
	var APIKey = defaultClient.authentications['API Key'];
	APIKey.apiKey = apiKey;
});

var lineLayer = new ol.layer.Vector({
	source: new ol.source.Vector(),
	style: function (feature) {
		var key = feature.get('type');
		return styles[key];
	}
});
var addFeature = function (feature) {
	lineLayer.getSource().addFeature(feature);
};
var removeFeature = function (feature) {
	lineLayer.getSource().removeFeature(feature);
};

//Define style
var styles = {
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


//Craete map
var map = new ol.Map({
	controls: ol.control
		.defaults({
			attributionOptions: {
				collapsible: false
			}
		})
		.extend([new app.drawLineControl()]),

	layers: [darkLayer, lightLayer, aerialLayer, transparentBackgroundLayer, lineLayer],
	target: 'map',
	view: new ol.View({
		center: ol.proj.fromLonLat([-122.405729, 37.802898]),
		maxResolution: 40075016.68557849 / 512,
		zoom: 16,
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

var drawLineElevation = function (feature, wkt) {
	var apiInstance = new GisServerApis.ElevationApi();
	if (wkt) {
		opts = {
			srid: 3857,
			numberOfSegments: samplesNumber || 15,
			intervalDistance: intervalLine || null,
			elevationUnit: 'Feet',
			intervalDistanceUnit: intervalDistanceUnit || 'Feet'
		};
		var grades = [];
		apiInstance.getGradeOfLineV1(wkt, opts, function (error, data, response) {
			if (error) {
				console.error(error);
			} else {
				for (let i = 0; i < data.data.length; i++) {
					var grade = data.data[i].grade;
					grades.push(grade);
				}
			}
		});

		apiInstance.getElevationOfLineV1(wkt, opts, function (error, data, response) {
			if (error) {
				console.log(error);
			} else {
				var format = new ol.format.WKT();
				var geom = format.readGeometry(wkt);
				var coordinates = geom.getLastCoordinate();
				addFeature(
					new ol.Feature({
						geometry: new ol.geom.Point(coordinates),
						type: 'end'
					})
				);
				var l = data.data.length;
				for (let i = 0; i < l; i++) {
					var item = data.data[i];
					var start = data.data[0];
					var waypoint = format.readFeature(item.wellKnownText);
					var startpoint = format.readFeature(start.wellKnownText);
					startpoint.set('type', 'start');
					waypoint.set('type', 'waypoint');
					addFeature(startpoint);
					addFeature(waypoint);
				}
				var datas = getChartDataSet(data.data);
				drawChart(datas, grades);
			}
		});
	} else {
		var line = feature.getGeometry();
		if (line.getLength() > 20000) {
			window.alert('The test distance is too long and the input is invalid. Please re-enter!');
			clear();
			drawChart(null);
			feature.set('type', null);
			map.removeInteraction(
				new ol.interaction.Draw({
					source: lineLayer.getSource(),
					type: 'LineString'
				})
			);
		} else {
			var format = new ol.format.WKT();
			var wkt = format.writeGeometry(feature.getGeometry());
			var opts = {
				srid: 3857,
				numberOfSegments: samplesNumber || 15,
				intervalDistance: intervalLine || null,
				elevationUnit: 'Feet',
				intervalDistanceUnit: intervalDistanceUnit || 'Feet'
			};
			var grades = [];
			apiInstance.getGradeOfLineV1(wkt, opts, function (error, data, response) {
				if (error) {
					console.error(error);
				} else {
					for (let i = 0; i < data.data.length; i++) {
						var grade = data.data[i].grade;
						grades.push(grade);
					}
				}
			});

			apiInstance.getElevationOfLineV1(wkt, opts, function (error, data, response) {
				if (error) {} else {
					var coordinates = feature.getGeometry().getLastCoordinate();
					addFeature(
						new ol.Feature({
							geometry: new ol.geom.Point(coordinates),
							type: 'end'
						})
					);
					for (let i = 0; i < data.data.length; i++) {
						var item = data.data[i];
						var start = data.data[0];
						var waypoint = format.readFeature(item.wellKnownText);
						var startpoint = format.readFeature(start.wellKnownText);
						startpoint.set('type', 'start');
						waypoint.set('type', 'waypoint');
						addFeature(startpoint);
						addFeature(waypoint);
					}
					var datas = getChartDataSet(data.data);
					drawChart(datas, grades);
				}
			});
		}
	}
};

//Change the parameters
var canExecuteApiCall = function () {
	var samplesNumber = $('#samples-number').val();
	if (Number.isNaN(samplesNumber)) {
		return false;
	}
	return parseInt(samplesNumber) > 0;
};

var featureLine;
$('.drawline').click(function () {
	samplesNumber = $('#samples-number').val();
	intervalLine = null;
	$('#side-bar').show();
	clear();
	drawChart(null);
	selectedWaypoint = null;
	map.removeInteraction(draw);
	draw = new ol.interaction.Draw({
		source: lineLayer.getSource(),
		type: 'LineString'
	});
	map.addInteraction(draw);

	draw.on('drawstart', function (feature) {
		clear();
		drawChart(null);
	});

	draw.on('drawend', function (feature) {
		featureLine = feature.feature;
		featureLine.set('type', 'route');
		drawLineElevation(featureLine);
	});
});

var defaultFeature;
$('#samples-number').on('change', function () {
	samplesNumber = $('#samples-number').val();
	intervalLine = null;
	clear();
	drawChart(null);
	selectedWaypoint = null;
	if (canExecuteApiCall()) {
		if (featureLine) {
			drawLineElevation(featureLine);
			featureLine.set('type', 'route');
			addFeature(featureLine);
		} else {
			var format = new ol.format.WKT();
			var place = $('#places').val();
			var geom = format.readGeometry(wkts[place]);
			var feature = new ol.Feature({
				geometry: geom,
				type: 'route'
			});
			drawLineElevation(feature);
			feature.set('type', 'route');
			addFeature(feature);
		}
	}
});

var defaultLine = function () {
	var defaultClient = GisServerApis.ApiClient.instance;
	defaultClient.basePath = 'https://cloud1.thinkgeo.com';
	var APIKey = defaultClient.authentications['API Key'];
	APIKey.apiKey = apiKey;

	var format = new ol.format.WKT();
	var defaultWkt = wkts.place1;
	var defalutGeom = format.readGeometry(defaultWkt);
	defaultFeature = new ol.Feature({
		geometry: defalutGeom,
		type: 'route'
	});
	addFeature(defaultFeature);
	drawLineElevation(defaultFeature);
};

$(defaultLine());

var clear = function () {
	var source = lineLayer.getSource();
	source.clear();
};

function sortNumber(a, b) {
	return a - b;
}
var getSequentialArray = function (data) {
	var values = [];
	for (var i = 0; i < data.length; i++) {
		values.push(data[i].elevation);
	}
	return values.sort(sortNumber);
};

var getChartDataSet = function (data) {
	var labels = [];
	var values = [];
	for (var i = 0; i < data.length; i++) {
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

//Render result to chart
var initChart = function () {
	chartCtx = document.getElementById('chartContainer').getContext('2d');
};
var drawChart = function (data, grades) {
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
						var label = data.datasets[tooltipItem.datasetIndex].label || '';
						if (label) {
							label += ': ';
						}
						var elevation = data.originaldata[tooltipItem.index];
						if (grades == null) {
							label += 'Elevation: ' + elevation.elevation + 'ft';
						} else {
							label +=
								'Elevation: ' + elevation.elevation + 'ft' + '  grade: ' + grades[tooltipItem.index];
						}
						if (selectedWaypoint) {
							removeFeature(selectedWaypoint);
						}
						var wktReader = new ol.format.WKT();
						selectedWaypoint = wktReader.readFeature(elevation.wellKnownText);
						selectedWaypoint.set('type', 'waypoint-selected');
						addFeature(selectedWaypoint);
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
					scaleLabel: {
						display: false,
						labelString: 'Distance(KM)'
					}
				}],
				yAxes: [{
					display: true,
					scaleLabel: {
						display: true,
						labelString: 'Elevation(ft)'
					},
					ticks: {
						callback: function (value) {
							if (Math.floor(value) === value) {
								return value;
							}
						}
					}
				}]
			}
		}
	});
};

const changeLayer = function (e) {
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

$(initChart(), drawChart());

$(function () {
	$('.buttonClear').click(function () {
		samplesNumber = $('#samples-number').val();
		selectedWaypoint = null;
		map.removeInteraction(draw);
		draw = new ol.interaction.Draw({
			source: lineLayer.getSource(),
			type: 'LineString'
		});
		map.addInteraction(draw);

		draw.on('drawstart', function (feature) {
			selectedWaypoint = null;
			clear();
			drawChart(null);
		});

		draw.on('drawend', function (feature) {
			featureLine = feature.feature;
			featureLine.set('type', 'route');
			drawLineElevation(featureLine);
		});
		clear();
		drawChart(null);
	});

	$('.style-btn-group').click(function (e) {
		if (e.target.nodeName == 'BUTTON') {
			changeLayer(e);
		}
		$('.style-btn-group button').removeClass('current');
		$(e.target).addClass('current');
	});

	$('.info').click(function (e) {
		if ($('.info p').hasClass('hide')) {
			$('.info p').removeClass('hide');
		} else {
			$('.info p').addClass('hide');
		}
	});

	$('.info p').click(function () {
		return false;
	});

	$('.close').click(function () {
		$('.info p').addClass('hide');
	});

	$('#places').change(function (e) {
		var geom;
		var newFeature;
		var format = new ol.format.WKT();
		switch (e.target.value) {
			case 'place1':
				map.getView().animate({
					center: ol.proj.fromLonLat([-122.405729, 37.802898]),
					zoom: 16
				});
				var geom = format.readGeometry(wkts.place1);
				newFeature = new ol.Feature({
					geometry: geom,
					type: 'route'
				});
				addFeature(newFeature);
				drawLineElevation(null, wkts.place1);
				break;
			case 'place2':
				map.getView().animate({
					center: ol.proj.fromLonLat([-111.022344, 35.027376]),
					zoom: 13
				});
				var geom = format.readGeometry(wkts.place2);
				newFeature = new ol.Feature({
					geometry: geom,
					type: 'route'
				});
				addFeature(newFeature);
				drawLineElevation(null, wkts.place2);
				break;
			case 'place3':
				map.getView().animate({
					center: ol.proj.fromLonLat([-121.747991, 46.820717]),
					zoom: 11
				});
				var geom = format.readGeometry(wkts.place3);
				newFeature = new ol.Feature({
					geometry: geom,
					type: 'route'
				});
				addFeature(newFeature);
				drawLineElevation(null, wkts.place3);
				break;
		}
	});
});
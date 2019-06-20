let source;
let routingLayer;
let curCoord;
let startPoint = [];
let endPoint = [];
let lastLinePoint;
let firstLinePoint;
let wktLineFeature;
let overlay;
let listener;
let modifyInteraction;
let turnFeature;
let points = [];
let coordBeforeMove;

window.app = {};
var app = window.app;

const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';

const routingClient = new tg.RoutingClient(apiKey);

const lightLayer = new ol.mapsuite.VectorTileLayer('https://cdn.thinkgeo.com/worldstreets-styles/3.0.0/light.json', {
	apiKey: apiKey,
	layerName: 'light'
});

let map;
const view = new ol.View({
	center: ol.proj.fromLonLat([-96.7962, 42.79423]),
	maxResolution: 40075016.68557849 / 512,
	progressiveZoom: false,
	zoom: 3,
	minZoom: 2,
	maxZoom: 19
});

const initializeMap = () => {
	map = new ol.Map({
		renderer: 'webgl',
		loadTilesWhileAnimating: true,
		loadTilesWhileInteracting: true,
		layers: [lightLayer],
		target: 'map',
		view: view,
		interactions: ol.interaction.defaults().extend([new app.Drag()])
	});

	source = new ol.source.Vector();
	routingLayer = new ol.layer.Vector({
		source: source
	});
	routingLayer.set('layerName', 'routing');
	map.addLayer(routingLayer);

	let container = document.querySelector('#popup');
	container.classList.remove('hide');
	overlay = new ol.Overlay({
		element: container,
		offset: [-27, 12],
		autoPan: false
	});

	map.addOverlay(overlay);
	let u = navigator.userAgent;
	const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
	const isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
	let left, top;
	let clientWidth = document.documentElement.clientWidth;
	let clientHeight = document.documentElement.clientHeight;
	const contextmenu = document.querySelector('#ol-contextmenu');
	const insTip = document.querySelector('#instruction-tip');
	let timeOutEvent;
	const contextWidth = 165;
	if (isiOS) {
		map.getViewport().addEventListener('gesturestart', function (e) {
			clearTimeout(timeOutEvent);
			timeOutEvent = 0;
			return false;
		});

		map.getViewport().addEventListener('touchstart', function (e) {
			e.preventDefault();
			if (e.touches.length != 1) {
				clearTimeout(timeOutEvent);
				timeOutEvent = 0;
				return false;
			}
			timeOutEvent = setTimeout(function () {
				if (e.touches.length == 1) {
					timeOutEvent = 0;
					left =
						e.changedTouches[0].clientX + contextWidth > clientWidth ?
						clientWidth - contextWidth :
						e.changedTouches[0].clientX;
					top =
						e.changedTouches[0].clientY + contextmenu.offsetHeight > clientHeight ?
						clientHeight - contextmenu.offsetHeight :
						e.changedTouches[0].clientY;
					contextmenu.style.left = left + 'px';
					contextmenu.style.top = top + 'px';
					let point = map.getEventCoordinate(e);
					curCoord = point;
					hideOrShowContextMenu('show');
					insTip.classList.add('gone');
				}
			}, 500);
		});

		map.getViewport().addEventListener('touchend', function (event) {
			clearTimeout(timeOutEvent);
			if (timeOutEvent != 0) {
				hideOrShowContextMenu('hide');
			}
			return false;
		});

		map.getViewport().addEventListener('touchmove', function (event) {
			clearTimeout(timeOutEvent);
			timeOutEvent = 0;
			return false;
		});
	} else {
		map.getViewport().addEventListener('contextmenu', (e) => {
			hideOrShowContextMenu('show');
			insTip.classList.add('gone');
			left =
				e.clientX + contextWidth > clientWidth ? clientWidth - contextWidth : e.clientX;
			top =
				e.clientY + contextmenu.offsetHeight > clientHeight ?
				clientHeight - contextmenu.offsetHeight :
				e.clientY;

			contextmenu.style.left = left + 'px';
			contextmenu.style.top = top + 'px';
			let point = map.getEventCoordinate(e);
			curCoord = point;
		});
	}

	// Show the mobile instruction tip on Android and IOS, and show pc tip on PC.
	if (isiOS || isAndroid) {
		document.querySelector('.mobile-tip').classList.remove('hide');
	} else {
		document.querySelector('.pc-tip').classList.remove('hide');
	}

	map.on('pointermove', function (e) {
		if (e.dragging) {
			return;
		}
		const pixel = map.getEventPixel(e.originalEvent);
		const hit = map.hasFeatureAtPixel(pixel);
		let cursor = false;
		if (hit) {
			const features = map.getFeaturesAtPixel(pixel);

			features.some((feature) => {
				let featureName = feature.get('name');
				if (featureName === 'start' || featureName === 'end') {
					cursor = true;
					return true;
				}
			});
		} else {
			cursor = false;
		}
		map.getTargetElement().style.cursor = cursor ? 'pointer' : '';
	});
};

const errorLoadingTile = () => {
	const errorModal = document.querySelector('#error-modal');
	if (errorModal.classList.contains('hide')) {
		// Show the error tips when Tile loaded error.
		errorModal.classList.remove('hide');
	}
}

const setLayerSourceEventHandlers = (layer) => {
	let layerSource = layer.getSource();
	layerSource.on('tileloaderror', function () {
		document.querySelector('.sidebar').classList.add('hide');
		errorLoadingTile();
	});
}

setLayerSourceEventHandlers(lightLayer);

const styles = {
	start: new ol.style.Style({
		image: new ol.style.Icon({
			anchor: [0.5, 0.9],
			anchorXUnits: 'fraction',
			anchorYUnits: 'fraction',
			opacity: 1,
			crossOrigin: "Anonymous",
			src: '../image/starting.png'
		})
	}),
	end: new ol.style.Style({
		image: new ol.style.Icon({
			anchor: [0.5, 0.9],
			anchorXUnits: 'fraction',
			anchorYUnits: 'fraction',
			opacity: 1,
			crossOrigin: "Anonymous",
			src: '../image/ending.png'
		})
	}),
	mid: new ol.style.Style({
		image: new ol.style.Circle({
			radius: 10,
			fill: new ol.style.Fill({
				color: [255, 255, 255, 19]
			}),
			stroke: new ol.style.Stroke({
				color: [29, 93, 48, 1],
				width: 6
			})
		})
	}),
	line: new ol.style.Style({
		stroke: new ol.style.Stroke({
			width: 6,
			color: [34, 109, 214, 0.9]
		})
	}),
	line_halo: new ol.style.Style({
		stroke: new ol.style.Stroke({
			width: 10,
			lineCap: 'round',
			color: [34, 109, 214, 1]
		})
	}),
	walkLine: new ol.style.Style({
		stroke: new ol.style.Stroke({
			width: 2,
			lineDash: [5, 3],
			color: [34, 109, 214, 1]
		})
	}),
	resultRadius: new ol.style.Style({
		image: new ol.style.Circle({
			radius: 15,
			fill: new ol.style.Fill({
				color: [255, 102, 0, 0.4]
			}),
			stroke: new ol.style.Stroke({
				color: [255, 102, 0, 0.8],
				width: 1
			})
		})
	})
}

const addPointFeature = (name, coord) => {
	document.querySelector('#result').classList.add('hide');
	if (name === 'start') {
		removeFeatureByName(name);
	} else if (name === 'end') {
		removeFeatureByName(name);
	}
	let feature = new ol.Feature({
		geometry: new ol.geom.Point(coord),
		name: name
	});
	feature.setStyle(styles[name]);
	source.addFeatures([feature]);
}

const addRouteFeature = (wkt) => {
	const format = new ol.format.WKT();
	const routeFeature = format.readFeature(wkt);
	routeFeature.set('name', 'line');
	routeFeature.setStyle([styles.line, styles.line_halo]);
	source.addFeature(routeFeature);
}

const addWalkLinesFeatures = (waypointsCoord) => {
	let features = [];
	points.forEach((point, index) => {
		const point_ = new ol.proj.transform(point, 'EPSG:4326', 'EPSG:3857');
		const feature = new ol.Feature({
			geometry: new ol.geom.LineString([point_, waypointsCoord[index]]),
			name: 'line'
		});
		features.push(feature);
	});
	source.addFeatures(features);
}

const addResultRadius = (coord) => {
	removeFeatureByName('resultRadius');
	let center = coord;
	let resultRadiusFeature = new ol.Feature({
		geometry: new ol.geom.Point(center),
		name: 'resultRadius'
	});
	resultRadiusFeature.setStyle(styles.resultRadius);
	routingLayer.getSource().addFeature(resultRadiusFeature);
}

const formatDistanceAndDuration = (distance, duration) => {
	let distance_;
	let duration_;
	if (distance >= 1000) {
		distance_ = distance / 1000;
		distance_ = Math.round(distance_ * 10) / 10;
		distance_ = new Intl.NumberFormat().format(distance_);
		distance_ = distance_ + 'km';
	} else {
		distance_ = Math.round(distance * 10) / 10;
		distance_ = distance_ + 'm';
	}

	if (duration > 60) {
		let hours = parseInt(duration / 60);
		let min = Math.round(duration % 60);
		hours = new Intl.NumberFormat().format(hours);
		duration_ = `${hours}h ${min}min`;
	} else {
		duration_ = Math.round(duration * 10) / 10;
		duration_ = `${duration_}min`;
	}

	return {
		distance: distance_,
		duration: duration_
	};
};

const generateBox = (routes) => {
	const lineWkt = routes.geometry;
	let segments = routes.segments;
	let count = 0;

	let distance = Math.round(routes.distance * 100) / 100;
	let duration = Math.round(routes.duration * 100) / 100;
	let format = formatDistanceAndDuration(distance, duration);
	let warnings
	if (routes.warnings) {
		let str = ``
		Object.keys(routes.warnings).map((key) => {
			str += `${routes.warnings[key]}  `
		})
		warnings = `<p class="warnings">${str} </p> `
	} else {
		warnings = ''
	}

	let boxesDom = document.querySelector('#boxes');
	let totalDom = document.querySelector('#total');
	let total = `<span class='format-distance'>${format.distance}</span>
				 <span class='format-duration'>${format.duration}</span> 
				 ${warnings}
				  <button id='menu'></button>
				  <button id='closeMenu'></button>
				`;
	totalDom.innerHTML = total;
	boxesDom.innerHTML = '';
	removeFeatureByName('line');
	removeFeatureByName('resultRadius');
	let lastLinePenultCoord = [];
	let lastLineLastCoord = [];
	var isTurn = true;
	var polylineCoords = [];

	addRouteFeature(lineWkt);

	let segments_ = segments.map(item => {
		let polyline = item.geometry;
		let polylineCoord = polyline.split('(')[1].split(')')[0].split(',');
		let secondPointFromStart = findSecondPointFromStart(polylineCoord);

		return secondPointFromStart ? item : false;
	}).filter(item => item);

	segments_.forEach((item) => {
		count++;
		let polyline = item.geometry;
		let polylineCoord = polyline.split('(')[1].split(')')[0].split(',');
		let secondPointFromStart = findSecondPointFromStart(polylineCoord);
		let secondPointFromEnd = findSecondPointFromEnd(polylineCoord);

		let startCoord = polylineCoord[0];
		polylineCoords.push(polylineCoord);
		let instruction = item.instruction;
		const maneuverType = item.maneuverType;
		let boxInnerDom;
		let format = formatDistanceAndDuration(item.distance, item.duration);
		distance = format.distance;
		duration = format.duration;
		let className;
		let warnStr
		if (item.isToll) {
			warnStr = '<span class="warnings-small ">Toll road</span>'
		} else {
			warnStr = ''
		}
		isTurn = true;

		switch (maneuverType) {
			case 'turn-left':
				className = `left`;
				break;
			case 'sharp-left':
				className = `sharp_left`;
				break;
			case 'slightly-left':
				className = `slight_left`;
				break;
			case 'turn-right':
				className = `right`;
				break;
			case 'sharp-right':
				className = `sharp_right`;
				break;
			case 'slightly-right':
				className = `slight_right`;
				break;
			case 'straight-on':
				className = `straight_on`;
				isTurn = false;
				break;
			case 'u-turn':
				className = `turn-back`;
				break;
			case 'start':
				className = `start`;
				isTurn = false;
				break;
			case 'stop':
				className = `end`;
				isTurn = false;
				break;
			case 'roundabout':
				className = `around_circle_straight`;
				break;
		}

		boxInnerDom = count !== segments_.length ? `<span class="direction-wrap" ><i class="direction ${className}"></i></span><span title='${instruction}' class="instruction">${instruction}</span>
				<span class="distance">${distance}</span><span  class="duration">${duration}</span>${warnStr}` :
			`<span class="direction-wrap" ><i class="direction ${className}"></i></span><span class="instruction endPoint">${instruction}</span>`;
		let boxDom = document.createElement('DIV');
		boxDom.className = 'box';
		boxDom.id = count;
		if (count === 1) {
			firstLinePoint = startCoord.split(' ');
			firstLinePoint = [+firstLinePoint[0], +firstLinePoint[1]];

			let penult = secondPointFromEnd;
			penultPoint = penult.split(' ');
			penultPoint = [+penultPoint[0], +penultPoint[1]];

			let last = polylineCoord[polylineCoord.length - 1];
			lastPoint = last.split(' ');
			lastPoint = [+lastPoint[0], +lastPoint[1]];

			lastLinePenultCoord = penult;
			lastLineLastCoord = last;

			let penult_ = polylineCoord[0];
			penult_ = penult_.split(' ');

			let last_ = polylineCoord[1];
			let lastPoint_ = last_.split(' ');
			lastPoint_ = [+lastPoint_[0], +lastPoint_[1]];
		}

		if (count === segments_.length) {
			let endCoord = polylineCoord[polylineCoord.length - 1];
			lastLinePoint = endCoord.split(' ');
			lastLinePoint = [+lastLinePoint[0], +lastLinePoint[1]];
			boxDom.setAttribute('coord', endCoord);
		} else {
			boxDom.setAttribute('coord', startCoord);
		}

		if (count >= 2) {
			boxDom.setAttribute('lastLinePenultCoord', lastLinePenultCoord);
			boxDom.setAttribute('lastLineLastCoord', lastLineLastCoord);
			isTurn && boxDom.setAttribute('lineSecondCoord', secondPointFromStart);

			let penult = secondPointFromEnd;
			penultPoint = penult.split(' ');
			penultPoint = [+penultPoint[0], +penultPoint[1]];

			let last = polylineCoord[polylineCoord.length - 1];
			lastPoint = last.split(' ');
			lastPoint = [+lastPoint[0], +lastPoint[1]];

			lastLinePenultCoord = penult;
			lastLineLastCoord = last;
		}

		boxDom.setAttribute('instruction', instruction);
		boxDom.innerHTML = boxInnerDom;
		boxesDom.appendChild(boxDom);
	});

	if (document.body.clientWidth <= 767) {
		const result = document.getElementById('result');

		result.style.height = 60 + 'px';
		const menu = document.getElementById('menu');
		const closeMenu = document.getElementById('closeMenu');

		menu.addEventListener('click', () => {
			result.style.height = 240 + 'px';
			result.style.overflowY = 'auto';
			menu.style.display = 'none';
			closeMenu.style.display = 'inline-block';
		});

		closeMenu.addEventListener('click', () => {
			result.style.height = 60 + 'px';
			result.style.overflow = 'hidden';
			closeMenu.style.display = 'none';
			menu.style.display = 'inline-block';
		});
	}
};

const findSecondPointFromStart = (coordinates) => {
	for (let i = 0; i < coordinates.length - 1; i++) {
		if (coordinates[i + 1] != coordinates[i]) {
			return coordinates[i + 1];
		}
	}

	return false;
}

const findSecondPointFromEnd = (coordinates) => {
	for (let i = coordinates.length - 1; i > 0; i--) {
		if (coordinates[i - 1] != coordinates[i]) {
			return coordinates[i - 1];
		}
	}

	return false;
}

const hideOrShowContextMenu = (style) => {
	let contextmenu = document.querySelector('#ol-contextmenu');
	switch (style) {
		case 'hide':
			contextmenu.classList.add('hide');
			break;
		case 'show':
			contextmenu.classList.remove('hide');
	}
};

const removeFeatureByName = (featureName) => {
	if (source) {
		const features = source.getFeatures();
		for (let i = 0, l = features.length; i < l; i++) {
			let feature = features[i];
			if (feature.get('name') === featureName) {
				source.removeFeature(feature);
			}
		}
	}
}

const addPopup = (coordinates, instruction) => {
	let popupContent = document.querySelector('#popup-content');
	popupContent.innerHTML = instruction;
	overlay.setPosition(coordinates);
};

const addPointsFeature = () => {
	const length = points.length;
	let features = [];
	points.forEach((point, index) => {
		let feature;
		let coord = point;
		let type;
		if (index === 0) {
			// Add start point style to the start point.
			type = 'start';
		} else if (index === length - 1) {
			// Add end point style to the end point.
			type = 'end';
		} else {
			// Add mid point style to the mid points.
			type = 'mid';
		}
		feature = new ol.Feature({
			geometry: new ol.geom.Point(coord),
			name: type,
			id: index
		});
		feature.setStyle(styles[type]);
		features.push(feature);
	});
	source.addFeatures(features)
}

const gotResponse = (res) => {
	const data = res.data;
	const routes = data.routes[0];
	generateBox(routes);
	const waypointsCoord = data.waypoints.map(item => {
		return [item.coordinate.x, item.coordinate.y]
	});
	addWalkLinesFeatures(waypointsCoord);
	// addPointsFeature();
};

const performRouting = () => {
	const points = getAllPoints();
	const inputsCount = document.querySelectorAll('.point input');
	if (points && points.length >= 2 && inputsCount.length === points.length) {
		document.querySelector('.loading').classList.remove('hide');
		document.querySelector('#result').classList.add('hide');

		const options = {
			turnByTurn: true,
			srid: 3857
		};
		const callback = (status, response) => {
			resetSidebarHeight();
			document.querySelector('.sidebar').style.height = 'unset';
			if (status === 200) {
				result.classList.remove('error-on-mobile');
				document.querySelector('.loading').classList.add('hide');
				document.querySelector('#result').classList.remove('hide');
				gotResponse(response);
			} else {
				document.querySelector('.loading').classList.add('hide');
				result.classList.remove('hide');
				document.querySelector('#total').innerHTML = '';

				if (document.body.clientWidth <= 767) {
					result.classList.add('error-on-mobile');
				}
				if (status === 400) {
					const data = response.data;
					let message = '';
					Object.keys(data).forEach((key) => {
						message = message + data[key] + '<br />'
					})
					result.querySelector('#boxes').innerHTML = `<div class="error-message">${message}</div>`;
				} else if (status === 401 || status === 410 || status === 404) {
					result.querySelector('#boxes').innerHTML = `<div class="error-message">${response.error.message}</div>`;
				} else if (status === 'error') {
					document.querySelector('.sidebar').classList.add('hide');
					errorLoadingTile();
				} else {
					result.querySelector('#boxes').innerHTML = `<div class="error-message">Request failed.</div>`;
				}
			}
		}

		const points_ = points.map(point => {
			return {
				x: point[0],
				y: point[1]
			}
		});

		routingClient.getRoute(points_, callback, options);
	} 
};

const addDestination = () => {
	const add = document.querySelector('.add');
	add.classList.add('hide');
	const addDom = `<p class="added"><label></label><input placeholder="Add Destination" /><span class="delete"></span> </p>`;
	add.insertAdjacentHTML('beforebegin', addDom);
};

let arrowFeature;
const addArrow = (penultCoord, lastCoord) => {
	removeFeatureByName('arrow');

	arrowFeature = new ol.Feature({
		geometry: new ol.geom.Point(lastCoord),
		name: 'arrow'
	});

	const dx = lastCoord[0] - penultCoord[0];
	const dy = lastCoord[1] - penultCoord[1];

	const rotation = Math.atan2(dy, dx);

	const arrowStyle = new ol.style.Style({
		image: new ol.style.Icon({
			anchor: [0.5, 0.5],
			anchorXUnits: 'fraction',
			anchorYUnits: 'fraction',
			crossOrigin: "Anonymous",
			src: '../image/arrow.png',
			rotateWithView: true,
			rotation: -rotation
		})
	});

	arrowFeature.setStyle(arrowStyle);
	source.addFeature(arrowFeature);
};

const addTurnLine = (penultCoord, lastCoord, lineSecondCoord) => {
	var lineFeature = new ol.Feature({
		geometry: new ol.geom.LineString([penultCoord, lastCoord, lineSecondCoord]),
		name: 'arrow'
	});

	lineFeature.setStyle(new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: '#0a5012',
			width: 6
		})
	}));
	source.addFeature(lineFeature);
};

const lerp = (firstCoord, secondCoord) => {
	var resolution = view.getResolution();
	var x1 = firstCoord[0];
	var y1 = firstCoord[1];
	var x2 = secondCoord[0];
	var y2 = secondCoord[1];
	var length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / resolution;
	var x, y;

	if (length > 50) {
		var interpolate = 50 / length;
		var x = ol.math.lerp(x1, x2, interpolate);
		var y = ol.math.lerp(y1, y2, interpolate);

		return [x, y];
	}

	return secondCoord;
}

const clearInputBox = () => {
	const inputs = document.querySelectorAll('.point input');
	inputs.forEach(input => {
		input.setAttribute('data-origin', '');
		input.value = '';
	});

};

const updateOriginByInputValue = () => {
	let startInput = document.querySelector('.start input');
	let endInput = document.querySelector('.end input');
	if (startInput.value) {
		let startValue = startInput.value;
		startValue = startValue.split(',');
		if (startValue.length === 2) {
			let startValue_ = [Number(startValue[1]), Number(startValue[0])];
			startInput.setAttribute('data-origin', new ol.proj.fromLonLat(startValue_));
			startPoint = (new ol.proj.fromLonLat(startValue_)).slice();
		} else {
			// startInput.setAttribute('data-origin', startValue);
			// startPoint = startValue.slice();
		}
	} else {
		startInput.setAttribute('data-origin', '');
	}
	if (endInput.value) {
		let endValue = endInput.value;
		endValue = endValue.split(',');
		if (endValue.length === 2) {
			let endValue_ = [];
			endValue_[1] = Number(endValue[0]);
			endValue_[0] = Number(endValue[1]);

			endInput.setAttribute('data-origin', new ol.proj.fromLonLat(endValue_));
			let endPoint_ = endValue_.slice();
			endPoint = endPoint_.slice();
		} else {
			// endInput.setAttribute('data-origin', endValue);
			// endPoint = endValue.slice();
		}
	} else {
		endInput.setAttribute('data-origin', '');
	}
};

const updateDataOriginByInput = (inputNode, inputValue) => {
	if (inputValue) {
		let valueArr = inputValue.split(',');
		if (valueArr.length === 2) {
			let valueArr_ = [Number(valueArr[1]), Number(valueArr[0])]; // '12,13' => [13,12]
			inputNode.setAttribute('data-origin', new ol.proj.fromLonLat(valueArr_))
		} else {
			// inputNode.setAttribute('data-origin', inputValue);
		}
	} else {
		inputNode.setAttribute('data-origin', '');
	}
}

const stringToArray = (str) => {
	let arr = str.split(',');
	return [Number(arr[0]),Number(arr[1])];
};

const handleEnterEvent = () => {
	let startOrigin = document.querySelector('.start input').getAttribute('data-origin');
	let endOrigin = document.querySelector('.end input').getAttribute('data-origin');

	startOrigin = stringToArray(startOrigin);
	endOrigin = stringToArray(endOrigin);

	if (startOrigin.length > 0 && endOrigin.length > 0) {
		source.clear();
		overlay.setPosition(undefined);
		performRouting();
		addPointFeature('start', startOrigin);
		addPointFeature('end', endOrigin);
	}
};

WebFont.load({
	custom: {
		families: ["vectormap-icons"],
		urls: ["https://cdn.thinkgeo.com/vectormap-icons/2.0.0/vectormap-icons.css"],
		testStrings: {
			'vectormap-icons': '\ue001'
		}
	},
	// The "active" property defines a function to call when the font has
	// finished downloading.  Here, we'll call our initializeMap method.
	active: initializeMap
});

const addInputBox = (coord) => {
	removeFeatureByName('line');
	const lastPoint = document.querySelector('.end');
	const lastInput = lastPoint.querySelector('input');
	const parent = document.querySelector('.point');

	const newNode = document.createElement('P');
	newNode.classList.add('via');
	let dataOrigin;
	let inputValue;
	if (coord) {
		dataOrigin = coord;
		let coord_ = new ol.proj.toLonLat(coord);
		inputValue = [coord_[1], coord_[0]];
	} else {
		dataOrigin = lastInput.getAttribute('data-origin');
		inputValue = lastInput.value;
		lastInput.value = '';
		lastInput.setAttribute('data-origin', '');
	}
	newNode.innerHTML = `
	<label>:</label>
	<input value="${inputValue}" data-origin="${dataOrigin}" placeholder="To" />
	<span class=""></span>
	<a class="closer"></a>`;
	parent.insertBefore(newNode, lastPoint);
}

const getCoordFromDataOrigin = (dataOriginValue) => {
	let value = dataOriginValue.split(',');
	if(value.length===2){
		return [Number(value[0]), Number(value[1])];
	}else{
		return [];
	}
}

const resetSidebarHeight = () => {
	const resultSidebar = document.querySelector('.sidebar');
	const topHeight = document.querySelector('.point').clientHeight + 30;
	resultSidebar.classList.remove('hide');
	resultSidebar.style.top = `${topHeight}px`;
}

const toggleCloserAndSwitch = () => {
	if (document.querySelectorAll('.point input').length === 2) {
		// There is no via node but only start and end input point. So we have to hide the hide icon of the input and show the switch icon.
		document.querySelectorAll('.closer').forEach(closer => {
			closer.classList.add('hide');
		})
		document.querySelector('.switch').classList.remove('hide');
	} else {
		// When there are more than or equal to 1 via node, we need to show the closer icon and hide the switch icon.
		document.querySelectorAll('.closer').forEach(closer => {
			closer.classList.remove('hide');
		})
		document.querySelector('.switch').classList.add('hide');
	}
}

const getAllPoints = () => {
	let points = [];
	const allInputs = document.querySelectorAll('.point input');
	allInputs.forEach(input => {
		const value = input.getAttribute('data-origin');
		value ? points.push(getCoordFromDataOrigin(value)) : null
	})
	return points;
}

const removeFeatureByCoord = (coord) => {
	const features = source.getFeatures()
	features.some(feature => {
		if (feature.getGeometry().getCoordinates().toString() === coord) {
			source.removeFeature(feature);
			return true;
		}
	});
}

const getFeatureByName = (name) => {
	let feature_;
	source.getFeatures().some(feature => {
		if (feature.get('name') === name) {
			feature_ = feature;
			return true;
		}
	});
	return feature_;
}

const getFeatureByCoord = (coord) => {
	let feature;
	const features = source.getFeatures();
	features.some(f => {
		if (f.getGeometry().getCoordinates().toString() === coord) {
			feature = f;
		}
	});
	return feature;
}

const isContained = (existPoints, point)=>{
	let isContained = false;
	existPoints.some(existPoint=>{
		if(existPoint.toString() === point.toString()){
			isContained = true;
			return true
		}
	})
	return isContained;
}

/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 */
app.Drag = function () {
	ol.interaction.Pointer.call(this, {
		handleDownEvent: app.Drag.prototype.handleDownEvent,
		handleDragEvent: app.Drag.prototype.handleDragEvent,
		handleMoveEvent: app.Drag.prototype.handleMoveEvent,
		handleUpEvent: app.Drag.prototype.handleUpEvent
	});
	this.coordinate_ = null;
	this.cursor_ = 'pointer';
	this.feature_ = null;
	this.previousCursor_ = undefined;
	this.timeEvent;
	this.flag_ = true;
};
ol.inherits(app.Drag, ol.interaction.Pointer);

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
app.Drag.prototype.handleDownEvent = function (evt) {
	var map = evt.map;
	var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
		clearTimeout(this.timeEvent);
		this.flag_ = true;
		let featureName = feature.get('name');
		if (featureName === 'start' || featureName === 'end' || featureName === 'mid') {
			coordBeforeMove = feature.getGeometry().getCoordinates();
			return feature;
		}
	});

	if (feature) {
		this.coordinate_ = evt.coordinate;
		this.feature_ = feature;
	}

	return !!feature;
};

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
app.Drag.prototype.handleDragEvent = function (evt) {
	var map = evt.map;
	clearTimeout(this.timeEvent);
	this.timeEvent = 0;
	var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
		return feature;
	});

	this.flag_ = true

	var deltaX = evt.coordinate[0] - this.coordinate_[0];
	var deltaY = evt.coordinate[1] - this.coordinate_[1];

	var geometry = this.feature_.getGeometry();
	geometry.translate(deltaX, deltaY);
	const coord = geometry.getCoordinates();
	const coord_ = coord.slice();
	const featureType = this.feature_.get('name');
	this.coordinate_[0] = evt.coordinate[0];
	this.coordinate_[1] = evt.coordinate[1];
	const coordBeforeMove_ = coordBeforeMove.slice();


	this.timeEvent = setTimeout(function () {
		removeFeatureByName('line');
		overlay.setPosition(undefined);
		this.flag_ = false
		// Update the corresponding input node value and data-origin attribute value.
		if (featureType === 'start' || featureType === 'end' || featureType === 'mid') {
			const inputs = document.querySelectorAll('.point input');
			let inputNode;
			Array.from(inputs).some((input) => {
				const inputOrigin = input.getAttribute('data-origin');
				if (inputOrigin === coordBeforeMove_.toString()) {
					inputNode = input;
					return true;
				}
			})
			inputNode.setAttribute('data-origin', coord);
			inputNode.value = [coord_[1].toFixed(8), coord_[0].toFixed(8)];
		}
		performRouting();
		this.coordinate_ = null;
		this.feature_ = null;
		return false;
	}, 1000)


};

/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
app.Drag.prototype.handleMoveEvent = function (evt) {

	if (this.cursor_) {
		var map = evt.map;
		var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
			return feature;
		});
		var element = evt.map.getTargetElement();
		if (feature) {
			if (element.style.cursor != this.cursor_) {
				this.previousCursor_ = element.style.cursor;
				element.style.cursor = this.cursor_;
			}
		} else if (this.previousCursor_ !== undefined) {
			element.style.cursor = this.previousCursor_;
			this.previousCursor_ = undefined;
		}
	}
};

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
app.Drag.prototype.handleUpEvent = function (e) {
	clearTimeout(this.timeEvent);
	this.timeEvent = 0;
	if (this.flag_) {
		// removeFeatureByName('line');
		// removeFeatureByName('resultRadius');
		overlay.setPosition(undefined);
		const featureType = this.feature_.get('name');
		const coord = this.feature_.getGeometry().getCoordinates();
		const coord_ = new ol.proj.toLonLat(coord);
		const coordBeforeMove_ = coordBeforeMove.slice();

		// Update the corresponding input node value and data-origin attribute value.
		if (featureType === 'start' || featureType === 'end' || featureType === 'mid') {
			const inputs = document.querySelectorAll('.point input');
			let inputNode;
			Array.from(inputs).some((input) => {
				const inputOrigin = input.getAttribute('data-origin');
				if (inputOrigin === coordBeforeMove_.toString()) {
					inputNode = input;
					return true;
				}
			})
			inputNode.setAttribute('data-origin', coord);
			inputNode.value = [coord_[1].toFixed(8), coord_[0].toFixed(8)];
		}
		removeFeatureByName('line');
		removeFeatureByName('arrow');
		performRouting();
		this.coordinate_ = null;
		this.feature_ = null;
		return false;
	}
};

document.addEventListener('DOMContentLoaded', function () {

	document.querySelector('#map').oncontextmenu = () => {
		return false;
	};

	document.querySelector('#map').onclick = () => {
		hideOrShowContextMenu('hide');
	};

	document.querySelector('#ol-contextmenu').addEventListener('click', (e) => {
		const target = e.target.id;
		switch (target) {
			case 'add-startpoint':
				addPointFeature('start', curCoord);
				hideOrShowContextMenu('hide');
				removeFeatureByName('line');
				overlay.setPosition(undefined);

				// Update the start input value and data-origin value.
				let startInput = document.querySelector('.start input');
				startInput.setAttribute('data-origin', curCoord);
				let curCoord_ = ol.proj.transform(curCoord, 'EPSG:3857', 'EPSG:4326')
				startInput.value = curCoord_[1].toFixed(8) + ', ' + curCoord_[0].toFixed(8);

				break;
			case 'add-endpoint':
				addPointFeature('end', curCoord);
				hideOrShowContextMenu('hide');
				removeFeatureByName('line');
				overlay.setPosition(undefined);

				// Update the end input value and data-origin value.
				let endInput = document.querySelector('.end input');
				endInput.setAttribute('data-origin', curCoord);
				let curEndCoord_ = new ol.proj.toLonLat(curCoord);
				endInput.value = curEndCoord_[1].toFixed(8) + ', ' + curEndCoord_[0].toFixed(8);
				break;
			case 'context-add-point':
				addPointFeature('mid', curCoord);
				removeFeatureByName('line');
				addInputBox(curCoord);
				toggleCloserAndSwitch();
				resetSidebarHeight();
				hideOrShowContextMenu('hide');
				document.querySelector('.switch').classList.add('hide');
				break;
		}
		performRouting();
	});

	document.querySelector('#map').addEventListener('mouseover', (e) => {
		let target = e.target;
		let boxDom;
		if (target.nodeName === 'SPAN' && target.parentNode.classList.contains('box')) {
			boxDom = target.parentNode;
		} else if (target.classList.contains('box')) {
			boxDom = target;
		}
		if (boxDom !== undefined) {
			let attrCoord = boxDom.getAttribute('coord');
			attrCoord = attrCoord.split(' ');
			let coord = [Number(attrCoord[0]), Number(attrCoord[1])];
			addResultRadius(coord)
		} else {
			removeFeatureByName('resultRadius');
		}
	})

	document.querySelector('#result').addEventListener('click', (e) => {
		let target = e.target;
		let boxDom;
		const nodeList = document.querySelectorAll('.box')
		nodeList.forEach((node) => {
			if (node.classList.contains('selectBox')) {
				node.classList.remove('selectBox')
			}
		})

		if (target.nodeName === 'SPAN' && target.parentNode.classList.contains('box')) {
			target.parentNode.classList.add('selectBox')
			boxDom = target.parentNode;
		} else if (target.classList.contains('box')) {
			target.classList.add('selectBox')
			boxDom = target;
		}

		if (boxDom !== undefined) {
			removeFeatureByName('resultRadius');
			let penult = boxDom.getAttribute('lastlinepenultcoord');
			if (penult) {
				penult = penult.split(' ');
				let penultCoord = [Number(penult[0]), Number(penult[1])];

				let last = boxDom.getAttribute('lastLineLastCoord');
				last = last.split(' ');
				let lastCoord = [Number(last[0]), Number(last[1])];

				addArrow(penultCoord, lastCoord);
			}
			let attrCoord = boxDom.getAttribute('coord');
			attrCoord = attrCoord.split(' ');
			let instruction = boxDom.getAttribute('instruction');
			let coord = [Number(attrCoord[0]), Number(attrCoord[1])];
			view.fit(new ol.geom.Point(coord), {
				padding: [20, 20, 20, 20],
				duration: 1000,
				maxZoom: 17,
				callback: function () {
					let penult = boxDom.getAttribute('lastlinepenultcoord');
					if (penult) {
						penult = penult.split(' ');
						let penultCoord = [Number(penult[0]), Number(penult[1])];

						let last = boxDom.getAttribute('lastLineLastCoord');
						last = last.split(' ');
						let lastCoord = [Number(last[0]), Number(last[1])];

						var lineSecondCoord = boxDom.getAttribute('lineSecondCoord');
						if (lineSecondCoord) {
							var stringCoords = lineSecondCoord.split(' ');
							lineSecondCoord = [+stringCoords[0], +stringCoords[1]].slice();
							var prevCoord = lerp(lastCoord, penultCoord);
							var secondCoord = lerp(lastCoord, lineSecondCoord);
							addArrow(lastCoord, secondCoord);
							addTurnLine(prevCoord, lastCoord, secondCoord);
						} else {
							addArrow(penultCoord, lastCoord);
						}
					}
				}
			});
		}
	});

	document.querySelector('.ol-popup-closer').onclick = () => {
		overlay.setPosition(undefined);
		return false;
	};

	document.querySelector('#clear').addEventListener('click', () => {
		document.querySelector('#total').innerHTML = '';
		document.querySelector('#boxes').innerHTML = '';
		document.querySelector('#result').classList.remove('hide');
		document.querySelector('.sidebar').classList.add('hide');
		source.clear();
		clearInputBox();
		overlay.setPosition(undefined);
		startPoint = [];
		endPoint = [];

		const x = window.matchMedia('(max-width: 767px)');
		if (x.matches) {
			result.style.overflowY = 'hidden';
			result.classList.remove('transition-height');
			result.style.height = 0 + 'px';
		}
		hideOrShowContextMenu('hide');
	});

	document.querySelector('.switch').addEventListener('click', () => {
		let startInput = document.querySelector('.start input');
		let endInput = document.querySelector('.end input');

		// switch input value
		let t = startInput.value;
		startInput.value = endInput.value;
		endInput.value = t;

		// switch input data-origin value
		let tOrigin = startInput.getAttribute('data-origin');
		startInput.setAttribute('data-origin', endInput.getAttribute('data-origin'));
		endInput.setAttribute('data-origin', tOrigin);

		let startOrigin = startInput.getAttribute('data-origin');
		let endOrigin = endInput.getAttribute('data-origin');

		// string to array
		let startOrigin_ = getCoordFromDataOrigin(startOrigin);
		let endOrigin_ = getCoordFromDataOrigin(endOrigin);

		if (startOrigin_.length > 0 && endOrigin_.length > 0) {
			source.clear();
			// overlay.setPosition(undefined);
			addPointFeature('start', startOrigin_);
			addPointFeature('end', endOrigin_);
			performRouting();
		}
	});

	const startInputNode = document.querySelector('.start input')
	const endInputNode = document.querySelector('.end input')
	const clearEndInput = document.querySelector('#clear-end')
	const clearStartInput = document.querySelector('#clear-start')

	// startInputNode.addEventListener('keyup', () => {
	// 	if (event.keyCode === 13) {
	// 		handleEnterEvent();
	// 	} else {
	// 		updateOriginByInputValue();
	// 	}
	// });

	// endInputNode.addEventListener('keyup', () => {
	// 	if (event.keyCode === 13) {
	// 		handleEnterEvent();
	// 	} else {
	// 		updateOriginByInputValue();
	// 	}
	// });

	const inputValue = () => {
		document.querySelector('.sidebar').classList.add('hide');
		document.querySelector('#total').innerHTML = '';
		document.querySelector('#boxes').innerHTML = '';
		removeFeatureByName('resultRadius')
		removeFeatureByName('line');
		removeFeatureByName('arrow');
	}

	startInputNode.addEventListener('input', () => {
		if (!startInputNode.value) {
			inputValue()
			startPoint = [];
			removeFeatureByName('start');
			clearStartInput.classList.add('hide');

		} else {
			clearStartInput.classList.remove('hide');
		}
	});

	endInputNode.addEventListener('input', () => {
		// if (!endInputNode.value) {
		// 	clearEndInput.classList.add('hide');
		// 	inputValue()
		// 	endPoint = [];

		// 	removeEndFeature()
		// 	endFeature = null;
		// } else {
		// 	clearEndInput.classList.remove('hide');
		// }
	});

	document.querySelector('#error-modal button').addEventListener('click', () => {
		document.querySelector('#error-modal').classList.add('hide');
	})

	// Add an input box once clicked the "Add destination" button
	document.querySelector('#add-point').addEventListener('click', function () {
		removeFeatureByName('line');
		removeFeatureByName('arrow');
		const feature = getFeatureByName('end');
		if(feature){
			feature.set('name', 'mid');
			feature.setStyle(styles.mid);
		}
		addInputBox();
		resetSidebarHeight();
	})

	document.querySelector('.point').addEventListener('click', function (e) {
		e = window.event || e;
		const target = e.target;
		const classlist = target.classList;
		if (classlist.contains('start-closer')) {
			// Delete the target input box(start point input).
			// Move the value and data-origin from second node to first node, and delete the second node.
			const first = target.parentNode;
			const second = document.querySelectorAll('.via')[0];
			const secondOrigin = second.querySelector('input').getAttribute('data-origin');
			first.querySelector('input').value = second.querySelector('input').value;
			first.querySelector('input').setAttribute('data-origin', secondOrigin);
			second.remove();
			removeFeatureByName('start');
			const feature = getFeatureByCoord(secondOrigin);
			if(feature){			
				feature.set('name', 'start');
				feature.setStyle(styles.start);
			}
		} else if (classlist.contains('end-closer')) {
			// Delete the target input box(end point input).
			// Move the value and data-origin from penult node to last node, and delete the penult node.
			const last = target.parentNode;
			const allVias = document.querySelectorAll('.via');
			const penult = allVias[allVias.length - 1];
			const penultOrigin = penult.querySelector('input').getAttribute('data-origin');
			last.querySelector('input').value = penult.querySelector('input').value;
			last.querySelector('input').setAttribute('data-origin', penult.querySelector('input').getAttribute('data-origin'));
			penult.remove();
			removeFeatureByName('end');
			const feature = getFeatureByCoord(penultOrigin);
			if(feature){
				feature.set('name', 'end');
				feature.setStyle(styles.end);
			}			
		} else if (classlist.contains('closer')) {
			// Delete the target input box(input in the middle).
			const parentNode = target.parentNode;
			let coord = parentNode.querySelector('input').getAttribute('data-origin');
			removeFeatureByCoord(coord);
			parentNode.remove();
		}

		if(classlist.contains('closer') || target.id === 'add-point'){
			removeFeatureByName('line');
			removeFeatureByName('arrow');
			resetSidebarHeight();
			toggleCloserAndSwitch();
			performRouting();
		}
	})

	document.querySelector('.point').addEventListener('input', function (e) {
		e = window.event || e;
		const target = e.target;
		updateDataOriginByInput(target, target.value);
	})

	document.querySelector('.point').addEventListener('keyup', function (e) {
		e = window.e || e;
		if (e.keyCode === 13) {
			// handleEnterEvent();
		} else {
			// updateOriginByInputValue();
		}
	})

	document.querySelector('#go').addEventListener('click', function () {
		removeFeatureByName('line');
		removeFeatureByName('arrow');

		const points = getAllPoints();
		const pointsLength = points.length;
		// Before this step, we have to remove all the features except start, end and mid point.
		const existPoints = source.getFeatures().map(feature=>{
			return feature.getGeometry().getCoordinates();
		});
		if(points.length !== existPoints.length){
			points.forEach((point, index)=>{
				if(!isContained(existPoints, point)){
					// This point in input box isn't added to map, so we have to add it to map.
					let type;
					if(pointsLength-1 === index){
						type = 'end';
					}else if(0 === index){
						type = 'start';
					}else{
						type='mid';
					}
					addPointFeature(type, point)
				}
			})
		}

		performRouting()
	})
})
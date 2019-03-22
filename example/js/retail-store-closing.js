

const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';

let baseLightLayer = new ol.layer.Tile({
	source: new ol.source.XYZ({
		url: `https://cloud.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
		tileSize: 512
	}),
	layerName: 'light',
	visible: true
});
let baseDarkLayer = new ol.layer.Tile({
	source: new ol.source.XYZ({
		url: `https://cloud.thinkgeo.com/api/v1/maps/raster/dark/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
		tileSize: 512
	}),
	layerName: 'dark',
	visible: false
});
let baseAerialLayer = new ol.layer.Tile({
	source: new ol.source.XYZ({
		url: `https://cloud.thinkgeo.com/api/v1/maps/raster/aerial/x1/3857/512/{z}/{x}/{y}.jpeg?apiKey=${apiKey}`,
		tileSize: 512
	}),
	layerName: 'aerial',
	visible: false
});
let baseTransparentLayer = new ol.layer.Tile({
	source: new ol.source.XYZ({
		url: `https://cloud.thinkgeo.com/api/v1/maps/raster/transparent-background/x1/3857/512/{z}/{x}/{y}.png?apiKey=${apiKey}`,
		tileSize: 512
	}),
	layerName: 'transparent',
	visible: false
});

let view = new ol.View({
	center: ol.proj.fromLonLat([-96.8366345, 32.7203765]),
	maxResolution: 40075016.68557849 / 512,
	progressiveZoom: false,
	zoom: 3,
	minZoom: 2,
	maxZoom: 19
});

let map = new ol.Map({
	loadTilesWhileAnimating: true,
	loadTilesWhileInteracting: true,
	layers: [ baseLightLayer, baseDarkLayer, baseAerialLayer, baseTransparentLayer],
	target: 'map',
	view: view
});

let searsStyle = new ol.style.Style({
	image: new ol.style.Circle({
		radius: view.getZoom() * 2,
		stroke: new ol.style.Stroke({
			color: '#ffffffcc',
			width: 1
		}),
		fill: new ol.style.Fill({
			color: '#002c65'
		})
	})
});

let kmartStyle = new ol.style.Style({
	image: new ol.style.Circle({
		radius: view.getZoom() * 2,
		stroke: new ol.style.Stroke({
			color: '#ffffffcc',
			width: 1
		}),
		fill: new ol.style.Fill({
			color: '#cd1314'
		})
	})
});

let familyDollarStyle = new ol.style.Style({
	image: new ol.style.Circle({
		radius: view.getZoom() * 2,
		stroke: new ol.style.Stroke({
			color: '#ffffffcc',
			width: 1
		}),
		fill: new ol.style.Fill({
			color: '#eb8f2d'
		})
	})
});

let lowesStyle = new ol.style.Style({
	image: new ol.style.Circle({
		radius: view.getZoom() * 2,
		stroke: new ol.style.Stroke({
			color: '#ffffffcc',
			width: 1
		}),
		fill: new ol.style.Fill({
			color: '#004a90'
		})
	})
});

let macysStyle = new ol.style.Style({
	image: new ol.style.Circle({
		radius: view.getZoom() * 2,
		stroke: new ol.style.Stroke({
			color: '#000000cc',
			width: 1
		}),
		fill: new ol.style.Fill({
			color: '#ffffff'
		})
	})
});

let searsIconStyle = new ol.style.Style({
	image: new ol.style.Icon({
		anchor: [ 0.5, 0.5 ],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		opacity: 1,
		src: '../image/sears_logo_200_outline_10.png'
	})
});

let kmartIconStyle = new ol.style.Style({
	image: new ol.style.Icon({
		anchor: [ 0.5, 0.5 ],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		opacity: 1,
		src: '../image/kmart_logo_200_outline_10.png'
	})
});

let familyDollarIconStyle = new ol.style.Style({
	image: new ol.style.Icon({
		anchor: [ 0.5, 0.5 ],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		opacity: 1,
		src: '../image/family_dollar_logo_200_outline_10.png'
	})
});

let lowesIconStyle = new ol.style.Style({
	image: new ol.style.Icon({
		anchor: [ 0.5, 0.5 ],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		opacity: 1,
		src: '../image/lowes_logo_200_outline_10.png'
	})
});

let macysIconStyle = new ol.style.Style({
	image: new ol.style.Icon({
		anchor: [ 0.5, 0.5 ],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		opacity: 1,
		src: '../image/macys_logo_200_outline_10.png'
	})
});

let searsSource = new ol.source.Vector({
	url: '../data/Sears.geojson',
	format: new ol.format.GeoJSON()
});

let searsLayer = new ol.layer.Vector({
	source: searsSource,
	style: searsStyle
});

let kmartSource = new ol.source.Vector({
	url: '../data/Kmart.geojson',
	format: new ol.format.GeoJSON()
});

let kmartLayer = new ol.layer.Vector({
	source: kmartSource,
	style: kmartStyle
});

let familyDollarSource = new ol.source.Vector({
	url: '../data/Family_Dollar.geojson',
	format: new ol.format.GeoJSON()
});

let familyDollarLayer = new ol.layer.Vector({
	source: familyDollarSource,
	style: familyDollarStyle
});

let lowesSource = new ol.source.Vector({
	url: '../data/Lowes.geojson',
	format: new ol.format.GeoJSON()
});

let lowesLayer = new ol.layer.Vector({
	source: lowesSource,
	style: lowesStyle
});

let macysSource = new ol.source.Vector({
	url: '../data/Macys.geojson',
	format: new ol.format.GeoJSON()
});

let macysLayer = new ol.layer.Vector({
	source: macysSource,
	style: macysStyle
});

map.addLayer(searsLayer);
map.addLayer(kmartLayer);
map.addLayer(familyDollarLayer);
map.addLayer(lowesLayer);
map.addLayer(macysLayer);

let getIconScale = function(zoomLevel) {
	let minScale = 0.09;
	let maxScale = 0.35;
	let iconScale = (zoomLevel + 1) ** 2 / 1.5 * 0.003;

	if (iconScale < minScale) iconScale = minScale;
	else if (iconScale > maxScale) iconScale = maxScale;
	return iconScale;
};

let flag = 0;
map.getView().on('change:resolution', function() {
	let zoom = view.getZoom();
	if (zoom >= 4) {
		if (flag === 1) {
			flag = 0;
			// Change every feature's style.
			let searsFeatures = searsLayer.getSource().getFeatures();
			let kmartFeatures = kmartLayer.getSource().getFeatures();
			let familyDollarFeatures = familyDollarLayer.getSource().getFeatures();
			let lowesFeatures = lowesLayer.getSource().getFeatures();
			let macysFeatures = macysLayer.getSource().getFeatures();
			for (let i = 0, l = searsFeatures.length; i < l; i++) {
				let searsFeature = searsFeatures[i];
				searsFeature.setStyle(searsIconStyle);
			}
			for (let i = 0, l = kmartFeatures.length; i < l; i++) {
				let kmartFeature = kmartFeatures[i];
				kmartFeature.setStyle(kmartIconStyle);
			}
			for (let i = 0, l = familyDollarFeatures.length; i < l; i++) {
				let familyDollarFeature = familyDollarFeatures[i];
				familyDollarFeature.setStyle(familyDollarIconStyle);
			}
			for (let i = 0, l = lowesFeatures.length; i < l; i++) {
				let lowesFeture = lowesFeatures[i];
				lowesFeture.setStyle(lowesIconStyle);
			}
			for (let i = 0, l = macysFeatures.length; i < l; i++) {
				let macysFeature = macysFeatures[i];
				macysFeature.setStyle(macysIconStyle);
			}

			// Switch out the little color squares on the legend for small versions of the store logos.
			let colorSquares = document.querySelectorAll('.legend li');
			for (let i = 0, l = colorSquares.length; i < l; i++) {
				let item = colorSquares[i];
				let square = item.querySelector('i');
				let style = square.style;
				style.backgroundColor = 'transparent';
				style.borderWidth = 0;
				style.width = '1.2rem';
				style.height = '1.2rem';
				switch (item.className) {
					case 'sears':
						style.backgroundImage =
							"url('../image/sears_logo_200_outline_10.png')";
						break;
					case 'kmart':
						style.backgroundImage =
							"url('../image/kmart_logo_200_outline_10.png')";
						break;
					case 'familydollar':
						style.backgroundImage =
							"url('../image/family_dollar_logo_200_outline_10.png')";
						break;
					case 'lowes':
						style.backgroundImage =
							"url('../image/lowes_logo_200_outline_10.png')";
						break;
					case 'macys':
						style.backgroundImage =
							"url('../image/macys_logo_200_outline_10.png')";
						break;
				}
			}
		}
		let iconScale = getIconScale(view.getZoom());
		searsIconStyle.getImage().setScale(iconScale);
		kmartIconStyle.getImage().setScale(iconScale);
		familyDollarIconStyle.getImage().setScale(iconScale);
		lowesIconStyle.getImage().setScale(iconScale);
		macysIconStyle.getImage().setScale(iconScale);
	} else {
		flag = 1;
		searsStyle = new ol.style.Style({
			image: new ol.style.Circle({
				radius: zoom * 2,
				stroke: new ol.style.Stroke({
					color: '#ffffffcc',
					width: 1
				}),
				fill: new ol.style.Fill({
					color: '#002c65'
				})
			})
		});

		kmartStyle = new ol.style.Style({
			image: new ol.style.Circle({
				radius: zoom * 2,
				stroke: new ol.style.Stroke({
					color: '#ffffffcc',
					width: 1
				}),
				fill: new ol.style.Fill({
					color: '#cd1314'
				})
			})
		});

		familyDollarStyle = new ol.style.Style({
			image: new ol.style.Circle({
				radius: zoom * 2,
				stroke: new ol.style.Stroke({
					color: '#ffffffcc',
					width: 1
				}),
				fill: new ol.style.Fill({
					color: '#eb8f2d'
				})
			})
		});

		lowesStyle = new ol.style.Style({
			image: new ol.style.Circle({
				radius: zoom * 2,
				stroke: new ol.style.Stroke({
					color: '#ffffffcc',
					width: 1
				}),
				fill: new ol.style.Fill({
					color: '#004a90'
				})
			})
		});

		macysStyle = new ol.style.Style({
			image: new ol.style.Circle({
				radius: zoom * 2,
				stroke: new ol.style.Stroke({
					color: '#000000cc',
					width: 1
				}),
				fill: new ol.style.Fill({
					color: '#ffffff'
				})
			})
		});

		// Switch out the little color squares on the legend for small versions of the store logos.
		let squares = document.querySelectorAll('.legend i');
		squares.forEach((square) => {
			let bgColor = square.getAttribute('data-bg-color');
			let style = square.style;
			style.backgroundColor = bgColor;
			style.borderWidth = '1px';
			style.backgroundImage = '';
			style.width = '0.6rem';
			style.height = '0.6rem';
		});

		let searsFeatures = searsLayer.getSource().getFeatures();
		let kmartFeatures = kmartLayer.getSource().getFeatures();
		let familyDollarFeatures = familyDollarLayer.getSource().getFeatures();
		let lowesFeatures = lowesLayer.getSource().getFeatures();
		let macysFeatures = macysLayer.getSource().getFeatures();
		for (let i = 0, l = searsFeatures.length; i < l; i++) {
			let searsFeature = searsFeatures[i];
			searsFeature.setStyle(searsStyle);
		}
		for (let i = 0, l = kmartFeatures.length; i < l; i++) {
			let kmartFeature = kmartFeatures[i];
			kmartFeature.setStyle(kmartStyle);
		}
		for (let i = 0, l = familyDollarFeatures.length; i < l; i++) {
			let familyDollarFeature = familyDollarFeatures[i];
			familyDollarFeature.setStyle(familyDollarStyle);
		}
		for (let i = 0, l = lowesFeatures.length; i < l; i++) {
			let lowesFeature = lowesFeatures[i];
			lowesFeature.setStyle(lowesStyle);
		}
		for (let i = 0, l = macysFeatures.length; i < l; i++) {
			let macysFeature = macysFeatures[i];
			macysFeature.setStyle(macysStyle);
		}
	}
});

document.addEventListener('DOMContentLoaded', function() {
	document.getElementsByClassName('legend')[0].addEventListener('change', (e) => {
		e = window.event || e;
		if (e.target.checked) {
			switch (e.target.id) {
				case 'sears_checkbox':
					map.addLayer(searsLayer);
					break;
				case 'kmart_checkbox':
					map.addLayer(kmartLayer);
					break;
				case 'family_dollar_checkbox':
					map.addLayer(familyDollarLayer);
					break;
				case 'lowes_checkbox':
					map.addLayer(lowesLayer);
					break;
				case 'macys_checkbox':
					map.addLayer(macysLayer);
					break;
			}
		} else {
			switch (e.target.id) {
				case 'sears_checkbox':
					map.removeLayer(searsLayer);
					break;
				case 'kmart_checkbox':
					map.removeLayer(kmartLayer);
					break;
				case 'family_dollar_checkbox':
					map.removeLayer(familyDollarLayer);
					break;
				case 'lowes_checkbox':
					map.removeLayer(lowesLayer);
					break;
				case 'macys_checkbox':
					map.removeLayer(macysLayer);
					break;
			}
		}
	});

	document.getElementsByClassName('map-btn-group')[0].addEventListener('click', (e) => {
		e = window.event || e;
		let target = e.target;
		let value = target.value;
		document.getElementsByClassName('current')[0].classList.remove('current');
		target.classList.add('current');
		switch (value) {
			case 'light':
				baseLightLayer.setVisible(true);
				baseDarkLayer.setVisible(false);
				baseAerialLayer.setVisible(false);
				baseTransparentLayer.setVisible(false);
				break;
			case 'dark':
				baseLightLayer.setVisible(false);
				baseDarkLayer.setVisible(true);
				baseAerialLayer.setVisible(false);
				baseTransparentLayer.setVisible(false);
				break;
			case 'hybrid':
				baseLightLayer.setVisible(false);
				baseDarkLayer.setVisible(false);
				baseAerialLayer.setVisible(true);
				baseTransparentLayer.setVisible(true);
				break;
		}
	});
});

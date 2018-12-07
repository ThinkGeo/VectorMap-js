const Feature = ol.Feature;
const Map = ol.Map;
const Overlay = ol.Overlay;
const View = ol.View;
const Point = ol.geom.Point;
const [TileLayer, VectorLayer] = [ol.layer.Tile, ol.layer.Vector];
const TileJSON = ol.source.TileJSON;
const VectorSource = ol.source.Vector;
const [Icon, Style] = [ol.style.Icon, ol.style.Style];


WebFont.load({
    custom: {
        families: ['vectormap-icons'],
        urls: ['https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css']
    }
});


const styleJson = {
    light: 'https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json',
}
const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~'

let vectorLayer = new ol.mapsuite.VectorTileLayer(styleJson.light, {
    apiKey: apiKey,
});

let map =  new ol.Map({                         
    loadTilesWhileAnimating: true,                         
    loadTilesWhileInteracting: true,
    layers: [vectorLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.810008, 33.128337]),
        zoom: 12,
        minZoom: 2
    })
});


let iconFeature = new Feature({
    geometry: new Point(ol.proj.fromLonLat([-96.810008, 33.128337])),
    name: 'Thinkgeo'
});


let iconStyle = new Style({
    image: new Icon({
        anchor: [0, 0],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: '../image/point.png'
    })
});

iconFeature.setStyle(iconStyle);

let vectorSource = new VectorSource({
    features: [iconFeature]
});

let vectorLayer2 = new VectorLayer({
    source: vectorSource
});
map.addLayer(vectorLayer2);

let element = document.getElementById('popup');

let popup = new Overlay({
    element: element,
    positioning: 'bottom-center',
    stopEvent: true,
     offset: [20, 0]
});
map.addOverlay(popup);

// display popup on click
map.on('click', function (evt) {
    let feature = map.forEachFeatureAtPixel(evt.pixel,
        function (feature) {
            return feature;
        });
    if (feature) {
        element.classList.contains('hidden') ? element.classList.remove('hidden') : element.classList.add('hidden');
    } else {
        element.classList.add('hidden');
    }
});

// change mouse cursor when over marker
map.on('pointermove', function (e) {
    if (e.dragging) {
        element.classList.remove('hidden');
        return;
    }
    let pixel = map.getEventPixel(e.originalEvent);
    let hit = map.hasFeatureAtPixel(pixel);
    document.getElementById('map').style.cursor = hit ? 'pointer' : '';
});

window.onload = function () {
    document.getElementById("popup").classList.remove('hidden');
    popup.setPosition(ol.proj.fromLonLat([-96.810008, 33.128337]));
};

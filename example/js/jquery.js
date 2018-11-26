WebFont.load({
    custom: {
        families: ['vectormap-icons'],
        urls: ['https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css']
    }
});



const styleJson = {
    light: 'http://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json'
};
const baseURL = 'https://cloud.thinkgeo.com/api/v1/location/reverse-geocode/';

const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~';

//base layer 
let light = new ol.mapsuite.VectorTileLayer(styleJson.light, {
    apiKey: apiKey,
    layerName: 'light'
});

//nearby layer

let nearbyLayer = new ol.layer.Vector({
    source: new ol.source.Vector({ features: [] }),
    style: function (feature) {
        let key = feature.get('type');
        let style = styles[key];
        if (!style) {
            style = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    src: 'images/' + key + '.png'
                }),
                text: new ol.style.Text({
                    font: '14px Arial',
                    text: '',
                    fill: new ol.style.Fill({ color: 'black' }),
                    stroke: new ol.style.Stroke({ color: 'white', width: 1 })
                })
            });
            styles[key] = style;
        }
        let textStyle = style.getText();
        if (textStyle) {
            textStyle.setText(feature.get('text'));
        }
        return style;
    }
})


//map
let map = new ol.Map({
    layers: [light, nearbyLayer],
    target: 'map',
    view: new ol.View({
        center: [-10780491.18, 3915906.38],
        zoom: 15,
        maxZoom: 19,
    })
});

const addLayer=function(){
    
}


const styles = {
    searchRadius: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: [0, 0, 255, 0.5],
            width: 1
        }),
        fill: new ol.style.Fill({ color: [0, 0, 255, 0.1] })
    }),
    bestMatchLocation: new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: 'image/point.png'
        })
    }),
}


const getNearby = function (coordinate) {
    let getURL = `${baseURL}${coordinate}?apikey=${apiKey}&Srid=3857&Lang=en&SearchRadius=500&SearchRadiusUnit=Meter&MaxResults=20&PlaceCategories=Common&VerboseResults=true`;
    let jqxhr = $.get(getURL, function (data) {
        console.log(data);
    });
}

const renderSearchCircle = function (coordinate) {
    let view = _map.getView();
    let projection = view.getProjection();
    let resolutionAtEquator = view.getResolution();
    let center = coordinate;
    let pointResolution = ol.proj.getPointResolution(projection, resolutionAtEquator, center);
    let resolutionFactor = resolutionAtEquator / pointResolution;
    let radiusInMeter = (radius / ol.proj.METERS_PER_UNIT.m) * resolutionFactor;
    let feature = new ol.Feature({
        geometry: new ol.geom.Circle(center, radiusInMeter),
        type: 'searchRadius'
    });
    addFeature(feature);
}




map.on('click', function (evt) {
    getNearby(evt.coordinate)
})
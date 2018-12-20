//basemap style
const baseMapStyleJson = {
    "id": "base",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#044061",
    "styles": [{
            "id": "country",
            "style": [{
                "filter": "zoom>=0;zoom<=18;",
                "polygon-fill": "#004881"
            }]
        },
        {
            "id": "country_boundary",
            "style": [{
                "filter": "zoom>=0;zoom<=18;",
                "line-width": 0.6,
                "line-color": "#019fd4",
            }]
        }, {
            "id": "country_name",
            "style": [{
                "text-name": "name",
                "text-fill": "#ffff28",
                "text-wrap-width": 15,
                "style": [{
                    "filter": "zoom>=0;zoom<=18;",
                    "text-font": "16px Calibri,sans-serif",
                }]
            }]
        }
    ],
    "sources": [{
        "id": "data_source",
        "url": "../data/countries.json",
        "type": "GeoJSON"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "data_source",
        "styles": [
            "country", "country_boundary", "country_name"
        ]
    }]
};

//highlight style
const highlightStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: '#f4755d'
    }),
    stroke: new ol.style.Stroke({
        color: '#627ce3',
        width: 2
    }),
    text: new ol.style.Text({
        font: '16px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: 'rgb(103, 183, 220)'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
        })
    })
});

// highlight text wrap
const stringDivider = (str, width, spaceReplacer) => {
    if (str.length > width) {
        var p = width;
        while (p > 0 && (str[p] != ' ' && str[p] != '-')) {
            p--;
        }
        if (p > 0) {
            var left;
            if (str.substring(p, p + 1) == '-') {
                left = str.substring(0, p + 1);
            } else {
                left = str.substring(0, p);
            }
            var right = str.substring(p + 1);
            return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
        }
    }
    return str;
};

let baseMapLayer = new ol.mapsuite.VectorLayer(baseMapStyleJson, {
    multithread: false
});

let map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [baseMapLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([2.570481, 26.927630]),
        maxZoom: 19,maxResolution: 40075016.68557849 / 512,zoom: 2,
    }),
});

let highlightLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: function (feature) {
        highlightStyle.getText().setText(stringDivider(feature.get('name'), 10, '\n'));
        return highlightStyle;
    }
});

let highlight;

const displayFeatureInfo = function (pixel) {
    let feature = map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
    });

    if (feature !== highlight) {
        if (highlight) {
            highlightLayer.getSource().removeFeature(highlight);
        }
        if (feature) {
            highlightLayer.getSource().addFeature(feature);
        }
        highlight = feature;
    }
};

map.on('pointermove', function (evt) {
    if (evt.dragging) {
        return;
    }
    let pixel = map.getEventPixel(evt.originalEvent);
    displayFeatureInfo(pixel);
});

map.on('click', function (evt) {
    displayFeatureInfo(evt.pixel);
});
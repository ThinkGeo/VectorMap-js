
WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

const worldstreetsStyle = "https://cdn.thinkgeo.com/worldstreets-styles/1.0.0/light.json";

//block  map style 
// const blockMapStyle = new ol.style.Style({
//     fill: new ol.style.Fill({
//         color: '#afaeb1'
//     }),
//     stroke: new ol.style.Stroke({
//         color: '#a59f80',
//         width: 2
//     }),
//     text: new ol.style.Text({
//         font: '14px Calibri,sans-serif',
//         fill: new ol.style.Fill({
//             color: '#525255'
//         }),
//         placement: 'line',
//         stroke: new ol.style.Stroke({
//             color: '#fff',
//             width: 3
//         }),
//     })
// })

// const pointStyle = new ol.style.Style({
//     image: new ol.style.Icon({
//         anchor: [1, 1],
//         offset: [0, 3],
//         src: '../image/hotel.png',
//     }),
//     text: new ol.style.Text({
//         font: '12px Calibri,sans-serif',
//         fill: new ol.style.Fill({
//             color: '#ff3467'
//         }),
//         stroke: new ol.style.Stroke({
//             color: '#fff',
//             width: 3
//         }),
     
//     })
// })

// //point  layer
// let pointLayer = new ol.layer.Vector({
//     source: new ol.source.Vector({
//         url: '../data/hotels.json',
//         format: new ol.format.GeoJSON()
//     }),
//     style: function (feature) {
//         pointStyle.getText().setText(feature.get('NAME'));
//         return pointStyle;
//     }
// });


// let blockMapLayer = new ol.layer.Vector({
//     source: new ol.source.Vector({
//         url: '../data/label.json',
//         format: new ol.format.GeoJSON()
//     }),
//     style: function (feature) {
//         blockMapStyle.getText().setText(feature.get('NAME'));
//         return blockMapStyle;
//     }
// });

const geosjonStyle = {
    "id": "thinkgeo-world-streets-light",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "variables": {},
    "styles": [
        {
            "id": "block_boundary",
            "style": [{
                    "filter": "zoom>=0;zoom<=22;",
                    "line-width": 2,
                    "line-color": "a59f80",
                }
            ]
        }, {
            "id": "block_name",
            "style": [{
                "text-name": "NAME",
              
                "text-fill": "#496588",
                "text-halo-fill": "rgba(255, 255, 255, 0.5)",
                "text-halo-radius": 2,
                "text-force-horizontal-for-line": true,
                "style": [
                    {
                        "filter": "zoom>=3;zoom<=22;",
                        "text-font": "oblique 600 16px Arial, Helvetica, sans-serif",
                    }
                ]
            }]
        }
    ],
    "sources": [{
        "id": "block_source",
        "url": "../data/label.json",
        "type": "GeoJSON",
        "dataProjection":"EPSG:3857",
        "featureProjection":"EPSG:4326"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "block_source",
        "styles": [
            "block_boundary", "block_name"
        ]
    }]
}

let blockMapLayer = new ol.mapsuite.VectorLayer(geosjonStyle, {
    multithread: false
})



let map = new ol.Map({
    layers: [blockMapLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-96.820787, 33.098294]),
        zoom: 17,
    }),
});









 
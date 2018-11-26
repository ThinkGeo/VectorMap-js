
// // const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~'
// // let getURL = `https://cloud.thinkgeo.com/api/v1/color/scheme/analogous/ffff00/10?apikey=${apiKey}`;

// // let jqxhr = $.get(getURL, function (data) {
// //    console.log(data)
// // });


// const baseURL = 'https://cloud.thinkgeo.com/api/v1/color/scheme/';
// const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~'

// const output = function (data) {

//     $('#output').html("");
//     let str = '';
//     if (data.colors) {
//         data.colors.forEach(function (color) {
//             str+=`<span class="output-color"  style=" background:#${color} ">#${color}</span> `;
//         })
//     } else {
//         data.forEach(function (val) {
//             str += `<div>base coler: <span class="output-color"  style=" background:#${val.baseColor} ">#${val.baseColor}</span> </div>`;
//             val.colors.forEach(function (color) {
//                 str+=`<span class="output-color"  style=" background:#${color} ">#${color}</span> `;
//             })
//         });
//     }
//     $('#output').html(str);
// }

// $('button').click(function () {
//     let options = {
//         category: $('select#category option:selected').val(),
//         radio: $('input:radio:checked').val(),
//         color: $('#color').val(),
//         numbur: $('#number').val(),
//     }
//     let getURL

//     if (options.radio == 'random') {
//         getURL = `${baseURL}${options.category}/${options.radio}/${options.numbur}?apikey=${apiKey}`
//     } else {
//         getURL = `${baseURL}${options.category}/${options.color}/${options.numbur}?apikey=${apiKey}`
//     }

//     let jqxhr = $.get(getURL, function (data) {
//         if (data.status=='success'){
//             output(data.data)
//         } 
//     });

//     jqxhr.fail(function (data) {
//         window.alert('No results');
//     })

// });

WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

let rules=[

]
 
//base map style 
const baseMapStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: '#f3b600'
    }),
    stroke: new ol.style.Stroke({
        color: 'rgba(255, 255, 255, 0.6)',
        width: 2
    }),
    text: new ol.style.Text({
        font: '16px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: '#990100'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
        }),
    })
})

var styleFunction = function (feature) {
    return styles[feature.getGeometry().getType()];
};

 
 

let baseMapLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: '../data/europe.json',
        format: new ol.format.GeoJSON()
    }),
    style: function (feature) {
        baseMapStyle.getText().setText(feature.get('NAME'));
        return baseMapStyle;
    }
});

 

let map = new ol.Map({
    layers: [baseMapLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([18.79620, 50.55423]),
        zoom: 7,
    }),
});


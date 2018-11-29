
const baseURL = 'https://cloud.thinkgeo.com/api/v1/color/scheme/';
const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~'

const output = function (data) {

    $('#output').html("");
    let outputData = [];
    if (data.colors) {
        outputData = data.colors
    } else {
        data.forEach(function (val) {
            val.colors.forEach(function (color) {
                outputData.push(color)
            })
        });
    }

    return outputData;
}
 


WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/1.0.0/vectormap-icons.css"]
    }
});

let color = ["641615", "7C1B1A", "93201F", "AB2624", "C22B28", "D43533", "D94D4A", "65153C", "7C1A4A", "931F58", "AB2567", "C22A75", "D33583", "D84C91", "641563", "7C1A7A", "931F91", "AB24A9", "C228C0", "D433D1"]

let styles = {
    'XXXS': new ol.style.Style({
        fill: new ol.style.Fill({
            color: `#${color[19]}`
        })
    }),
    'XXS': new ol.style.Style({
        fill: new ol.style.Fill({
            color: `#${color[17]}`
        })
    }),
    'XS': new ol.style.Style({
        fill: new ol.style.Fill({
            color: `#${color[15]}`
        })
    }),
    'S': new ol.style.Style({
        fill: new ol.style.Fill({
            color: `#${color[13]}`
        })
    }),
    'M': new ol.style.Style({
        fill: new ol.style.Fill({
            color: `#${color[11]}`
        }),
    }),
    'L': new ol.style.Style({
        fill: new ol.style.Fill({
            color: `#${color[9]}`
        }),
    }),
    'XL': new ol.style.Style({
        fill: new ol.style.Fill({
            color: `#${color[7]}`
        })
    }),
    'XXL': new ol.style.Style({
        fill: new ol.style.Fill({
            color: `#${color[5]}`
        })
    }),
    'XXXL': new ol.style.Style({
        fill: new ol.style.Fill({
            color: `#${color[3]}`
        })
    }),
    'XXXXL': new ol.style.Style({
        fill: new ol.style.Fill({
            color: `#${color[0]}`
        })
    }),

}

//base map style 
const baseMapStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: 'rgba(256, 256, 256, 1)',
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
 

const layerStyle= function (feature) {
        let population = Number(feature.get('POP2005'))
        if (population < 10000) {
            return styles.XXXS
        } else if (population > 10000 && population < 50000) {
            return styles.XXS
        } else if (population > 50000 && population < 100000) {
            return styles.XS
        } else if (population > 100000 && population < 500000) {
            return styles.S
        } else if (population > 500000 && population < 1000000) {
            return styles.M
        } else if (population > 1000000 && population < 5000000) {
            return styles.L
        } else if (population > 5000000 && population < 10000000) {
            return styles.XL
        } else if (population > 10000000 && population < 50000000) {
            return styles.XXL
        } else if (population > 50000000 && population < 100000000) {
            return styles.XXXL
        } else if (population > 100000000) {
            return styles.XXXXL
        }
    }



let colorLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: '../data/europe.json',
        format: new ol.format.GeoJSON(),
    }),
    style: layerStyle

})

let map = new ol.Map({
    layers: [colorLayer, baseMapLayer],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([18.79620, 50.55423]),
        zoom: 5,
    }),
});

$('button').click(function () {
    let options = {
        category: $('select#category option:selected').val(),
        radio: $('input:radio:checked').val(),
        color: $('#color').val(),
        numbur: 20,
    }
    let getURL

    if (options.radio == 'random') {
        getURL = `${baseURL}${options.category}/${options.radio}/${options.numbur}?apikey=${apiKey}`
    } else {
        getURL = `${baseURL}${options.category}/${options.color}/${options.numbur}?apikey=${apiKey}`
    }

    let jqxhr = $.get(getURL, function (data) {
        if (data.status == 'success') {
             color = output(data.data);
            console.log(color);
            styles = {
                'XXXS': new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: `#${color[19]}`
                    })
                }),
                'XXS': new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: `#${color[17]}`
                    })
                }),
                'XS': new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: `#${color[15]}`
                    })
                }),
                'S': new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: `#${color[13]}`
                    })
                }),
                'M': new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: `#${color[11]}`
                    }),
                }),
                'L': new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: `#${color[9]}`
                    }),
                }),
                'XL': new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: `#${color[7]}`
                    })
                }),
                'XXL': new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: `#${color[5]}`
                    })
                }),
                'XXXL': new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: `#${color[3]}`
                    })
                }),
                'XXXXL': new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: `#${color[0]}`
                    })
                }),

            }
            colorLayer.setStyle(layerStyle)
        }
    });

    jqxhr.fail(function (data) {
        window.alert('No results');
    })

});
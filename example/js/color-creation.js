
// const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~'
// let getURL = `https://cloud.thinkgeo.com/api/v1/color/scheme/analogous/ffff00/10?apikey=${apiKey}`;

// let jqxhr = $.get(getURL, function (data) {
//    console.log(data)
// });


const baseURL = 'https://cloud.thinkgeo.com/api/v1/color/scheme/';
const apiKey = 'v8pUXjjVgVSaUOhJCZENyNpdtN7_QnOooGkG0JxEdcI~'

const output = function (data) {

    $('#output').html("");
    let str = '';
    if (data.colors) {
        data.colors.forEach(function (color) {
            str+=`<span class="output-color"  style=" background:#${color} ">#${color}</span> `;
        })
    } else {
        data.forEach(function (val) {
            str += `<div>base coler: <span class="output-color"  style=" background:#${val.baseColor} ">#${val.baseColor}</span> </div>`;
            val.colors.forEach(function (color) {
                str+=`<span class="output-color"  style=" background:#${color} ">#${color}</span> `;
            })
        });
    }
    $('#output').html(str);
}

$('button').click(function () {
    let options = {
        category: $('select#category option:selected').val(),
        radio: $('input:radio:checked').val(),
        color: $('#color').val(),
        numbur: $('#number').val(),
    }
    let getURL

    if (options.radio == 'random') {
        getURL = `${baseURL}${options.category}/${options.radio}/${options.numbur}?apikey=${apiKey}`
    } else {
        getURL = `${baseURL}${options.category}/${options.color}/${options.numbur}?apikey=${apiKey}`
    }

    let jqxhr = $.get(getURL, function (data) {
        if (data.status=='success'){
            output(data.data)
        } 
    });

    jqxhr.fail(function (data) {
        window.alert('No results');
    })

});


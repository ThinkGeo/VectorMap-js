#!/usr/bin/env node

var fs = require('fs');
var packer = require('./packer');
var Packer = packer.packer;
var method = process.argv[process.argv.length - 2];
var mergeStr = "";
var i = 1;

(function readFuc() {
    i++;
    if (i != process.argv.length - 2) {
        fs.readFile(process.argv[i], 'utf-8', function(err, data) {
            if (err) {
                console.log(err);
            } else {
                mergeStr += data;
                readFuc();
            }
        })
    } else {
        main(mergeStr);
    }
})();

function writeFuc(data) {
    fs.writeFile(process.argv[process.argv.length - 1], data, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("sucess!")
        }
    })
}

function main(data) {
    if (method == "-c") {
        var packer = new Packer;
        var optdata = packer.pack(data);
        writeFuc(optdata)
    } else if (method == "-m") {
        writeFuc(data);
    } else {
        console.log("Error,Please choose merge(-m) or compression(-c)")
    }
}
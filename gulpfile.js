var gulp = require('gulp');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var ts = require("gulp-typescript");
var gulpWebpack = require('webpack-stream');
var webpack = require('webpack');

gulp.task('clean:dist', function (done) {
    return gulp.src('dist', {
        read: false
    }).pipe(clean());
});

gulp.task('bundle:src', function (callback) {
    //fix cannot find ts-loader issue, see https://github.com/webpack/webpack/issues/2411 for details
    delete global.System;

    return gulp.src('src/main.ts')
        .pipe(gulpWebpack(require('./webpack.config.js'), webpack))
        .pipe(gulp.dest('dist/')).pipe(gulp.dest('examples/worldstreets/dist'));
});

gulp.task('build', function () {
    runSequence('bundle:src', function () {
        console.log('build finished..');
    });
});
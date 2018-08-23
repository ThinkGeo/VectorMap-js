const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/main.ts',
    // devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: 'ol.mapsuite.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        open: true,
        port: 7000,
        publicPath: '/examples/worldstreets/dist',
        openPage: '/examples/worldstreets'
    },
    mode: 'development'
};
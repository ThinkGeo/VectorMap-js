const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        'ol.mapsuite': './src/main.ts'
    },
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
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: __dirname + '/src/ol/ol-debug.js', to: __dirname + '/examples/worldstreets/dist',
            }
        ])
    ],
    devServer: {
        open: true,
        port: 7000,
        publicPath: '/examples/worldstreets/dist',
        openPage: '/examples/worldstreets'
    },
    mode: 'development'
};
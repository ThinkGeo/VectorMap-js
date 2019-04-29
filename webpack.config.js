const path = require('path');

module.exports = {
    entry: {
        'ol.mapsuite': './src/main.ts'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            }, 
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
    devServer: {
        open: true,
        port: 7000,
        publicPath: '/examples/worldstreets/dist',
        openPage: '/examples/worldstreets'
    },
    mode: 'development'
};
const path = require('path');

module.exports = {
    devtool: 'inline-source-map',
    entry: {
        'ol.mapsuite': './src/main.ts'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
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
    devServer: {
        openPage: "./debug",
        publicPath: '/debug/dist',
        compress: true,
        port: 8080
    },
    mode: 'development'
};
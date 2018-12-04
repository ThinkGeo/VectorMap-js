const path = require('path');

module.exports = {
    entry: './js/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: 'temp/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },
    plugins: [],
    devServer: {
        contentBase: './',
        host: 'localhost',
        compress: true,
        port: 8080
    },
    devtool: 'source-map'
}
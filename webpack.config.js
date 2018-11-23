const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  devtool: 'inline-source-map',
  output: {
    filename: 'vectormap.js',
    library: 'ol',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader',
          options: { inline: true, fallback: false }
        }
      }
    ]
  }
};
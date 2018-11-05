const webpack = require('webpack');

module.exports = {
  entry: './main.js',
  devtool: 'inline-source-map',
  output: {
    filename: 'bundle.js'
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
const webpack = require('webpack');

module.exports = {
  entry: './main.js',
  devtool: 'inline-source-map',
  output: {
    filename: 'bundle.js'
  },
  mode: 'development'
};
const webpack = require('webpack');


var developConfig = {
  entry: './src/index.js',
  devtool: 'inline-source-map',
  output: {
    filename: 'vectormap-dev.js',
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
  },
  devServer: {
    openPage: "./debug",
    host: 'localhost',
    compress: true,
    port: 8080
  },
};

var releaseConfig= {
  entry: './src/index.js',
  output: {
    filename: 'vectormap.js',
    library: 'ol',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
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
  },
  devServer: {
    openPage: "./debug",
    host: 'localhost',
    compress: true,
    port: 8080
  },
};
module.exports = [developConfig,releaseConfig];
'use strict';

const _PROD_ = process.env.NODE_ENV === 'production';

const path = require('path');
const Webpack = require('webpack');

const staticDir = path.resolve('./static');
const srcDirs = [
  path.resolve('./UUI'),
  path.resolve('./src')
];

const index = path.resolve(`./src/${_PROD_ ? 'index.js' : 'app.jsx'}`);


const config = {
  entry: {
    app: ['babel-polyfill', index]
  },

  output: {
    path: staticDir,
    filename: 'app.js'
  },

  resolve: {
    extensions: ['.js', '.jsx']
  },

  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
        include: srcDirs
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader?cacheDirectory',
        include: srcDirs
      }
    ]
  }
};

if (_PROD_) {
  config.plugins = [
    new Webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    //new Webpack.optimize.OccurenceOrderPlugin(),
    new Webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
  ];
}

module.exports = config;

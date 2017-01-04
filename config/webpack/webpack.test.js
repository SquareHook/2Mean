'use strict';
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');

module.exports = {
  devtool: 'inline-source-map',

  resolve: {
    extensions: [ '', '.ts', '.js' ],
    moduleDirectories: [ 'node_modules', path.resolve(rootDir, 'app-client') ]
  },
  tslint: {
    emitErrors: true
  },

  module: {
    preLoaders: [
        { exclude: /node_modules/, loader: 'tslint', test: /\.ts$/ }
    ],
    loaders: [
      { 
        test: /\.ts$/, 
        loaders: ['awesome-typescript-loader', 'angular2-template-loader']
      },
      { 
        test: /\.(css|html)$/, 
        loader: 'raw' 
      },
      {
        test: /\.less$/,
        loader: 'null'
      }
    ],
    postLoaders: [
      { 
        test: /\.(js|ts)$/, 
        loader: 'istanbul-instrumenter?esModules=true', 
        include: path.resolve(rootDir, './app-client'),
        exclude: [ /\.(e2e|spec)\.ts/, /node_modules/ ] 
      }
    ]
  },
  tslint: {
    configFile: './config/tslint.json'
  },
  plugins: [
    new ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      path.resolve(rootDir, './app-client')
    )
  ]
};

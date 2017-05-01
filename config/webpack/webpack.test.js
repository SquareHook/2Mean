'use strict';
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');

module.exports = {
  devtool: 'inline-source-map',

  resolve: {
    extensions: [ '.ts', '.js' ],
    modules: [ 'node_modules', path.resolve(rootDir, 'modules/app/client') ]
  },
  module: {
    rules : [
      {
        enforce: 'pre',
        exclude: /node_modules/,
        loader: 'tslint-loader',
        test: /.ts$/,
        options: {
          configFile: './config/tslint.json',
          emitErrors: true
        }
      },
      { 
        test: /\.ts$/, 
        loaders: ['awesome-typescript-loader', 'angular2-template-loader']
      },
      { 
        test: /\.(css|html)$/, 
        loader: 'raw-loader' 
      },
      {
        test: /\.less$/,
        loader: 'null-loader'
      },
      { 
        enforce: 'post',
        test: /\.(js|ts)$/, 
        loader: 'istanbul-instrumenter-loader?esModules=true', 
        include: /modules\/.*\/client/,
        exclude: [ /\.(e2e|spec)\.ts/, /node_modules/ ] 
      }
    ]
  },
  entry: {
    app: [ path.resolve(rootDir, 'modules/app/client', 'main') ],
    vendor: [ path.resolve(rootDir, 'modules/app/client', 'vendor') ]
  },
  plugins: [
    new ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      path.resolve(rootDir, './modules/app/client')
    )
  ]
};

'use strict';

const HtmlWebpack = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const ChunkWebpack = webpack.optimize.CommonsChunkPlugin;

const rootDir = path.resolve(__dirname, '../..');

const config = require('../config');

module.exports = {
    devServer: {
        contentBase: path.resolve(rootDir, 'modules/app/client'),
        port: 3000
    },
    devtool: 'source-map',
    entry: {
        app: [ path.resolve(rootDir, 'modules/app/client', 'main') ],
        vendor: [ path.resolve(rootDir, 'modules/app/client', 'vendor.browser') ]
    },
    module: {
        loaders: [
            { loader: 'raw-loader', test: /\.(css|html)$/ },
            { exclude: [ /.*spec\.ts/, /node_modules/ ], loaders: ['ts-loader', 'angular2-template-loader'], test: /\.ts$/ },
            { test: /\.less$/, loaders: ['style-loader', 'css-loader', 'less-loader' ], },
            { test: /\.(png|jpe?g|gif|svg)$/, loader: 'file-loader?name=/assets/images/[name].[ext]' }
        ],
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(rootDir, 'dist')
    },
    plugins: [
        new ChunkWebpack({
            filename: 'vendor.bundle.js',
            minChunks: Infinity,
            name: 'vendor'
        }),
        new HtmlWebpack({
            filename: 'index.html',
            inject: 'body',
            template: path.resolve(rootDir, 'modules/app/client', 'index.html')
        }),
        new webpack.ContextReplacementPlugin(
          /angular(\\|\/)core(\\|\/)@angular/,
          path.resolve(__dirname, '../src')
        ),
        new webpack.DefinePlugin({
          'process.env': {
            'TOOMEAN_APP_ALLOW_REGISTRATION': JSON.stringify(config.app.allowRegistration)
          }
        })
    ],
    resolve: {
        extensions: [ '.js', '.ts', '.less' ]
    }
};

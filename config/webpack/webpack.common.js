'use strict';

const HtmlWebpack = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const ChunkWebpack = webpack.optimize.CommonsChunkPlugin;

const rootDir = path.resolve(__dirname, '../..');

module.exports = {
    debug: true,
    devServer: {
        contentBase: path.resolve(rootDir, 'app-client'),
        port: 3000
    },
    devtool: 'source-map',
    entry: {
        app: [ path.resolve(rootDir, 'app-client', 'main') ],
        vendor: [ path.resolve(rootDir, 'app-client', 'vendor.browser') ]
    },
    module: {
        loaders: [
            { loader: 'raw', test: /\.(css|html)$/ },
            { exclude: /node_modules/, loaders: ['ts', 'angular2-template-loader'], test: /\.ts$/ },
            { test: /\.json$/, loaders: [ 'raw-loader', 'json-loader' ] },
            { test: /\.less$/, loaders: ['style-loader', 'css-loader', 'less-loader' ] }
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
            template: path.resolve(rootDir, 'app-client', 'index.html')
        })
    ],
    resolve: {
        extensions: [ '', '.js', '.ts', '.less' ]
    }
};

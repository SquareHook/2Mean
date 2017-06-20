// Load global configuration
var config = require('./config/config');

var path = require('path');
var fs = require('fs');

// This is assuming the application was executed at the root dir.
config.basedir = path.resolve('.');

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();

var mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;

mongoose.connect(config.mongo.uri);

/*
 * Application Modules.
 *
 * TODO: This should be done somewhere else.
 */
var coreModule = require('./modules/core/server/');
var core = new coreModule(config, app);

var logger = core.moduleLoader.get('logger');

var auth = core.moduleLoader.get('auth');
var user = core.moduleLoader.get('users');

var http = require('http');
var https = require('https');

var https_options = {
  key: fs.readFileSync('./config/private/key.pem'),
  cert: fs.readFileSync('./config/private/cacert.pem')
};

/*
 * Express setup.
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());


// Impromptu logger.
app.use((req, res, next) => {
  logger.info('Endpoint ' + req.path);
  next();
});

// redirect all requests to https
if (config.app.force_https) {
  app.use(function(req, res, next) {
    if (!req.secure) {
      let redirect = 'https://' + req.hostname +
        (config.app.port_https === '443' ? '' : ':' + config.app.port_https) +
        req.url;
            
      return res.redirect(redirect);
    }

    next();
  });
}

// Magic - Abrakadabra load the application.
core.routes.loadRoutes();


// static route to serve app source and static assets (images)
app.use(express.static(path.resolve('dist')));

/**
 * Sends angular app back for all other requests
 */
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});


http.createServer(app).listen(config.app.port_http, () => {
  console.log('Application started and listening on port' + config.app.port_http);
});

https.createServer(https_options, app).listen(config.app.port_https, () => {
  console.log('Application started and listening on port' + config.app.port_https);
});

module.exports = app;

// Load global configuration
var config = require('./config/config');
console.log(config);

var path = require('path');
var fs = require('fs');

// Initialize the Application logger.
var logger = require('./app-server/logger.js');
logger.info('Application Bootstrapping...');

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();

var mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;

mongoose.connect(config.mongo.uri);

var authModule = require('./app-server/auth/');
var auth = new authModule(logger);

var http = require('http');
var https = require('https');

var https_options = {
    key: fs.readFileSync('./config/private/key.pem'),
    cert: fs.readFileSync('./config/private/cacert.pem')
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

/*
 * Routes that can be accessed by anyone.
 */
app.get('/api/test',
    auth.validateAPIKey,
    (req, res) => {
      res.send({
        user: req.auth
      });
    });

app.post('/api/login', auth.login);

/*
 * Routes that can be accessed only by authenticated users.
 */

/*
 * Routes that can be accessed only by authenticated & authorized users.
 */

/*
 * Setup the client application route.
 */

app.use(express.static(path.resolve('dist')));

/**
 * Sends angular app back for all other requests
 */
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

http.createServer(app).listen(config.app.port_http, () => {
  console.log('Application started and listening on port' + config.app.port_http);
});

https.createServer(https_options, app).listen(config.app.port_https, () => {
  console.log('Application started and listening on port' + config.app.port_https);
});

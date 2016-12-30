// Load global configuration
var config = require('./config/config');
console.log(config);

var path = require('path');
var fs = require('fs');

// Initialize the Application logger.
var logger = require('./app-server/logger.js');
logger.info('Application Bootstrapping...');

var express = require('express');
var router = express.Router();
var app = express();

var mongoose = require('mongoose');
mongoose.connect(config.mongo.uri);

var authModule = require('./app-server/auth/');
var auth = new authModule(logger);

var passport = require('passport');

var http = require('http');
var https = require('https');

var https_options = {
    key: fs.readFileSync('./config/private/key.pem'),
    cert: fs.readFileSync('./config/private/cacert.pem')
};

/*
 * Routes that can be accessed by anyone.
 */
app.get('/api/test',
    passport.authenticate('digest', {
      session: false,
      failureRedirect: '/auth/signin'
    }),
    (req, res) => {
      res.send({status: 'Test'});
    });

app.get('/login', (req, res) => {
  res.status(200).send({data: 'Endpoint not available'});
});

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

http.createServer(app).listen(config.app.port_http, () => {
  console.log('Application started and listening on port' + config.app.port_http);
});

https.createServer(https_options, app).listen(config.app.port_https, () => {
  console.log('Application started and listening on port' + config.app.port_https);
});

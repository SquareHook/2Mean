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

// TODO: This needs to be pulled into a separate file with environment set connection strings.
mongoose.connect('mongodb://localhost/toomean');

/*
 * Application Modules.
 *
 * TODO: This should be done somewhere else.
 */
var authModule = require('./app-server/auth/');
var auth = new authModule(logger);

var userModule = require('./app-server/user/');
var user = new userModule(logger);

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
 * Express setup.
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// Impromptu logger.
app.use((req, res, next) => {
  logger.info('Endpoint ' + req.path);
  next();
});

/*
 * Endpoint Definitions.
 *
 * TODO: This should be done somewhere else.
 */
app.get('/api/test',
    auth.validateAPIKey,
    (req, res) => {
      res.send({
        user: req.auth
      });
    });

app.post('/api/login', auth.login);

app.get('/api/users/:userId', auth.validateAPIKey, user.read);
app.post('/api/users', auth.validateAPIKey, user.create);
app.put('/api/users', auth.validateAPIKey, user.update);
app.delete('/api/users/:userId', auth.validateAPIKey, user.deleteUser);

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

http.createServer(app).listen(3080, () => {
  console.log('Application started and listening on port 3080');
});

https.createServer(https_options, app).listen(3443, () => {
  console.log('Application started and listening on port 3443');
});

var path = require('path');
var fs = require('fs');

// Initialize the Application logger.
var logger = require('./app-server/logger.js');
logger.info('Application Bootstrapping...');

var express = require('express');
var router = express.Router();
var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/2Mean');

var authModule = require('./app-server/auth/');
var auth = new authModule(logger);

var passport = require('passport');

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

app.listen(3000, () => {
  console.log('Application started and listening on port 3000');
});

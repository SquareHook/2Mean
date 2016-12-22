var path = require('path');

// Initialize the Application logger.
var logger = require('./app-server/logger.js');
logger.info('Application Bootstrapping...');

var express = require('express');
var app = express();

var auth = require('./app-server/auth.js');

/*
 * Routes that can be accessed by anyone.
 */
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

app.use('/app', (req, res, next) => {
  console.log('Got root request');
  return next();
});
app.get('/app', express.static(path.join(__dirname, 'app-client')));

app.use('/lib', (req, res, next) => {
  console.log('Got lib request');
  return next();
});
app.get('/lib', express.static('node_modules'));

app.listen(3000, () => {
  console.log('Application started and listening on port 3000');
});

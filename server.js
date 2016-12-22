var path = require('path');
var fs = require('fs');

// Initialize the Application logger.
var logger = require('./app-server/logger.js');
logger.info('Application Bootstrapping...');

var express = require('express');
var router = express.Router();
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

app.use(express.static(path.resolve('dist')));

app.listen(3000, () => {
  console.log('Application started and listening on port 3000');
});

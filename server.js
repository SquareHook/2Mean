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

app.use(express.static(path.resolve('app-client')));

/**
 * The route that serves all node_module files.
 */
router.get('/lib\*', (req, res, next) => {
  var url = req.originalUrl.replace('/lib', 'node_modules');
  var file;

  try {
    file = path.resolve(url);
  } catch (e) {
    logger.warning('Malformed file location', url);
    return next();
  }

  return res.sendFile(file);
});

router.get('/systemjs.config.js', (req, res, next) => {
  return res.sendFile(path.resolve('systemjs.config.js'));
});

app.use('/', router);

app.listen(3000, () => {
  console.log('Application started and listening on port 3000');
});

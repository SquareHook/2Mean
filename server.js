var path = require('path');

// Initialize the Application logger.
var logger = require('./config/logger.js');
logger.info('Application Bootstrapping...');

var express = require('express');
var router = express.Router();

var auth = require('./auth.js');

/*
 * Setup the client application route.
 */
router.get('/', express.static('app-client'));
router.get('/lib', express.static('node_modules'));

/*
 * Routes that can be accessed by anyone.
 */
router.post('/api/login', auth.login);

/*
 * Routes that can be accessed only by authenticated users.
 */

/*
 * Routes that can be accessed only by authenticated & authorized users.
 */

module.exports = router;

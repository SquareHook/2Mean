var path = require('path');

// Initialize the Application logger.
var logger = require('./config/logger.js');
logger.info('Application Bootstrapping...');

var express = require('express');
var router = express.Router();

var auth = require('./auth.js');

/*
 * Routes that can be accessed by anyone.
 */
router.post('/login', auth.login);

/*
 * Routes that can be accessed only by authenticated users.
 */

/*
 * Routes that can be accessed only by authenticated & authorized users.
 */

module.exports = router;

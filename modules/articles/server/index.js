var Users = require('../../users/server/models/Users');
var Article = require('./models/Article');

var ArticleController = require('./controllers/article.controller.js');


/**
 * Top level function that wraps all of the module together to return to the application.
 */
function Articles([logger]) {
  var articleController = new ArticleController(logger);

  return articleController;
};

module.exports = Articles;

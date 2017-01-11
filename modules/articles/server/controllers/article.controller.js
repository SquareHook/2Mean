var mongoose = require('mongoose');
var Article = mongoose.model('Article');
//var Keys = mongoose.model('Keys');
var q = require('q');
var _ = require('lodash');


function articleController(logger) {

  function test(req, res, next) {
    var user = req.user;
    return res.status(200).send('hit server endpoint for articles');
  }

  function create(req, res, next)
  {
    logger.info("create method");
    /*var article = new Article();
    newUser.save((err, data) => {

    });
	  */
    return res.status(200).send('hit server endpoint for articles');
  }


  return {
    read: test,
    create: create
  };
}

module.exports = articleController;

var mongoose = require('mongoose');
var Article = mongoose.model('Article');
//var Keys = mongoose.model('Keys');
var q = require('q');
var _ = require('lodash');

const MAX_RESULTS = 100;
function articleController(logger) {


  function getArticle(req, res, next) {

    var id = req.params.id || null; 
    var deferred = q.defer();
    Article.findOne({_id: id}, (err, data) => {
      if (err) {
        logger.error('Error creating article', err);
        deferred.reject({
        code: 500,
        error: 'Error creating article'
        });
      }
      else
      {
        deferred.resolve({
          code: 201,
          data: data
        });
      }
    });
    return deferred.promise
    .then((data) => {
        res.status(data.code).send(data);
      }, (error) => {
        res.status(error.code).send(error.error);
      });

    }

  function getArticles(req, res, next) {
    var deferred = q.defer();
    Article.find({}, (err, data) => {
      if (err) {
        logger.error('Error creating article', err);
        deferred.reject({
        code: 500,
        error: 'Error creating article'
        });
      }
      else
      {
        deferred.resolve({
          code: 201,
          data: data
        });
      }
    }).limit(MAX_RESULTS);
    return deferred.promise
    .then((data) => {
        res.status(data.code).send(data);
      }, (error) => {
        res.status(error.code).send(error.error);
      });

    }



  function create(req, res, next)
  {

    var deferred = q.defer();
    var article = new Article();
    article.title = req.body.title;
    article.content = req.body.content;
    article.userName = req.user.username;
    article.userId = req.user._id;

    article.save((err, data) => {
      if (err) {
        logger.error('Error creating article', err);
        deferred.reject({
          code: 500,
          error: 'Error creating article'
        });
      }
      else
      {
        deferred.resolve({
          code: 201,
          data: data
        });
      }
    })

    return deferred.promise
    .then((data) => {
        res.status(data.code).send(data.data);
      }, (error) => {
        res.status(error.code).send(error.error);
      });

    }
      return {
        read: getArticles,
        readOne: getArticle,
        create: create
      };
    }

    module.exports = articleController;

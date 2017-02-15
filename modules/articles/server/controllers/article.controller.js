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
        logger.error('Error getting article', err);
        deferred.reject({
        code: 500,
        error: 'Error creating article'
        });
      }
      else
      {
        deferred.resolve({
          code: 200,
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
        logger.error('Error getting articles', err);
        deferred.reject({
        code: 500,
        error: 'Error: failed to get articles'
        });
      }
      else
      {
        deferred.resolve({
          code: 200,
          data: data
        });
      }
    })
    .sort({created: 1})
    .limit(MAX_RESULTS);
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
    article._id = new mongoose.mongo.ObjectId();
    
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
        create: create,
        update: update,
        delete: remove
      };
  }

  function update(req, res, next)
  {
    var deferred = q.defer();
    var article = new Article();
    article._id = req.params['id'];
    var updateDef = {
      $set :{
        _id: req.params['id'],
        title: req.body.title,
        content: req.body.content,
        updated: new Date()
      }
    };

    article.update( updateDef, {upsert: true}, (err, data) => {
      if (err) {
        console.log(err);
        deferred.reject({
          code: 500,
          error: 'Error updating article'
        });
      }
      else
      {
        deferred.resolve({
          code: 200,
          data: data
        });
      }
    });

    return deferred.promise
    .then((data) => {
        res.status(data.code).send(data.data);
      }, (error) => {
        res.status(error.code).send(error.error);
      });

  }

  function remove(req, res, next)
  {
    var deferred = q.defer();
    var article = new Article();
    article._id = req.params['id'];


    article.remove( article, (err, data) => {
      if (err) {
        console.log( err);
        deferred.reject({
          code: 500,
          error: 'Error removing article'
        });
      }
      else
      {
        deferred.resolve({
          code: 200,
          data: data
        });
      }
    });

    return deferred.promise
    .then((data) => {
        res.status(data.code).send(data.data);
      }, (error) => {
        res.status(error.code).send(error.error);
      });
  }




    module.exports = articleController;

module.exports = function(logger) {
  /**
   * endpoint controller for relaying client side log messages to server
   * and possibly elasticsearch
   * @param {String} req.body.level
   * @param {Object} req.body.args
   */
  function relayLog(req, res, next) {
    // level must be set. args may be anything but undefined
    if (req.body.level && req.body.args !== undefined) {
      logger.log(req.body.level, req.body.args);
      res.status(204).send();
    } else {
      // send a nice client error if possible
      if (!req.body.level) {
        res.status(400).send({ message: 'missing log level' });
      } else if (!req.body.args) {
        res.status(400).send({ message: 'missing log message' });
      } else {
        // otherwise shrug
        res.status(400).send();
      }
    }
  }

  return {
    relayLog: relayLog
  }
}

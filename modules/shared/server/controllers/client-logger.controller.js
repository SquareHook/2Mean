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
      res.status(400).send({ message: 'missing log level' });
    }
  }

  return {
    relayLog: relayLog
  }
}

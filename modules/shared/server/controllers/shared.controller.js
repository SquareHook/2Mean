const SharedController = function(logger) {
  /**
   * endpoint for api canary. For applications downstream from 2mean update
   * this to check status of dependencies
   */
  function apiCanary(req, res, next) {
    return new Promise((resolve, reject) => {
      res.status(200).send();
      resolve();
    });
  }

  return {
    apiCanary: apiCanary
  }
}

module.exports = SharedController;

module.exports = [
  {
    route: '/files/info',
    type: 'GET',
    method: 'uploader.fileInfo',
    secure: true
  },
  {
    route: '/logger',
    type: 'POST',
    method: 'clientLogger.relayLog',
    secure: true
  }
];

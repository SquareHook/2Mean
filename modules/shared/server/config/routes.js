module.exports = [
  {
    route: '/canary',
    type: 'GET',
    method: 'shared.apiCanary',
    secure: false
  },
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

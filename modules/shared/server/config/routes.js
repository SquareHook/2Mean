module.exports = [
  {
    name: 'Signal endpoint.',
    description: 'Signal endpoint to determine server health.',
    route: '/canary',
    type: 'GET',
    method: 'shared.apiCanary',
    secure: false
  },
  {
    name: 'Read file info.',
    description: 'Gets file info.',
    route: '/files/info',
    type: 'GET',
    method: 'uploader.fileInfo',
    secure: true
  },
  {
    name: 'Relay log access.',
    description: 'Access to relay logs from the UI.',
    route: '/logger',
    type: 'POST',
    method: 'clientLogger.relayLog',
    secure: true
  }
];

module.exports = [
  {
    route: '/articles',
    type: 'GET',
    method: 'read',
    secure: true
  },
  {
    route: '/articles',
    type: 'POST',
    method: 'create',
    secure: true
  }


];

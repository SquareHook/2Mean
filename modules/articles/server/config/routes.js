module.exports = [
  {
    route: '/articles',
    type: 'POST',
    method: 'create',
    secure: true
  },
  {
    route: '/articles',
    type: 'GET',
    method: 'read',
    secure: true
  },

  {
    route: '/articles/:id',
    type: 'GET',
    method: 'readOne',
    secure: true
  }
];

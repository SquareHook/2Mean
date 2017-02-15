module.exports = [
 {
    route: '/articles',
    type: 'GET',
    method: 'read',
    secure: false
  },

  {
    route: '/articles/:id',
    type: 'GET',
    method: 'readOne',
    secure: false
  },

  {
    route: '/articles',
    type: 'POST',
    method: 'create',
    secure: true
  },

  {
    route: '/articles/:id',
    type: 'PUT',
    method: 'update',
    secure: true
  },
  {
    route: '/articles/:id',
    type: 'DELETE',
    method: 'delete',
    secure: true
  } 
];

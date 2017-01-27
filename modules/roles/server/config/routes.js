module.exports = [
  {
    route: '/roles',
    type: 'POST',
    method: 'create',
    secure: true
  },
  {
    route: '/roles',
    type: 'PUT',
    method: 'update',
    secure: true
  },
    {
    route: '/roles/:id',
    type: 'DELETE',
    method: 'delete',
    secure: true
  } 
];

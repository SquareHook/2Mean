module.exports = [
  {
    route: '/roles',
    type: 'POST',
    method: 'create',
    secure: false
  },
    {
    route: '/roles/:id',
    type: 'DELETE',
    method: 'delete',
    secure: false
  } 
];

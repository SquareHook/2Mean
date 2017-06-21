module.exports = [
  {
    name: 'Retreive a list of articles.',
    description: 'Lists articles.',
    route: '/articles',
    type: 'GET',
    method: 'read',
    secure: false
  },
  {
    name: 'Retreive a specific article.',
    description: 'Gets an article by it\'s Id',
    route: '/articles/:id',
    type: 'GET',
    method: 'readOne',
    secure: false
  },
  {
    name: 'Create an Article.',
    description: 'Creates an article.',
    route: '/articles',
    type: 'POST',
    method: 'create',
    secure: true
  },
  {
    name: 'Update an Article.',
    description: 'Updates an existing article given an ID and the updated article.',
    route: '/articles/:id',
    type: 'PUT',
    method: 'update',
    secure: true
  },
  {
    name: 'Delete an Article.',
    description: 'Delete an article by it\'s Id.',
    route: '/articles/:id',
    type: 'DELETE',
    method: 'delete',
    secure: true
  } 
];

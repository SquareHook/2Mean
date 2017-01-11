module.exports = [
  {
    route: '/users/:userId',
    type: 'GET',
    method: 'read',
    secure: true
  },
  {
    route: '/users',
    type: 'POST',
    method: 'create',
    secure: true
  },
  {
    route: '/users',
    type: 'PUT',
    method: 'update',
    secure: true
  },
  {
    route: '/users/:userId',
    type: 'DELETE',
    method: 'deleteUser',
    secure: true
  },
  {
    route: '/users/register',
    type: 'POST',
    method: 'register',
    secure: false
  },
  {
    route: '/users/picture',
    type: 'POST',
    method: 'changeProfilePicture',
    secure: true
  }
];

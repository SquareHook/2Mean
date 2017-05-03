module.exports = [
  {
    route: '/users/list/:userList',
    type: 'GET',
    method: 'crud.readList',
    secure: true
  },
  {
    route: '/users/verifyEmail',
    type: 'GET',
    method: 'auth.verifyEmail',
    secure: true
  },
  {
    route: '/users/requestVerificationEmail',
    type: 'GET',
    method: 'auth.requestVerificationEmail',
    secure: true
  },
  {
    route: '/users/resetPassword',
    type: 'POST',
    method: 'auth.resetPassword',
    secure: false
  },
  {
    route: '/users/requestChangePasswordEmail',
    type: 'GET',
    method: 'auth.requestChangePasswordEmail',
    secure: false
  },
  {
    route: '/users/:userId',
    type: 'GET',
    method: 'crud.read',
    secure: true
  },
  {
    route: '/users',
    type: 'GET',
    method: 'crud.list',
    secure: true
  },
  {
    route: '/users',
    type: 'POST',
    method: 'crud.create',
    secure: true
  },
  {
    route: '/users',
    type: 'PUT',
    method: 'crud.update',
    secure: true
  },
  {
    route: '/users/adminUpdate',
    type: 'PUT',
    method: 'crud.adminUpdate',
    secure: true
  },
  {
    route: '/users/:userId',
    type: 'DELETE',
    method: 'crud.deleteUser',
    secure: true
  },
  {
    route: '/users/register',
    type: 'POST',
    method: 'auth.register',
    secure: false
  },
  {
    route: '/users/picture',
    type: 'POST',
    method: 'profile.changeProfilePicture',
    secure: true
  },
  {
    route: '/users/:userId/picture/:fileName',
    type: 'GET',
    method: 'profile.getProfilePicture',
    secure: true
  },
  {
    route: '/users/changePassword',
    type: 'PUT',
    method: 'auth.changePassword',
    secure: true
  },
];

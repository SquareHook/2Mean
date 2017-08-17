module.exports = [
  {
    name: 'Get user information from an array of id\s.',
    description: 'Given an array of User ids, will retreive those users information.',
    route: '/users/list/:userList',
    type: 'GET',
    method: 'crud.readList',
    secure: true
  },
  {
    name: 'Verify a user\'s email.',
    description: 'Verifies a given email for a new user.',
    route: '/users/verifyEmail',
    type: 'GET',
    method: 'auth.verifyEmail',
    secure: true
  },
  {
    name: 'Request for verification of an email.',
    description: 'The request for verification for an email.',
    route: '/users/requestVerificationEmail',
    type: 'GET',
    method: 'auth.requestVerificationEmail',
    secure: true
  },
  {
    name: 'Reset a password.',
    description: 'Allows the reseting of a password.',
    route: '/users/resetPassword',
    type: 'POST',
    method: 'auth.resetPassword',
    secure: false
  },
  {
    name: 'Request password change.',
    description: 'Request a password change for a users account.',
    route: '/users/requestChangePasswordEmail',
    type: 'GET',
    method: 'auth.requestChangePasswordEmail',
    secure: false
  },
  {
    route: '/users/readSelf',
    type: 'GET',
    method: 'crud.readSelf',
    secure: true
  },
  {
    name: 'Retreive a user information.',
    description: 'Gets a users information based on their Id.',
    route: '/users/:userId',
    type: 'GET',
    method: 'crud.read',
    secure: true
  },
  {
    name: 'Gets a list of users.',
    description: 'Gets a list of users and their information.',
    route: '/users',
    type: 'GET',
    method: 'crud.list',
    secure: true
  },
  {
    name: 'Create a User.',
    description: 'Creates a user account.',
    route: '/users',
    type: 'POST',
    method: 'crud.create',
    secure: true
  },
  {
    name: 'Updates a User.',
    description: 'Updates a users information.',
    route: '/users',
    type: 'PUT',
    method: 'crud.update',
    secure: true
  },
  {
    name: 'Update the Admin User.',
    description: 'Updates the Admin user.',
    route: '/users/adminUpdate',
    type: 'PUT',
    method: 'crud.adminUpdate',
    secure: true
  },
  {
    name: 'Delete a User.',
    description: 'Deletes a user from the application.',
    route: '/users/:userId',
    type: 'DELETE',
    method: 'crud.deleteUser',
    secure: true
  },
  {
    name: 'Register a User.',
    description: 'Registers a User with the Application.',
    route: '/users/register',
    type: 'POST',
    method: 'auth.register',
    secure: false
  },
  {
    name: 'Change Profile Picture.',
    description: 'Change the Profile Picture.',
    route: '/users/picture',
    type: 'POST',
    method: 'profile.changeProfilePicture',
    secure: true
  },
  {
    name: 'Retreive Profile picture information.',
    description: 'Gets the Profile picture for the given user.',
    route: '/users/:userId/picture/:fileName',
    type: 'GET',
    method: 'profile.getProfilePicture',
    secure: true
  },
  {
    name: 'Change User Password.',
    description: 'Change the Password on a User account.',
    route: '/users/changePassword',
    type: 'PUT',
    method: 'auth.changePassword',
    secure: true
  },
];

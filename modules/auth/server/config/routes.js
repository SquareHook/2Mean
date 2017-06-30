module.exports = [
  {
    name: 'Authenticates a user.',
    description: 'Authenticates a user with the system and logs the user into the application.',
    route: '/login',
    type: 'POST',
    method: 'login',
    secure: false
  },
  {
    name: 'Logs a user out.',
    description: 'Logs a user out of the application.',
    route: '/logout',
    type: 'GET',
    method: 'logout',
    secure: true
  }
];

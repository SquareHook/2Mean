module.exports = [
  {
    route: '/login',
    type: 'POST',
    method: 'login',
    secure: false
  },
  {
    route: '/logout',
    type: 'GET',
    method: 'logout',
    secure: true
  }
];

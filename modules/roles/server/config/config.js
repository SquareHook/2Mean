module.exports = {
  ADMIN_ROLE_NAME: 'admin',
  /**
   * List of values that is pulled for determining the id hash for the route manager.
   */
  ENDPOINT_DETAIL_LIST : [
    'route',
    'type',
    'secure'
  ],
  DEFAULT_ROLE_TREE: {
    name: 'admin',
    children: [
      {
        name: 'user',
        children: [],
        permissions: [
          {
            module: 'auth',
            allow: [
              /^.*$/
            ],
            forbid: []
          },
          {
            module: 'users',
            allow: [
              /^.*$/
            ],
            forbid: [
              'GET/users/list/:userList',
              'GET/users/:userId',
              'POST/users',
              'PUT/users/adminUpdate',
              'DELETE/users/:userId'
            ]
          }
        ]
      }
    ]
  }
};

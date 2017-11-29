import { MenuItem } from './menu-item.interface';

export const CoreMenu: Array<MenuItem> = [
  {
    template: 'Admin',
    state: '#',
    position: 3,
    roles: [
      'admin'
    ],
    subitems: [
      {
        template: 'Roles',
        state: '/roles',
        roles: [
          'admin'
        ]
      },
      {
        template: 'Endpoints',
        state: '/roles/endpoints',
        roles: [
          'admin'
        ]
      },
      {
        template: 'Users',
        state: '/users/manage',
        roles: [
          'admin'
        ]
      }
    ]
  }
]

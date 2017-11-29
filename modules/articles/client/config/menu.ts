import { MenuItem } from './../../../core/client/config/menu-item.interface';

export const ArticlesMenu: Array<MenuItem> = [
  {
    template: 'Articles',
    state: '/articles',
    position: 2,
    roles: [],
    subitems: [
      {
        template: 'New',
        state: '/articles/new',
        roles: [
          'user',
        ]
      },
      {
        template: 'List',
        state: '/articles',
        roles: [
          'user'
        ]
      }
    ]
  }
];

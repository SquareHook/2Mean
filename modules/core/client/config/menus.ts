import { ArticlesMenu } from './../../../articles/client/config/menu';
import { CoreMenu } from './menu';

let menus: Array<any> = [];

export const Menu = menus.concat(ArticlesMenu, CoreMenu);

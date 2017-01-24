import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../auth/client/auth.service.client';

import { Subscription } from 'rxjs/Subscription';

const menuJson = require('./../config/menus.json');

/*
*  The component that renders the main navigation bar
*/
@Component({
  selector: 'core-menu',
  providers: [],
  templateUrl: 'core.component.client.html'
})

export class CoreMenuComponent {
  menu: Array<any>;
  loggedIn: boolean;
  user: any;

  constructor(private router: Router, private authService: AuthService) {
    this.menu = [];
    // Determine if logged in
    this.loggedIn = this.authService.loggedIn;
    this.setup();
    this.user = authService.getUser();

    //update the menu when auth changes
    authService.authChanged$.subscribe(
      data => {
        this.loggedIn = data;
        if(!this.loggedIn)
        {
          this.router.navigateByUrl('/signin');
        }
        this.user = authService.getUser();
        this.setup();
      });
  }

  /*
  * Adds items to the menu from the config file
  */
  private setup() {
    this.menu = [];
    let tempMenu = [];

    //do some formatting to get proper JSON
    tempMenu = menuJson.replace("module.exports =", "");
    tempMenu = tempMenu.slice(0, tempMenu.length - 1);
    tempMenu = JSON.parse(tempMenu);

    for (let item of tempMenu) {
      if (this.authorized(item)) {
        this.menu.push(this.processSubitems(item));
      }

    }

    this.menu.sort((a: any, b: any) => {
      return a.position - b.position;
    });
  }

  /*
  * Removes any subitems that are unauthorized. Configures aux route display and dropdown display
  */
  private processSubitems(item: any): any {
    let menuItem: any = {
      template: item.template,
      state: item.state,
      position: item.position,
      subitems: [],
      dropdown: false
    };

    if (item.subitems && item.subitems.length > 0) {
      for (let subitem of item.subitems) {
        if (subitem.outlet) {
          subitem.state = subitem.outlet + '/(' + subitem.outlet + ":" + subitem.state + ')';
        }
        if (this.authorized(subitem)) {
          menuItem.subitems.push(subitem);
          menuItem.dropdown = true;
        }
      }
    }
    return menuItem;
  }

  /*
  * Returns whether or not the user is authorized to view the menu item
  */
  private authorized(item: any): boolean {
    //if the item has one or more roles assigned, check authorization
    if (item.roles && item.roles.length > 0) {
      return this.loggedIn;
    }
    return true;
  }

  /*
  * programatically navigate to an auxiliary route
  */
  navByUrl(state: string): void {

    this.router.navigateByUrl(state);

  }
}


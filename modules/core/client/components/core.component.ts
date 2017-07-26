import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../auth/client/services/auth.service';
import { RoleService } from '../../../roles/client/services/roles.service';

import { Subscription } from 'rxjs/Subscription';

import { Menu } from './../config/menus';

/*
*  The component that renders the main navigation bar
*/
@Component({
  selector: 'core-menu',
  providers: [],
  templateUrl: '../views/core.view.html'
})

export class CoreMenuComponent implements OnInit{
  menu: Array<any>;
  loggedIn: boolean;
  user: any;
  isCollapsed: boolean;

  constructor(
    private router: Router,
    private authService: AuthService,
    private roleService: RoleService
  ) {
    this.menu = [];
    this.isCollapsed = true;
    
    }

    ngOnInit(): void
    {
      // Determine if logged in
      this.loggedIn = this.authService.loggedIn;

      this.user = this.authService.getUser();
      this.setup();
      //update the menu when auth changes
      this.authService.authChanged$.subscribe(
      data => {
        this.loggedIn = data;
        this.user = this.authService.getUser();
        this.setup();
      });
      
    }
    
  

  /*
  * Adds items to the menu from the config file
  */
  private setup() {
    this.menu = [];
    let tempMenu = [];

    tempMenu = Menu;

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

        if(this.user && this.user._id) {
          return this.roleService.userHasRole(this.user, item.roles);
        }
        else {
          return false;
        }

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


import { Component } from '@angular/core';
import {Router }   from '@angular/router';

import { AuthService } from '../../../auth/client/auth.service.client';

const menuJson = require('./../config/menus.json');


@Component({
	selector:'core-menu',
	providers: [],
	templateUrl: 'core.component.client.html'
})

export class CoreMenuComponent{
	menu: any;
  loggedIn: boolean;

	constructor(
    private router:Router,
    private authService: AuthService
  ) {
	  //TODO: filter out items and subitems by role
	  let menuItems;
	  //do some formatting to get proper JSON
	  menuItems = menuJson.replace("module.exports =", "");
	  menuItems = menuItems.slice(0, menuItems.length-1);				
      menuItems = JSON.parse(menuItems);


      //sort the menu items according to the position variable
      menuItems.sort((a :any, b :any) =>{
	    return a.position - b.position;
	  });

	  for(let item of menuItems)
	  {
		if(item.subitems && item.subitems.length > 0)
		  {
			item.dropdown=true;
			//temp fix for subitems with a different outlet
			for(let subitem of item.subitems)
			{
				if(subitem.outlet)
				{
					subitem.state = subitem.outlet +'/(' +subitem.outlet + ":" + subitem.state + ')';
				}
			}
		  }

	  }
		this.menu = menuItems;

    // Determine if logged in
    this.loggedIn = this.authService.loggedIn;
	}

	navByUrl(state:string):void{

        this.router.navigateByUrl(state);
    
	}
 
}	


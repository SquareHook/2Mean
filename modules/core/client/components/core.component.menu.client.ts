import { Component } from '@angular/core';
const menuJson = require('./../config/menus.json');


@Component({
	selector:'core-menu',
	providers: [],
	templateUrl: './core.component.client.html'
})

export class CoreMenuComponent{
	menu: any
	constructor()
	{
		
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
		   }
	  }
		this.menu = menuItems;
	}
}	


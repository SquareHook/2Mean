import { Component } from '@angular/core';
const menuItems = require('./../config/menus.json');


@Component({
	selector:'core-menu',
	providers: [],
	templateUrl: './core.component.client.html'
})

export class CoreMenuComponent{
	menu_items : any
	constructor()
	{
		//do some formatting to get proper JSON
		this.menu_items = menuItems.replace("module.exports =", "");
		this.menu_items = this.menu_items.slice(0, this.menu_items.length-1);				
		this.menu_items = JSON.parse(this.menu_items);

		//sort the menu items according to the position variable
		this.menu_items.sort((a :any, b :any) =>{
			return a.position - b.position;
		});

	
	}



		

}	


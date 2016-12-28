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
		//TODO: fix this awefulness
		this.menu_items = menuItems.replace("module.exports =", "");
		this.menu_items = this.menu_items.slice(0, this.menu_items.length-1);				
		this.menu_items = JSON.parse(this.menu_items);
		this.menu_items = this.menu_items.menu_items;

		//TODO: sort the menu items by position
	}


}	


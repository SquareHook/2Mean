import { Component } from '@angular/core';
//import { Menu }		 from '../config/menus.json';
var items = ['a', 'b', 'c'];

@Component({
	selector:'core-menu',
	providers: [],
	templateUrl: './core.component.client.html'
})

export class CoreMenuComponent{
	items = items;
	constructor()
	{

	}
}


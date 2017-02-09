/* Vendor */
import { Component }        from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { Router }           from '@angular/router';

/* Angular2 Models */
import { User }             from '../models/user.model.client';

@Component({
  templateUrl: './../views/users.view.html'
})
export class UsersComponent {
  constructor () { }


  setUser(user: any)
  {
    console.log(user);
  }
}

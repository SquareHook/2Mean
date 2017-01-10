/* Vendor */
import { Component }        from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { Router }           from '@angular/router';

/* Angular2 Models */
import { User }             from '../models/user.model.client';

/* Angular2 Services */
import { AuthService }      from '../../../auth/client/auth.service.client';
import { UserService }      from '../services/user.service';


@Component({
  templateUrl: './../views/profile.view.html'
})
export class ProfileComponent {
  user: User;

  constructor (private authService: AuthService) { 
    this.user = authService.user;
  }

  getUserString() {
    return JSON.stringify(this.user, null, 2);
  }
}

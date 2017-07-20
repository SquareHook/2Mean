/* Vendor */
import { Component, OnInit }        from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { Router }           from '@angular/router';

/* Angular2 Models */
import { User }             from '../models/user.model';

/* Angular2 Services */
import { AuthService }      from '../../../auth/client/services/auth.service';
import { UserService }      from '../services/user.service';


@Component({
  templateUrl: './../views/profile.view.html'
})
export class ProfileComponent implements OnInit{
  user: User;

  constructor (private authService: AuthService) { 
  }

  ngOnInit(){
    this.user = this.authService.getUser();
  }
  
  getUserString() {
    return JSON.stringify(this.user, null, 2);
  }
}

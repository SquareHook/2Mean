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
  templateUrl: './../views/change-password.view.html'
})
export class ChangePasswordComponent {
  user: User;
  loading = false;
  errorMessage: string;
  passwordNew0 : string;
  passwordNew1 : string;
  password0Valid : boolean;
  password1Valid : boolean;

  constructor (
    private authService: AuthService,
    private userService: UserService
  ) { 
    this.user = this.authService.getUser();
  }

  onKey (event : any) : void {
    if (this.passwordNew0 === this.passwordNew1) {
      this.password0Valid = true;
      this.password1Valid = true;
    } else {
      this.password0Valid = false
      this.password1Valid = false;
    }
  }

  /*
   * called on form submission. Validate passwords match authenticate user
   * and update user
   */
  submit() : void {
    this.loading = true;

    if (this.password0Valid && this.password1Valid) {
      this.userService.update(this.user)
        .subscribe(
          user => {
            this.user = user;
            this.authService.setUser(this.user);
          },
          error => {
            this.errorMessage = error._body;
          });
    }

    this.loading = false;
  }
}

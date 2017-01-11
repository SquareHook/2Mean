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
  templateUrl: './../views/edit-profile.view.html'
})
export class EditProfileComponent {
  errorMessage: string;
  user: User;
  loading = false;
  
  constructor (
    private authService: AuthService,
    private userService: UserService) {
      this.user = authService.user;
  }

  /*
   * called on button click. user userservice to update the model
   *
   */
  submit () : void {
    this.loading = true;
    this.userService.update(this.user)
      .subscribe(
        user => {
          this.authService.user = user;
          this.userService.uploadProfilePicture((item: any, response: any, headers: any) => {
            let userRes = JSON.parse(response);
            console.log(userRes);
            this.authService.setUser(userRes);
            this.user.profileImageURL = userRes.profileImageURL;
          });
        },
        error => {
          this.errorMessage = error._body;
          this.loading = false;
        });

  }
}


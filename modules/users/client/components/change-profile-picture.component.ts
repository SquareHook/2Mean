/* Vendor */
import { Component, Inject, Input }        from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { Router }           from '@angular/router';

/* Angular2 Models */
import { User }             from '../models/user.model.client';

/* Angular2 Services */
import { AuthService }      from '../../../auth/client/auth.service.client';
import { UserService }      from '../services/user.service';

@Component({
  templateUrl: './../views/change-profile-picture.view.html'
})
export class ChangeProfilePictureComponent {
  @Input() user: User;

  constructor (
    private authService: AuthService,
    private userService: UserService,
  ) { 
    this.user = authService.user;
  }

  upload () {
    this.userService.uploadProfilePicture((item: any, response: any, headers: any) => {
      let userRes = JSON.parse(response);
      console.log(userRes);
      this.authService.setUser(userRes);
      this.user.profileImageURL = userRes.profileImageURL;
    });
  }

  getImageUrl() {
    return this.user.profileImageURL;
  }
}

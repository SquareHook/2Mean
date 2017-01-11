/* Vendor */
import { Component, Inject, Input }        from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { Router }           from '@angular/router';
import { FileUploader }     from 'ng2-file-upload';

/* Config */
import { USERS_CONFIG, USERS_DI_CONFIG, UsersConfig } from '../config/users-config';
/* Angular2 Models */
import { User }             from '../models/user.model.client';

/* Angular2 Services */
import { AuthService }      from '../../../auth/client/auth.service.client';

@Component({
  templateUrl: './../views/change-profile-picture.view.html'
})
export class ChangeProfilePictureComponent {
  @Input() user: User;
  uploader : FileUploader;

  constructor (
    private authService: AuthService,
    @Inject(USERS_CONFIG) config : UsersConfig
  ) { 
    this.user = authService.user;

    this.uploader = new FileUploader({ url: config.uploads.profilePicture.url });
    this.uploader.onCompleteItem = (item : any, response: any, headers: any) => {
      let userRes = JSON.parse(response);
      console.log(userRes);
      this.authService.setUser(userRes);
      this.user.profileImageURL = userRes.profileImageURL;
    };
  }

  upload () {
    if (this.uploader.queue.length == 1) {
      this.uploader.queue[0].upload();
    }
  }

  getImageUrl() {
    return this.user.profileImageURL;
  }
}

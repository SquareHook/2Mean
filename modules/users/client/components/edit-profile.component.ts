/* Vendor */
import { Component, AfterViewChecked, ViewChild, Inject }        from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { Router }           from '@angular/router';
import { NgForm }           from '@angular/forms';

/* Config */
import { USERS_CONFIG, USERS_DI_CONFIG, UsersConfig } from '../config/users-config';

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
  sizeGood: boolean;
  typeGood: boolean;

  private allowedTypes: Array<string>;
  private maxSize: number;
  
  constructor (
    private authService: AuthService,
    private userService: UserService,
    @Inject(USERS_CONFIG) config : UsersConfig
  ) {
      this.user = authService.user;
      this.allowedTypes = config.uploads.profilePicture.allowedTypes;
      this.maxSize = config.uploads.profilePicture.maxSize;
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

  fileChange(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let file = fileInput.target.files[0];
      let fileType = file.type;
      let fileSize = file.size;

      this.sizeGood = fileSize <= this.maxSize;
      this.typeGood = this.allowedTypes.includes(fileType);
    }
  }

  userForm: NgForm;
  @ViewChild('userForm') currentForm: NgForm;

  ngAfterViewChecked() {
    this.formChanged();
  }

  formChanged() {
    if (this.currentForm === this.userForm) {
      return;
    }

    this.userForm = this.currentForm;

    this.userForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
  }

  onValueChanged(data?: any) {
    if (!this.userForm) {
      return;
    }

    const form = this.userForm.form;

    for (const field in this.formErrors) {
      // clear previous errors
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  formErrors = {
    'firstName': '',
    'lastName': '',
    'email': '',
    'profilePicture': ''
  };

  validationMessages = {
    'firstName': {

    },
    'lastName': {

    },
    'email': {

    },
    //TODO KB/MB
    'profilePicture': {
      'maxSize': 'Max picture size is ' + this.maxSize + 'B',
      'allowedType': 'Picture must one of the following types ' + this.allowedTypes
    }
  };
}


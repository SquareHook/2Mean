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
  strongPasswordRe: RegExp;

  constructor (
    private authService: AuthService,
    private userService: UserService,
    @Inject(USERS_CONFIG) config: UsersConfig
  ) { 
      this.user = this.authService.getUser();
      this.strongPasswordRe = config.passwordValidatorRe;
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
      this.user.password = this.passwordNew0;

      this.userService.update(this.user)
        .subscribe(
          user => {
            this.authService.user = user;
            this.loading = false;
          },
          error => {
            this.errorMessage = error._body;
            this.loading = false;
          });
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
    'password': '',
    'passwordNew0': '',
    'passwordNew1': ''
  };

  validationMessages = {
    'password': {
      'required': 'Password is required'
    },
    'passwordNew0': {
      'required': 'New password is required',
      'strongPassword': 'Password must contain uppper, lower case letter, digit, and symbol'
    },
    'passwordNew1': {
      'required': 'New password is required',
      'strongPassword': 'Password must contain uppper, lower case letter, digit, and symbol'
    }
  };
}

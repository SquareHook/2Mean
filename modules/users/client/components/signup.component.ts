/* Vendor */
import { Component, AfterViewChecked, ViewChild, Inject }        from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { Router }           from '@angular/router';
import { NgForm }          from '@angular/forms';

import { USERS_CONFIG, USERS_DI_CONFIG, UsersConfig } from '../config/users-config';

/* Angular2 Models */
import { User }             from '../models/user.model';

/* Angular2 Services */
import { UserService }      from '../services/user.service';

@Component({
  templateUrl: './../views/signup.view.html'
})
export class SignupComponent implements AfterViewChecked {
  model: any = {};
  errorMessage: string = null;
  strongPasswordRe: RegExp;
  validEmailRe: RegExp;

  constructor(
    private userService: UserService, 
    private router: Router,
    @Inject(USERS_CONFIG) config: UsersConfig
  ) { 
    // At least one Upper, lower, digit, symbol
    // min length 8
    this.strongPasswordRe = config.passwordValidatorRe;

    // an @
    this.validEmailRe = config.emailValidatorRe;
  }

  signup () {
    let newUser = new User();

    newUser.username = this.model.username;
    newUser.email = this.model.email;
    newUser.password = this.model.password;

    this.userService.register(newUser)
      .subscribe(
        user => {
          this.router.navigate(['/signin']);
        },
        error => {
          // TODO the server won't send this response until login by email
          // and email registration is enabled
          // this is to prevent username enumeration being used to
          // try to compromise accounts
          if (error._body === 'Username is taken') {
            
          }
          this.errorMessage = error._body;
        });
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
    if (this.userForm) {
      this.userForm.valueChanges
        .subscribe(data => this.onValueChanged(data));
    }
  }

  onValueChanged(data?: any) {
    if (!this.userForm) {
      return;
    }
    const form = this.userForm.form;

    for (const field in this.formErrors) {
      //clear previous errors
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
    'username': '',
    'email': '',
    'password': ''
  };

  validationMessages = {
    'username': {
      'unique': 'Username is taken',
      'required': 'Username is required'
    },
    'email': {
      'required': 'Email is required',
      'validEmail': 'That is not a valid email'
    },
    'password': {
      'required': 'Password is required',
      'strongPassword': 'Password must contain upper, lower case letter, digit, and symbol'
    }
  };

  get diagnostic() {
    return JSON.stringify(this.model);
  }
}

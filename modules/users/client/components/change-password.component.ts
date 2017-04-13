/* Vendor */
import { Component, AfterViewChecked, ViewChild, Inject }        from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { Router }           from '@angular/router';
import { NgForm }           from '@angular/forms';

/* Config */
import { USERS_CONFIG, USERS_DI_CONFIG, UsersConfig } from '../config/users-config';

/* Angular2 Models */
import { User }             from '../models/user.model';

/* Angular2 Services */
import { AuthService }      from '../../../auth/client/services/auth.service';
import { UserService }      from '../services/user.service';

@Component({
  selector: 'change-password',
  templateUrl: './../views/change-password.view.html'
})
export class ChangePasswordComponent {
  user: User;
  loading = false;
  errorMessage: string;
  passwordOld: string;
  passwordNew0 : string;
  passwordNew1 : string;
  password0Valid : boolean;
  password1Valid : boolean;
  strongPasswordRe: RegExp;

  constructor (
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
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
      // using changePassword instead of update because we want to be sure
      // to re-authenticate the user before changing its password
      this.userService.changePassword(this.passwordOld, this.passwordNew0)
        .subscribe(
          (user: User) => {
            this.authService.setUser(user);
            this.errorMessage = "";
            this.loading = false;
            this.router.navigate(['/profile']);
          },
          error => {
            // determine which error to display
            let errorCode = error.status;
            this.errorMessage = JSON.parse(error._body).message + errorCode;
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
    'passwordOld': '',
    'passwordNew0': '',
    'passwordNew1': ''
  };

  validationMessages = {
    'passwordOld': {
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

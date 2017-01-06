/*  Vendor */
import { Component }        from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { Router }           from '@angular/router';
/*  Angular2 Models */
import { User }             from './../models/user.model.client';

/*  Angular2 Services */
import { AuthService }      from './../../../auth/client/auth.service.client';

@Component({
  templateUrl: './../views/signin.view.html'
})
export class SigninComponent {
  model: any = {};
  loading = false;
  returnUrl: string;

  constructor(private authService: AuthService, private router: Router) { }

  login () {
    this.loading = true;

    // Attempt to hit login
    this.authService.login(this.model.userName, this.model.password, (error, data) => {
      // server has returned data
      if (data) {
        console.log(data);
        // is there a return url
        if (this.returnUrl) {
          this.router.navigate([this.returnUrl]);
        } else {
          // TODO real place to navigate by default after login
          this.router.navigate(['profile']);
        }
      }

      // server has returned error
      if (error) {
        console.log(error);
        this.loading = false;
      }
    });
  }

  get diagnostic() {
    return JSON.stringify(this.model);
  }
}

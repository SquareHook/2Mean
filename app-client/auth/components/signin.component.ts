/*  Vendor */
import { Component }        from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { Router }           from '@angular/router';
/*  Angular2 Models */
import { User }             from '../../users/models/user.model.client';

/*  Angular2 Services */
import { AuthService }      from './../auth.service.client';

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
    this.authService.login(this.model.userName, this.model.password, (error, data) => {
      if (data) {
        this.router.navigate([this.returnUrl]);
      }
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

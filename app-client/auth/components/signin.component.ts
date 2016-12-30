/*  Vendor */
import { Component }        from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { Router }           from '@angular/router';
/*  Angular2 Models */
import { User }             from './../models/user.model.client';

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
    console.log('login');
    this.loading = true;
    this.authService.login(this.model.userName, this.model.password)
      .subscribe(
        function (data: any) {
          this.router.navigate([this.returnUrl]);
        },
        function (error: any) {
          console.log(error);
          this.loading = false;
        });
  }

  get diagnostic() {
    return JSON.stringify(this.model);
  }
}

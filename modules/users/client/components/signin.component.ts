/*  Vendor */
import { Component, OnInit }from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { Router, ActivatedRoute }           from '@angular/router';
/*  Angular2 Models */
import { User }             from './../models/user.model.client';

/*  Angular2 Services */
import { AuthService }      from './../../../auth/client/auth.service.client';

@Component({
  templateUrl: './../views/signin.view.html'
})
export class SigninComponent implements OnInit {
  model: any = {};
  loading = false;
  returnUrl: string;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
  }

  login () {
    this.loading = true;

    // Attempt to hit login
    this.authService.login(this.model.userName, this.model.password, (error, data) => {
      // server has returned data
      if (data) {
        // is there a return url
        // honor query param first then authService
        this.activatedRoute.queryParams.subscribe((params) => {
          if (params['fredirect']) {
            //this.router.navigateByUrl(params['redirect']);
          } else {
            let redirect = this.authService.redirect ? this.authService.redirect : 'profile';
            this.router.navigateByUrl(redirect);
          }
        });
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

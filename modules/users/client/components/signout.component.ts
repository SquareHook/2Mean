/*  Vendor */
import { Component, OnInit }from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { Router, ActivatedRoute }           from '@angular/router';
/*  Angular2 Models */
import { User }             from './../models/user.model.client';

/*  Angular2 Services */
import { AuthService }      from './../../../auth/client/auth.service.client';

@Component({
  templateUrl: './../views/signout.view.html'
})
export class SignoutComponent implements OnInit {
  model: any = {};
  loading = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

/*  Vendor */
import { Component, OnInit }from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { Router, ActivatedRoute }           from '@angular/router';
import { NotificationsService } from 'angular2-notifications';

/*  Angular2 Models */
import { User }             from './../models/user.model';

/*  Angular2 Services */
import { AuthService }      from './../../../auth/client/services/auth.service';

import { LoggerService } from '../../../shared/client/services/logger.service';

@Component({
  templateUrl: './../views/signin.view.html'
})
export class SigninComponent implements OnInit {
  model: any = {};
  loading = false;
  returnUrl: string;

  constructor(
    private notificationsService: NotificationsService,
    private authService: AuthService, 
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private logger: LoggerService
  ) { 
  }

  ngOnInit() {
  }

  login () {
    this.loading = true;

    // Attempt to hit login
    this.authService.login(this.model.userName, this.model.password, (error, data) => {
      // server has returned data
      if (data) {
    this.logger.silly('Silly');
    this.logger.debug('Debug');
    this.logger.verbose('Verbose');
    this.logger.info('Info');
    this.logger.warn('Warn');
    this.logger.error('Error');
        // is there a return url
        // honor query param first then authService
        this.activatedRoute.queryParams.subscribe((params) => {
          if (params['redirect']) {
            this.router.navigateByUrl(params['redirect']);
          } else {
            let redirect = this.authService.redirect ? this.authService.redirect : 'profile';
            this.router.navigateByUrl(redirect);
          }
        });
      }

      // server has returned error
      if (error) {
        if (error.status === 400) {
          this.notificationsService.error('Error', error._body);
        } else if (error.status === 500) {
          this.notificationsService.error('Error', 'Internal Server Error');
        }

        this.loading = false;
      }
    });
  }

  get diagnostic() {
    return JSON.stringify(this.model);
  }
}

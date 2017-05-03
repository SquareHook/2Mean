import { Component } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import { Router } from '@angular/router';

import { UserService } from '../services/user.service';

@Component({
  selector: 'forgot-password',
  templateUrl: '../views/forgot-password.view.html'
})
export class ForgotPasswordComponent {
  private email: string;

  constructor(
    private userService: UserService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {

  }

  requestResetLink() {
    this.userService.requestResetPasswordEmail(this.email).subscribe((data) => {
      this.notificationsService.success('Email Sent', 'Check your inbox and follow the link in the email');
      this.router.navigateByUrl('/signin');
    }, (error) => {
      console.log(error);
      let body;

      if (error.status === 400) {
        body = JSON.parse(error._body);

        this.notificationsService.error('Error', body.error);
      } else if (error.status === 500) {
        this.notificationsService.error('Internal Server Error');
      }
    });
  }
}

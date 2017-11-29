import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';

import { UserService } from '../services/user.service';

@Component({
  selector: 'verify-email',
  templateUrl: '../views/verify-email.view.html'
})
export class VerifyEmailComponent implements OnInit {
  private token: string;
  private redirect: string;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private notificationsService: NotificationsService,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.token = this.route.snapshot.params['token'];
    if (this.token) {
      this.sendToken();
    }

    this.route.params.subscribe((params) => {
      if (params['redirect']) {
        this.redirect = params['redirect'];
      }
   });
  }

  /**
   * called on component load and on user request (input)
   */
  sendToken() {
    this.userService.verifyEmail(this.token).subscribe((data) => {
      this.notificationsService.success('Success', 'Email verified');

      this.router.navigateByUrl(this.redirect || '/');
    }, (error) => {
      let body = JSON.parse(error._body);
      if (error.status === 400) {
        if (body.message === 'Token has expired') {
          this.notificationsService.error('Error', 'Token has expired. Request a new email be sent');
        } else if (body.message === 'Token invalid') {
          this.notificationsService.error('Error', 'Token is invalid check your email again');
        } else {
          this.notificationsService.error('Error', 'Unknown error has occured');
        }
      } else if (error.status === 500) {
        this.notificationsService.error('Error', 'Unknown error has occured');
      }
    });
  }

  /**
   * called on request by user. Ask server to send another email
   */
  requestVerificationEmail() {
    this.userService.requestVerificationEmail().subscribe((data) => {
      // success notification
      this.notificationsService.success('Success', 'Email sent');
    }, (error) => {
      this.notificationsService.error('Error', 'Email sending failed');
    });
  }
}

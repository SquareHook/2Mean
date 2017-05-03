import { Component } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'reset-password',
  templateUrl: '../views/reset-password.view.html'
})
export class ResetPasswordComponent {
  private password: string;
  private token: string;

  constructor(
    private notificationsService: NotificationsService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    route.params.subscribe((params) => {
      if (params['token']) {
        this.token = params['token'];
      }
    });
  }

  resetPassword() {
    this.userService.resetPassword(this.password, this.token).subscribe((data) => {
      this.notificationsService.success('Password Reset');
    }, (error) => {
      if (error.status === 400) {
        let body = JSON.parse(error._body);

        this.notificationsService.error('Error', body.error);
      } else {
        this.notificationsService.error('Internal Server Error');
      }
    });
  }
}

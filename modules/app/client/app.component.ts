import { Component } from '@angular/core';

import { AuthService } from '../../auth/client/auth.service.client';
import { UserService } from '../../users/client/services/user.service';

import { User } from '../../users/client/models/user.model.client';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';


@Component({
  selector: 'too-mean',
  styles: [
    require('./less/app.style.less').toString()
  ],
  templateUrl: 'app.view.html'
})

export class AppComponent {
  constructor(private auth: AuthService, 
  	private userService: UserService,
  	private notificationService : NotificationsService) {
   }
  name = 'Too Mean';
  public notificationOptions = {
    position: ["bottom", "right"],
    timeOut: 5000,
    lastOnBottom: true
  }
}

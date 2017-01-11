import { Component } from '@angular/core';

import { AuthService } from '../../auth/client/auth.service.client';
import { UserService } from '../../users/client/services/user.service';

import { User } from '../../users/client/models/user.model.client';

import { Subject } from 'rxjs/Subject';


@Component({
  selector: 'too-mean',
  providers: [ AuthService ],
  styles: [
    require('./less/app.style.less').toString()
  ],
  templateUrl: 'app.view.html'
})

export class AppComponent {
  constructor(private auth: AuthService, private userService: UserService) {

   }
  name = 'Too Mean';
}

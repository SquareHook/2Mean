import { Component } from '@angular/core';

import { AuthService } from './auth/auth.service.client';
import { UserService } from './users/services/user.service';

import { User } from './users/models/user.model.client';

@Component({
  selector: 'too-mean',
  providers: [ AuthService ],
  styles: [
    require('./app.style.less').toString()
  ],
  templateUrl: 'app.view.html'
})

export class AppComponent {
  constructor(private auth: AuthService, private userService: UserService) { }
  name = 'Too Mean';
}

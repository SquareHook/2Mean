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
  constructor(auth: AuthService, userService: UserService) {
    auth.login('squarehook', '12345', (err, user: User) => {
      if (err) {
        // This would be where the redirect to the login form would be.
      }
      if (user) {
        // If we get here without errors, the user is logged in.
        let response = userService.read(user.id);
        response.subscribe((data) => {
          console.log(data);
        }, (error) => {
          console.log(error);
        });
      }
    });
  }
  name = 'Too Mean';
}

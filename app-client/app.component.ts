import { Component } from '@angular/core';

import { AuthService } from './auth/auth.service.client';

@Component({
  selector: 'too-mean',
  providers: [ AuthService ],
  styles: [
    require('./app.style.less').toString()
  ],
  templateUrl: 'app.view.html'
})

export class AppComponent {
  constructor(auth: AuthService) {
    auth.login('squarehook', '12345');
  }
  name = 'Too Mean';
}

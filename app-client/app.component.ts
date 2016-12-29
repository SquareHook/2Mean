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
    console.log('Auth service imported');
  }
  name = 'Too Mean';
}

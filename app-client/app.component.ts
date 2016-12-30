import { Component } from '@angular/core';

import { AuthService } from './auth/auth.service.client';

@Component({
  selector: 'too-mean',
  providers: [ AuthService ],
  styles: [
    require('./less/app.style.less').toString()
  ],
  templateUrl: 'app.view.html'
})

export class AppComponent {
  constructor(auth: AuthService) {

  }
  name = 'Too Mean';
}

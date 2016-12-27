import { Component } from '@angular/core';

import { AuthService } from './auth/auth.service.client';

@Component({
  selector: 'too-mean',
  providers: [ AuthService ],
  template: `
    <h1>Testing {{ name }}</h1>
  `
})

export class AppComponent {
  constructor(auth: AuthService) {
    console.log('Auth service imported');
  }
  name = 'Too Mean';
}

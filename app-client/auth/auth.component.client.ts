import { Component } from '@angular/core';

import {Http, Response, HttpModule} from '@angular/http';
import 'rxjs/add/operator/map';

@Component({
  selector: 'login-form',
  viewProviders: [HttpModule],
  templateUrl: 'auth.component.client.view.html'
})

export class LoginComponent {
  constructor(http: Http) {
    http.get('/api/test')
      .map( res => res.json())
      .subscribe((res:Response) => {
        console.log(res);
      });
  }
}

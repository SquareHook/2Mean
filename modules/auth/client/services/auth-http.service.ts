import { Injectable } from '@angular/core';
import {
  Http,
  ConnectionBackend,
  RequestOptions,
  Request,
  RequestOptionsArgs,
  Response,
  Headers
} from '@angular/http';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { NotificationsService } from 'angular2-notifications';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';

import { AuthService } from './auth.service';

@Injectable()
export class AuthHttpService extends Http {
  constructor (
    backend: ConnectionBackend,
    options: RequestOptions,
    private router: Router,
    private notificationsService: NotificationsService,
    private authService: AuthService
  ) {
    super(backend, options);
  }


  /* Override http#request
   *  pass good requests through
   *  catch error requests and check for 401 code
   *   handle by redirecting to login
   */
  request (url: string|Request, options?: RequestOptionsArgs) : Observable<Response> {
    let req = super.request(url, options).do((res: Response) => {
      let userUpdated = res.headers.get('user-updated');

      // header might not be set (signin) if not dont worry about it
      if (userUpdated) {
        let currentUser = this.authService.getUser();
        
        console.log(userUpdated);
        console.log(Date.parse(currentUser.updated));
        if (userUpdated !== "" + Date.parse(currentUser.updated)) {
          this.authService.updateUser();
        }
      }

      return res;
    }, (res: Response) => {
      if (res.status === 401) {
        let navigationExtras: NavigationExtras = {
          queryParams: {
            'redirect': this.router.url,
            'reauthenticate': true
          }
        };
        
        this.notificationsService.alert('Unauthenticated', 'You need to log back in');
        this.router.navigate([ '/signin' ], navigationExtras);
      }

      return res;
    });
    
    return req;
  }
}

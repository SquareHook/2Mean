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

@Injectable()
export class AuthHttpService extends Http {
  constructor (
    backend: ConnectionBackend,
    options: RequestOptions,
    private router: Router,
    private notificationsService: NotificationsService
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

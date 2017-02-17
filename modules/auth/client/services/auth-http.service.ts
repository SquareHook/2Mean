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

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';

@Injectable()
export class AuthHttpService extends Http {
  constructor (
    backend: ConnectionBackend,
    options: RequestOptions,
    private router: Router,
    route: ActivatedRoute
  ) {
    super(backend, options);
  }

  request (url: string|Request, options?: RequestOptionsArgs) : Observable<Response> {
    let req = super.request(url, options).do((res: Response) => {
      console.log(res);

      return res;
    }, (res: Response) => {
      console.log(res);
      if (res.status === 400 && res._body=== 'Not Authorized') {
        let navigationExtras: NavigationExtras = {
          queryParams: { 'redirect': res.url }
        };

        this.router.navigate([ '/signin' ], navigationExtras);
      }

      return res;
    });

    return req;
  }
}

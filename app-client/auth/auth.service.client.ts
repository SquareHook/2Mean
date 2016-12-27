/**
 * Angular 2 core injectable object for creating services.
 */
import { Injectable } from '@angular/core';

/**
 * Get the user class model.
 */
import { User } from './user.model.client.ts';

/**
 * Pull in the necessary HTTP objects.
 */
import {
  Http,
  Response,
  HttpModule,
  RequestOptions,
  Request,
  RequestMethod
} from '@angular/http';

/*
 * Reactive library.
 */
import 'rxjs/add/operator/map';

/**
 * The main Auth service class.
 */
@Injectable()
export class AuthService {
  constructor(http: Http) {
    let requestOpts = new RequestOptions({
      
    });

    http.get('/api/test')
      .map( res => res.json())
      .subscribe((res:Response) => {
        console.log('This is the subscribe method');
        console.log(res);
      });
  }

  user: User;
}

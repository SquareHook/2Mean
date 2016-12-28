/**
 * Angular 2 core injectable object for creating services.
 */
import { Injectable } from '@angular/core';

/**
 * Get the user class model.
 */
import { User } from './models/user.model.client';

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
  constructor(private http: Http) {
  }

  login (userName: string, password: string) {
    return this.http.post('/api/login', JSON.stringify({ userName: userName, password: password }))
      .map(function (response: Response) {
        let user = response.json();
        if (user) {
          // store details
        }
      });
  }

  create (user: User) {
    // TODO endpoint does not exist yet
    return this.http.put('/api/users/', user);
  }

  user: User;
}

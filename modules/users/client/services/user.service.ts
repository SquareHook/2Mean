/**
 * Angular 2 core injectable object for creating services.
 */
import { Injectable } from '@angular/core';

/**
 * Get the user class model.
 */
import { User } from '../models/user.model.client';

/**
 * Pull in the necessary HTTP objects.
 */
import {
  Http,
  Response,
  HttpModule,
  RequestOptions,
  Request,
  RequestMethod,
  Headers
} from '@angular/http';

import { Observable } from 'rxjs/Rx';

/*
 * Reactive library.
 */
import 'rxjs/add/operator/map';

/**
 * The main User service class.
 */
@Injectable()
export class UserService {
  user: User;

  constructor(private http: Http) { }

  read(userId: string) : Observable<User> {
    return this.http.get('api/users/' + userId)
      .map(this.extractData);
  }

  create(newUser: User) : Observable<User> {
    return this.http.post('api/users', newUser)
      .map(this.extractData);
  }

  update(updatedUser: User) : Observable<User> {
    return this.http.put('api/users', updatedUser)
      .map(this.extractData);
  }

  delete(userId: string) : Observable<User> {
    return this.http.delete('api/users/' + userId)
      .map(this.extractData);
  }

  private extractData(res: Response | any) {
    let body = res.json();
    return body.data || { };
  }
}

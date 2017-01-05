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

  read(userId: string) {
    return this.http.get('api/users/' + userId);
  }

  create(newUser: User) {
    return this.http.post('api/users', newUser);
  }

  update(updatedUser: User) {
    return this.http.put('api/users', updatedUser);
  }

  delete(userId: string) {
    return this.http.delete('api/users/' + userId);
  }
}

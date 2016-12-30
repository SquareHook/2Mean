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
  http: Http;

  constructor(http: Http) {
    this.http = http;
  }

  read(userId: string) {
    return this.http.get('api/users/' + userId);
  }
}

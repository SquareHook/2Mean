/**
 * Angular 2 core injectable object for creating services.
 */
import { Injectable } from '@angular/core';

import { Md5 } from 'ts-md5/dist/md5';

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
  RequestMethod,
  Headers
} from '@angular/http';

import { Observable } from 'rxjs/Rx';

/*
 * Reactive library.
 */
import 'rxjs/add/operator/map';

/**
 * The main Auth service class.
 */
@Injectable()
export class AuthService {
  user: User;
  http: Http;

  HA1: string;
  HA2: string;

  constructor(http: Http) {
    this.http = http;
    this.user = new User();

    this.user.userName = 'squarehook';
    this.user.password = '12345';
  }

  isLogged() {
    if (this.user.userName) {
      return true;
    } else {
      return false;
    }
  }

  login(username: string, password: string) {
    // TODO: hit /api/login with username and password in post data.
  }
}

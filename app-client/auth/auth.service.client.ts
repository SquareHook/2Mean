/**
 * Angular 2 core injectable object for creating services.
 */
import { Injectable } from '@angular/core';

import { Md5 } from 'ts-md5/dist/md5';

/**
 * Get the user class model.
 */
import { User } from '../users/models/user.model.client';

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
  apikey: String;

  HA1: string;
  HA2: string;

  constructor(http: Http) {
    this.http = http;
    this.user = new User();
    this.apikey = null;

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

  /*
   * Login function to process login requests.
   *
   * @param {string}   username The username to auth with.
   * @param {string}   password The password to auth with.
   * @param {function} cb       The callback to use to get results.
   */
  login(username: string, password: string, cb: (err: Object, user: Object) =>  any) : void {
    let body = {
      username: username,
      password: password
    };

    this.http
      .post('api/login', body)
      .subscribe((res: Response) => {
        let body = res.json();

        // Save the user information for use later.
        this.user.id = body.user.id;
        this.user.firstName = body.user.firstName;
        this.user.lastName = body.user.lastName;
        this.user.displayName = body.user.displayName;
        this.user.email = body.user.email;
        this.user.userName = body.user.username;
        this.user.profileImageUrl = body.user.profileImageURL;
        this.user.roles = body.user.roles;

        // Save the apikey
        this.apikey = body.apikey;

        cb(null, this.user);
      }, (error: Response | any) => {
        cb({ error: 401}, null);
      });
  }

  getUser(): User {
    return this.user;
  }

}

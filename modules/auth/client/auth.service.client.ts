/**
 * Angular 2 core injectable object for creating services.
 */
import { Injectable } from '@angular/core';

import { Md5 } from 'ts-md5/dist/md5';

/**
 * Get the user class model.
 */
import { User } from '../../users/client/models/user.model.client';

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
  apikey: String;
  loggedIn: boolean;

  constructor(private http: Http) {
    this.user = this.getUser();
    
    // user not logged in
    if (!this.user) {
      this.loggedIn = false;
      this.user = new User();
    } else {
      this.loggedIn = true;
    }

    this.apikey = null;
  }

  isLogged() {
    if (this.user.username) {
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
        this.user.username = body.user.username;
        this.user.profileImageURL = body.user.profileImageURL;
        this.user.roles = body.user.roles;

        this.saveUser();
        this.loggedIn = true;

        // Save the apikey
        this.apikey = body.apikey;

        cb(null, this.user);
      }, (error: Response | any) => {
        cb({ error: 401}, null);
      });
  }

  /*
   * Register function to create new users
   *
   * @param {string}   username The username to signup with
   * @param {string}   email    The email to signup with
   * @param {string}   password The password to signup with
   * @param {function} cb       The callback used to get results
   */
  register(username: string, email: string, password: string, cb: (err: Object, user: Object) => any) : void {
    let body = {
      username: username,
      email: email,
      password: password
    };

    this.http
      .post('api/users', body)
      .subscribe((res: Response) => {
        let body = res.json();

        cb(null, this.user);
      }, (error: Response | any) => {
        cb({ error: 401 }, null);
      });
  }

  /*
   * Logout function to log user out
   */
  logout() : void {
    this.http
      .get('api/logout')
      .subscribe((res: Response) => {
        this.setUser(null);
        this.apikey = null;
        this.loggedIn = false;
      }, (error: Response | any) => {
        // either way invalidate local creds. Server may still accept
        console.log('Error logging out: ', error);
        this.setUser(null);
        this.apikey = null;
        this.loggedIn = false;
      });
  }

  getUser(): User {
    return JSON.parse(localStorage.getItem('user'));
  }

  setUser(user : User) : void {
    this.user = user;
    this.saveUser();
  }

  private saveUser(): void {
    localStorage.setItem('user', JSON.stringify(this.user));
  }

}

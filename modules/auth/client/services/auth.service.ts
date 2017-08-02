/**
 * Angular 2 core injectable object for creating services.
 */
import { Injectable, Injector } from '@angular/core';

import { Md5 } from 'ts-md5/dist/md5';

import { Subject } from 'rxjs/Subject';

/**
 * Get the user class model.
 */
import { User } from '../../../users/client/models/user.model';

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
  loggedIn: boolean;
  redirect: string;

  // Observable sources
  private authChangedSource = new Subject<boolean>();

  // Observable streams
  authChanged$ = this.authChangedSource.asObservable();

  private http: Http;
  constructor(injector: Injector) {
    this.loggedIn = this.determineAuth();
    if (this.loggedIn) {
      this.setUser(this.getUser());
    }
    setTimeout(() => {
      //resolves a circular dependency
      this.http = injector.get(Http);
    });
  }


  /*
   * Login function to process login requests.
   *
   * @param {string}   username The username to auth with.
   * @param {string}   password The password to auth with.
   * @param {function} cb       The callback to use to get results.
   */
  login(username: string, password: string, cb: (err: any, user: Object) => any): void {

    let body = {
      username: username,
      password: password
    };

    this.http
      .post('api/login', body)
      .subscribe((res: Response) => {
        let body = res.json();
        this.loggedIn = true;
        this.setUser(body.user);

        cb(null, this.user);
      }, (error: Response | any) => {
        cb(error, null);
      });


  }

  /*
   * Logs user out. Emits false to authChanged subscribers
   */
  logout(): void {
    this.http
      .get('api/logout')
      .subscribe((res: Response) => {
      }, (error: Response | any) => {
        console.log(error);
      });

    this.setUser(null);
    this.loggedIn = false;
    this.authChanged(false);
    localStorage.setItem('user', JSON.stringify(null));
  }

  /*
   * Register function to create new users
   *
   * @param {string}   username The username to signup with
   * @param {string}   email    The email to signup with
   * @param {string}   password The password to signup with
   * @param {function} cb       The callback used to get results
   */
  register(username: string, email: string, password: string, cb: (err: Object, user: Object) => any): void {
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

    // emit data to subscribers
  authChanged(data: boolean) {
    this.authChangedSource.next(data);
  }

  getUser(): User {
    return JSON.parse(localStorage.getItem('user'));
  }

  isLogged() {
    return this.loggedIn;
  }


  setUser(user: User): void {
    this.user = user;
    this.saveUser();
    this.authChanged(true);
  }


  updateUser() {
    let options = new RequestOptions({
      headers: new Headers({
        'update-user': 'true'
      })
    });

    this.http.get('api/users/readSelf', options).subscribe((res: Response) => {
      let data = res.json();
      this.setUser(data);
    });
  }


  /**
   * Attempts to pull a cached user from local storage.
   * If a cached user exists, the user is considered logged in
   * @returns {boolean} true iff cached user exists
   */
  private determineAuth() {
    try {
      let cachedUser: any = JSON.parse(localStorage.getItem('user'));
      return !!cachedUser.apikey;

    } catch (error) {
      return false;
    }
  }


  private saveUser(): void {
    localStorage.setItem('user', JSON.stringify(this.user));
  }
}
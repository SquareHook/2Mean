/**
 * Angular 2 core injectable object for creating services.
 */
import { Injectable } from '@angular/core';

import { Md5 } from 'ts-md5/dist/md5';
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

    console.log(this.getProfileInfo());
  }

  isLogged() {
    if (this.user.userName) {
      return true;
    } else {
      return false;
    }
  }

  getProfileInfo() {
    let header = new Headers({
      'Authorization': 'Digest username="squarehook:12345"'
    });

    let body = {
      username : 'squarehook',
      password : '12345'
    };

    let requestOpts = new RequestOptions({
      headers: header
    });

    if (this.isLogged()) {
      this.http.post('/api/test', body, requestOpts)
        .map( res => res.json())
        .subscribe((res:Response) => {
          console.log('This is the subscribe method');
          console.log(res);
        }
      );
    }
  }

  getAuthHeader() {
    var header;// = new Headers({});

    var HA1 = Md5.hashStr(this.user.userName + ':toomean:' + this.user.password);
  }

  logIn(username: string, password: string) {

  }
}

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
    let body = {
      username : 'squarehook',
      password : '12345'
    };

    if (this.isLogged()) {
      this.http.post('/api/login', body)
        .map( res => res.json())
        .subscribe((res:Response) => {
          console.log('This is the subscribe method');
          console.log(res);
        }
      );
    }
  }

  getAuthHeader(protocol: string, path: string) {
    var header;// = new Headers({});

    var HA2 = Md5.hashStr(protocol + ':' + path);
    var response;
    var cnonce = this.generateCNonce(8);

    if (!this.HA1) {
      this.HA1 = <string>Md5.hashStr(this.user.userName + ':toomean:' + this.user.password);
    }

    response = Md5.hashStr(this.HA1 + ':nounce:nc:' + cnonce + ':auth:' + HA2);
  }

  generateCNonce(len: number) {
    // 8 characters long hexadecimal.
    var buf = []
      , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      , charlen = chars.length;

    for (var i = 0; i < len; ++i) {
      buf.push(chars[Math.random() * charlen | 0]);
    }

    return buf.join('');

  }

  logIn(username: string, password: string) {

  }
}

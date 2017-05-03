/**
 * Angular 2 core injectable object for creating services.
 */
import { Injectable, Inject } from '@angular/core';

/**
 * Get the user class model.
 */
import { User }               from '../models/user.model';

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

/*
 * ng2-file-upload
 *  valor-software ditributed under MIT liscense
 *  https://github.com/valor-software/ng2-file-upload
 *
 *  used to simplify file uploading
 *  TODO may want to write own uploader because this one isn't great
 *  prefferably one which uses promises/observables. This one requires
 *  overriding functions on the uploader object which are called internally
 *  which isn't very intuative to use
 */
import { FileUploader }       from 'ng2-file-upload';

import { Observable, Observer }         from 'rxjs/Rx';

/*
 * Reactive library.
 */
import 'rxjs/add/operator/map';

import {
  USERS_CONFIG, 
  USERS_DI_CONFIG, 
  UsersConfig 
} from '../config/users-config';

/**
 * The main User service class.
 */
@Injectable()
export class UserService {
  user: User;
  uploader: FileUploader;

  private allowedTypes: Array<string>;
  private maxSize: number;

  constructor(
    private http: Http,
    @Inject(USERS_CONFIG) config : UsersConfig
  ) { 
    this.uploader = new FileUploader({ url: config.uploads.profilePicture.url });
    this.allowedTypes = config.uploads.profilePicture.allowedTypes;
    this.maxSize = config.uploads.profilePicture.maxSize;
  }

  read(userId: string) : Observable<User> {
    return this.http.get('api/users/' + userId)
      .map(this.extractData);
  }

  //list for searching and pagination
  list(page: number, search: string) : Observable<Array<User>>
  {
    return this.http.get('api/users?page='+page +'&search='+search)
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
  
  //used to update user fields by admin users
  adminUpdate(updatedUser: User) :Observable<User>{
    return this.http.put('api/users/adminUpdate', updatedUser)
    .map(this.extractData);
  }

  delete(userId: string) : Observable<any> {
    return this.http.delete('api/users/' + userId)
      .map(this.extractData);
  }

  register(newUser: User) : Observable<any> {
    return this.http.post('api/users/register', newUser)
      .map(this.extractData);
  }

  //returns a list of users given an array of user ids
  readList(userList: Array<string>) : Observable<User> {
    var csvList = userList.join(',');

    var userFeed;

    if (userList.length < 1) {
      return Observable.from([]);
    }

    userFeed = Observable.create(
      (observer: Observer<User>) => {
        this.http.get('api/users/list/'+csvList)
          .subscribe((data) => {
            let responseArray = data.json();

            responseArray.forEach((userItem: User) => {
              if (userItem) {
                observer.next(userItem);
              }
            });

            observer.complete();
          });
      });

    return userFeed;
  }

  /**
   * called to upload the last item in the uploader queue
   *  @param {(item: any, response: any, headers: any) => void} onCompleteItem
   *    a callback function (kind of) which is called after the upload
   *    process is done
   *  //TODO either switch uploader or add cb's for error/success
   */
  uploadProfilePicture(onCompleteItem : (item: any, response: any, status: number, headers: any) => void) {
    // Only if file(s) are queued
    if (this.uploader.queue.length > 0) {
      // Bind callback. I don't like that it is done here
      this.uploader.onCompleteItem = onCompleteItem;

      // we only want to upload the last file the user selected
      let fileItem = this.uploader.queue[this.uploader.queue.length-1];

      // I wish this library registered callbacks here as part of the call
      fileItem.upload();
    } else {
      // No files to upload
      // TODO handle this here? or just disable the submit button while
      // it is invalid and require the file input
    }
  }

  /**
   * called to change the password of the user
   * this alternate route must be used because update does not authenticate
   * the user before updating
   *
   * @param {string} oldPassword  the old password
   * @param {string} newPassword  the new password
   */
  changePassword(oldPassword: string, newPassword: string) {
    return this.http.put('api/users/changePassword', { 
      oldPassword: oldPassword,
      newPassword: newPassword
    }).map(this.extractData);
  }

  /**
   * for encapsulation
   */
  clearUploaderQueue() : void {
    this.uploader.clearQueue();
  }

  /**
   * send a verification get request
   */
  verifyEmail(token: string) : Observable<any> {
    return this.http.get('api/users/verifyEmail?token=' + token)
      .map(this.extractData);
  }

  /**
   * requests a new verification email be sent
   */
  requestVerificationEmail() : Observable<any> {
    return this.http.get('api/users/requestVerificationEmail')
      .map(this.extractData);
  }

  /**
   * send the password and token to reset a password
   * @param {string} password
   * @param {string} token
   */
  resetPassword(password: string, token: string) : Observable<any> {
    let body = {
      password: password,
      token: token
    };

    return this.http.post('api/users/resetPassword', body)
      .map(this.extractData);
  }

  /**
   * requests a password reset email to be sent
   * @param {string} email - the email the user claims to have
   */
  requestResetPasswordEmail(email: string) : Observable<any> {
    return this.http.get('api/users/requestChangePasswordEmail?email=' + email)
      .map(this.extractData);
  }

  /**
   * mapping helper function
   */
  private extractData(res: Response | any) {
    let body = res.json();
    return body;
  }
}

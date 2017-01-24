/* testing tools */
import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { By }                               from '@angular/platform-browser';
import { DebugElement }                     from '@angular/core';
import { FormsModule }                      from '@angular/forms';
import { Observable }                       from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/Rx';
import { Router, ActivatedRoute }                           from '@angular/router';

/* Unit under test */
import { SigninComponent }                  from './signin.component';

/* Dependencies */

import { UsersRoutingModule } from '../config/user-routing.module';
import { UserService } from '../services/user.service';
import { AuthService } from '../../../auth/client/auth.service.client';
import { User } from '../models/user.model.client';

import { UsersComponent }       from './users.component';
import {
  SignupComponent
} from './signup.component';
import { 
  ProfileComponent 
} from './profile.component';
import { 
  ChangePasswordComponent 
} from './change-password.component';
import { 
  ChangeProfilePictureComponent 
} from './change-profile-picture.component';
import {
  EditProfileComponent
} from './edit-profile.component';
import { 
  ManageSocialComponent
} from './manage-social.component';
import {
  SettingsComponent
} from './settings.component';

describe('SigninComponent', () => {
  let comp:     SigninComponent;
  let fixture:  ComponentFixture<SigninComponent>;
  let page: Page;

  class Page {
    loginBtn: DebugElement;
    usernameInput: HTMLInputElement;
    passwordInput: HTMLInputElement;

    constructor() {
    
    }

    addPageElements() {
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const inputs = fixture.debugElement.queryAll(By.css('input'));

      this.loginBtn = buttons[0];
      this.usernameInput = inputs[0].nativeElement;
      this.passwordInput = inputs[1].nativeElement;
    }
  }
  
  const mockUser : User = {
    displayName: 'Squarehook',
    email: 'support@squarehook.com',
    firstName: 'Admin',
    id: '5866b8c0f5b5613933d30a21',
    lastName: 'User',
    password: 'null',
    profileImageURL: 'modules/users/client/img/profile/default.png',
    roles: [ 'admin', 'user' ],
    username: 'squarehook'
  };

  const mockKey = 'M9NNI8NtOClaApm6';

  class userServiceStub {
    read(userId: string) : Observable<User> { 
      return Observable.of(mockUser);
    }

    create(user: User) : Observable<User> {
      return Observable.of(user);
    }

    update(user: User) : Observable<User> {
      return Observable.of(user);
    }

    delete(userId: string) : Observable<User> {
      return Observable.of(mockUser);
    }
  }

  class authServiceStub {
    user: User;
    apiKey: String;

    isLogged() : boolean {
      return this.user.username ? true : false;
    }

    login(username: string, password: string, cb: (err: Object, user: Object) => any) : void {
      this.user = mockUser;
      this.apiKey = mockKey;
      cb(null, this.user);
    }

    register(username: string, password: string, email: string, cb: (err: Object, user: Object) => any) : void {
      this.user = mockUser;
      cb(null, this.user);
    }

    getUser() : User {
      return this.user;
    }

    setUser(user : User) : void {
      this.user = user;
      this.saveUser();
    }

    // no need to use local storage because instance stub will remember
    saveUser() : void {
    }
  }

  class RouterStub {
    navigateByUrl(url: string) { return url; }

    // no events from stub
    private subject = new BehaviorSubject([]);
    events = this.subject.asObservable();
  }

  class ActivatedRouteStub {
    private subject = new BehaviorSubject(this.testParams);
    params = this.subject.asObservable;

    private _testParams: {};
    get testParams() { return this._testParams; }
    set testParams(params: {}) {
      this._testParams = params;
      this.subject.next(params);
    }

    get snapshot() {
      return { params: this.testParams };
    }
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        UsersRoutingModule
      ],
      declarations: [
        UsersComponent,
        SigninComponent,
        SignupComponent,
        ProfileComponent,
        ChangePasswordComponent,
        ChangeProfilePictureComponent,
        EditProfileComponent,
        ManageSocialComponent,
        SettingsComponent
      ],
      providers: [
        { provide: UserService, useClass: userServiceStub },
        { provide: AuthService, useClass: authServiceStub },
        { provide: Router, useClass: RouterStub },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub }
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SigninComponent);
    comp = fixture.componentInstance;
    page = new Page();

    fixture.detectChanges();
    page.addPageElements();
  });

  it('should have a defined component', () => {
    expect(comp).toBeDefined();
  });

  describe('#login', () => {
    it('should send back a user and set the api key', fakeAsync(() => {
      // Enter in credentials
      page.usernameInput.value = 'squarehook';
      page.passwordInput.value = '12345';
      page.loginBtn.triggerEventHandler('click', null);
      tick(); // wait for async

      expect(comp.model).toEqual(mockUser);
      expect(fixture.debugElement.injector.get('AuthService').getUser()).toEqual(mockUser);
      expect(fixture.debugElement.injector.get('AuthService').apiKey).toEqual(mockKey);
    }));
  });
});

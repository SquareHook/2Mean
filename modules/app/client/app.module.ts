import { NgModule }                 from '@angular/core';
import { BrowserModule }            from '@angular/platform-browser';
import { BrowserAnimationsModule }  from '@angular/platform-browser/animations';
import { HttpModule }               from '@angular/http';
import { NgbModule }                from '@ng-bootstrap/ng-bootstrap';

import {
  RouterModule,
  Routes,
  Router
} from '@angular/router';

import { AppComponent }           from './components/app.component';
import { PageNotFoundComponent }  from './components/not-found.component';
import { 
  SimpleNotificationsModule, 
  PushNotificationsModule, 
  NotificationsService
} from 'angular2-notifications';
import { UserService }            from '../../users/client/services/user.service';
import { AuthService }            from '../../auth/client/services/auth.service';
import { RoleService }            from '../../roles/client/services/roles.service';
import { AuthModule }             from '../../auth/client/auth.module';
import { CoreModule }             from '../../core/client/core.module';
import { UsersModule }            from '../../users/client/users.module';
import { ArticleModule }          from '../../articles/client/articles.module';
import { AppRoutingModule }       from './app-routing.module';
import { RoleModule }             from '../../roles/client/roles.module';
 
import {
  Http,
  XHRBackend,
  BaseRequestOptions
} from '@angular/http';
import { AuthHttpService }        from './../../auth/client/services/auth-http.service';
import { ActivatedRoute }         from '@angular/router';

@NgModule({
  imports:      [
    BrowserModule,
    BrowserAnimationsModule,
    NgbModule.forRoot(),
    HttpModule,
    AuthModule,
    CoreModule,
    UsersModule,
    ArticleModule,
    AppRoutingModule,
    RoleModule,
    SimpleNotificationsModule,
    PushNotificationsModule
  ],
  providers: [
    UserService,
    AuthService,
    RoleService,
    NotificationsService,
    XHRBackend,
    BaseRequestOptions,
    {
      provide: Http,
      useFactory: (
        backend: XHRBackend,
        options: BaseRequestOptions,
        router: Router,
        notificationsService: NotificationsService,
        authService: AuthService
      ) => new AuthHttpService(backend, options, router, notificationsService, authService),
      deps: [ XHRBackend, BaseRequestOptions, Router, NotificationsService, AuthService ]
    }
  ],
  declarations: [
    AppComponent,
    PageNotFoundComponent
  ],
  bootstrap:    [ AppComponent ]
})

export class AppModule {}

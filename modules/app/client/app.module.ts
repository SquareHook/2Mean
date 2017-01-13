import { NgModule }              from '@angular/core';
import { BrowserModule }         from '@angular/platform-browser';
import { HttpModule }            from '@angular/http';
import { NgbModule }             from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes }  from '@angular/router';

import { AppComponent }          from './app.component';
import { PageNotFoundComponent } from './components/not-found.component';

import { UserService }           from '../../users/client/services/user.service';
import { AuthService }           from '../../auth/client/auth.service.client';
import { AuthModule }            from '../../auth/client/auth.module';
import { CoreModule }            from '../../core/client/core.module';
import { UsersModule }           from '../../users/client/users.module';
import { ArticleModule }        from '../../articles/client/articles.module';
import { AppRoutingModule }      from './app-routing.module';


@NgModule({
  imports:      [
    BrowserModule,
    NgbModule.forRoot(),
    HttpModule,
    AuthModule,
    CoreModule,
    UsersModule,
    ArticleModule,
    AppRoutingModule
  ],
  providers: [ UserService, AuthService ],
  declarations: [
    AppComponent,
    PageNotFoundComponent
  ],
  bootstrap:    [ AppComponent ]
})

export class AppModule {}


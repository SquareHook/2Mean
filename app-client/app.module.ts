import { NgModule }              from '@angular/core';
import { BrowserModule }         from '@angular/platform-browser';
import { HttpModule }            from '@angular/http';
import { NgbModule }             from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes }  from '@angular/router';

import { AppComponent }          from './app.component';
import { PageNotFoundComponent } from './components/not-found.component';

import { AuthModule }            from './auth/auth.module';
import { CoreModule }            from './core/core.module';

import { AppRoutingModule }      from './app-routing.module';

 @NgModule({
  imports:      [
    BrowserModule,
    NgbModule.forRoot(),
    HttpModule,
    AuthModule,
    CoreModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    PageNotFoundComponent,

  ],
  bootstrap:    [ AppComponent ]
})

export class AppModule {}


import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { AppComponent }   from './app.component';
import { HttpModule }     from '@angular/http';

import { NgbModule }      from '@ng-bootstrap/ng-bootstrap';

import { LoginComponent } from './auth/auth.component.client';

@NgModule({
  imports:      [
    BrowserModule,
    NgbModule.forRoot(),
    HttpModule
  ],
  declarations: [
    AppComponent,
    LoginComponent
  ],
  bootstrap:    [ AppComponent ]
})

export class AppModule {}

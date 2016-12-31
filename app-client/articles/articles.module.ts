import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { HttpModule }     from '@angular/http';
import { NgbModule }      from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes }     from '@angular/router';
import { AppModule }      from '../app.module';
import { AppRoutingModule }      from './../app-routing.module';

@NgModule({
  imports:      [
    BrowserModule,
    NgbModule,
    HttpModule,
    RouterModule
  ],
  /*components available inside of this module */
  declarations: [
  ],
  /*components available to other modules */
  exports: [],
  bootstrap:    [ ]
})

export class CoreModule {}

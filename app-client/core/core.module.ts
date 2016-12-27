import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { HttpModule }     from '@angular/http';
import { NgbModule }      from '@ng-bootstrap/ng-bootstrap';
import { CoreMenuComponent }  from './core.component.menu.client';

@NgModule({
  imports:      [
    BrowserModule,
    NgbModule.forRoot(), //Ng-Material
    HttpModule
  ],
  declarations: [
    CoreMenuComponent
  ],
  bootstrap:    [ CoreMenuComponent ]
})

export class CoreModule {}

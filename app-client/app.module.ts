import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { AppComponent }   from './app.component';
import { HttpModule }     from '@angular/http';
import { NgbModule }      from '@ng-bootstrap/ng-bootstrap';
import { CoreModule }     from './core/core.module';
import { CoreMenuComponent } from './core/core.component.menu.client';

@NgModule({
  imports:      [
    BrowserModule,
    NgbModule.forRoot(),
    HttpModule,
    CoreModule
  ],
  declarations: [
    AppComponent
  ],
  bootstrap:    [ AppComponent ]
})

export class AppModule {}

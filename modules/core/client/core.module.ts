import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { HttpModule }     from '@angular/http';
import { NgbModule }      from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes }     from '@angular/router';
import { CoreMenuComponent }  from './components/core.component';
import { CoreLandingPageComponent }  from './components/core.landing-page.component';
import { RoleModule } from '../../roles/client/roles.module';
import { AppModule }      from '../../app/client/app.module';
import { AppRoutingModule }      from '../../app/client/app-routing.module';
import { CoreRoutingModule }     from './config/core-routing.module';

@NgModule({
  imports:      [
    BrowserModule,
    NgbModule,
    HttpModule,
    RouterModule,
    CoreRoutingModule,
    RoleModule
  ],
  /*components available inside of this module */
  declarations: [
    CoreMenuComponent,
    CoreLandingPageComponent
  ],
  /*components available to other modules */
  exports: [CoreMenuComponent],
  bootstrap:    [ CoreMenuComponent]
})

export class CoreModule {
}

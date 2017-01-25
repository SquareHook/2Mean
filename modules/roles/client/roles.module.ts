import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { AppModule } from '../../app/client/app.module';
import { RolesRoutingModule } from './config/roles-routing.module';
import { FormsModule } from '@angular/forms';


import { RoleCreateComponent } from './components/role-create.component';
import { RoleDeleteComponent } from './components/role-delete.component';

@NgModule({
  imports: [
    BrowserModule,
    NgbModule,
    HttpModule,
    RolesRoutingModule,
    FormsModule

  ],
  /*components available inside of this module */
  declarations: [
    RoleCreateComponent,
    RoleDeleteComponent
  ],
  /*components available to other modules */
  exports: [],

  /* which components to load when starting this module */
  bootstrap: []
})

export class RoleModule { }

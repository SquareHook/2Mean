import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { AppModule } from '../../app/client/app.module';
import { RolesRoutingModule } from './config/roles-routing.module';
import { FormsModule } from '@angular/forms';

import { RoleComponent } from './components/role.component';

import { RoleService } from './services/roles.service';

import { EndpointsComponent } from './components/endpoints.component';
import { EndpointDetailComponent } from './components/endpoint-detail.component';
import { EndpointPermissionFormComponent } from './components/endpoint-permission-form.component';
import { EndpointPermissionListComponent } from './components/endpoint-permission-list.component';

import { JsonTreePipe } from './components/json-tree.pipe';

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
    RoleComponent,
    JsonTreePipe,
    EndpointsComponent,
    EndpointDetailComponent,
    EndpointPermissionFormComponent,
    EndpointPermissionListComponent
  ],
  /*components available to other modules */
  exports: [
    RoleComponent
  ],

  /* which components to load when starting this module */
  bootstrap: []
})

export class RoleModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/* import the components this module uses */

import { RoleComponent } from '../components/role.component';
import { EndpointsComponent } from '../components/endpoints.component';

/* register the routes to these components  */
const rolesRoutes: Routes = [
  {
    path: 'roles',
    component: RoleComponent
  },
  {
    path: 'roles/endpoints',
    component: EndpointsComponent
  }
];

/* connect the routes above to the router module */
@NgModule({
  imports: [
    RouterModule.forChild(rolesRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class RolesRoutingModule {}

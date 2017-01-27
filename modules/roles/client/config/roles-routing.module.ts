import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/* import the components this module uses */

import { RoleCreateComponent } from '../components/role-create.component';
import { RoleDeleteComponent } from '../components/role-delete.component';

/* register the routes to these components  */
const rolesRoutes: Routes = [
  {
    path: 'roles/new',
    component: RoleCreateComponent
  },
  {
    path: 'roles/delete',
    component: RoleDeleteComponent
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

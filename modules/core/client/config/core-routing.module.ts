/* Vendor */
import { NgModule }				                from '@angular/core';
import { RouterModule, Routes }           from '@angular/router';

/* Components */
import {
  CoreLandingPageComponent
} from './../components/core.landing-page.component';


/* this defines the global users routes */
const usersRoutes: Routes = [
  {
    path: '',
    component: CoreLandingPageComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(usersRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class CoreRoutingModule {}

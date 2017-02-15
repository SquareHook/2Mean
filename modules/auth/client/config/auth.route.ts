/*  Vendor */
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/*  Components */
/*  Routes */
const authRoutes: Routes = [
];

@NgModule({
  imports: [
    RouterModule.forChild(authRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AuthRoutingModule {}

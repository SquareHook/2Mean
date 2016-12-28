/*  Vendor */
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/*  Components */
import { AuthComponent }    from '../components/auth.component';
import { SigninComponent }  from '../components/signin.component';
import { SignupComponent }  from '../components/signup.component';

/*  Routes */
const authRoutes: Routes = [
  { path: 'auth/',       component: AuthComponent },
  { path: 'auth/signin', component: SigninComponent },
  { path: 'auth/signup', component: SignupComponent }
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

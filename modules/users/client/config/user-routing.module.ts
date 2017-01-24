/* Vendor */
import { NgModule }				                from '@angular/core';
import { RouterModule, Routes }           from '@angular/router';

/* Guards */
import {
  AuthGuard
} from './../services/auth-guard.service';

/* Components */
import {
  SigninComponent
} from './../components/signin.component';
import {
  SignupComponent
} from './../components/signup.component';
import {
  SignoutComponent
} from './../components/signout.component';
import { 
  ProfileComponent 
} from './../components/profile.component';
import { 
  ChangePasswordComponent 
} from './../components/change-password.component';
import { 
  ChangeProfilePictureComponent 
} from './../components/change-profile-picture.component';
import {
  EditProfileComponent
} from './../components/edit-profile.component';
import { 
  ManageSocialComponent
} from './../components/manage-social.component';
import {
  SettingsComponent
} from './../components/settings.component';

/* this defines the global users routes */
const usersRoutes: Routes = [
  // Authentication
  {
    path: 'signin',
    component: SigninComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'signout',
    component: SignoutComponent
  },
  // User profile
  { 
    path: 'profile',
    component: ProfileComponent,
    canActivate: [ AuthGuard ],
    children: [
      { 
        path: 'change-password',
        component: ChangePasswordComponent,
        outlet: 'profile'
      },
      { 
        path: 'change-profile-picture',
        component: ChangeProfilePictureComponent,
        outlet: 'profile'
      },
      { 
        path: 'edit',
        component: EditProfileComponent,
        outlet: 'profile'
      },
      { 
        path: 'manage-social',
        component: ManageSocialComponent,
        outlet: 'profile'
      },
      { 
        path: 'settings', 
        component: SettingsComponent,
        outlet: 'profile'
      }
    ]
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
export class UsersRoutingModule {}

/* Vendor */
import { NgModule }				                from '@angular/core';
import { RouterModule, Routes }           from '@angular/router';

/* Components */
import {
  SigninComponent
} from './../components/signin.component';
import {
  SignupComponent
} from './../components/signup.component';
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
  // User profile
  { 
    path: 'profile', 
    component: ProfileComponent 
  },
  { 
    path: 'profile/change-password', 
    component: ChangePasswordComponent 
  },
  { 
    path: 'profile/change-profile-picture', 
    component: ChangeProfilePictureComponent 
  },
  { 
    path: 'profile/edit', 
    component: EditProfileComponent 
  },
  { 
    path: 'profile/manage-social', 
    component: ManageSocialComponent 
  },
  { 
    path: 'profile/settings', 
    component: SettingsComponent 
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


/* Vendor */
import { NgModule, OpaqueToken }              from '@angular/core';
import { BrowserModule }         from '@angular/platform-browser';
import { HttpModule }            from '@angular/http';
import { NgbModule }             from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes }  from '@angular/router';
import { FormsModule, ReactiveFormsModule }          from '@angular/forms';
import { FileSelectDirective }  from 'ng2-file-upload';

/* Config */
import { USERS_CONFIG, USERS_DI_CONFIG, UsersConfig } from './config/users-config';
/* Components */
import { UsersComponent }       from './components/users.component';
import {
  SigninComponent
} from './components/signin.component';
import {
  SignupComponent
} from './components/signup.component';
import {
  SignoutComponent
} from './components/signout.component';
import { 
  ProfileComponent 
} from './components/profile.component';
import { 
  ChangePasswordComponent 
} from './components/change-password.component';
import { 
  ChangeProfilePictureComponent 
} from './components/change-profile-picture.component';
import {
  EditProfileComponent
} from './components/edit-profile.component';
import { 
  ManageSocialComponent
} from './components/manage-social.component';
import {
  SettingsComponent
} from './components/settings.component';
import { AdminUsersComponent } from './components/admin-users.component';

/* Services */
import { UserService }          from './services/user.service';
import { AuthService }          from './../../auth/client/auth.service.client';
import { AuthGuard }            from './services/auth-guard.service';

/* Directives */
import { StrongPasswordValidatorDirective } from './directives/strong-password.directive';
import { AllowedTypesValidatorDirective } from './directives/allowed-types.directive';
import { MaxSizeValidatorDirective } from './directives/max-size.directive';
import { ValidEmailValidatorDirective } from './directives/valid-email.directive';

/* Routing */
import { UsersRoutingModule }      from './config/user-routing.module';

@NgModule({
  imports:      [
    BrowserModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    UsersRoutingModule
  ],
  declarations: [
    FileSelectDirective,
    UsersComponent,
    SigninComponent,
    SignupComponent,
    SignoutComponent,
    ProfileComponent,
    ChangePasswordComponent,
    ChangeProfilePictureComponent,
    EditProfileComponent,
    ManageSocialComponent,
    SettingsComponent,
    StrongPasswordValidatorDirective,
    AllowedTypesValidatorDirective,
    MaxSizeValidatorDirective,
    ValidEmailValidatorDirective,
    AdminUsersComponent
  ],
  providers: [ 
    { provide: USERS_CONFIG, useValue: USERS_DI_CONFIG },
    AuthGuard
  ],
  bootstrap:    [ UsersComponent ]
})

export class UsersModule {}


/*  Vendor */
import { NgModule }             from '@angular/core';
import { BrowserModule }        from '@angular/platform-browser';
import { FormsModule }          from '@angular/forms';

/*  Modules */
import { AuthRoutingModule }    from './config/auth.route';

/*  Components */
import { AuthComponent }        from './components/auth.component';
import { SigninComponent }      from './components/signin.component';
import { SignupComponent }      from './components/signup.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AuthRoutingModule
  ],
  declarations: [
    AuthComponent,
    SigninComponent,
    SignupComponent
  ],
  bootstrap: [ AuthComponent ]
})
export class AuthModule {};

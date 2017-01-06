/*  Vendor */
import { NgModule }             from '@angular/core';
import { BrowserModule }        from '@angular/platform-browser';

/*  Modules */
import { AuthRoutingModule }    from './config/auth.route';

/*  Components */

@NgModule({
  imports: [
    BrowserModule,
    AuthRoutingModule
  ]
})
export class AuthModule {};

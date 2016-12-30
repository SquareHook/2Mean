import { NgModule }                 from '@angular/core';
import { BrowserModule }            from '@angular/platform-browser';
import { HttpModule }               from '@angular/http';
import { NgbModule }                from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes }     from '@angular/router';

import { AppComponent }             from './app.component';
import { PageNotFoundComponent }    from './components/not-found.component';


import { AuthModule }               from './auth/auth.module';
import { CoreModule }               from './core/core.module';

const appRoutes: Routes = [
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports:      [
    BrowserModule,
    NgbModule.forRoot(),
    RouterModule.forRoot(appRoutes),
    HttpModule,
    AuthModule,
    CoreModule
  ],
  declarations: [
    AppComponent,
    PageNotFoundComponent
  ],
  bootstrap:    [ AppComponent ]
})

export class AppModule {}


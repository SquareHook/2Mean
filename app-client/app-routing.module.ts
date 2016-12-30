import { NgModule }				 from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';



import { CoreMenuComponent }	 from './core/components/core.component.menu.client';
import { PageNotFoundComponent } from './components/not-found.component';


/* this defines the global app routes */
const appRoutes: Routes = [
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}
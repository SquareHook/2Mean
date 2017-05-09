import { Component } from '@angular/core';
import { Router } from '@angular/router';

/*
*  The component that renders the main navigation bar
*/
@Component({
  selector: 'landing-page',
  providers: [],
  styles: [
    require('./../less/core.landing-page.style.less').toString()
  ],
  templateUrl: '../views/core.landing-page.view.html'
})

export class CoreLandingPageComponent {
  constructor(private router: Router) {
   
  }
}


import { Component, Input } from '@angular/core';

@Component({
  selector: 'spinner',
  styleUrls: [ '../styles/spinner.css' ],
  templateUrl: '../views/spinner.view.html'
})
export class SpinnerComponent {
  // Message for accessability
  @Input() srMessage: string;

  constructor() {
    this.srMessage = 'Loading...';
  }
}

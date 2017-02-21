import { Component } from '@angular/core';

import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';


@Component({
  selector: 'too-mean',
  styles: [
    require('./../less/app.style.less').toString()
  ],
  templateUrl: './../views/app.view.html'
})

export class AppComponent {
  constructor(private notificationService : NotificationsService) {
   }
  name = 'Too Mean';
  
  public notificationOptions = {
    position: ["bottom", "right"],
    timeOut: 5000,
    lastOnBottom: true
  }
}

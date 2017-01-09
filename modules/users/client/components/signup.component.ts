/* Vendor */
import { Component }        from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { Router }           from '@angular/router';

/* Angular2 Models */
import { User }             from '../models/user.model.client';

/* Angular2 Services */
import { UserService }      from '../services/user.service';

@Component({
  templateUrl: './../views/signup.view.html'
})
export class SignupComponent {
  model: any = {};
  errorMessage: string = null;

  constructor(private userService: UserService, private router: Router) { }

  signup () {
    let newUser = new User();

    newUser.username = this.model.username;
    newUser.email = this.model.email;
    newUser.password = this.model.password;

    this.userService.register(newUser)
      .subscribe(
        user => {
          router.navigate(['/login']);
        },
        error => {
          this.errorMessage = error._body;
        });
  }

  get diagnostic() {
    return JSON.stringify(this.model);
  }
}

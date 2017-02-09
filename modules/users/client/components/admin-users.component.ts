/*  Vendor */
import { Component, OnInit }from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { Router, ActivatedRoute }           from '@angular/router';
/*  Angular2 Models */
import { User }             from './../models/user.model.client';

/*  Angular2 Services */
import { AuthService }      from './../../../auth/client/auth.service.client';
import { UserService }      from '../services/user.service';
@Component({
  templateUrl: './../views/admin-users-view.html'
})
export class AdminUsersComponent implements OnInit {
  users: any
  constructor(
    private authService: AuthService, 
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}
  ngOnInit() {
   
    this.userService.list(1, "").subscribe( data =>
    {
      this.users = data;
    }, error =>{
      console.log(error);
    });
  }
}

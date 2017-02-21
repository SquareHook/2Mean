/*  Vendor */
import { 
  Component,
   OnInit
  }
   from '@angular/core';

import { BrowserModule }    from '@angular/platform-browser';
import { Router, ActivatedRoute }           from '@angular/router';
import { NgbModule, NgbModalModule, NgbModal, NgbModalOptions, NgbActiveModal, NgbModalRef, ModalDismissReasons }  from '@ng-bootstrap/ng-bootstrap';
import { ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
/*  Angular2 Models */
import { User }             from './../models/user.model.client';

/*  Angular2 Services */
import { AuthService }      from './../../../auth/client/auth.service.client';
import { UserService }      from '../services/user.service';
import { AdminUserForm }   from './admin-user-form.component';



@Component({
  templateUrl: './../views/admin-users-view.html'
})

export class AdminUsersComponent implements OnInit {
  users: Array<User>
  userSubject: Subject<User> = new Subject();

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

  displayUser(user: User)
  { 
    this.userSubject.next(user);
  }

}

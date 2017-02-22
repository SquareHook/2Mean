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
import { User }             from './../models/user.model';

/*  Angular2 Services */
import { AuthService }      from './../../../auth/client/services/auth.service';
import { UserService }      from '../services/user.service';
import { AdminUserForm }   from './admin-user-form.component';

/* Notifications */
import {NotificationsService} from 'angular2-notifications';


@Component({
  templateUrl: './../views/admin-users-view.html'
})

export class AdminUsersComponent implements OnInit {
  users: Array<User>
  userSubject: Subject<User> = new Subject();
  searchText: string = "";
  constructor(
    private authService: AuthService, 
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notificationsService: NotificationsService
  ) {}
  ngOnInit() {
   this.searchUsers();
  }

  //runs search function when enter is hit in the search input 
  searchHelper(keyCode)
  {
    if(keyCode === 13)
    {
      this.searchUsers();
    }
  }

  //returns a list of users with optional filtering
  searchUsers()
  {
    this.userService.list(1, this.searchText.trim()).subscribe( data =>
    {
      this.users = data;
      if(this.users.length < 1)
      {
            this.notificationsService.info('No Users Found', 'No users found based on your search criteria.', 
            {
            timeOut: 4000,
            showProgressBar: false,
            pauseOnHover: true,
            clickToClose: true,
            maxLength: 100
          });
      }
    }, error=>{
      console.log(error);
    })
  }
  displayUser(user: User)
  { 
    this.userSubject.next(user);
  }

}

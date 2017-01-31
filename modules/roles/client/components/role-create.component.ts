import {
	Component,
	OnInit
}
	from '@angular/core';

import {
	Role
} from '../models/role';

import {
	Router,
	ActivatedRoute,
	Params 
} from '@angular/router';

/* Import role service */
import {
	RoleService
} from '../services/roles.service';

import {
  NotificationsService
}
  from 'angular2-notifications';

@Component({
	selector: 'create-role',
	templateUrl: '../views/role-create.html'
})



export class RoleCreateComponent implements OnInit {

  Role: Role
  IsValid: Boolean
  NoErrors: Boolean
  constructor(private roleService: RoleService, private notificationsService: NotificationsService) {
    this.Role = new Role();
    this.NoErrors = true;
  }

  ngOnInit(): void {
  }

  submit(): void {
    this.roleService.createRole(this.Role)
      .subscribe((data: any) => {
        this.NoErrors = true;
        this.notificationsService.success('Role Created','Your role has been created', 
        {
            timeOut: 3000,
            showProgressBar: true,
            pauseOnHover: false,
            clickToClose: true,
            maxLength: 50
          }
        );
      },
      error => {
        this.NoErrors = false;
      });
  }
}

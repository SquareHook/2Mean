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
	constructor(private roleService: RoleService, private notificationsService: NotificationsService) {
		this.Role = new Role();
	}

	ngOnInit(): void {
		this.notificationsService.success(
			'Some Title',
			'Some Content',
			{
				timeOut: 1000,
				showProgressBar: true,
				pauseOnHover: false,
				clickToClose: false,
				maxLength: 10
			}
		);
	}

	submit(): void {
		this.roleService.createRole(this.Role)
			.subscribe((data: any) => {
				alert("HERE");
				this.notificationsService.success(
					'Some Title',
					'Some Content',
					{
						timeOut: 500000,
						showProgressBar: true,
						pauseOnHover: false,
						clickToClose: false,
						maxLength: 10
					}
				);
			},
			error => {
				console.log("crap");
			});
	}

}


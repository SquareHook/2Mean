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


@Component({
	selector: 'create-role',
	templateUrl: '../views/role-create.html'
})


export class RoleCreateComponent implements OnInit {

	Role: Role
	constructor(private roleService: RoleService) {
		this.Role = new Role('not set', null, []);
	}

	ngOnInit(): void {

	}

	submit(): void {
		this.roleService.createRole(this.Role)
			.subscribe((data: any) => {
				console.log(data);
			});
	}

}


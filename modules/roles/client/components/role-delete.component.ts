import {
  Component,
  OnInit
} from '@angular/core';

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
  selector: 'delete-role',
  providers: [RoleService],
  templateUrl: '../views/role-delete.html'
})


export class RoleDeleteComponent implements OnInit {

  Role: Role
  constructor(private roleService: RoleService) {
    this.Role = new Role('not set', null, []);
  }

  ngOnInit(): void {

  }

  submit(): void {
    this.roleService.removeRole(this.Role._id)
    .subscribe((data: any) => {
      console.log(data);
    });
  }
}
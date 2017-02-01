import {Component,OnInit} from '@angular/core';

import {Role} from '../models/role';

import { Router,ActivatedRoute, Params } from '@angular/router';


/* Import role service */
import { RoleService} from '../services/roles.service';

import {NotificationsService} from 'angular2-notifications';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'create-role', 
  templateUrl: '../views/role-create.html'
})

export class RoleCreateComponent implements OnInit {

  Role: Role
  IsValid: Boolean
  NoErrors: Boolean = true;
  Parents: Array < string >
  Tree: any = null;
  constructor(private roleService: RoleService, private notificationsService: NotificationsService) {
    this.Role = new Role();
    this.Parents = [];
  }

  ngOnInit(): void {
    this.getTree();
    this.getRoles();

    this.roleService.roleTreeChanged$
    .subscribe((data: any) => this.getRoles());

    this.roleService.rolesChanged$
    .subscribe((data: any) => this.getTree());
  }

  getTree(): void {
    this.roleService.getTree()
      .subscribe((data: any) => {
        this.Tree = data;
      });
  }

  getRoles(): void {
    this.roleService.getRoles().subscribe((data: any) => {
      data.sort();
      this.Parents = data;
    });
  }
 
  submit(): void {

    this.roleService.createRole(this.Role)
      .subscribe((data: any) => {
          this.NoErrors = true;
          this.notificationsService.success('Role Created', 'Your role has been created', {
            timeOut: 3000,
            showProgressBar: true,
            pauseOnHover: false,
            clickToClose: true,
            maxLength: 50
          });
        },
        error => {
          console.log(error);
          this.NoErrors = false;
        });
  }
}
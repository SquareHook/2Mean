import { Component } from '@angular/core';

import { NotificationsService } from 'angular2-notifications';

import { RoleService } from '../services/roles.service';

@Component({
  templateUrl: '../views/endpoints.view.html',
  selector: 'endpoints'
})
export class EndpointsComponent {
  private endpoints : Array<any>;
  private roles : Array<any>;
  private showForm: boolean;

  constructor(
    private roleService: RoleService,
    private notificationsService: NotificationsService
  ) { }

  ngOnInit() {
    this.roleService.getRoles().subscribe((response) => {
      this.roles = response;
    });

    this.roleService.getEndpoints().subscribe((response) => {
      this.endpoints = response;
    }, (error) => {
      this.notificationsService.error('Error', 'Failed to get endpoints');
    });
  }

  updateEndpoints() : void {
    this.showForm = false;

    this.roles.forEach((role) => {
      this.roleService.updateSingleRole(role).subscribe((response) => {
      }, (error) => {
        this.notificationsService.error('Error', 'Failed to update role');
      })
    });
  }
}

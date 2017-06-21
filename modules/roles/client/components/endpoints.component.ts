import { Component } from '@angular/core';

import { NotificationsService } from 'angular2-notifications';

import { RoleService } from '../services/roles.service';

const mockEndpoints = [
  {
    name: 'users',
    endpoints: [
      {
        route: '/users',
        type: 'GET',
        method: 'crud.readList',
        secure: true,
        name: 'Get User',
        description: 'Use to get users',
        permissions: {
          admin: false,
          user: false
        }
      },
      {
        route: '/users',
        type: 'POST',
        method: 'crud.create',
        secure: true,
        name: 'Create User',
        description: 'Use to create users',
        permissions: {
          admin: true,
          user: false
        }
      }
    ]
  }
];

@Component({
  templateUrl: '../views/endpoints.view.html',
  selector: 'endpoints'
})
export class EndpointsComponent {
  private endpoints : Array<any>;
  private roles : Array<any>;

  constructor(
    private roleService: RoleService,
    private notificationsService: NotificationsService
  ) { }

  ngOnInit() {
    this.endpoints = mockEndpoints;

    this.roleService.getRoles().subscribe((response) => {
      this.roles = response;
    });

    /*
    this.roleService.getEndpoints().subscribe((response) => {
      
    }, (error) => {
      this.notificationsService.error('Error', 'Failed to get endpoints');
    });
    */
  }

  updateEndpoint(endpoint: any) : void {
    endpoint.showForm = false;

    this.roleService.updateEndpoint(endpoint).subscribe((response) => {
      this.notificationsService.success(':+1:', 'Endpoint Updated');
    }, (error) => {
      this.notificationsService.error('Error', 'Failed to update endpoint');
    });
  }
}

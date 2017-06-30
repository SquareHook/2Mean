import { Component, Input } from '@angular/core';

@Component({
  selector: 'endpoint-permission-list',
  templateUrl: '../views/endpoint-permission-list.view.html'
})
export class EndpointPermissionListComponent {
  @Input() endpoint: any;
  @Input() roles: Array<any>;
  
  isChecked(role: any, endpoint: any) {
    if (role._id === 'admin') {
      return true;
    }

    let index = role.permissions.findIndex((element: any) => {
      return element.asset === endpoint.hashId;
    });

    return index !== -1;
  }
}

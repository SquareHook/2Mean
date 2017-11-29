import { Component, Input } from '@angular/core';

@Component({
  selector: 'endpoint-permission-form',
  templateUrl: '../views/endpoint-permission-form.view.html'
})
export class EndpointPermissionFormComponent {
  @Input() roles : Array<any>;
  @Input() endpoint : any;

  updateRole(role: any, endpoint: any) {
    // check if permission object exists. If not create it
    if (role.permissions === undefined) {
      role.permissions = [];
    }

    // look for the permission object in the array
    let permissionIndex = role.permissions.findIndex((element: any) => {
      return element.asset === endpoint.hashId;
    });

    if (permissionIndex === -1) {
      // add if asset is not in the array
      role.permissions.push({
        asset: endpoint.hashId
      });
    } else {
      // remove if the asset is in the array
      role.permissions.splice(permissionIndex, 1);
    }

    // update the endpoint for ui's sake
    if (endpoint.permissions) {
      endpoint.permissions.push(role._id);
    } else {
      endpoint.permissions = [ role._id ];
    }
  }

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

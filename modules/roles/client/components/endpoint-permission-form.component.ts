import { Component, Input } from '@angular/core';

@Component({
  selector: 'endpoint-permission-form',
  templateUrl: '../views/endpoint-permission-form.view.html'
})
export class EndpointPermissionFormComponent {
  @Input() roles : Array<any>;
  @Input() endpoint : any;

  updateRole(role: any, asset: string) {
    // check if permission object exists. If not create it
    if (role.permissions === undefined) {
      role.permissions = [];
    }

    // look for the permission object in the array
    let permissionIndex = role.permissions.findIndex((element) => {
      return element.asset === asset;
    });

    if (permissionIndex === -1) {
      // add if asset is not in the array
      role.permissions.push({
        asset: asset
      });
    } else {
      // remove if the asset is in the array
      role.permissions.splice(permissionIndex, 1);
    }

    // update the endpoint for ui's sake
  }
}

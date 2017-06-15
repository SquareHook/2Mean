import { Component, Input } from '@angular/core';

@Component({
  selector: 'endpoint-permission-form',
  templateUrl: '../views/endpoint-permission-form.view.html'
})
export class EndpointPermissionFormComponent {
 @Input() roles : Array<any>;
 @Input() endpoint : any;
}

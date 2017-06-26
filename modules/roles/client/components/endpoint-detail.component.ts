import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'endpoint-detail',
  templateUrl: '../views/endpoint-detail.view.html'
})
export class EndpointDetailComponent {
  @Input() endpoint : any;
  @Input() roles : Array<any>;
  @Input() showForm: boolean;
  @Output() endpointChange = new EventEmitter<any>();
}

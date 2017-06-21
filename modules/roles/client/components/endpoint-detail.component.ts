import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'endpoint-detail',
  templateUrl: '../views/endpoint-detail.view.html'
})
export class EndpointDetailComponent {
  @Input() endpoint : any;
  @Input() roles : Array<any>;
  @Output() endpointChange = new EventEmitter<any>();

  submitChanges(api: any) : void {
    this.endpointChange.emit(api);
  }
}

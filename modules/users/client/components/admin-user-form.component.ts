import {Component, Input, ElementRef, ViewChild} from '@angular/core';

import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Subject';
import { RoleService}           from '.././../../roles/client/services/roles.service';
@Component({
  selector: 'admin-user-modal',
  templateUrl: './../views/admin-user-form.view.html'
})
export class AdminUserModal {
  closeResult: string;
  display: boolean;
  @Input()
  userSubject:Subject<any>;
  private user: any;
  roles: Array<any>
  @ViewChild('content') content: ElementRef

  constructor(private modalService: NgbModal, private elRef: ElementRef, private roleService: RoleService) {
    this.elRef = elRef;
  }

  ngOnInit()
  {
    this.roleService.getRoles().subscribe(roles =>
    {
      this.roles = roles;
    });
    this.userSubject.subscribe(data =>{
     this.user = data;
     console.log(data);
     this.open(this.content);
    });
  }

 
  open(content:any) {
     
    this.modalService.open(content).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  updateSubroles()
  {
    //TODO
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
}

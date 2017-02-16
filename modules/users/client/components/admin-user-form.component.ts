import {Component, Input, ElementRef, ViewChild, } from '@angular/core';
import {FormsModule} from '@angular/forms';

import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Subject';
import { RoleService}           from '../../../roles/client/services/roles.service';
import { UserService} from '../../../users/client/services/user.service';
import { User} from '../../../users/client/models/user.model.client';
@Component({
  selector: 'admin-user-modal',
  templateUrl: './../views/admin-user-form.view.html'
})
export class AdminUserModal {
  closeResult: string;
  display: boolean;
  @Input()
  userSubject:Subject<any>;
  private user: User;
  roles: Array<any>
  @ViewChild('content') content: ElementRef

  constructor(private modalService: NgbModal, 
    private elRef: ElementRef, 
    private roleService: RoleService,
    private userService: UserService)
  {
    this.elRef = elRef;
  }

  ngOnInit()
  {
    this.roleService.getRoles().subscribe(data =>
    {
      this.roles = data;
    });
    
    //open modal and set member vars when user subject emits a user
    this.userSubject.subscribe(data =>{
     this.user = data;
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

  updateSubroles($event: any)
  {
    this.roleService.getSubroles(this.user.role).subscribe(data =>
    {
      this.user.subroles = data;
    });
  }

  onSubmit()
  {
    alert("OK");
    this.userService.adminUpdate(this.user).subscribe(data =>
    {
      console.log(data);
    });
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

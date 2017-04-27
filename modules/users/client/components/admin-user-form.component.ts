import { Component, Input, Output, ElementRef, ViewChild, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Subject';
import { RoleService } from '../../../roles/client/services/roles.service';
import { UserService } from '../../../users/client/services/user.service';
import { User } from '../../../users/client/models/user.model';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'admin-user-modal',
  templateUrl: './../views/admin-user-form.view.html'
})
export class AdminUserForm {
  closeResult: string;
  display: boolean;
  @Output()
  refreshUsers: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input()
  userSubject: Subject<any>;
  private user: User;
  roles: Array<any>

  //this gets the template with the id content to display in the modal
  @ViewChild('content') content: ElementRef

  constructor(private modalService: NgbModal,
    private elRef: ElementRef,
    private roleService: RoleService,
    private userService: UserService,
    private notificationsService: NotificationsService)
  { }


  ngOnInit() {
    this.roleService.getRoles().subscribe(data => {
      this.roles = data;
    });

    //open modal and set member vars when user subject emits a user
    this.userSubject.subscribe(data => {
      this.user = data;
      this.open(this.content);
    });
  }


  //open up the user edit modal for the selected user
  open(content: any) {

    this.modalService.open(content).result.then((result) => {
      //the modal can be closed with a button, by clicking on the backdrop, or by clicking submit
      if (this.getDismissReason(result) == "Submission") {
        this.onSubmit();
      }
      else if (this.getDismissReason(result) == "Deletion") {
        this.deleteUser();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  updateSubroles($event: any) {
    this.roleService.getSubroles(this.user.role).subscribe(data => {
      this.user.subroles = data;
    });
  }

  deleteUser() {
    let confirmed: any = confirm("Are you sure you want to delete this user? This can't be undone.");
    if (confirmed) {
      this.userService.delete(this.user._id).subscribe(result => {
        if (result.success) {
          //notify success and tell parent to pull list of users from the server
          this.notificationsService.info('User Deleted', 'The user has been deleted', this.notificationConfig);
          this.refreshUsers.emit(true);
        }
        else {
          this.notificationsService.error('Error', 'The user could not be deleted', this.notificationConfig);
        }
      });
    }
  }

  onSubmit() {
    //update general information about the user
    this.userService.adminUpdate(this.user).subscribe(data => {

      //update the user's role
      let updateObj = {
        userId: this.user._id,
        roleId: this.user.role
      };

      this.roleService.updateUserRole(updateObj).subscribe(data => {
        this.notificationsService.info('User Updated', 'The user has been updated', );
      }, error => {
        console.log(error);
      });
    },
      error => {
        console.log(error);
      });
  }

  private notificationConfig: any = {
    timeOut: 3000,
    showProgressBar: true,
    pauseOnHover: false,
    clickToClose: true,
    maxLength: 50
  };
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    }
    else {
      return `${reason}`;
    }
  }
}

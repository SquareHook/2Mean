import { Injectable } from '@angular/core';
import { Role } from '../models/role';
import { User } from '../../../users/client/models/user.model';

import {
  Http,
  Response
} from '@angular/http';

import { Observable } from 'rxjs'; 
import 'rxjs/add/operator/map';
import { Subject } from 'rxjs/Subject';


@Injectable()
export class RoleService{

  // Observable sources
  private roleTreeChangedSource = new Subject<any>();
 private rolesChangedSource = new Subject<any>();

  // Observable streams
  roleTreeChanged$ = this.roleTreeChangedSource.asObservable();
  rolesChanged$ = this.rolesChangedSource.asObservable();

  constructor(private http: Http){}


  getRoles(): Observable<any>
  {
    return this.http
      .get('api/roles')
      .map((r: Response) => r.json());
  }

  getRoleList(roleList: Array<String>): Observable<Array<any>>
  {
    // TODO: Need to add the roleList at the end of the uri as a CSV list.
    let roleCSV = roleList[0];
    for (let i = 1; i < roleList.length; i++) {
      roleCSV += ',' + roleList[i];
    }

    return this.http
      .get('api/roles/roleList/' + roleCSV)
      .map((r:Response) => r.json());
  }
  getTree(): Observable<any>
  {
    return this.http
      .get('api/roles/tree')
      .map((r: Response) => r.json());
  }

  createRole(formData: Role): Observable<any>
  {
      return this.http
      .post('api/roles', formData)
      .map((r: Response) => {
        this.roleTreeChangedSource.next(true);
        this.rolesChangedSource.next(true);
        let formatted = r.json();
        return formatted;
      });
  }

  getEndpoints() : Observable<any> {
    return this.http.get('api/roles/permissions').map((res: Response) => {
      return res.json();
    });
  }

  updateSingleRole(role: Role) : Observable<any> {
    return this.http.put('api/roles/' + role._id, role).map((res: Response) => {
      return res.json();
    });
  }

 updateUserRole(data: any): Observable<any>
 {
   return this.http
    .put('api/roles/updateUserRole', data)
    .map((r: Response) => r.json());
 }
  removeRole(id: string): Observable<Role> {
    return this.http.delete('api/roles/' + id)
        .map((r: Response) => {
        this.roleTreeChangedSource.next(true);
        this.rolesChangedSource.next(true);
        let formatted = r.json();
        return formatted;
      });
  }

  userHasRole(user: User, role: Array<String>) : boolean {
    for (let i = 0; i < user.cachedRoles.length; i++) {
      if (role.indexOf(user.cachedRoles[i]) !== -1) {
        return true;
      }
    }

    return false;
  }
}

import { Injectable } from '@angular/core';
import { Role } from '../models/role';

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
      .get('api/roles/subroles')
      .map((r: Response) => r.json());
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



  removeRole(id: string): Observable<Role> {
    return this.http.delete('api/roles/' + id)
        .map((r: Response) => {
        this.roleTreeChangedSource.next(true);
        this.rolesChangedSource.next(true);
        let formatted = r.json();
        return formatted;
      });
  }




}
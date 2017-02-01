import { Injectable } from '@angular/core';
import { Role } from '../models/role';

import {
  Http,
  Response
} from '@angular/http';

import { Observable } from 'rxjs'; 
import 'rxjs/add/operator/map';


@Injectable()
export class RoleService {

  constructor(private http: Http){}


  getRoles(): Observable<any>
  {
    return this.http
      .get('api/roles/subroles/' + 'admin')
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
      .map(this.formatCreateResponse);
  }

  removeRole(id: string): Observable<Role> {
    return this.http.delete('api/roles/' + id)
      .map((r: Response) => r.json().data);
  }



  private formatCreateResponse(res: Response | any) {
    let body = res.json();

    return body;
  }
}
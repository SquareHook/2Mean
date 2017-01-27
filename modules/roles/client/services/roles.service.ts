import { Injectable } from '@angular/core';
import { Role } from '../models/Role';

import {
	Http,
	Response
} from '@angular/http';

import { Observable } from 'rxjs'; 
import 'rxjs/add/operator/map';


@Injectable()
export class RoleService {

	constructor(private http: Http){}


	getRoles(): Observable<Role[]>
	{
		return this.http
			.get('api/roles')
			.map((r: Response) => r.json().data);
	}

	createRole(formData: Role): Observable<any>
	{
		return this.http
			.post('api/roles', formData)
			.map(this.extractData);		
	}

	removeRole(id: string): Observable<Role> {
		return this.http.delete('api/roles/' + id)
			.map((r: Response) => r.json().data);
	}

	private extractData(res: Response | any) {
		console.log(res);
		let body = res.json();
		return body;
	}
}
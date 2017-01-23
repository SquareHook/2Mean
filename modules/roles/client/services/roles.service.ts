/*

import { Injectable } from '@angular/core';
import { Role } from '../../models/Role';

import {
  Http,
  Response,
  HttpModule,
  RequestOptions,
  Request,
  RequestMethod,
  Headers
} from '@angular/http';

import { Observable } from 'rxjs'; 
import 'rxjs/add/operator/map';

@Injectable()
export class ArticleService {

	constructor(private http: Http){}
	

	getArticles(): Observable<Article[]>
	{
		return this.http
		.get('api/articles')
		.map((r: Response) => r.json().data);
	}

	publishArticle(formData: Article) : Observable<any>
	{
	  return this.http.post('api/articles', formData)
    .map(this.extractData);		
  }

	getArticle(id: string): Observable<Article> {
		return this.http.get('api/articles/' + id)
			.map((r: Response) => r.json().data);
	}

	updateArticle(formData: Article) : Observable<any>
	{
		return this.http.put('api/articles/' + formData.id, formData)
    .map(this.extractData);		
	}

	removeArticle(id: string): Observable<Article> {
		return this.http.delete('api/articles/' + id)
			.map((r: Response) => r.json().data);
	}
	private extractData(res: Response | any) {
		let body = res.json();
		return body;
	}
}
*/
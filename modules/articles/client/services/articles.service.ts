import { Injectable } from '@angular/core';
import { Article } from '../../models/article.client.model';
import { ARTICLES } from './mock-articles';

@Injectable()
export class ArticleService {
	//TODO: switch over to obersvables one the server side endpoints are set up
	getArticles(): Promise<Article[]>
	{
		return Promise.resolve(ARTICLES);
	}

	getArticle(id: string) : Promise<Article>
	{
		 return Promise.resolve(ARTICLES.find((x) => {return x.id === id}));
	}

}
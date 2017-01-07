import { Component, OnInit } from '@angular/core';
import { Article }      from '../models/article.client.model';
import { ArticleService } from '../services/articles.service';

@Component({
	selector:'new-article',
	providers: [ArticleService],
	templateUrl: ''
})

export class ListArticlesComponent implements OnInit{

	articles: Article[];
	selectedArticle: Article;
	/*
	* The constructor is for simple initializations like wiring constructor paramaters to properties
	* We should be able to create a component in a test and not worry that it might do real work, 
	* like calling a server!
	*/
	constructor(private articleService: ArticleService){}

	
	/* 
	* Leave it to angular to call the initialization code at the right time
	*/
	ngOnInit() : void{
		
	}

	

}	


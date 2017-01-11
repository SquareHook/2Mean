import { Component, OnInit } from '@angular/core';
import { Article }      from '../models/article.client.model';
import { ArticleService } from '../services/articles.service';

@Component({
	selector:'list-articles',
	providers: [ArticleService],
	templateUrl: '../views/list-articles.html'
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
		this.getArticles();
	}

	/* 
	* Our service returns a promise, once resolved we will bind the data 
	*/
	getArticles() : void{
		this.articleService.getArticles()
			.subscribe((data) => { this.articles = data;});
		
	}
	
	onSelect(article: Article): void{
		this.selectedArticle = article;
	}

}	


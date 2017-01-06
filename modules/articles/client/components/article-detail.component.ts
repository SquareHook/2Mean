import { Component, OnInit } from '@angular/core';
import { Article }      from '../../models/article.client.model';
import { ArticleService } from '../services/articles.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';

@Component({
	selector:'article-detail',
	providers: [ArticleService],
	templateUrl: '../views/article-detail.html'
})

export class ArticleDetailComponent implements OnInit{

	article: Article;

	constructor(private articleService: ArticleService, private router:Router, private route:ActivatedRoute){
		this.article = null;
	}

	/*
	* here we use rxjs to watch for changes to the url, once changed we use the articles service to get
	* the new object without having to reload the component 
	*/
	ngOnInit() : void{
		  this.route.params.switchMap((params: Params) => this.articleService.getArticle(params['id']))
   		  .subscribe((_article: Article) => {this.article = _article});
	};


}


import { Component, OnInit } from '@angular/core';
import { Article } from './../models/article.client.model';
import { ArticleService } from '../services/articles.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../auth/client/auth.service.client';

import 'rxjs/add/operator/switchMap';

@Component({
	selector: 'article-detail',
	providers: [ArticleService],
	templateUrl: '../views/article-detail.html'
})

export class ArticleDetailComponent implements OnInit {

	article: Article;
	detailView: boolean;
	loggedIn: boolean;
	constructor(private articleService: ArticleService,
	 private authService: AuthService,
	 private router: Router, 
	 private route: ActivatedRoute) {
		this.article = null;
		this.detailView = true;
		this.loggedIn = authService.loggedIn;
	}


	ngOnInit(): void {
	  this.route.params
		  .subscribe((data: any) => {
			 //display form or display article based on route params
				if (data.id && data.id === 'new') {
					this.detailView = false;
					this.article = new Article("", "", null);
				}
				else {
					//here we use rxjs to watch for changes to the url, once changed we use the articles service to get
					//the new object without having to reload the component 
					this.route.params
					.switchMap((params: Params) =>
						this.articleService.getArticle(params['id']))
							.subscribe((_article: Article) => { this.article = _article; this.detailView = true; });
				}
			});

	};

	submit(): void {
		this.articleService.publishArticle(this.article)
		.subscribe((data) => 
		{
				if(data._id)
				{
					this.router.navigate(['articles']);
				}
		});
	}


}


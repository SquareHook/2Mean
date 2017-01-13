import {
  Component,
  OnInit
} from '@angular/core';
import {
  Article
} from './../models/article.client.model';
import {
  ArticleService
} from '../services/articles.service';
import {
  Router,
  ActivatedRoute,
  Params
} from '@angular/router';
import {
  FormsModule
} from '@angular/forms';

import {
  AuthService
} from '../../../auth/client/auth.service.client';

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
  isEdit: boolean;
  loading: boolean;

  constructor(private articleService: ArticleService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute) {
    this.setDefaults();
  }

  private setDefaults(): void {
    this.loading = true;
    this.article = null;
    this.detailView = true;
    this.isEdit = false;
    this.loggedIn = this.authService.loggedIn;
  }

  private userIsOwner(): boolean {
    return this.article && this.article.userId == this.authService.getUser().id;
  }

  ngOnInit(): void {
    this.route.params
      .subscribe((data) => {
        this.setDefaults();
        if (data['id'] === 'new') {
          this.article = new Article("", "", null);
          this.detailView = false;
          return;
        }
        else {
          this.loadArticle(data['id']);
        }
      });
  }

  loadArticle(id: string) {
    this.setDefaults();
    this.articleService.getArticle(id)
      .subscribe((data) => {
        if (data) {

          this.loading = false;
          this.article = data;
          this.article.id = data['_id'];
          //check to see if the current user created the article
          if (this.userIsOwner()) {
            this.isEdit = true;
            this.detailView = false;
          }
        }
      });
  }

  deleteArticle(id: string) {
    this.articleService.removeArticle(this.article.id)
      .subscribe((data) => {
        this.router.navigate(['/articles']);
      });
  }


  submit(): void {
    if (this.userIsOwner()) {
      this.articleService.updateArticle(this.article)
        .subscribe((data) => {
          this.router.navigate(['/articles']);
        });
      return;
    }

    this.articleService.publishArticle(this.article)
      .subscribe((data) => {
        if (data._id) {
          this.router.navigate(['/articles']);
        }
      });
  }


}

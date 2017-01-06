import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { HttpModule }     from '@angular/http';
import { NgbModule }      from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes }     from '@angular/router';
import { AppModule }      from '../../app/client/app.module';
import { ArticlesRoutingModule }      from './config/articles-routing.module';


import { ListArticlesComponent } from './components/list-articles.component';
import { ArticleDetailComponent } from './components/article-detail.component';

@NgModule({
  imports:      [
    BrowserModule,
    NgbModule,
    HttpModule,
    ArticlesRoutingModule,

  ],
  /*components available inside of this module */
  declarations: [
    ListArticlesComponent,
    ArticleDetailComponent
  ],
  /*components available to other modules */
  exports: [],

  /* which components to load when starting this module */
  bootstrap:    [ ListArticlesComponent]
})

export class ArticleModule {}


import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/* import the components this module uses */
import { ListArticlesComponent } from '../components/list-articles.component';
import { ArticleDetailComponent } from '../components/article-detail.component';

/* register the routes to these components */
const articlesRoutes: Routes = [
  {
    path: 'articles',
    component: ListArticlesComponent
  },
  {
    path: 'articles/:id',
    component: ArticleDetailComponent
  }
];

/* connect the routes above to the router module */
@NgModule({
  imports: [
    RouterModule.forChild(articlesRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class ArticlesRoutingModule {}

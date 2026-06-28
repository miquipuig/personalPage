import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { BlogRoutingModule } from './blog-routing.module';
import { BlogListComponent } from './blog-list.component';
import { BlogDetailComponent } from './blog-detail.component';

@NgModule({
  declarations: [
    BlogListComponent,
    BlogDetailComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    BlogRoutingModule
  ]
})
export class BlogModule { }

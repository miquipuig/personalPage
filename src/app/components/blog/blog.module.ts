import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BlogRoutingModule } from './blog-routing.module';
import { BlogListComponent } from './blog-list.component';
import { BlogDetailComponent } from './blog-detail.component';
import { PostViewModule } from '../../shared/post-view/post-view.module';

@NgModule({
  declarations: [
    BlogListComponent,
    BlogDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    BlogRoutingModule,
    PostViewModule
  ],
  // <emoji-picker> is a custom element (emoji-picker-element).
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BlogModule { }

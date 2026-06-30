import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostViewComponent } from './post-view.component';

@NgModule({
  declarations: [PostViewComponent],
  imports: [CommonModule, RouterModule],
  exports: [PostViewComponent],
})
export class PostViewModule {}

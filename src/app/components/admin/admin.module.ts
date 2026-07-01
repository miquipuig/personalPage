import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminPostsComponent } from './admin-posts/admin-posts.component';
import { AdminEditorComponent } from './admin-editor/admin-editor.component';
import { MediaPickerComponent } from './media-picker/media-picker.component';
import { AdminApiComponent } from './admin-api/admin-api.component';
import { AdminAnalyticsComponent } from './admin-analytics/admin-analytics.component';
import { AdminCommentsComponent } from './admin-comments/admin-comments.component';
import { PostViewModule } from '../../shared/post-view/post-view.module';

@NgModule({
  declarations: [
    AdminLoginComponent,
    AdminPostsComponent,
    AdminEditorComponent,
    MediaPickerComponent,
    AdminApiComponent,
    AdminAnalyticsComponent,
    AdminCommentsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AdminRoutingModule,
    GoogleSigninButtonModule,
    ImageCropperComponent,
    PostViewModule
  ]
})
export class AdminModule {}

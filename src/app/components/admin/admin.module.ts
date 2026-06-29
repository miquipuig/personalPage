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

@NgModule({
  declarations: [
    AdminLoginComponent,
    AdminPostsComponent,
    AdminEditorComponent,
    MediaPickerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AdminRoutingModule,
    GoogleSigninButtonModule,
    ImageCropperComponent
  ]
})
export class AdminModule {}

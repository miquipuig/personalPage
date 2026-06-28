import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GoogleSigninButtonModule, SocialLoginModule } from '@abacritt/angularx-social-login';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminPostsComponent } from './admin-posts/admin-posts.component';
import { AdminEditorComponent } from './admin-editor/admin-editor.component';

@NgModule({
  declarations: [
    AdminLoginComponent,
    AdminPostsComponent,
    AdminEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AdminRoutingModule,
    SocialLoginModule,
    GoogleSigninButtonModule
  ]
})
export class AdminModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminPostsComponent } from './admin-posts/admin-posts.component';
import { AdminEditorComponent } from './admin-editor/admin-editor.component';
import { AdminAuthGuard } from '../../guards/admin-auth.guard';

const routes: Routes = [
  { path: 'login', component: AdminLoginComponent },
  { path: '', component: AdminPostsComponent, canActivate: [AdminAuthGuard] },
  { path: 'new', component: AdminEditorComponent, canActivate: [AdminAuthGuard] },
  { path: 'edit/:id', component: AdminEditorComponent, canActivate: [AdminAuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}

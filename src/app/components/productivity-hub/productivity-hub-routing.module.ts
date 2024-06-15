import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductivityHubComponent } from './productivity-hub.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [{
  path: '',
  component: ProductivityHubComponent
},
{path: 'login', component: LoginComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductivityHubRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductivityHubComponent } from './productivity-hub.component';
import { LoginComponent } from './access/login/login.component';
import { RegistrationComponent } from './access/registration/registration.component';

const routes: Routes = [{
  path: '',
  component: ProductivityHubComponent
},
{path: 'login', component: LoginComponent},
{path: 'registration', component: RegistrationComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductivityHubRoutingModule { }

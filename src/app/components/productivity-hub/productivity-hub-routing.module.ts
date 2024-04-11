import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductivityHubComponent } from './productivity-hub.component';

const routes: Routes = [{
  path: '',
  component: ProductivityHubComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductivityHubRoutingModule { }

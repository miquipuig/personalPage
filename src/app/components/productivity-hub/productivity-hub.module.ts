import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductivityHubRoutingModule } from './productivity-hub-routing.module';
import { ProductivityHubComponent } from './productivity-hub.component';
import { TaskModalComponent } from './menus/task-modal/task-modal.component';


@NgModule({
  declarations: [ProductivityHubComponent, TaskModalComponent],
  imports: [
    CommonModule,
    ProductivityHubRoutingModule
  ],exports: [ProductivityHubComponent]
})
export class ProductivityHubModule { 


}

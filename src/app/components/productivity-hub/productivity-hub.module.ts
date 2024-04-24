import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductivityHubRoutingModule } from './productivity-hub-routing.module';
import { ProductivityHubComponent } from './productivity-hub.component';
import { TaskModalComponent } from './menus/task-modal/task-modal.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [ProductivityHubComponent, TaskModalComponent],
  imports: [
    CommonModule,
    ProductivityHubRoutingModule,
    ReactiveFormsModule
  ],exports: [ProductivityHubComponent]
})
export class ProductivityHubModule { 


}

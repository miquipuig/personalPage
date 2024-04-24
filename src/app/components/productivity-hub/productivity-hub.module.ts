import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductivityHubRoutingModule } from './productivity-hub-routing.module';
import { ProductivityHubComponent } from './productivity-hub.component';
import { TaskModalComponent } from './menus/task-modal/task-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [ProductivityHubComponent, TaskModalComponent],
  imports: [
    NgbTimepickerModule,
    CommonModule,
    ProductivityHubRoutingModule,
    ReactiveFormsModule,
  ],exports: [ProductivityHubComponent]
})
export class ProductivityHubModule { 


}

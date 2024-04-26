import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductivityHubRoutingModule } from './productivity-hub-routing.module';
import { ProductivityHubComponent } from './productivity-hub.component';
import { TaskModalComponent } from './complements/task-modal/task-modal.component';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { TimePickerComponent } from './complements/time-picker/time-picker.component';


@NgModule({
  declarations: [ProductivityHubComponent, TaskModalComponent, TimePickerComponent],
  imports: [ 
    NgbTimepickerModule,
    CommonModule,
    ProductivityHubRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],exports: [ProductivityHubComponent]
})
export class ProductivityHubModule { 


}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductivityHubRoutingModule } from './productivity-hub-routing.module';
import { ProductivityHubComponent } from './productivity-hub.component';
import { TaskModalComponent } from './complements/task-modal/task-modal.component';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { TimePickerComponent } from './complements/time-picker/time-picker.component';
import { TruncatePipe } from 'src/app/pipes/truncate.pipe';
import { CustomTimeFormatPipe } from 'src/app/pipes/custom-time-format.pipe';
import { LabelEditorComponent } from './complements/label-editor/label-editor.component';


@NgModule({
  declarations: [ProductivityHubComponent, TaskModalComponent, TimePickerComponent,TruncatePipe,CustomTimeFormatPipe, LabelEditorComponent],
  imports: [ 
    CommonModule,
    ProductivityHubRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],exports: [ProductivityHubComponent]
})
export class ProductivityHubModule { 


}

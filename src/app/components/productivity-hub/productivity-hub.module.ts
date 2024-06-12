import { NgModule } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';

import { ProductivityHubRoutingModule } from './productivity-hub-routing.module';
import { ProductivityHubComponent } from './productivity-hub.component';
import { TaskModalComponent } from './complements/task-modal/task-modal.component';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { TimePickerComponent } from './complements/time-picker/time-picker.component';
import { TruncatePipe } from 'src/app/pipes/truncate.pipe';
import { CustomTimeFormatPipe } from 'src/app/pipes/custom-time-format.pipe';
import { LabelEditorComponent } from './complements/label-editor/label-editor.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ClockComponent } from './clock/clock.component';
import { TimerComponent } from './timer/timer.component';
import { PeriodicityComponent } from './complements/periodicity/periodicity.component';
import { DatapickerComponent } from './datapicker/datapicker.component';
import { NgbAlertModule, NgbDateParserFormatter, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateCustomParserFormatter } from './datapicker/date-formatter.service';
import { CheckBoxComponent } from './complements/check-box/check-box.component';
import { FilterButtonsComponent } from './complements/filter-buttons/filter-buttons.component';
import { TaskCardComponent } from './complements/task-card/task-card.component';
import { FilterMenuComponent } from './complements/filter-menu/filter-menu.component';
import { HistoryBriefComponent } from './complements/history-brief/history-brief.component';



@NgModule({
  declarations: [ProductivityHubComponent, TaskModalComponent, TimePickerComponent,TruncatePipe,CustomTimeFormatPipe, LabelEditorComponent, ClockComponent, TimerComponent, PeriodicityComponent, DatapickerComponent, CheckBoxComponent, FilterButtonsComponent, TaskCardComponent, FilterMenuComponent, HistoryBriefComponent],
  imports: [ 
    CommonModule,
    ProductivityHubRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    NgbDatepickerModule, JsonPipe, NgbAlertModule, DragDropModule
  ],exports: [ProductivityHubComponent],providers: [

    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }  // <-- add this
  ],
})
export class ProductivityHubModule { 


}

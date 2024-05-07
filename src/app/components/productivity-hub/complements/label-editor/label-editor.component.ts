import { Component } from '@angular/core';
import { Label } from 'src/app/services/productivity-hub/task-services.service';
import { TaskServicesService } from 'src/app/services/productivity-hub/task-services.service';

@Component({
  selector: 'app-label-editor',
  templateUrl: './label-editor.component.html',
  styleUrls: ['./label-editor.component.css']
})
export class LabelEditorComponent {
  editLabelOpened: boolean = true;
  labels: Label[] = [];
  selectedLabel: Label;
  constructor(private taskService: TaskServicesService) {
    this.loadLabels();
    this.selectedLabel = {} as Label;
  }
  loadLabels() {
    this.taskService.loadLabels();
    this.labels = this.taskService.labels;
  }

  selectLabel(label: Label) {
    this.saveLabel();
    this.selectedLabel = label;
  }

  saveLabel() {
    if(this.selectedLabel.name !== '' && this.selectedLabel.color !== '' && this.selectedLabel.icon !== '') {
      this.taskService.saveLabel(this.selectedLabel);
      this.loadLabels();
    }
    this.selectedLabel = {} as Label;
  }
  close() {
    this.saveLabel();
    this.editLabelOpened = false;
  }

}

import { Component, EventEmitter, Output } from '@angular/core';
import { Label } from 'src/app/services/productivity-hub/task-services.service';
import { TaskServicesService } from 'src/app/services/productivity-hub/task-services.service';

@Component({
  selector: 'app-label-editor',
  templateUrl: './label-editor.component.html',
  styleUrls: ['./label-editor.component.css']
})
export class LabelEditorComponent {

  @Output() closeMenus = new EventEmitter<any>();


  editLabelOpened: boolean = false;
  pickColorOpened: boolean = false;
  pickIconOpened: boolean = false;
  availableColors: string[] = ['yellow',  'green', 'blue', 'red', 'purple', 'orange', 'pink', 'brown', 'grey', 'clearGrey'];
  availableIcons: string[] = ['ri-file-list-line',"ri-home-5-line","ri-square-line", "ri-square-fill"];
  labels: Label[] = [];
  selectedLabel: Label;
  constructor(private taskService: TaskServicesService) {
    this.loadLabels();
    this.selectedLabel = {} as Label;
    this.selectedLabel.color = 'clearGrey';
    // this.selectedLabel.icon = 'ri-file-list-line';
  }
  loadLabels() {
    this.taskService.loadLabels();
    this.labels = this.taskService.getOrderedLabelsPerName();
  }

  selectLabel(label: Label) {
    // this.saveLabel();
    this.selectedLabel = {...label}
    this.pickColorOpened = false;
    this.pickIconOpened = false;
    
  }

  saveLabel() {
    if(this.selectedLabel.name !== '' && this.selectedLabel.color !== '' && this.selectedLabel.icon !== '') {
      this.taskService.saveLabel(this.selectedLabel);
      this.loadLabels();
    }
    this.selectedLabel = {} as Label;
  }
  close() {
    // this.saveLabel();
    this.editLabelOpened = false;
  }
  selectColor(color: string) {
    this.selectedLabel.color = color;
    this.pickColorOpened = false;
  }
  selectIcon(icon: string) {
    this.selectedLabel.icon = icon;
    this.pickIconOpened = false;
  }

  pickColor() {
    this.pickColorOpened = !this.pickColorOpened;
    this.pickIconOpened = false;
  }
  pickIcon() {
    this.pickIconOpened = !this.pickIconOpened;
    this.pickColorOpened = false;
  }

  newLabel() {
    this.selectedLabel = {} as Label;
    this.selectedLabel.color = 'clearGrey';
  }
  deleteLabel() {
    this.taskService.deleteLabel(this.selectedLabel.id);
    this.loadLabels();
    this.selectedLabel = {} as Label;
  }
  openEditLabel(label: Label) {
    this.closeMenus.emit();
    this.editLabelOpened = true;
    this.selectedLabel = {...label};
  }
  openEdit() {
    console.log('aaaaa');

    this.closeMenus.emit();
    this.editLabelOpened = !this.editLabelOpened;
    console.log('this.editLabelOpened');
  }

}

import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, startWith, map, of } from 'rxjs';
import { TaskServicesService } from 'src/app/services/productivity-hub/task-services.service';
import { Time } from '@angular/common';
import { TimePickerComponent } from '../time-picker/time-picker.component';
import { Task } from 'src/app/services/productivity-hub/task-services.service';
import { LabelEditorComponent } from '../label-editor/label-editor.component';
@Component({
  selector: 'app-task-modal',
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.css']
})
export class TaskModalComponent implements OnInit {
  declare bootstrap: any;
  modalOpened = false;
  taskModalP: any;
  form: FormGroup;
  id: number;
  showList = false;
  showSectionIdList = false;
  pressLeft: number = 0;
  pressTop: number = 0;
  dontClose: boolean = false;
  dontCloseTraficLight: boolean = false;
  task: Task = {} as Task;
  label: Label = {} as Label;
  segment: Task = {} as Task;
  @Output() refreshTasks = new EventEmitter<any>();

  @ViewChild('taskModal') taskModal!: ElementRef;
  @ViewChild('taskModalDialog') taskModalDialog!: ElementRef;
  @ViewChild(TimePickerComponent) timePicker!: TimePickerComponent;
  @ViewChild(LabelEditorComponent) labelEditor!: LabelEditorComponent;


  sugerencias = ['Sugerencia 1', 'Sugerencia 2', 'Sugerencia 3'];
  // filteredActivities: Observable<Label[]>;
  labels: Label[] = [];
  segmentIds: Task[] = [];
  constructor(private taskService: TaskServicesService, private fb: FormBuilder) {
    this.id = -1;
    this.form = new FormGroup({
      elementType: new FormControl('task', Validators.required),
      name: new FormControl('', Validators.required),
      detail: new FormControl(''),
      label: new FormControl(''),
      segmentId: new FormControl(''),
      estimatedTime: new FormControl(0) // Asegúrate que el control '' está definido aquí
    });


    this.labels = this.filterOptions(this.form.get('label')!.value || '');
    this.segmentIds = this.filterSectionIdOptions(this.form.get('label')!.value || '');

  }

  private filterOptions(value: string): Label[] {
    const filterValue = value.toLowerCase();
    const options = this.taskService.getOrderedLabelsPerName();

    return options.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  private filterSectionIdOptions(value: string): Task[] {
    const filterValue = value.toLowerCase();
    let options: Task[]

    options = this.taskService.tasks.filter(task => task.elementType === 'segment').sort((a, b) => a.idPosition - b.idPosition);
    if (this.label && this.label.id !== undefined) {
      options = options.filter(option => option.label === this.label.id);
    }
    return options.filter(option => option.name.toLowerCase().includes(filterValue));
  }



  selectLabel() {
    this.dontCloseTraficLight = true;

    this.labels = this.filterOptions('');
    // this.filteredActivities = this.form.get('label')!.valueChanges
    // .pipe(
    //   startWith(''),
    //   map(value => this.filterOptions(value))
    // );

    this.showList = true;
  }

  selectSectionId() {

    this.segmentIds = this.filterSectionIdOptions('');
    // this.filteredActivities = this.form.get('label')!.valueChanges
    // .pipe(
    //   startWith(''),
    //   map(value => this.filterOptions(value))
    // );

    this.showSectionIdList = true;
  }

  onSearch(): void {
    // Logic to handle live search update
    // this.filteredActivities = of(this.filterOptions(this.form.get('label')!.value));
    this.labels = this.filterOptions(this.form.get('label')!.value || '');
    if (this.labels.length === 1) {
      this.label = this.labels[0];
    }

  }
  onSegmentIdsearch(): void {
    this.segmentIds = this.filterSectionIdOptions(this.form.get('segmentId')!.value || '');
    if (this.segmentIds.length === 1) {
      if(this.segmentIds[0].name===this.form.get('segmentId')!.value){
        this.segment = this.segmentIds[0];
        this.label= this.taskService.getLabelById(this.segment.label!);
        this.form.get('label')!.setValue(this.label.name);
      }
    }

  }

  selectOption(option: Label): void {
    this.showList = false;
    this.form.get('label')!.setValue(option.name);
    this.label = option;
  }

  selectSectionIdOption(option: Task): void {
    this.showSectionIdList = false;
    this.form.get('segmentId')!.setValue(option.name);
    this.label= this.taskService.getLabelById(option.label!);
    this.form.get('label')!.setValue(this.label.name);
    this.segment = option;
  }
  deleteActivity(label: Label): void {
    if (this.dontCloseTraficLight) {
      this.dontCloseTraficLight = false;
      this.dontClose = true;
    }
    this.labels = this.labels.filter(option => option.id !== label.id);
    this.taskService.deleteLabel(label.id);
    // this.filteredActivities = this.form.get('label')!.valueChanges
    // .pipe(
    //   startWith(''),
    //   map(value => this.filterOptions(value))
    // );
    //refresh filteredActivities
    this.showList = true;

  }

  editActivity(label: Label): void {
    this.closeMenus();
    this.labelEditor.openEditLabel(label);

  }

  ngOnInit() {
    const element = document.getElementById('taskModal');
    if (element !== null) {
      this.taskModalP = bootstrap.Modal.getOrCreateInstance(element, {
        keyboard: true
      });
      element.addEventListener('hidden.bs.modal', () => {
        this.closeModal();
      });
    }
  }
  // onModalShown() {
  //   let rect = this.taskModalDialog.nativeElement.getBoundingClientRect();
  //   console.log(rect);
  // }
  onInputBlur() {

    setTimeout(() => {
      if (!this.dontClose) {
        this.showList = false;

      } else {
        this.dontClose = false;
      }
    }, 300);
  }
  visualEffectAddTask(left: number, top: number) {

    let aproxLeft = window.innerWidth / 2 - 250;
    let aproxTop = 55;
    let originX = left - aproxLeft;
    let originY = top - aproxTop;
    this.taskModal.nativeElement.style.setProperty('--modal-originX', `${originX}px`);
    this.taskModal.nativeElement.style.setProperty('--modal-originY', `${originY}px`);
    //print originX and originY
    console.log('originX: ' + originX + ' originY: ' + originY);
    // this.taskModal.nativeElement.style.setProperty('--modal-left', `${left}px`);
    // this.taskModal.nativeElement.style.setProperty('--modal-top', `${top}px`);    

  }

  async openModal(left: number, top: number) {
    this.visualEffectAddTask(left, top);

    this.modalOpened = true;
    // this.onModalShown();
    this.form.reset();
    this.form.get('elementType')?.setValue('task');
    this.form.get('estimatedTime')?.setValue(0);
    this.id = -1;
    this.taskModalP.show();
  }



  async editModal(index: number, task: any, left: number, top: number) {
    this.visualEffectAddTask(left, top);
    this.modalOpened = true;

    this.id = task.id;
    this.task = task;

    this.form.get('name')?.setValue(task.name);

    this.form.get('detail')?.setValue(task.detail);
    this.form.get('estimatedTime')?.setValue(task.estimatedTime);
    if (this.taskService.getLabelById(task.label)) {
      this.label = this.taskService.getLabelById(task.label);
      this.form.get('label')?.setValue(this.label.name);
    }
    if (this.taskService.getTaskById(task.segmentId)) {
      this.segment = this.taskService.getTaskById(task.segmentId);
      this.form.get('segmentId')?.setValue(this.segment.name);
    } else {
      this.form.get('segmentId')?.setValue('');
    }
    this.form.get('elementType')?.setValue(task.elementType);
    this.taskModalP.show();
  }
  closeMenus() {
    this.showList = false;
    this.showSectionIdList = false;
    if (this.timePicker) {
      this.timePicker.closeTimePicker();
    }
    if(this.labelEditor){
      this.labelEditor.close();
    }

  }

  closeModal() {
    this.closeMenus();
    this.taskModalP.hide();
    this.modalOpened = false;
 
  }

  async onSubmit() {
    console.log(this.form.get('segmentId')!.value);
    if (this.form.valid) {
      if (this.id !== -1) {
        this.task = { ...this.task, ...this.form.value };
        this.closeModal();

        if (this.form.get('label')!.value !== '' && this.form.get('label')!.value !== null && this.form.get('label')!.value !== undefined) {

          this.task.label = this.taskService.addLabelByName(this.form.get('label')!.value).id;
        }
        if (this.form.get('segmentId')!.value !== '' && this.form.get('segmentId')!.value !== null && this.form.get('segmentId')!.value !== undefined) {
          let newSegment: any;
          newSegment = {
            name: this.form.get('segmentId')!.value,
            label: this.task.label,
            elementType: 'segment'

          }
          const segment = ((await this.taskService.addTaskByChild(newSegment)))
          this.task.segmentId=segment.id;
        }else{
          this.task.segmentId=undefined;
        }
        await this.taskService.saveTask(this.task);

      } else {
        this.closeModal();
        this.task = { ...this.task, ...this.form.value };
        if (this.form.get('label')!.value !== '' && this.form.get('label')!.value !== null && this.form.get('label')!.value !== undefined) {
          this.task.label = this.taskService.addLabelByName(this.form.get('label')!.value).id
        }
        if (this.form.get('segmentId')!.value !== '' && this.form.get('segmentId')!.value !== null && this.form.get('segmentId')!.value !== undefined) {
          let newSegment: any;
          newSegment = {
            name: this.form.get('segmentId')!.value,
            label: this.task.label,
            elementType: 'segment'
          }
          const segment = (await this.taskService.addTaskByChild(newSegment))
          this.task.segmentId=segment.id;
        }else{
          this.task.segmentId=undefined;
        }
        await this.taskService.addTask(this.task);
      }
      this.refreshTasks.emit();

    } else {
      this.form.markAllAsTouched();
    }
  }

  validateForm() {
    const nameControl = this.form.get('name');
    if (nameControl) {
      // console.log('entro1' + nameControl.touched + nameControl.valid);

      if (nameControl.touched && !nameControl.valid) {
        return true;
      }

    } return false;
  }

  async deleteTaskEmit() {
    console.log('delete task');
    console.log(this.task.id);
    this.closeModal();

    await this.taskService.deleteTask(this.task.id);
    this.refreshTasks.emit();
  }
}



interface Label {
  id: number;
  name: string;
  color: string;
  icon: string;
}

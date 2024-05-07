import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, startWith, map, of } from 'rxjs';
import { TaskServicesService } from 'src/app/services/productivity-hub/task-services.service';
import { Time } from '@angular/common';
import { TimePickerComponent } from '../time-picker/time-picker.component';
import { Task } from 'src/app/services/productivity-hub/task-services.service';
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
  pressLeft: number = 0;
  pressTop: number = 0;
  dontClose: boolean = false;
  dontCloseTraficLight: boolean = false;
  task:Task = {} as Task;

  @Output() refreshTasks = new EventEmitter<any>();

  @ViewChild('taskModal') taskModal!: ElementRef;
  @ViewChild('taskModalDialog') taskModalDialog!: ElementRef;
  @ViewChild(TimePickerComponent) timePicker!: TimePickerComponent;

  sugerencias = ['Sugerencia 1', 'Sugerencia 2', 'Sugerencia 3'];
  // filteredActivities: Observable<Label[]>;
  labels: Label[] = [];
  constructor(private taskService: TaskServicesService, private fb: FormBuilder) {
    this.id = -1;
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      detail: new FormControl(''),
      label: new FormControl(''),
      estimatedTime: new FormControl(0) // Asegúrate que el control '' está definido aquí
    });

    // this.filteredActivities = this.form.get('label')!.valueChanges
    // .pipe(
    //   startWith(''),
    //   map(value => this.filterOptions(value))
    // );
    this.labels = this.filterOptions(this.form.get('label')!.value || '');


  }

  private filterOptions(value: string): Label[] {
    const filterValue = value.toLowerCase();
    const options = this.taskService.getOrderedLabelsPerName();
    console.log(options);

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

  onSearch(): void {
    // Logic to handle live search update
    // this.filteredActivities = of(this.filterOptions(this.form.get('label')!.value));
    this.labels = this.filterOptions(this.form.get('label')!.value || '');

  }

  selectOption(option: Label): void {
    this.showList = false;
    this.form.get('label')!.setValue(option.name);
  }
  deleteActivity(label: Label): void {
    if(this.dontCloseTraficLight){
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
    // Retrasar el cambio de la variable `mostrarLista` por 200 milisegundos (ajustable según necesidades)









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
    this.form.get('label')?.setValue(task.label);
    this.form.get('detail')?.setValue(task.detail);
    this.form.get('estimatedTime')?.setValue(task.estimatedTime);
    this.taskModalP.show();
  }
  closeMenus() {
    this.showList = false;
    this.timePicker.closeTimePicker();
    
  }

  closeModal() {
    this.taskModalP.hide();
    this.modalOpened = false;
  }

  async onSubmit() {
    if (this.form.valid) {
      if(this.id !== -1){
        this.task = {...this.task, ...this.form.value};       
        this.closeModal();
        this.taskService.addLabelByName(this.form.get('label')!.value);
        await this.taskService.saveTask(this.task);

      }else{
        this.closeModal();
        this.taskService.addLabelByName(this.form.get('label')!.value);
        await this.taskService.addTask( this.form.value);
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

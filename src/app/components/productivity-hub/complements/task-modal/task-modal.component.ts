import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-task-modal',
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.css']
})
export class TaskModalComponent implements OnInit {
  declare bootstrap: any;
  modalOpened = false;
  taskModal: any;
  form: FormGroup;
  id: number;
  @Output() addTask = new EventEmitter<any>();
  @Output() deleteTask = new EventEmitter<any>();



  constructor(private fb: FormBuilder) {
    this.id = -1;
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      detail: new FormControl(''),
      estimatedTime: new FormControl(0) // Asegúrate que el control '' está definido aquí
    });
  }


  ngOnInit() {
    const element = document.getElementById('taskModal');
    if (element !== null) {
      this.taskModal = bootstrap.Modal.getOrCreateInstance(element, {
        keyboard: true
      });
      // this.taskModal.show();
    }
  }

  async openModal() {

    this.modalOpened = true;
    this.form.reset();
    this.form.get('estimatedTime')?.setValue(0);
    this.id = -1;
    this.taskModal.show();
  }

  async editModal(index: number, task: any) {
    this.modalOpened = true;
    this.id = index;
    this.form.get('name')?.setValue(task.name);
    this.form.get('detail')?.setValue(task.detail);
    this.form.get('estimatedTime')?.setValue(task.estimatedTime);
    this.taskModal.show();
  }
  closeModal() {
    this.taskModal.hide();
    this.modalOpened = false;
  }

  onSubmit() {
    if (this.form.valid) {
      this.addTask.emit({ task: this.form.value, index: this.id });
      this.closeModal();
    } else {
      console.log('entrosubmit');
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

    deleteTaskEmit() {
      this.deleteTask.emit(this.id);
      this.closeModal();
    }
  }

  interface Task {
    name: string;
    detail: string;
    estimatedTime: number;
    workTime: number;
    restTime: number;
    completed: boolean;
    userStoryId: number;
    pomodoroCounter: number;
    pomodoroQuarterCounter: number;
  }

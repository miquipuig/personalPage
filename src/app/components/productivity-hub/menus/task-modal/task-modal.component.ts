import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';

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
  time: any;
  @Output() addTask = new EventEmitter<any>();
  @Output() deleteTask = new EventEmitter<any>();



  constructor(private fb: FormBuilder) {
    this.id=-1;
    this.form = this.fb.group({
      name: ['', Validators.required],
      detail: [''],
      time: [null]  // Asegúrate que el control 'time' está definido aquí
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
    this.id = -1;
    this.taskModal.show();
  }

  async editModal(index: number, task: any) {
    this.modalOpened = true;
    this.id = index;
    this.form.get('name')?.setValue(task.name);
    this.form.get('detail')?.setValue(task.detail);
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
      this.form.markAllAsTouched();
    }
  }

  validateForm() {
    const nameControl = this.form.get('name');
    if (nameControl) {
      return nameControl.touched && !(nameControl.value);
    }
    return false;
  }

  deleteTaskEmit() {
    this.deleteTask.emit(this.id);
    this.closeModal();
  }
}

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-task-modal',
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.css']
})
export class TaskModalComponent implements OnInit {
  declare bootstrap: any;
  taskModal: any;
  form: FormGroup;
  id:number;
  @Output() addTask = new EventEmitter<any[]>();
  @Output() editTask = new EventEmitter<any[]>();


  constructor() {
    this.id=-1;
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      detail: new FormControl('')
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
    this.form.reset();
    this.taskModal.show();
  }

  async editModal(index:number,task:any){
    this.id=index;
    this.form.get('name')?.setValue(task.name);
    this.form.get('detail')?.setValue(task.detail);
    this.taskModal.show();
  }
  closeModal() {
    this.taskModal.hide();
  }

  onSubmit() {
    if (this.form.valid) {
      if(this.id!==-1){
        this.addTask.emit({id:this.id,task:this.form.value});
        this.id=-1;
      }else{
        this.addTask.emit(this.form.value);

      }
      this.closeModal();
    } else {
      this.form.markAllAsTouched();
    }
  }

  validateForm() {
    const nameControl = this.form.get('name');
    if (nameControl) {
      return nameControl.touched && !(nameControl.value.length > 0);
    }
    return false;
  }
}

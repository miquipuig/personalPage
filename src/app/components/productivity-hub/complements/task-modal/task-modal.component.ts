import { Component, ElementRef, EventEmitter, OnInit, Output,ViewChild } from '@angular/core';
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
  taskModalP: any;
  form: FormGroup;
  id: number;
  pressLeft:number = 0;
  pressTop:number = 0;
  @Output() addTask = new EventEmitter<any>();
  @Output() deleteTask = new EventEmitter<any>();

  @ViewChild('taskModal') taskModal!: ElementRef;
  @ViewChild('taskModalDialog') taskModalDialog!: ElementRef;

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
      this.taskModalP = bootstrap.Modal.getOrCreateInstance(element, {
        keyboard: true
      });
      // element.addEventListener('shown.bs.modal', () => {
      //   this.onModalShown();
      // });
    }
  }
  // onModalShown() {
  //   let rect = this.taskModalDialog.nativeElement.getBoundingClientRect();
  //   console.log(rect);
  // }

  visualEffectAddTask(left:number,top:number) {

    let aproxLeft = window.innerWidth/2 - 250;
    let aproxTop = 55;
    let originX = left-aproxLeft;
    let originY = top-aproxTop;
    this.taskModal.nativeElement.style.setProperty('--modal-originX', `${originX}px`);
    this.taskModal.nativeElement.style.setProperty('--modal-originY', `${originY}px`);
    //print originX and originY
    console.log('originX: ' + originX + ' originY: ' + originY);
    // this.taskModal.nativeElement.style.setProperty('--modal-left', `${left}px`);
    // this.taskModal.nativeElement.style.setProperty('--modal-top', `${top}px`);    

  }

  async openModal(left:number,top:number) {
    this.visualEffectAddTask(left,top);

    this.modalOpened = true;
    // this.onModalShown();
    this.form.reset();
    this.form.get('estimatedTime')?.setValue(0);
    this.id = -1;
    this.taskModalP.show();
  }

  

  async editModal(index: number, task: any, left:number,top:number) {
    this.visualEffectAddTask(left,top);
    this.modalOpened = true;
    // this.onModalShown();

    this.id = index;
    this.form.get('name')?.setValue(task.name);
    this.form.get('detail')?.setValue(task.detail);
    this.form.get('estimatedTime')?.setValue(task.estimatedTime);
    this.taskModalP.show();
  }
  closeModal() {
    this.taskModalP.hide();
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

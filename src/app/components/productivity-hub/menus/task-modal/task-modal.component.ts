import { Component, OnInit } from '@angular/core';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-task-modal',
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.css']
})
export class TaskModalComponent implements OnInit {
declare bootstrap: any;
taskModal: any;


  ngOnInit() {
    console.log("component has been initialized!")
      const element = document.getElementById('taskModal');
      if (element !== null) {
        console.log('Elemento #taskModal encontrado en el DOM.');
          this.taskModal =  bootstrap.Modal.getOrCreateInstance(element, {
              keyboard: true
          });

      } else {
          console.error('Elemento #taskModal no encontrado en el DOM.');
      }  

  
  }

  async openModal() {
    this.taskModal.show();
  }
  closeModal() {
    this.taskModal.hide();
  }
}

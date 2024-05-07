import { Injectable } from '@angular/core';

export interface Label {
  id: number;
  name: string;
  color: string;
  icon: string;
}


export interface Task {
  id: number;
  name: string;
  idPosition: number;
  detail: string;
  label: string;
  estimatedTime: number;
  elapsedTime: number;
  restTime: number;
  completed: boolean;
  userStoryId: number;
  pomodoroCounter: number;
  pomodoroQuarterCounter: number;
}


@Injectable({
  providedIn: 'root'
})
export class TaskServicesService {

  constructor() {
    this.loadLabels();
    this.loadTasks();

  }

  labels: Label[] = [];
  tasks: Task[] = [];
  taskLoaded: boolean = false;

  async loadTasks(): Promise<any> {
    this.taskLoaded = false;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (localStorage.getItem('tasks') !== null && localStorage.getItem('tasks') !== undefined && localStorage.getItem('tasks') !== '[]') {
            this.tasks = JSON.parse(localStorage.getItem('tasks')!);
          }
          this.taskLoaded = true;
          resolve(this.tasks);
        } catch (error) {
          reject([]);
        }
      }, 1000); // Simula un retraso de 1 segundo
    });
  }

  getTaskById(id: number): Task {
    return this.tasks.find(task => task.idPosition === id)!;
  }

  async addTask(task: Task): Promise<any> {
    this.taskLoaded = false;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          //iterate to get the unique id
          let id = 1;
          
          while (this.tasks.find(task => task.id === id) !== undefined) {
            id++;
          }
          task.id = id;
          task.idPosition = this.tasks.length * 100;
          this.tasks.push(task);
          localStorage.setItem('tasks', JSON.stringify(this.tasks));
          this.taskLoaded = true;
          resolve(this.tasks);
        } catch (error) {
          reject(this.tasks);
        }
      }, 1000); // Simula un retraso de 1 segundo
    });
  }

  async saveTask(task: Task): Promise<any> {

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          
          const index = task.id;
          let foundTask = this.tasks.find(t => t.id === index);
          if (foundTask) {
            Object.assign(foundTask, task);
          }
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
          resolve(this.tasks);
        } catch (error) {
          reject(this.tasks);
        }
      }, 1000); // Simula un retraso de 1 segundo
    });
  }

  async deleteTask(id: number): Promise<any> {
    this.taskLoaded = false;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          this.tasks = this.tasks.filter(task => task.id !== id);
          localStorage.setItem('tasks', JSON.stringify(this.tasks));
          this.taskLoaded = true;
          resolve(this.tasks);
        } catch (error) {
          reject(error);
        }
      }, 1000); // Simula un retraso de 1 segundo
    });
  }

  async saveTasks(): Promise<any> {
    this.taskLoaded = false;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          localStorage.setItem('tasks', JSON.stringify(this.tasks));
          this.taskLoaded = true;
          
          resolve('Tasks saved');
        } catch (error) {
          reject(error);
        }
      }, 1000); // Simula un retraso de 1 segundo
    });
  }

  getLabels(): Label[] {
    return this.labels;
  }
  getLabelById(id: number): Label {
    return this.labels.find(label => label.id === id)!;
  }
  addLabel(label: Label): Label {
    if(!(label.name === '' || label.name === null || label.name === undefined)){
      //set de id to the label don't repeat
      let id = 1;
          
          while (this.labels.find(label => label.id === id) !== undefined) {
            id++;
          }
          label.id = id;
      this.labels.push(label);
      this.saveLabels();
    }
    return label;

   
  }
  getOrderedLabelsPerName(): Label[] {
    return this.labels;
    return this.labels.sort((a, b) => a.name.localeCompare(b.name));
  }
  getLabelByName(name: string): Label {
    return this.labels.find(label => label.name === name)!;
  }
  //Add Label by Name if not exists
  addLabelByName(name: string): any {
    if (!this.labels.find(label => label.name === name) && name !== '' && name !== null && name !== undefined) {
      return this.addLabel({ id: this.labels.length + 1, name: name, color: '#FF69B4', icon: 'fa fa-question' });
    }else{
      return this.getLabelByName(name);
    }
  }
  deleteLabel(id: any): void {
    this.labels = this.labels.filter(label => label.id !== id);
    //Update the tasks with the old label
    this.tasks.forEach(task => {
      if (task.label === id) {
        task.label = '';
        this.saveTask(task);
      }
    });
    this.saveLabels();
  }

  saveLabel(label: Label): void {
    if (label.id === undefined) {
      this.addLabel(label);
    } else {
      this.updateLabel(label);
    }
    this.saveLabels();
  }

  updateLabel(label: Label): void {
    const index = this.labels.findIndex(l => l.id === label.id);
    if (index >= 0) {
      this.labels[index] = label;
    }
    this.saveLabels();
  }

  saveLabels(): void {
    localStorage.setItem('labels', JSON.stringify(this.labels));
  }
  loadLabels(): void {
    if (localStorage.getItem('labels') !== null && localStorage.getItem('labels') !== undefined && localStorage.getItem('labels') !== '[]') {
      this.labels = JSON.parse(localStorage.getItem('labels')!);
    } else {
      this.labels = [
        { id: 1, name: 'Personal', color: 'green', icon: 'ri-mail-unread-fill' },
        { id: 2, name: 'Work', color: 'yellow', icon: 'ri-mail-unread-fill' },
        { id: 3, name: 'Study', color: 'blue', icon: 'ri-mail-unread-fill' },
        { id: 4, name: 'Home', color: 'purple', icon: 'ri-mail-unread-fill' },
        { id: 5, name: 'Other', color: 'brown', icon: 'ri-mail-unread-fill' }
      ];
    }
  }


}


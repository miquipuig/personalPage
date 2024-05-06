import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TaskServicesService {

  constructor() {this.loadLabels() }

  labels: Label[] = [];

  getLabels(): Label[] {
    return this.labels;
  }
  getLabelById(id: number): Label {
    return this.labels.find(label => label.id === id)!;
  }
  addLabel(label: Label): void {
    this.labels.push(label);
    this.saveLabels();
  }
  getOrderedLabelsPerName(): Label[] {
    return this.labels.sort((a, b) => a.name.localeCompare(b.name));
  }
  getLabelByName(name: string): Label {
    return this.labels.find(label => label.name === name)!;
  }
  //Add Label by Name if not exists
  addLabelByName(name: string): void {
    if (!this.labels.find(label => label.name === name)) {
      this.addLabel({ id: this.labels.length + 1, name: name, color: '#FF69B4', icon: 'fa fa-question' });
      this.saveLabels();
    }
  }
  deleteLabel(id: number): void {
    this.labels=this.labels.filter(label => label.id !== id);
    this.saveLabels();
  }

  saveLabels(): void {
    localStorage.setItem('labels', JSON.stringify(this.labels));
  }
  loadLabels(): void {
    if (localStorage.getItem('labels') !== null && localStorage.getItem('labels') !== undefined && localStorage.getItem('labels') !== '[]'  ){
      console.log(localStorage.getItem('labels'));
      this.labels = JSON.parse(localStorage.getItem('labels')!);
    }else{
      this.labels = [
        { id: 1, name: 'Personal', color: '#FFD700', icon: 'fa fa-user' },
        { id: 2, name: 'Work', color: '#FF4500', icon: 'fa fa-briefcase' },
        { id: 3, name: 'Study', color: '#4169E1', icon: 'fa fa-book' },
        { id: 4, name: 'Home', color: '#32CD32', icon: 'fa fa-home' },
        { id: 5, name: 'Other', color: '#FF69B4', icon: 'fa fa-question' }
      ];
    }
  }
  

}

interface Label {
  id:number;
  name:string;
  color:string;
  icon:string;
}

interface Task {
  name: string;
  detail: string;
  label: string;
  estimatedTime: number;
  workTime: number;
  restTime: number;
  completed: boolean;
  userStoryId: number;
  pomodoroCounter: number;
  pomodoroQuarterCounter: number;
}


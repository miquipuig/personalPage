import { Injectable } from '@angular/core';
import { TaskServicesService } from './task-services.service';


export interface dayHistory {
  date: number;
  numTasksDone: number;
  elapsedTime: number;
}

@Injectable({
  providedIn: 'root'
})

export class HistoryService {

  history: dayHistory[] = [];
  today: dayHistory = { date: new Date().getDate(), numTasksDone: 0, elapsedTime: 0 };


  constructor(private tks:TaskServicesService) { this.loadHistory() }

  saveHistory() {
    let index = this.history.findIndex(day => day.date === this.today.date);
    if (index === -1) {
      this.history.push(this.today);
    } else {
      this.history[index] = this.today;
    }
    localStorage.setItem('history', JSON.stringify(this.history));
  }

  loadHistory() {
    if (localStorage.getItem('history')) {
      this.history = JSON.parse(localStorage.getItem('history') as string);
    } else {
      this.history = [];
    }
    this.loadToday();

  }
  loadToday() {
    let todayDay: number =new Date().getDate();
    let index = this.history.findIndex(day => day.date === todayDay);

    if (index === -1) {
      this.saveHistory();
      this.today = { date: todayDay, numTasksDone: 0, elapsedTime: 0 };
    } else {
      this.today = this.history[index];
    }
  }

  addTaskDone() {
    this.loadToday();
    this.today.numTasksDone++;
    this.saveHistory();

  }
  subsTaskDone() {
    this.loadToday();

    this.today.numTasksDone--;
    this.saveHistory();
  }

  refreshTasksDone() {
    console.log('refreshTasksDone');
    let todayTasks=0;
    this.tks.tasks.forEach(task => {
      if (task.endDate && new Date(task.endDate).getDate() === this.today.date) {
        todayTasks++;
      }
    });
    this.today.numTasksDone = todayTasks;
    this.saveHistory();
  }


}



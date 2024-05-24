import { Injectable } from '@angular/core';

export interface Clock {
  timerStarted: boolean;
  isPaused: boolean;
  actualTask: number; //index of the task that is being worked on   
  elapsedTime: number; //in seconds, most important variable
  startTime: number; //used to show the time when the timer started
  endTime: number; //used to calculate the time left in the timer
  pomodoroState: string;
  pomodoroQuarterCounter: number;
  pomodoroLimit: number;
  pomodoroCounter: number;
  undoStartTime: number;
  undoElapsedTime: number;
  undoPomodoroState: string;
  undoPomodoroQuarterCounter: number;
  undoPomodoroCounter: number;
  undoTotalTime: number;
  totalTime: number;

}
@Injectable({
  providedIn: 'root'
})
export class LocalService {

  constructor() { }

  
}

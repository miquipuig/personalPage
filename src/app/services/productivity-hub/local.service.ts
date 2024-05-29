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
  isSectionActive: boolean;
  filteredLabel:number;
  filteredSegment:number;
  filteredAllTasks: boolean;
  filteredAllSegments: boolean;
  filteredAllSimpleTasks:boolean;
  orderedView:boolean;

}
@Injectable({
  providedIn: 'root'
})
export class LocalService {

  clock: Clock = {
    timerStarted: false,
    isPaused: false,
    actualTask: -1,
    elapsedTime: 0,
    startTime: 0,
    endTime: 0,
    pomodoroState: 'work',
    pomodoroQuarterCounter: 0,
    pomodoroLimit: 4,
    pomodoroCounter: 0,
    undoStartTime: 0,
    undoElapsedTime: 0,
    undoPomodoroState: 'work',
    undoPomodoroQuarterCounter: 0,
    undoPomodoroCounter: 0,
    undoTotalTime: 0,
    totalTime: 0, // Total time in seconds for a full cycle
    isSectionActive: false,
    filteredLabel: -1,
    filteredSegment: -1,
    filteredAllTasks: false,
    filteredAllSegments: false,
    filteredAllSimpleTasks: false,
    orderedView: false
    
  };
  interval: any;
  resumeTimerSync: boolean = false;
  constructor() { }

  loadClock() {
    if (localStorage.getItem('clock')) {

      let clock = JSON.parse(localStorage.getItem('clock') as string || '{}');
      this.clock = this.validateClock(clock);
    }

  }

  validateClock(clock: any): Clock {
    return {
      timerStarted: typeof clock.timerStarted === 'boolean' ? clock.timerStarted : false,
      isPaused: typeof clock.isPaused === 'boolean' ? clock.isPaused : false,
      actualTask: typeof clock.actualTask === 'number' ? clock.actualAask : -1,
      elapsedTime: typeof clock.elapsedTime === 'number' ? clock.elapsedTime : 0,
      startTime: typeof clock.startTime === 'number' ? clock.startTime : 0,
      endTime: typeof clock.endTime === 'number' ? clock.endTime : 0,
      pomodoroState: typeof clock.pomodoroState === 'string' ? clock.pomodoroState : 'work',
      pomodoroQuarterCounter: typeof clock.pomodoroQuarterCounter === 'number' ? clock.pomodoroQuarterCounter : 0,
      pomodoroLimit: typeof clock.pomodoroLimit === 'number' ? clock.pomodoroLimit : 4,
      pomodoroCounter: typeof clock.pomodoroCounter === 'number' ? clock.pomodoroCounter : 0,
      undoStartTime: typeof clock.undoStartTime === 'number' ? clock.undoStartTime : 0,
      undoElapsedTime: typeof clock.undoElapsedTime === 'number' ? clock.undoElapsedTime : 0,
      undoPomodoroState: typeof clock.undoPomodoroState === 'string' ? clock.undoPomodoroState : 'work',
      undoPomodoroQuarterCounter: typeof clock.undoPomodoroQuarterCounter === 'number' ? clock.undoPomodoroQuarterCounter : 0,
      undoPomodoroCounter: typeof clock.undoPomodoroCounter === 'number' ? clock.undoPomodoroCounter : 0,
      undoTotalTime: typeof clock.undoTotalTime === 'number' ? clock.undoTotalTime : 0,
      totalTime: typeof clock.totalTime === 'number' ? clock.totalTime : 0,
      isSectionActive: typeof clock.isSectionActive === 'boolean' ? clock.isSectionActive : false,
      filteredLabel: typeof clock.filteredLabel === 'number' ? clock.filteredLabel : -1,
      filteredSegment: typeof clock.filteredSegment === 'number' ? clock.filteredSegment : -1,
      filteredAllTasks: typeof clock.filteredAllTasks === 'boolean' ? clock.filteredAllTasks : false,
      filteredAllSegments: typeof clock.filteredAllSegments === 'boolean' ? clock.filteredAllSegments : false,
      filteredAllSimpleTasks: typeof clock.filteredAllSimpleTasks === 'boolean' ? clock.filteredAllSimpleTasks : false,
      orderedView: typeof clock.orderedView === 'boolean' ? clock.orderedView : false
    };
  }

  saveClock() {
    localStorage.setItem('clock', JSON.stringify(this.clock));
  }

  
}

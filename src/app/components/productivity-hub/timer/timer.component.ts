import { Component } from '@angular/core';
import { LocalService } from 'src/app/services/productivity-hub/local.service';
import { TaskServicesService } from 'src/app/services/productivity-hub/task-services.service';
import { Task } from 'src/app/services/productivity-hub/task-services.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
export class TimerComponent {

  constructor(public local: LocalService, public tks:TaskServicesService) { }


  taskStartTime = 0;
  segmentStartTime = 0;
  referenceWorkTime = 1500; // 25 minutes Work
  referenceShortBreakTime = 300;  // 5 minutes Break
  referenceLongBreakTime = 900; // 15 minutes Break
  audio = new Audio();

  ngOnInit() {
    this.totalTimeAssingment(this.local.clock.pomodoroState);
    this.preloadSounds();
  }

  private sounds: { [key: string]: HTMLAudioElement } = {}; 
  private preloadSounds() {
    const soundFiles = ['bell01', 'happyBell', 'ticking']; // Lista de tus archivos de sonido
    soundFiles.forEach(sound => {
      const audio = new Audio();
      audio.src = `assets/productivity/sounds/${sound}.mp3`;
      audio.load();
      this.sounds[sound] = audio;
    });
  }

  

  playSound(soundName:string) {
    const audio = this.sounds[soundName];
    if (audio) {
      audio.play();
    } else {
      console.error(`Sonido no encontrado: ${soundName}`);
    }
  }
  changePomodoroState(pomodoroState: string, undoElapsedTime: number = 0): void {
    //carga de los tiempos de referencia
    this.totalTimeAssingment(pomodoroState);

    if (pomodoroState !== this.local.clock.pomodoroState) {

      this.local.clock.undoStartTime = this.local.clock.startTime;
      this.local.clock.undoElapsedTime = this.local.clock.elapsedTime;
      this.local.clock.undoPomodoroState = this.local.clock.pomodoroState;

      this.local.clock.pomodoroState = pomodoroState;
      clearInterval(this.local.interval);
      if (undoElapsedTime > 0) {

        this.local.clock.elapsedTime = undoElapsedTime;
      } else {
        this.local.clock.elapsedTime = 0;
      }
      if (!this.local.clock.isPaused) {
        this.startTimer();
      }
    }
    this.saveClock();
  }

  totalTimeAssingment(pomodoroState: string) {
    if (pomodoroState === 'work') {
      this.local.clock.totalTime = this.referenceWorkTime;
    } else if (pomodoroState === 'shortBreak') {
      this.local.clock.totalTime = this.referenceShortBreakTime;
    } else if (pomodoroState === 'longBreak') {
      this.local.clock.totalTime = this.referenceLongBreakTime;
    }

  }
  nextPomodoroState() {
    this.local.clock.timerStarted = false;
    clearInterval(this.local.interval);
    this.local.clock.undoPomodoroQuarterCounter = this.local.clock.pomodoroQuarterCounter;
    this.local.clock.undoPomodoroCounter = this.local.clock.pomodoroCounter;
    if (this.local.clock.pomodoroState === 'work') {
      if (this.local.clock.pomodoroQuarterCounter >= this.local.clock.pomodoroLimit - 1) {
        this.changePomodoroState('longBreak');
      } else {
        this.changePomodoroState('shortBreak');
      }
    } else if (this.local.clock.pomodoroState === 'shortBreak' || this.local.clock.pomodoroState === 'longBreak') {
      if (this.local.clock.pomodoroQuarterCounter >= this.local.clock.pomodoroLimit - 1) {
        this.local.clock.pomodoroCounter++;
        this.local.clock.pomodoroQuarterCounter = 0;
      } else {
        this.local.clock.pomodoroQuarterCounter++;
      }
      this.changePomodoroState('work');
    }
    this.saveClock();

  }
  startTimer() {
    //primera vez que se inicia el timer
    if (!(this.local.clock.isPaused && this.local.clock.elapsedTime > 0)) {
      this.local.clock.startTime = Date.now();
    }
    this.local.clock.endTime = Date.now() + this.local.clock.totalTime * 1000 - this.local.clock.elapsedTime * 1000;
    this.local.clock.isPaused = false;
    this.local.clock.timerStarted = true;
    this.local.resumeTimerSync = true;
    this.saveClock();

  }
  undoPomodoro() {
    clearInterval(this.local.interval);
    if (this.local.clock.undoStartTime > 0) {

      const quarterCounter = this.local.clock.pomodoroQuarterCounter;
      const counter = this.local.clock.pomodoroCounter;

      if (this.local.clock.undoElapsedTime >= this.local.clock.undoTotalTime) {
        this.local.clock.undoElapsedTime = 0;
      }

      this.local.clock.startTime = this.local.clock.undoStartTime;

      this.local.clock.pomodoroQuarterCounter = this.local.clock.undoPomodoroQuarterCounter;
      this.local.clock.pomodoroCounter = this.local.clock.undoPomodoroCounter;
      this.local.clock.undoPomodoroCounter = counter;
      this.local.clock.undoTotalTime = this.local.clock.totalTime;
      this.local.clock.undoPomodoroQuarterCounter = quarterCounter;
      this.changePomodoroState(this.local.clock.undoPomodoroState, this.local.clock.undoElapsedTime);
    }

  }

  saveClock() {
    let clock = { ...this.local.clock };
    clock.timerStarted = false;
    clock.isPaused = true;
    localStorage.setItem('clock', JSON.stringify(clock));
  }


  getTimeLeft() {
    return (this.local.clock.totalTime - this.local.clock.elapsedTime);
  }

  getPercentage() {
    return (Math.floor(this.local.clock.elapsedTime / this.local.clock.totalTime * 100));
  }

  pauseTimer() {
    clearInterval(this.local.interval);
    this.local.clock.timerStarted = false;
    this.local.clock.isPaused = true;
    this.saveClock();
  }
  resumeTimer() {
    const timerStart = Date.now() - this.local.clock.elapsedTime * 1000;
    const actualTask = this.tks.tasks.find(task => task.id === this.local.clock.actualTask);
    let segment: Task | undefined;
    this.playSound('ticking');

    if (actualTask) {
      if (actualTask.elapsedTime > 0) {
        this.taskStartTime = Date.now() - actualTask.elapsedTime * 1000;
      } else {
        this.taskStartTime = Date.now();
      }
      if (actualTask.segmentId) {
        segment = this.tks.getTaskById(actualTask.segmentId);
        if (segment.elapsedTime > 0) {
          this.segmentStartTime = Date.now() - segment.elapsedTime * 1000;
        } else {
          this.segmentStartTime = Date.now();
        }
      }
    }

    let counter = 0;
    this.local.interval = setInterval(() => {
      this.local.clock.elapsedTime = Math.floor((Date.now() - timerStart) / 1000);
      if (actualTask && this.local.clock.pomodoroState === 'work') {
        actualTask.elapsedTime = Math.floor((Date.now() - this.taskStartTime) / 1000);
      }
      if (segment && this.local.clock.pomodoroState === 'work') {
        segment.elapsedTime = Math.floor((Date.now() - this.segmentStartTime) / 1000);
      }
      if (this.local.clock.elapsedTime >= this.local.clock.totalTime) {
        // Pomodoro finished
        this.local.clock.elapsedTime = 0;
        this.local.clock.isPaused = false;
        this.local.clock.timerStarted = false;
        clearInterval(this.local.interval);
        if (this.local.clock.pomodoroState === 'work') {
          this.playSound('happyBell');
        }else
        {
          this.playSound('bell01');
        }
        this.nextPomodoroState();
      }
      counter++;
      if (counter % 30 === 0 && actualTask) {
        this.tks.saveTask(actualTask);
      }
      this.saveClock();
    }, 1000);
  }
}

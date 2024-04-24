import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, Renderer2, ViewChild } from '@angular/core';
import { timer } from 'rxjs';
import { TaskModalComponent } from './menus/task-modal/task-modal.component';

@Component({
  selector: 'app-productivity-hub',
  templateUrl: './productivity-hub.component.html',
  styleUrls: ['./productivity-hub.component.css']
})
export class ProductivityHubComponent implements AfterViewInit {

  @ViewChild('hourHand') hourHand!: ElementRef;
  @ViewChild('minuteHand') minuteHand!: ElementRef;
  @ViewChild('secondHand') secondHand!: ElementRef;
  @ViewChild('dateDisplay') dateDisplay!: ElementRef;
  @ViewChild('colRef') colRef!: ElementRef;

  @ViewChild(TaskModalComponent) childComponent!: TaskModalComponent;

  isSectionActive = false;

  constructor(private renderer: Renderer2, private cdRef: ChangeDetectorRef) {
    this.time = new Date();
    this.time.setHours(12, 0, 0, 0);

  }

  pomodoro = true;
  ngOnInit() {
    window.addEventListener('resize', this.updateDimensions.bind(this));
    // temporizador que se espera 0.5 segundos y setea la variable isSectionActive a true``
    setTimeout(() => {
      this.isSectionActive = true;
    }, 50);

    this.changePomodoroState("work");

    this.startClock();
    this.tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

  }
  updateDimensions() {
    const width = this.colRef.nativeElement.offsetWidth;
    // const centerHeight = this.colRef.nativeElement.offsetHeight / 2 + 0.15 * this.colRef.nativeElement.offsetHeight;
    const centerHeight = this.colRef.nativeElement.offsetHeight / 2 + 0.15 * this.colRef.nativeElement.offsetHeight;

    const radius = width * 0.23;
    const pointWide = radius * 0.07;
    //  const pointWide = radius * 0.00;
    const centerWide = radius * 0.13;
    const handWide = radius * 0.05;
    const secondWide = radius * 0.03;

    this.colRef.nativeElement.style.setProperty('--pomodoro-width', `${width}px`);
    this.colRef.nativeElement.style.setProperty('--pomodoro-centerHeight', `${centerHeight}px`);
    this.colRef.nativeElement.style.setProperty('--pomodoro-radius', `${radius}px`);
    this.colRef.nativeElement.style.setProperty('--pomodoro-centerWide', `${centerWide}px`);
    this.colRef.nativeElement.style.setProperty('--pomodoro-pointWide', `${pointWide}px`);
    this.colRef.nativeElement.style.setProperty('--pomodoro-handWide', `${handWide}px`);
    this.colRef.nativeElement.style.setProperty('--pomodoro-secondWide', `${secondWide}px`);
  }
  ngAfterViewInit() {
    this.updateDimensions();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  //interficie de tarea
  tasks: Task[] = [];
  time: Date;

  interval: any; //object that will hold the interval
  clockInterval: any; //object that will hold the interval
  resumeTimerSync = false;


  referenceWorkTime = 1500; // 25 minutes Work
  referenceShortBreakTime = 300;  // 5 minutes Break
  referenceLongBreakTime = 900; // 15 minutes Break
  totalTime = 0;  // Total time in seconds for a full cycle

  timerStarted = false;
  isPaused = false; // Timer is paused

  elapsedTime = 0;

  // Time left in the cycle, only used to display the time


  stopTime = 0; // Time when the timer was paused, only used to display the time
  startTime = 0; // Time when the timer was started, only used to display the time
  endTime = 0; // Time when the timer should end , only used to display the time

  pomodoroState = 'work'; // work, shortBreak, longBreak
  pomodoroQuarterCounter = 0;  // 0, 1, 2, 3
  pomodoroLimit = 4; // 4 pomodoros before long break
  pomodoroCounter = 0; // Full pomodoro Cicle counter

  //Undo memory
  undoStartTime = 0;
  undoStopTime = 0;
  undoElapsedTime = 0;
  undoPomodoroState: string = 'work';
  undoPomodoroQuarterCounter = 0;
  undoPomodoroCounter = 0;
  undoTotalTime = 0;
  //Not used
  // getHandTransformAAAAAAAAA() {
  //   const degreesPerSecond = 360 / this.totalTime;
  //   const angle = this.elapsedTime * degreesPerSecond;
  //   return `rotate(${angle}deg)`;
  // }

  startClock() {

    const interval = setInterval(() => {
      const currentTime = new Date();
      // Añade un segundo cada 50 milisegundos
      this.time = new Date(this.time.getTime() + 60000);
      //obtener los segundos
      if (currentTime.getSeconds() > this.time.getSeconds()) {

        this.time.setMilliseconds(this.time.getMilliseconds() + 250);
      }
      this.updateClock(this.time);
      // Compara si la hora y minutos del tiempo simulado son iguales a la hora y minutos actuales
      if (this.time.getHours() >= currentTime.getHours() && this.time.getMinutes() >= currentTime.getMinutes()) {
        this.clockTimer(); // Vuelve a llamar a la función para actualizar el reloj
        clearInterval(interval); // Detiene el intervalo una vez alcanzada la hora actual

      }
    }, 5);
  }
  updateClock(date: Date) {
    const seconds = date.getSeconds() * 6; // 360/60
    const minutes = date.getMinutes() * 6; // 360/60
    const hours = (date.getHours() % 12) * 30 + minutes / 12; // 360/12
    const dateString = date.getDate();

    if (this.secondHand && this.secondHand.nativeElement) {
      this.secondHand.nativeElement.style.transform = `rotate(${seconds}deg)`;
    }
    if (this.minuteHand && this.minuteHand.nativeElement) {
      this.minuteHand.nativeElement.style.transform = `rotate(${minutes}deg)`;
    }
    if (this.hourHand && this.hourHand.nativeElement) {
      this.hourHand.nativeElement.style.transform = `rotate(${hours}deg)`;
    }
    if (this.dateDisplay && this.dateDisplay.nativeElement) {
      this.dateDisplay.nativeElement.innerHTML = dateString;
    }
  }

  startTimer() {
    if (!(this.isPaused && this.elapsedTime > 0)) {
      this.startTime = Date.now();

    }

    this.endTime = Date.now() + this.totalTime * 1000 - this.elapsedTime * 1000;
    this.isPaused = false;
    this.timerStarted = true;
    this.resumeTimerSync = true;
  }


  pauseTimer() {
    clearInterval(this.interval);
    this.timerStarted = false;
    this.isPaused = true;
  }

  clockTimer() {
    this.clockInterval = setInterval(() => {
      if (this.resumeTimerSync) {
        this, this.resumeTimerSync = false;
        this.resumeTimer();
      }
      this.updateClock(new Date());
    }, 1000);
  }

  resumeTimer() {
    const timerStart = Date.now() - this.elapsedTime * 1000;
    this.interval = setInterval(() => {
      this.elapsedTime = Math.floor((Date.now() - timerStart) / 1000);
      if (this.elapsedTime >= this.totalTime) {
        // Pomodoro finished
        this.elapsedTime = 0;
        this.isPaused = false;
        this.timerStarted = false;
        clearInterval(this.interval);
        this.nextPomodoroState();
      }
    }, 1000);
  }

  nextPomodoroState() {
    this.timerStarted = false;
    clearInterval(this.interval);
    this.undoPomodoroQuarterCounter = this.pomodoroQuarterCounter;
    this.undoPomodoroCounter = this.pomodoroCounter;
    if (this.pomodoroState === 'work') {
      if (this.pomodoroQuarterCounter >= this.pomodoroLimit - 1) {
        this.changePomodoroState('longBreak');
      } else {
        this.changePomodoroState('shortBreak');
      }
    } else if (this.pomodoroState === 'shortBreak' || this.pomodoroState === 'longBreak') {
      if (this.pomodoroQuarterCounter >= this.pomodoroLimit - 1) {
        this.pomodoroCounter++;
        this.pomodoroQuarterCounter = 0;
      } else {
        this.pomodoroQuarterCounter++;
      }
      this.changePomodoroState('work');
    }
  }

  changePomodoroState(pomodoroState: string, undoElapsedTime: number = 0): void {
    //carga de los tiempos de referencia
    if (pomodoroState === 'work') {
      this.totalTime = this.referenceWorkTime;
    } else if (pomodoroState === 'shortBreak') {
      this.totalTime = this.referenceShortBreakTime;
    } else if (pomodoroState === 'longBreak') {
      this.totalTime = this.referenceLongBreakTime;
    }

    if (pomodoroState !== this.pomodoroState) {

      // if (this.elapsedTime < this.totalTime ) {

      this.undoStartTime = this.startTime;
      this.undoStopTime = this.stopTime;
      this.undoElapsedTime = this.elapsedTime;
      this.undoPomodoroState = this.pomodoroState;

      this.pomodoroState = pomodoroState;
      clearInterval(this.interval);
      if (undoElapsedTime > 0) {

        this.elapsedTime = undoElapsedTime;
      } else {
        this.elapsedTime = 0;
      }
      if (!this.isPaused) {
        this.startTimer();
      }
    }
  }

  undoPomodoro() {
    clearInterval(this.interval);
    if (this.undoStartTime > 0) {

      const quarterCounter = this.pomodoroQuarterCounter;
      const counter = this.pomodoroCounter;

      if (this.undoElapsedTime >= this.undoTotalTime) {
        this.undoElapsedTime = 0;
      }

      this.startTime = this.undoStartTime;
      this.stopTime = this.undoStopTime;

      this.pomodoroQuarterCounter = this.undoPomodoroQuarterCounter;
      this.pomodoroCounter = this.undoPomodoroCounter;
      this.undoPomodoroCounter = counter;
      this.undoTotalTime = this.totalTime;
      this.undoPomodoroQuarterCounter = quarterCounter;
      this.changePomodoroState(this.undoPomodoroState, this.undoElapsedTime);
    }

  }

  getTimeLeft() {
    return (this.totalTime - this.elapsedTime);
  }

  getPercentage() {
    return (Math.floor(this.elapsedTime / this.totalTime * 100));
  }

  newTask() {

    this.childComponent.openModal();
  }

  editTask(index: number) {
    console.log(index);
    this.childComponent.openModal();
  }
  addTask(event: any, index: number) {
    if(index === -1){
      this.tasks.push(event);
    }else{
      this.tasks[index] = event;
    }
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
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

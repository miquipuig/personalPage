import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, Renderer2, ViewChild } from '@angular/core';
import { timer } from 'rxjs';
import { TaskModalComponent } from './complements/task-modal/task-modal.component';

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

    

    this.loadClock();
    this.startClock();
    this.totalTimeAssingment(this.clock.pomodoroState);
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
    totalTime: 0  // Total time in seconds for a full cycle
  };
  time: Date;

  interval: any; //object that will hold the interval
  clockInterval: any; //object that will hold the interval
  resumeTimerSync = false;


  referenceWorkTime = 1500; // 25 minutes Work
  referenceShortBreakTime = 300;  // 5 minutes Break
  referenceLongBreakTime = 900; // 15 minutes Break



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
    //primera vez que se inicia el timer
    if (!(this.clock.isPaused && this.clock.elapsedTime > 0)) {
      this.clock.startTime = Date.now();
    }
    this.clock.endTime = Date.now() + this.clock.totalTime * 1000 - this.clock.elapsedTime * 1000;
    this.clock.isPaused = false;
    this.clock.timerStarted = true;
    this.resumeTimerSync = true;
    this.saveClock();

  }


  pauseTimer() {
    console.log('pauseTimer');
    clearInterval(this.interval);
    this.clock.timerStarted = false;
    this.clock.isPaused = true;
    this.saveClock();
  }

  clockTimer() {
    this.clockInterval = setInterval(() => {
      if (this.resumeTimerSync) {
        this.resumeTimerSync = false;
        this.resumeTimer();
      }
      this.updateClock(new Date());
    }, 1000);
  }
  //core function
  resumeTimer() {
    const timerStart = Date.now() - this.clock.elapsedTime * 1000;
    this.interval = setInterval(() => {
      this.clock.elapsedTime = Math.floor((Date.now() - timerStart) / 1000);
      if (this.clock.elapsedTime >= this.clock.totalTime) {
        // Pomodoro finished
        this.clock.elapsedTime = 0;
        this.clock.isPaused = false;
        this.clock.timerStarted = false;
        clearInterval(this.interval);
        this.nextPomodoroState();
      }
      this.saveClock();
    }, 1000);
  }

  nextPomodoroState() {
    this.clock.timerStarted = false;
    clearInterval(this.interval);
    this.clock.undoPomodoroQuarterCounter = this.clock.pomodoroQuarterCounter;
    this.clock.undoPomodoroCounter = this.clock.pomodoroCounter;
    if (this.clock.pomodoroState === 'work') {
      if (this.clock.pomodoroQuarterCounter >= this.clock.pomodoroLimit - 1) {
        this.changePomodoroState('longBreak');
      } else {
        this.changePomodoroState('shortBreak');
      }
    } else if (this.clock.pomodoroState === 'shortBreak' || this.clock.pomodoroState === 'longBreak') {
      if (this.clock.pomodoroQuarterCounter >= this.clock.pomodoroLimit - 1) {
        this.clock.pomodoroCounter++;
        this.clock.pomodoroQuarterCounter = 0;
      } else {
        this.clock.pomodoroQuarterCounter++;
      }
      this.changePomodoroState('work');
    }
    this.saveClock()

  }

  totalTimeAssingment(pomodoroState: string) {
    if (pomodoroState === 'work') {
      this.clock.totalTime = this.referenceWorkTime;
    } else if (pomodoroState === 'shortBreak') {
      this.clock.totalTime = this.referenceShortBreakTime;
    } else if (pomodoroState === 'longBreak') {
      this.clock.totalTime = this.referenceLongBreakTime;
    }
    
  }

  changePomodoroState(pomodoroState: string, undoElapsedTime: number = 0): void {
    //carga de los tiempos de referencia
    this.totalTimeAssingment(pomodoroState);

    if (pomodoroState !== this.clock.pomodoroState) {
      console.log('pomodoroState', pomodoroState);

      // if (this.elapsedTime < this.clock.totalTime ) {

      this.clock.undoStartTime = this.clock.startTime;
      this.clock.undoElapsedTime = this.clock.elapsedTime;
      this.clock.undoPomodoroState = this.clock.pomodoroState;

      this.clock.pomodoroState = pomodoroState;
      clearInterval(this.interval);
      if (undoElapsedTime > 0) {

        this.clock.elapsedTime = undoElapsedTime;
      } else {
        this.clock.elapsedTime = 0;
      }
      if (!this.clock.isPaused) {
        this.startTimer();
      }
    }
    this.saveClock();
  }

  undoPomodoro() {
    clearInterval(this.interval);
    if (this.clock.undoStartTime > 0) {

      const quarterCounter = this.clock.pomodoroQuarterCounter;
      const counter = this.clock.pomodoroCounter;

      if (this.clock.undoElapsedTime >= this.clock.undoTotalTime) {
        this.clock.undoElapsedTime = 0;
      }

      this.clock.startTime = this.clock.undoStartTime;

      this.clock.pomodoroQuarterCounter = this.clock.undoPomodoroQuarterCounter;
      this.clock.pomodoroCounter = this.clock.undoPomodoroCounter;
      this.clock.undoPomodoroCounter = counter;
      this.clock.undoTotalTime = this.clock.totalTime;
      this.clock.undoPomodoroQuarterCounter = quarterCounter;
      this.changePomodoroState(this.clock.undoPomodoroState, this.clock.undoElapsedTime);
    }

  }

  getTimeLeft() {
    return (this.clock.totalTime - this.clock.elapsedTime);
  }

  getPercentage() {
    return (Math.floor(this.clock.elapsedTime / this.clock.totalTime * 100));
  }

  newTask() {

    this.childComponent.openModal();
  }

  editTask(index: number) {
    this.childComponent.editModal(index, this.tasks[index]);
  }
  addTask(event: any) {

    if (event.index === -1) {
      this.tasks.push(event.task);
    } else {
      this.tasks[event.index] = event.task
    }
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  deleteTask(index: number) {
    this.tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  taskTimePercentage(index: number): number {
    if (this.tasks[index].estimatedTime > 0 && this.tasks[index].workTime > 0) {
      return this.tasks[index].workTime / this.tasks[index].estimatedTime * 100;
    }
    return 0;
  }
  activeTask(index: number): void {
    if (this.clock.actualTask === index) {
      this.clock.actualTask = -1;
    } else {
      this.clock.actualTask = index;
    }
    this.saveClock();
  }

  saveClock() {
    console.log('saveClock');
    
    let clock = {...this.clock};
    console.log(clock);
    clock.timerStarted = false;
    clock.isPaused = true;
    localStorage.setItem('clock', JSON.stringify(clock));
  }

  loadClock() {
    if (localStorage.getItem('clock')){
    
      let clock = JSON.parse(localStorage.getItem('clock') as string || '{}');
      console.log(clock);
      this.clock = this.validateClock(clock);
    }


  }

  validateClock(clock: any): Clock {
    return {
      timerStarted: typeof clock.timerStarted === 'boolean' ? clock.timerStarted : false,
      isPaused: typeof clock.isPaused === 'boolean' ? clock.isPaused : false,
      actualTask: typeof clock.actualTask === 'number' ? clock.actualTask : -1,
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
      totalTime: typeof clock.totalTime === 'number' ? clock.totalTime : 0
    };
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

interface Clock {
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

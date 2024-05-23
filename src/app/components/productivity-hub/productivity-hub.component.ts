import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Output, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { timer } from 'rxjs';
import { TaskModalComponent } from './complements/task-modal/task-modal.component';
import { TaskServicesService } from 'src/app/services/productivity-hub/task-services.service';
import { Label } from 'src/app/services/productivity-hub/task-services.service';
import { Task } from 'src/app/services/productivity-hub/task-services.service';
import { CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragMove, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { State } from 'src/app/services/productivity-hub/task-services.service';

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
  @ViewChild('newTaskButton') newTaskButton!: ElementRef;
  @ViewChildren('editTaskButton') editTaskButton!: QueryList<ElementRef>;


  @ViewChild(TaskModalComponent) childComponent!: TaskModalComponent;


  isSectionActive = false;
  filteredLabel = -1;
  filteredSegment = -1;
  filteredAllTasks = false;
  filteredAllSegments = false;
  orderedView = true;
  searchInput = '';
  dragOverIndex: number | null = null;
  hoverIndex: number = -1;
  labelsAnimated = true;
  stateFilterMenu = false
  stateFilterMenuAll = false
  states: State[] = [];
  dropListDisabled = false;

  items = [
    { name: 'No', disabled: true },
    { name: 'Role' },
    { name: ' Creation Time' },
    { name: 'Completion Time' },
    {
      name: 'Process1',
    },
    {
      name: 'Process2',
    },
    {
      name: 'Process3',
    },
    {
      name: 'Process4',
    },
    {
      name: 'Process5',
    },
    {
      name: 'Process6',
    },
    {
      name: 'Process7',
    },
  ];
  childs = [
    { name: 'No', disabled: true },
    { name: 'Role' },
    { name: ' Creation Time' },
    { name: 'Completion Time' }
  ];

  constructor(private cdr: ChangeDetectorRef, private renderer: Renderer2, public taskService: TaskServicesService) {
    this.time = new Date();
    this.time.setHours(12, 0, 0, 0);
  }
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const clickedInside = (event.target as HTMLElement).closest('.filterList');
    if (!clickedInside) {
      this.stateFilterMenu = false;
    }
  }


  pomodoro = true;
  selectedTask = -1;

  ngOnInit() {
    window.addEventListener('resize', this.updateDimensions.bind(this));
    // temporizador que se espera 0.5 segundos y setea la variable isSectionActive a true``
    setTimeout(() => {
      this.isSectionActive = true;
    }, 50);
    this.labels = this.taskService.getLabels();

    this.loadStates();
    this.loadTasks();

    this.loadClock();
    this.startClock();
    this.totalTimeAssingment(this.clock.pomodoroState);
  }

  async refreshTasks() {
    this.labelsAnimated = true;
    //ordenar las tareas por idPosition
    // this.tasks = [...this.taskService.tasks];
    this.filterSearch();
  }
  async loadTasks() {
    await this.taskService.loadTasks();

    this.refreshTasks();
  }
  async loadStates() {
    this.states = this.taskService.states;
  }
  loadFilteredTasksByLabel(labelId: any) {

    this.filteredLabel = labelId;
    this.filterSearch();
  }
  async onStateChange(event: Event, task: Task) {
    const selectedStateId = parseInt((event.target as HTMLSelectElement).value);
    task.state = selectedStateId;
    await this.taskService.saveTask(task);
    this.filterSearch();

    // this.refreshTasks();
    // Lógica adicional que quieres ejecutar al cambiar la selección
  }

  loadUnfilteredTasksByLabel() {
    this.filteredLabel = -1;
    this.filterSearch();
  }

  loadFilteredTasksBySegment(segmentId: any) {
    this.filteredSegment = segmentId;
    this.filterSearch();
  }

  loadUnfilteredTasksBySegment() {
    this.filteredSegment = -1;
    this.filterSearch();
  }

  async stateFilter(state: State) {

    state.visibilityTaskList = !state.visibilityTaskList;
    this.checkStateAllFilter();

    this.states = await (this.taskService.saveState(state));

    this.filterSearch();
  }

  asyncStateFilterAll() {
    //si todos los estados estan visibles, se ocultan

    if (this.states.every(state => state.visibilityTaskList)) {
      this.states.forEach(state => {
        state.visibilityTaskList = false;
      });
    } else {
      this.states.forEach(state => {
        state.visibilityTaskList = true;
      });
    }
    this.checkStateAllFilter();

    this.filterSearch();
  }

  checkStateAllFilter() {
    //si todos los estados estan visibles, se ocultan
    if (this.states.every(state => state.visibilityTaskList)) {
      this.stateFilterMenuAll = true;
    } else {
      this.stateFilterMenuAll = false;
    }
  }
  getTasksBySegment(segmentId: number): Task[] {
    return this.taskService.tasks.filter(task => task.segmentId === segmentId).sort((a, b) => a.idPosition - b.idPosition);;
  }

  filterSearch(): void {

    let tasks: Task[] = [];
    tasks = [...this.taskService.tasks];
    tasks = tasks.sort((a, b) => a.idPosition - b.idPosition);
    if (this.states.length > 0) {
      tasks = tasks.filter(task => this.states.find(state => state.id === task.state)?.visibilityTaskList);
    }
    console.log(tasks);


    if (this.orderedView) {
      this.filteredAllSegments = false;
      //filtrar todos los segmentos y solo las tareas que no tengan asignado un segmento
      if (!this.filteredAllTasks) {
        tasks = tasks.filter(task => task.elementType === 'task' && (task.segmentId === undefined || task.segmentId === null || task.segmentId <= 0) || task.elementType === 'segment');
      } else {
        tasks = tasks.filter(task => task.elementType === 'segment');
      }
    } else {



      if (this.filteredAllSegments || this.filteredAllTasks) {
        console.log('paso2');
        console.log('filteredAllSegments:', this.filteredAllSegments);
        console.log('filteredAllTasks:', this.filteredAllTasks);
        tasks = tasks.filter(task => {

          if (this.filteredAllSegments && task.elementType == 'segment') {
            return false;
          }
          if (this.filteredAllTasks && task.elementType == 'task') {
            return false;
          }
          return true;
        });
      }

      if (this.filteredLabel !== -1) {
        tasks = tasks.filter(task => task.label === this.filteredLabel);
      }
      if (this.filteredSegment !== -1) {
        tasks = tasks.filter(task => task.segmentId === this.filteredSegment || task.id === this.filteredSegment);
      }
      if (this.searchInput !== '') {
        tasks = tasks.filter(task =>
          task.name.toLowerCase().includes(this.searchInput.toLowerCase()) ||
          (task.detail && task.detail.toLowerCase().includes(this.searchInput.toLowerCase()))
        );
      }
    }

    this.tasks = tasks;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
  }

  onDragStarted(event: any) {

    this.labelsAnimated = false;
  }
  onDragEnded(event: any) {
    this.clock.actualTask = this.selectedTask;
  }
  // onDragMoved(event: CdkDragMove<any>, index: number) {
  //   let currentIndex = index;
  //   let hoveringOverIndex = this.getHoveringIndex(event.pointerPosition.y, event.source.dropContainer.element.nativeElement.children);

  //   if (hoveringOverIndex !== currentIndex) {
  //     this.hoverIndex = hoveringOverIndex;
  //     console.log(`Current hovering index: ${this.hoverIndex}`);
  //   }
  // }

  getHoveringIndex(pointerY: number, listElements: HTMLCollection): number {
    let hoverIndex = -1;
    Array.from(listElements).some((element: Element, index: number) => {
      const bounds = element.getBoundingClientRect();
      if (pointerY > bounds.top && pointerY < bounds.bottom) {
        hoverIndex = index;
        return true; // Detiene la iteración una vez que se encuentra el índice
      }
      return false;
    });
    return hoverIndex;
  }


  onDrop(event: CdkDragDrop<any>, segmentFatherId?: number | undefined) {
    let taskList: Task[] = [];
    if (segmentFatherId) {
      console.log('segmentFatherId', segmentFatherId);
      taskList=this.getTasksBySegment(segmentFatherId);
    }else{
      taskList = this.tasks;
    }

    if (event.previousIndex !== event.currentIndex) {
      const element = taskList[event.previousIndex];
      // moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
      let superiorPosition = undefined
      let inferiorPosition = undefined
      let additional = 0;
      if (event.previousIndex < event.currentIndex) {
        superiorPosition = taskList[event.previousIndex - 1];
        additional = 1;
      }

      if (event.currentIndex > 0) {

        superiorPosition = taskList[event.currentIndex - 1 + additional];

      } if (event.currentIndex < this.tasks.length) {
        inferiorPosition = taskList[event.currentIndex + additional];
      }
      moveItemInArray(taskList, event.previousIndex, event.currentIndex);
      this.moveElement(element, superiorPosition, inferiorPosition);
    }
  }


  async moveElement(element: any, superiorPosition: any, inferiorPosition: any) {

    this.tasks = [...await this.taskService.moveElement(element.id, superiorPosition, inferiorPosition)];
    this.filterSearch();
    // this.labelsAnimated=true;

  }

  dragEntered(event: CdkDragEnter<any>) {
    console.log('drag entered', event);
    this.dragOverIndex = event.container.data.indexOf(event.item.data);
  }

  dragExited(event: CdkDragExit<any>) {
    console.log('drag exited', event);
    this.dragOverIndex = null;
  }


  clearSarch() {
    this.searchInput = '';
    this.filterSearch();
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
  labels: Label[] = [];
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

  taskStartTime = 0;
  segmentStartTime = 0;
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
  // resumeTimer() {
  //   const timerStart = Date.now() - this.clock.elapsedTime * 1000;
  //   if (this.clock.actualTask > -1) {
  //     if (this.tasks[this.clock.actualTask].elapsedTime > 0) {
  //       this.taskStartTime = Date.now() - this.tasks[this.clock.actualTask].elapsedTime * 1000;
  //     } else {
  //       this.taskStartTime = Date.now();
  //     }
  //   }
  //   let counter = 0;
  //   this.interval = setInterval(() => {
  //     this.clock.elapsedTime = Math.floor((Date.now() - timerStart) / 1000);
  //     if (this.clock.actualTask > -1 && this.clock.pomodoroState === 'work') {
  //       this.tasks[this.clock.actualTask].elapsedTime = Math.floor((Date.now() - this.taskStartTime) / 1000);
  //     }
  //     if (this.clock.elapsedTime >= this.clock.totalTime) {
  //       // Pomodoro finished
  //       this.clock.elapsedTime = 0;
  //       this.clock.isPaused = false;
  //       this.clock.timerStarted = false;
  //       clearInterval(this.interval);
  //       this.nextPomodoroState();
  //     }
  //     counter++;
  //     if (counter % 30 === 0) {
  //       this.saveTask(this.tasks[this.clock.actualTask]);
  //     }
  //     this.saveClock();
  //   }, 1000);
  // }

  // startTaskElapsedTime() {
  //   3
  // }

  resumeTimer() {
    const timerStart = Date.now() - this.clock.elapsedTime * 1000;
    const actualTask = this.taskService.tasks.find(task => task.id === this.clock.actualTask);
    let segment: Task | undefined;
    if (actualTask) {
      if (actualTask.elapsedTime > 0) {
        this.taskStartTime = Date.now() - actualTask.elapsedTime * 1000;
      } else {
        this.taskStartTime = Date.now();
      }
      if (actualTask.segmentId) {
        segment = this.taskService.getTaskById(actualTask.segmentId);
        if (segment.elapsedTime > 0) {
          this.segmentStartTime = Date.now() - segment.elapsedTime * 1000;
        } else {
          this.segmentStartTime = Date.now();
        }
      }
    }

    let counter = 0;
    this.interval = setInterval(() => {
      this.clock.elapsedTime = Math.floor((Date.now() - timerStart) / 1000);
      if (actualTask && this.clock.pomodoroState === 'work') {
        actualTask.elapsedTime = Math.floor((Date.now() - this.taskStartTime) / 1000);
      }
      if (segment && this.clock.pomodoroState === 'work') {
        segment.elapsedTime = Math.floor((Date.now() - this.segmentStartTime) / 1000);
      }
      if (this.clock.elapsedTime >= this.clock.totalTime) {
        // Pomodoro finished
        this.clock.elapsedTime = 0;
        this.clock.isPaused = false;
        this.clock.timerStarted = false;
        clearInterval(this.interval);
        this.nextPomodoroState();
      }
      counter++;
      if (counter % 30 === 0 && actualTask) {
        this.saveTask(actualTask);
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
    this.saveClock();

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
    const rect = this.newTaskButton.nativeElement.getBoundingClientRect();

    // const top = this.newTaskButton.nativeElement.offsetTop;
    // const left = this.newTaskButton.nativeElement.offsetLeft;

    this.childComponent.openModal(rect.left, rect.top);
  }

  editTask(index: number) {
    const nativeElement = this.editTaskButton.get(index)?.nativeElement;

    const rect = nativeElement.getBoundingClientRect();
    this.childComponent.editModal(index, this.tasks[index], rect.left, rect.top);
  }

  saveTask(task: Task) {
    this.taskService.saveTask(task);
  }



  taskTimePercentage(id: number): number {
    const task = this.tasks.find(task => task.id === id);
    if (task && task.estimatedTime > 0 && task.elapsedTime > 0) {
      return task.elapsedTime * 1000 / task.estimatedTime * 100;
    }
    return 0;
  }
  activeTask(index: number): void {
    if (this.clock.actualTask === index) {
      this.clock.actualTask = -1;
    } else {
      if (this.interval && this.clock.pomodoroState === 'work') {
        clearInterval(this.interval);
        this.clock.actualTask = index;
        this.resumeTimer();
      } else {
        this.clock.actualTask = index;
      }
    }
    this.saveClock();
  }

  getLabelInfo(labelId: any): Label {
    return this.taskService.getLabelById(labelId);
  }
  getSegmentName(segmentId: any): string {
    let segment = this.taskService.getTaskById(segmentId);
    if (segment) {
      return segment.name;
    } else {
      return 'Segment not Found'
    }

  }



  saveClock() {
    let clock = { ...this.clock };
    clock.timerStarted = false;
    clock.isPaused = true;
    localStorage.setItem('clock', JSON.stringify(clock));
  }

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



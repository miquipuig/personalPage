import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Output, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { timer } from 'rxjs';
import { TaskModalComponent } from './complements/task-modal/task-modal.component';
import { TaskServicesService } from 'src/app/services/productivity-hub/task-services.service';
import { Label } from 'src/app/services/productivity-hub/task-services.service';
import { Task } from 'src/app/services/productivity-hub/task-services.service';
import { CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragMove, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { State } from 'src/app/services/productivity-hub/task-services.service';
import { LocalService } from 'src/app/services/productivity-hub/local.service';
import {Clock} from 'src/app/services/productivity-hub/local.service';
import { ClockComponent } from './clock/clock.component';
@Component({
  selector: 'app-productivity-hub',
  templateUrl: './productivity-hub.component.html',
  styleUrls: ['./productivity-hub.component.css']
})
export class ProductivityHubComponent  implements AfterViewInit{

  @ViewChild('newTaskButton') newTaskButton!: ElementRef;
  @ViewChildren('editTaskButton') editTaskButton!: QueryList<ElementRef>;
  @ViewChildren('editTaskButtonChild') editTaskButtonChild!: QueryList<ElementRef>;



  @ViewChild(TaskModalComponent) childComponent!: TaskModalComponent;
  @ViewChild(ClockComponent) clockComponent!: ClockComponent;



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

  constructor(private cdr: ChangeDetectorRef, private renderer: Renderer2, public tks: TaskServicesService, public local: LocalService) {

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
    // temporizador que se espera 0.5 segundos y setea la variable isSectionActive a true``
    setTimeout(() => {
      this.isSectionActive = true;
    }, 50);
    this.tks.labels = this.tks.getLabels();

    this.loadStates();
    this.loadTasks();
    this.local.loadClock();
    this.totalTimeAssingment(this.local.clock.pomodoroState);
  }
  ngAfterViewInit() {
    this.clockTimer();
  }

  async refreshTasks() {
    this.labelsAnimated = true;
    this.filterSearch();
  }
  async loadTasks() {
    await this.tks.loadTasks();

    this.refreshTasks();
  }
  async loadStates() {
    this.states = this.tks.states;
  }
  loadFilteredTasksByLabel(labelId: any) {

    this.filteredLabel = labelId;
    this.filterSearch();
  }
  async onStateChange(event: Event, task: Task) {
    const selectedStateId = parseInt((event.target as HTMLSelectElement).value);
    task.state = selectedStateId;
    await this.tks.saveTask(task);
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

    this.states = await (this.tks.saveState(state));

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
    return [...this.tks.tasks.filter(task => task.segmentId === segmentId).sort((a, b) => a.idPosition - b.idPosition)];
  }

  filterSearch(): void {

    let tasks: Task[] = [];
    tasks = [...this.tks.tasks];
    tasks = tasks.sort((a, b) => a.idPosition - b.idPosition);
    if (this.states.length > 0) {
      tasks = tasks.filter(task => this.states.find(state => state.id === task.state)?.visibilityTaskList);
    }

    if (this.orderedView) {
      this.filteredAllSegments = false;

      if (!this.filteredAllTasks) {
        tasks = tasks.filter(task => task.elementType === 'task' && (task.segmentId === undefined || task.segmentId === null || task.segmentId <= 0) || task.elementType === 'segment');
      } else {
        tasks = tasks.filter(task => task.elementType === 'segment');
      }
      tasks.forEach(segment => {
        segment.tasks = this.getTasksBySegment(segment.id);
      });

    } else {



      if (this.filteredAllSegments || this.filteredAllTasks) {

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
     this.tks.filteredTasks = tasks;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray( this.tks.filteredTasks, event.previousIndex, event.currentIndex);
  }

  onDragStarted(event: any) {

    this.labelsAnimated = false;
  }
  onDragEnded(event: any) {
    this.local.clock.actualTask = this.selectedTask;
  }


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
      taskList =  this.tks.filteredTasks.find(task => task.id === segmentFatherId)?.tasks || [];
    } else {
      taskList =  this.tks.filteredTasks;
    }

    if (event.previousIndex !== event.currentIndex) {
      const element = taskList[event.previousIndex];
      // moveItemInArray( this.tks.filteredTasks, event.previousIndex, event.currentIndex);
      let superiorPosition = undefined
      let inferiorPosition = undefined
      let additional = 0;
      if (event.previousIndex < event.currentIndex) {
        superiorPosition = taskList[event.previousIndex - 1];
        additional = 1;
      }

      if (event.currentIndex > 0) {
        superiorPosition = taskList[event.currentIndex - 1 + additional];

      } if (event.currentIndex <  this.tks.filteredTasks.length) {
        inferiorPosition = taskList[event.currentIndex + additional];
      }
      moveItemInArray(taskList, event.previousIndex, event.currentIndex);
      this.moveElement(element, superiorPosition, inferiorPosition);
    }
  }


  async moveElement(element: any, superiorPosition: any, inferiorPosition: any) {

    await this.tks.moveElement(element.id, superiorPosition, inferiorPosition);
    this.filterSearch();
    // this.labelsAnimated=true;

  }

  dragEntered(event: CdkDragEnter<any>) {
    this.dragOverIndex = event.container.data.indexOf(event.item.data);
  }

  dragExited(event: CdkDragExit<any>) {
    this.dragOverIndex = null;
  }


  clearSarch() {
    this.searchInput = '';
    this.filterSearch();
  }




  //interficie de tarea
  // tasks: Task[] = [];


  interval: any; //object that will hold the interval
  clockInterval: any; //object that will hold the interval
  resumeTimerSync = false;

  taskStartTime = 0;
  segmentStartTime = 0;
  referenceWorkTime = 1500; // 25 minutes Work
  referenceShortBreakTime = 300;  // 5 minutes Break
  referenceLongBreakTime = 900; // 15 minutes Break



  startTimer() {
    //primera vez que se inicia el timer
    if (!(this.local.clock.isPaused && this.local.clock.elapsedTime > 0)) {
      this.local.clock.startTime = Date.now();
    }
    this.local.clock.endTime = Date.now() + this.local.clock.totalTime * 1000 - this.local.clock.elapsedTime * 1000;
    this.local.clock.isPaused = false;
    this.local.clock.timerStarted = true;
    this.resumeTimerSync = true;
    this.saveClock();

  }


  pauseTimer() {
    clearInterval(this.interval);
    this.local.clock.timerStarted = false;
    this.local.clock.isPaused = true;
    this.saveClock();
  }

  clockTimer() {
    this.clockComponent.startClock();
    this.clockInterval = setInterval(() => {
      if (this.resumeTimerSync) {
        this.resumeTimerSync = false;
        this.resumeTimer();
      }
      this.clockComponent.updateClock(new Date());
    }, 1000);
  }
  
  resumeTimer() {
    const timerStart = Date.now() - this.local.clock.elapsedTime * 1000;
    const actualTask = this.tks.tasks.find(task => task.id === this.local.clock.actualTask);
    let segment: Task | undefined;
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
    this.interval = setInterval(() => {
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
    this.local.clock.timerStarted = false;
    clearInterval(this.interval);
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

  totalTimeAssingment(pomodoroState: string) {
    if (pomodoroState === 'work') {
      this.local.clock.totalTime = this.referenceWorkTime;
    } else if (pomodoroState === 'shortBreak') {
      this.local.clock.totalTime = this.referenceShortBreakTime;
    } else if (pomodoroState === 'longBreak') {
      this.local.clock.totalTime = this.referenceLongBreakTime;
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
      clearInterval(this.interval);
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

  undoPomodoro() {
    clearInterval(this.interval);
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

  getTimeLeft() {
    return (this.local.clock.totalTime - this.local.clock.elapsedTime);
  }

  getPercentage() {
    return (Math.floor(this.local.clock.elapsedTime / this.local.clock.totalTime * 100));
  }

  newTask() {
    const rect = this.newTaskButton.nativeElement.getBoundingClientRect();

    // const top = this.newTaskButton.nativeElement.offsetTop;
    // const left = this.newTaskButton.nativeElement.offsetLeft;

    this.childComponent.openModal(rect.left, rect.top);
  }

  editTask(task: Task, index: number) {
    const nativeElement = this.editTaskButton.get(index)?.nativeElement;

    const rect = nativeElement.getBoundingClientRect();
    this.childComponent.editModal(index, task, rect.left, rect.top);

  }
  editChild(task: Task, index: number, fatherIndex: number) {

    let positionButton = 0;

    for (let i = 0; i < this.tks.filteredTasks.length; i++) {
      
      if (i >= fatherIndex) {
        positionButton += index;
        break;
      }
      const task =  this.tks.filteredTasks[i];
      positionButton += task.tasks.length;
    }
    const nativeElement = this.editTaskButtonChild.get(positionButton)?.nativeElement;
    const rect = nativeElement.getBoundingClientRect();
    this.childComponent.editModal(index, task, rect.left, rect.top);

  }

  saveTask(task: Task) {
    this.tks.saveTask(task);
  }



  taskTimePercentage(id: number): number {
    const task =  this.tks.filteredTasks.find(task => task.id === id);
    if (task && task.estimatedTime > 0 && task.elapsedTime > 0) {
      return task.elapsedTime * 1000 / task.estimatedTime * 100;
    }
    return 0;
  }
  activeTask(index: number): void {
    if (this.local.clock.actualTask === index) {
      this.local.clock.actualTask = -1;
    } else {
      if (this.interval && this.local.clock.pomodoroState === 'work') {
        clearInterval(this.interval);
        this.local.clock.actualTask = index;
        this.resumeTimer();
      } else {
        this.local.clock.actualTask = index;
      }
    }
    this.saveClock();
  }

  getLabelInfo(labelId: any): Label {
    return this.tks.getLabelById(labelId);
  }
  getSegmentName(segmentId: any): string {
    let segment = this.tks.getTaskById(segmentId);
    if (segment) {
      return segment.name;
    } else {
      return 'Segment not Found'
    }

  }



  saveClock() {
    let clock = { ...this.local.clock };
    clock.timerStarted = false;
    clock.isPaused = true;
    localStorage.setItem('clock', JSON.stringify(clock));
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



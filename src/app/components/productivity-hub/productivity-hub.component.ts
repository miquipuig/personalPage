import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Output, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { timer } from 'rxjs';
import { TaskModalComponent } from './complements/task-modal/task-modal.component';
import { TaskServicesService } from 'src/app/services/productivity-hub/task-services.service';
import { Label } from 'src/app/services/productivity-hub/task-services.service';
import { Task } from 'src/app/services/productivity-hub/task-services.service';
import { CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragMove, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { State } from 'src/app/services/productivity-hub/task-services.service';
import { LocalService } from 'src/app/services/productivity-hub/local.service';
import { Clock } from 'src/app/services/productivity-hub/local.service';
import { ClockComponent } from './clock/clock.component';
import { TimerComponent } from './timer/timer.component';
@Component({
  selector: 'app-productivity-hub',
  templateUrl: './productivity-hub.component.html',
  styleUrls: ['./productivity-hub.component.css']
})
export class ProductivityHubComponent implements AfterViewInit {

  @ViewChild('newTaskButton') newTaskButton!: ElementRef;
  @ViewChildren('editTaskButton') editTaskButton!: QueryList<ElementRef>;
  @ViewChildren('editTaskButtonChild') editTaskButtonChild!: QueryList<ElementRef>;



  @ViewChild(TaskModalComponent) childComponent!: TaskModalComponent;
  @ViewChild(ClockComponent) clockComponent!: ClockComponent;
  @ViewChild(TimerComponent) timerComponent!: TimerComponent;


  searchInput = '';
  dragOverIndex: number | null = null;
  labelsAnimated = true;
  stateFilterMenu = false
  stateFilterMenuAll = false
  states: State[] = [];
  isVisible=true;

  constructor(private elRef: ElementRef,private cdr: ChangeDetectorRef, private renderer: Renderer2, public tks: TaskServicesService, public local: LocalService) {

  }
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const clickedInside = (event.target as HTMLElement).closest('.filterList');
    if (!clickedInside) {
      this.stateFilterMenu = false;
    }
  }

  

  selectedTask = -1;

  ngOnInit() {
    // temporizador que se espera 0.5 segundos y setea la variable isSectionActive a true``
    setTimeout(() => {
      this.local.clock.isSectionActive = true;
    }, 50);
    this.tks.labels = this.tks.getLabels();

    this.loadStates();
    this.loadTasks();
    this.local.loadClock();
    this.checkWidth()

  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkWidth();
  }

  checkWidth() {
    const parentElement = this.elRef.nativeElement.querySelector('#menu');
    if (parentElement.offsetWidth < 420) {
      this.isVisible = false;
    } else {
      this.isVisible = true;
    }
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

    this.local.clock.filteredLabel = labelId;
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
    this.local.clock.filteredLabel = -1;
    this.filterSearch();
  }

  loadFilteredTasksBySegment(segmentId: any) {
    this.local.clock.filteredSegment = segmentId;
    this.filterSearch();
  }

  loadUnfilteredTasksBySegment() {
    this.local.clock.filteredSegment = -1;
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
    this.local.saveClock();
    // Copia inicial de tareas y ordenación por idPosition
    let tasks: Task[] = [...this.tks.tasks].sort((a, b) => a.idPosition - b.idPosition);
  
    // Filtrado por estado visible
    if (this.states.length > 0) {
      tasks = tasks.filter(task => this.states.some(state => state.id === task.state && state.visibilityTaskList));
    }
  
    // Procesamiento dependiendo de si la vista está ordenada o no
    if (this.local.clock.orderedView) {
     
      this.local.clock.filteredAllSegments=false;

      //Filtrado de tareas con segment padre
      tasks = tasks.filter(task => task.segmentId === -1 || task.segmentId === null ||task.segmentId === undefined );




      if (this.local.clock.filteredAllSegments || this.local.clock.filteredAllTasks || this.local.clock.filteredAllSimpleTasks) {
        // Filtra todos los segmentos o tareas según la configuración
        tasks = tasks.filter(task => (!this.local.clock.filteredAllSegments && task.elementType == 'segment') ||
                                      (!this.local.clock.filteredAllTasks && task.elementType == 'task') || (!this.local.clock.filteredAllSimpleTasks && task.elementType == 'simpleTask')) 
      }
      
      // Asignación de tareas a los segmentos
      tasks.forEach(segment => {
        if (segment.elementType === 'segment') {
          segment.tasks = this.getTasksBySegment(segment.id);
        }
      });
    } else if (this.local.clock.filteredAllSegments || this.local.clock.filteredAllTasks || this.local.clock.filteredAllSimpleTasks) {
      // Filtra todos los segmentos o tareas según la configuración
      tasks = tasks.filter(task => (!this.local.clock.filteredAllSegments && task.elementType == 'segment') ||
                                    (!this.local.clock.filteredAllTasks && task.elementType == 'task') || (!this.local.clock.filteredAllSimpleTasks && task.elementType == 'simpleTask')) 
    }
  
   // Filtrado adicional común a ambos modos
    if (this.local.clock.filteredLabel !== -1) {
      tasks = tasks.filter(task => task.label === this.local.clock.filteredLabel);
    }

    if (this.local.clock.filteredSegment !== -1) {
      tasks = tasks.filter(task => task.segmentId === this.local.clock.filteredSegment || task.id === this.local.clock.filteredSegment);
    }
    if (this.searchInput !== '') {
      const searchLower = this.searchInput.toLowerCase();
      tasks = tasks.filter(task => task.name.toLowerCase().includes(searchLower) || 
                                   (task.detail && task.detail.toLowerCase().includes(searchLower)));
    }

    // Asignación final de tareas filtradas
    this.tks.filteredTasks = tasks;
  }
  
  

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tks.filteredTasks, event.previousIndex, event.currentIndex);
  }

  //es necessario?
  onDragStarted(event: any) {

    this.labelsAnimated = false;
  }
  onDragEnded(event: any) {
    this.local.clock.actualTask = this.selectedTask;
  }



  onDrop(event: CdkDragDrop<any>, segmentFatherId?: number | undefined) {
    let taskList: Task[] = [];
    if (segmentFatherId) {
      taskList = this.tks.filteredTasks.find(task => task.id === segmentFatherId)?.tasks || [];
    } else {
      taskList = this.tks.filteredTasks;
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

      } if (event.currentIndex < this.tks.filteredTasks.length) {
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


  clockInterval: any; //object that will hold the interval

  taskStartTime = 0;
  segmentStartTime = 0;
  referenceWorkTime = 1500; // 25 minutes Work
  referenceShortBreakTime = 300;  // 5 minutes Break
  referenceLongBreakTime = 900; // 15 minutes Break



  clockTimer() {
    this.clockComponent.startClock();
    this.clockInterval = setInterval(() => {
      if (this.local.resumeTimerSync) {
        this.local.resumeTimerSync = false;
        this.timerComponent.resumeTimer();
      }
      this.clockComponent.updateClock(new Date());
    }, 1000);
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
      console.log(positionButton);
      console.log(i);

      const task = this.tks.filteredTasks[i];
      console.log(task);
      positionButton += task.tasks.length;
      console.log(positionButton);

    }
    const nativeElement = this.editTaskButtonChild.get(positionButton)?.nativeElement;
    const rect = nativeElement.getBoundingClientRect();
    this.childComponent.editModal(index, task, rect.left, rect.top);

  }


  taskTimePercentage(id: number): number {
    const task = this.tks.filteredTasks.find(task => task.id === id);
    if (task && task.estimatedTime > 0 && task.elapsedTime > 0) {
      return task.elapsedTime * 1000 / task.estimatedTime * 100;
    }
    return 0;
  }
  activeTask(index: number): void {
    if (this.local.clock.actualTask === index) {
      this.local.clock.actualTask = -1;
    } else {
      if (this.local.interval && this.local.clock.pomodoroState === 'work') {
        clearInterval(this.local.interval);
        this.local.clock.actualTask = index;
        this.timerComponent.resumeTimer();
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








}



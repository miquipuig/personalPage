import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Output, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { timer } from 'rxjs';
import { TaskModalComponent } from './complements/task-modal/task-modal.component';
import { TaskServicesService } from 'src/app/services/productivity-hub/task-services.service';
import { Label } from 'src/app/services/productivity-hub/task-services.service';
import { Task } from 'src/app/services/productivity-hub/task-services.service';
import { CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragMove, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { LocalService } from 'src/app/services/productivity-hub/local.service';
import { Clock } from 'src/app/services/productivity-hub/local.service';
import { ClockComponent } from './clock/clock.component';
import { TimerComponent } from './timer/timer.component';
import { CheckBoxComponent } from './complements/check-box/check-box.component';
import { State } from 'src/app/services/productivity-hub/task-services.service';
import { TaskCardComponent } from './complements/task-card/task-card.component';

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
  @ViewChild(CheckBoxComponent) checkBoxComponent!: CheckBoxComponent;
  @ViewChildren(TaskCardComponent) taskCardComponent!: QueryList<TaskCardComponent>;


  searchInput = '';
  dragOverIndex: number | null = null;
  stateFilterMenu = false
  stateFilterMenuAll = false

  constructor(private elRef: ElementRef, private cdr: ChangeDetectorRef, private renderer: Renderer2, public tks: TaskServicesService, public local: LocalService) {

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
    this.checkStateAllFilter();

  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkWidth();
  }

  checkWidth() {
    const parentElement = this.elRef.nativeElement.querySelector('#menu');
    if (parentElement.offsetWidth < 550) {
      this.local.isVisible = false;
    } else {
      this.local.isVisible = true;
    }
  }
  ngAfterViewInit() {
    this.clockTimer();
  }

  async refreshTasks() {
    this.local.labelsAnimated = true;
    this.taskCardComponent.forEach(taskCard => {
      taskCard.refresh();
    });
    this.filterSearch();
  }
  async loadTasks() {
    await this.tks.loadTasks();

    this.refreshTasks();
  }
  async loadStates() {
    this.local.states = this.tks.states;
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


  }

  loadUnfilteredTasksByLabel() {
    this.local.clock.filteredLabel = -1;
    this.filterSearch();
  }

  loadUnfilteredTasksBySegment() {
    this.local.clock.filteredSegment = -1;
    this.filterSearch();
  }

  async stateFilter(state: State) {
    state.visibilityTaskList = !state.visibilityTaskList;
    this.checkStateAllFilter();

    this.local.states = await (this.tks.saveState(state));

    this.filterSearch();
  }

  asyncStateFilterAll() {
    //si todos los estados estan visibles, se ocultan

    if (this.local.states.every(state => state.visibilityTaskList)) {
      this.local.states.forEach(async state => {
        state.visibilityTaskList = false;
        await (this.tks.saveState(state));
      });
    } else {
      this.local.states.forEach(async state => {
        state.visibilityTaskList = true;
        await (this.tks.saveState(state));
      });
    }
    this.checkStateAllFilter();
    this.filterSearch();
  }

  checkStateAllFilter() {
    //si todos los estados estan visibles, se ocultan
    if (this.local.states.every(state => state.visibilityTaskList)) {
      this.stateFilterMenuAll = true;
    } else {
      this.stateFilterMenuAll = false;
    }
  }
  getTasksBySegment(segmentId: number): Task[] {
    return [...this.tks.tasks.filter(task => task.segmentId === segmentId).sort((a, b) => a.idPosition - b.idPosition)];
  }

  getTasksBySegment2(segmentId: number, tasks: Task[]): Task[] {
    return [...tasks.filter(task => task.segmentId === segmentId).sort((a, b) => a.idPosition - b.idPosition)];
  }


  //funciión para comprar fechas con la de hoy. Devulve true si la fecha es posterior a la de hoy. Solo set ienen en cuenta los días no las horas ni munutos etc

  setToMidnight(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  isFutureDate(date: Date): boolean {
    const today = this.setToMidnight(new Date());
    const taskDate = this.setToMidnight(date);
    return taskDate > today;
  }

  isFutureTodayDate(date: Date): boolean {
    const today = this.setToMidnight(new Date());
    const taskDate = this.setToMidnight(date);
    return taskDate >= today;
  }

  isPastDate(date: Date): boolean {
    const today = this.setToMidnight(new Date());
    const taskDate = this.setToMidnight(date);
    return taskDate <= today;
  }

  endPastDate(date: Date): boolean {
    const today = this.setToMidnight(new Date());
    const taskDate = this.setToMidnight(date);
    return taskDate < today;
  }


  filterSearch(): void {
    this.local.saveClock();
    // Copia inicial de tareas y ordenación por idPosition
    let tasks: Task[] = [...this.tks.tasks].sort((a, b) => a.idPosition - b.idPosition);


    // Filtrado por tareas rutinarias y checks
    tasks = tasks.filter(task => {
      //Filtrado para segments y tasks normales
      if (task.elementType === 'simpleTask' || task.elementType === 'routine') {
        if (this.local.filteredCheckTasksRoutinesFilterAll) {
          return true;
        }
        if (this.local.clock.filteredCheckTasksRoutinesFinished) {
          if (task.isTaskDone && !task.endDate) {
            return true;
          }
          if (task.isTaskDone && task.endDate && this.endPastDate(task.endDate)) {

            return true;
          }
        }

        if (this.local.clock.filteredCheckTasksRoutinesPendent) {
          if (!task.isTaskDone && !task.startDate) {
            return true;
          }
          if (!task.isTaskDone && task.startDate && this.isPastDate(task.startDate)) {

            return true;
          }

          if (task.isTaskDone && task.endDate && this.isFutureTodayDate(task.endDate)) {

            return true;
          }
        }

        if (this.local.clock.filteredCheckTasksRoutinesScheduled) {
          if (!task.isTaskDone && task.startDate && this.isFutureDate(task.startDate)) {

            return true;
          }
        }

      } else {
        return true;
      }
      return false;
    });

    // Filtrado por estado visible
    if (this.local.states.length > 0) {
      tasks = tasks.filter(task =>
        task.elementType !== 'segment' && task.elementType !== 'task' || // Permite todos los elementos que no son ni 'segment' ni 'task'
        (task.elementType === 'segment' || task.elementType === 'task') && this.local.states.some(state =>
          state.id === task.state && state.visibilityTaskList
        )
      );
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

    // Procesamiento dependiendo de si la vista está ordenada o no
    if (this.local.clock.orderedView) {


      if (this.local.clock.filteredAllSegments || this.local.clock.filteredAllTasks || this.local.clock.filteredAllSimpleTasks) {
        // Filtra todos los segmentos o tareas según la configuración
        tasks = tasks.filter(task => (!this.local.clock.filteredAllSegments && task.elementType == 'segment') ||
          (!this.local.clock.filteredAllTasks && task.elementType == 'task') || (!this.local.clock.filteredAllSimpleTasks && task.elementType == 'simpleTask'))
      }
      tasks.forEach(segment => {
        if (segment.elementType === 'segment') {
          segment.tasks = this.getTasksBySegment2(segment.id, tasks);
          // segment.tasks = this.getTasksBySegment(segment.id);

        }
      });
      //Filtrado de tareas con segment padre

      tasks = tasks.filter(task => task.segmentId === -1 || task.segmentId === null || task.segmentId === undefined);


      // Asignación de tareas a los segmentos

    } else if (this.local.clock.filteredAllSegments || this.local.clock.filteredAllTasks || this.local.clock.filteredAllSimpleTasks) {
      // Filtra todos los segmentos o tareas según la configuración
      tasks = tasks.filter(task => (!this.local.clock.filteredAllSegments && task.elementType == 'segment') ||
        (!this.local.clock.filteredAllTasks && task.elementType == 'task') || (!this.local.clock.filteredAllSimpleTasks && task.elementType == 'simpleTask'))
    }

    // Asignación final de tareas filtradas
    this.tks.filteredTasks = tasks;
  }





  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tks.filteredTasks, event.previousIndex, event.currentIndex);
  }

  //es necessario?
  onDragStarted(event: any) {
    // this.local.labelsAnimated = false;
    this.selectedTask = this.local.clock.actualTask;
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
  resumeTimer() {
    this.timerComponent.resumeTimer();
  }

  newTask() {
    const rect = this.newTaskButton.nativeElement.getBoundingClientRect();

    // const top = this.newTaskButton.nativeElement.offsetTop;
    // const left = this.newTaskButton.nativeElement.offsetLeft;

    this.childComponent.openModal(rect.left, rect.top);
  }

  editTaskReferenced(event: any,) {
    const task = event.task;
    const index = event.index;
    const rect = event.rect;
    if (event.add) {
      this.childComponent.openModal(rect.left, rect.top, task);
    } else {
      this.childComponent.editModal(index, task, rect.left, rect.top);
    }
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



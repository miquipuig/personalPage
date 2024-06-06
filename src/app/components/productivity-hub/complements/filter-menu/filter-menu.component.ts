import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { LocalService } from 'src/app/services/productivity-hub/local.service';
import { TaskServicesService } from 'src/app/services/productivity-hub/task-services.service';
import { State } from 'src/app/services/productivity-hub/task-services.service';

@Component({
  selector: 'app-filter-menu',
  templateUrl: './filter-menu.component.html',
  styleUrls: ['./filter-menu.component.css']
})
export class FilterMenuComponent {

  constructor( public local: LocalService, private tks: TaskServicesService) { }

  ngOnInit(): void {
    this.checkFilterAll();
  }

  @Output() filterSearchEmitter = new EventEmitter<any>();
  @Input() isVisible?: boolean;

  stateFilterMenu = false;
  stateFilterMenuAll = false;

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
    this.filterSearchEmitter.emit();
  }

  checkStateAllFilter() {
    //si todos los estados estan visibles, se ocultan
    if (this.local.states.every(state => state.visibilityTaskList)) {
      this.stateFilterMenuAll = true;
    } else {
      this.stateFilterMenuAll = false;
    }
  }
  async stateFilter(state: State) {
    state.visibilityTaskList = !state.visibilityTaskList;
    this.checkStateAllFilter();

    this.local.states = await (this.tks.saveState(state));

    this.filterSearchEmitter.emit();
  }

  CheckScheduled(){
    this.local.clock.filteredCheckTasksRoutinesScheduled = !this.local.clock.filteredCheckTasksRoutinesScheduled;
    this.filterSearchEmitter.emit();
    this.local.saveClock();
  }

  CheckPendent(){
    this.local.clock.filteredCheckTasksRoutinesPendent = !this.local.clock.filteredCheckTasksRoutinesPendent;
    this.filterSearchEmitter.emit();
    this.local.saveClock();
  }

  CheckFinished(){
    this.local.clock.filteredCheckTasksRoutinesFinished = !this.local.clock.filteredCheckTasksRoutinesFinished;
    this.filterSearchEmitter.emit();
    this.local.saveClock();
  }

  CheckFilterAll(){
    this.local.clock.filteredCheckTasksRoutinesFilterAll = !this.local.clock.filteredCheckTasksRoutinesFilterAll;
    if(this.local.clock.filteredCheckTasksRoutinesFilterAll){
      this.local.clock.filteredCheckTasksRoutinesScheduled = true;
      this.local.clock.filteredCheckTasksRoutinesPendent = true;
      this.local.clock.filteredCheckTasksRoutinesFinished = true;
    }else{
      this.local.clock.filteredCheckTasksRoutinesScheduled = false;
      this.local.clock.filteredCheckTasksRoutinesPendent = false;
      this.local.clock.filteredCheckTasksRoutinesFinished = false;
    }
    this.filterSearchEmitter.emit();
    this.local.saveClock();
  }

  checkFilterAll(){
    if(this.local.clock.filteredCheckTasksRoutinesScheduled && this.local.clock.filteredCheckTasksRoutinesPendent && this.local.clock.filteredCheckTasksRoutinesFinished){
      this.stateFilterMenuAll = true;
    }else{
      this.stateFilterMenuAll = false;
    }
  }
  
}

import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { LocalService } from 'src/app/services/productivity-hub/local.service';
import { Label, Task, TaskServicesService } from 'src/app/services/productivity-hub/task-services.service';
import { TimerComponent } from '../../timer/timer.component';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { CheckBoxComponent } from '../check-box/check-box.component';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.css']
})
export class TaskCardComponent {
  @ViewChild(TaskModalComponent) childComponent!: TaskModalComponent;
  @ViewChildren('editTaskButton') editTaskButton!: QueryList<ElementRef>;
  @ViewChild(CheckBoxComponent) checkBoxComponent!: CheckBoxComponent;

  @Input() task?: Task;
  @Input() index?: number;
  @Input() child?: boolean;

  @Output() filterSearchEmitter = new EventEmitter<any>();
  @Output() editTaskEmitter = new EventEmitter<any>();
  @Output() resumeTimerEmitter = new EventEmitter<any>();




  constructor(public local: LocalService, public tks: TaskServicesService) { }

  // ngOnInit(): void {
  //   console.log(this.task);
  // }

  activeTask(index: number): void {
    if (this.local.clock.actualTask === index) {
      this.local.clock.actualTask = -1;
    } else {
      if (this.local.interval && this.local.clock.pomodoroState === 'work') {
        clearInterval(this.local.interval);
        this.local.clock.actualTask = index;
        this.resumeTimerEmitter.emit();
      } else {
        this.local.clock.actualTask = index;
      }
    }
    this.local.saveClock();
  }

  loadFilteredTasksByLabel(labelId: any) {

    this.local.clock.filteredLabel = labelId;
    this.filterSearchEmitter.emit();
  }

  getLabelInfo(labelId: any): Label {
    return this.tks.getLabelById(labelId);
  }
  loadFilteredTasksBySegment(segmentId: any) {
    this.local.clock.filteredSegment = segmentId;
    this.filterSearchEmitter.emit();

  }

  getSegmentName(segmentId: any): string {
    let segment = this.tks.getTaskById(segmentId);
    if (segment) {
      return segment.name;
    } else {
      return 'Segment not Found'
    }

  }
  taskTimePercentage(id: number): number {
    const task = this.tks.filteredTasks.find(task => task.id === id);
    if (task && task.estimatedTime > 0 && task.elapsedTime > 0) {
      return task.elapsedTime * 1000 / task.estimatedTime * 100;
    }
    return 0;
  }

  async onStateChange(event: Event, task: Task) {
    const selectedStateId = parseInt((event.target as HTMLSelectElement).value);
    task.state = selectedStateId;
    await this.tks.saveTask(task);
    this.filterSearchEmitter.emit();
  }
  editTask(task: Task, index: number) {
    const nativeElement = this.editTaskButton.get(0)?.nativeElement;
    const rect = nativeElement.getBoundingClientRect();
    this.editTaskEmitter.emit({ task, index, rect });
  }

  refresh() {
    if (this.checkBoxComponent) {
      this.checkBoxComponent.refresh(this.task?.size);
    }
  }

  stopPropagation(event: any | null) {
    console.log('stopPropagation');
    console.log(event);
    if(!event?.target?.className.includes( 'draggable')) {
      event?.stopPropagation();
    }
  }


  filterSearch() {
    console.log('filterSearch11111');
    this.filterSearchEmitter.emit();
    console.log('filterSearch22222');
  }

}

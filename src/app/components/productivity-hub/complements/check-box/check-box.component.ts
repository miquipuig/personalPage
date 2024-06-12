import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { HistoryService } from 'src/app/services/productivity-hub/history.service';
import { Task, TaskServicesService } from 'src/app/services/productivity-hub/task-services.service';

@Component({
  selector: 'app-check-box',
  templateUrl: './check-box.component.html',
  styleUrls: ['./check-box.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckBoxComponent),
      multi: true
    }
  ]
})
export class CheckBoxComponent {
  @ViewChild('checkbox') checkbox!: ElementRef;
  @Input() size?: number;
  @Input() label?: string;
  @Input() check: boolean = false;
  @Input() task: Task | undefined;
  @Output() checkChange = new EventEmitter<boolean>();
  formWorkMode: boolean = false;

  onChange = (_: any) => { }
  onTouch = () => { }
  constructor(private tks: TaskServicesService,private history:HistoryService) { }



  ngOnInit() {
    this.refresh();
  }
  refresh(size:number= 0) {
    if (this.task === undefined) {
      this.formWorkMode = true;
    } else {
      this.formWorkMode = false;
      if (this.task?.isTaskDone) {
        this.check = true;
      } else {
        this.check = false;
      }
    }
    this.refreshSize(size);
  }

  refreshSize( ss:number= 0) {

    if (ss>0) {
      this.size = ss*15;
    }

    if (this.size && this.checkbox) {
      this.checkbox.nativeElement.style.setProperty('--size', `${this.size}px`);
    }
  }

  ngAfterViewInit(): void {
    this.refreshSize();
  }

  async toggleCheck() {
   
    this.check = !this.check;
    if (this.formWorkMode) {
      this.onChange(this.check);
      this.checkChange.emit(this.check);

    } else {
      this.task!.isTaskDone = this.check;
      if(this.check){
        this.task!.endDate = new Date();
      }else{
        this.task!.endDate = null;
        this.task!.startDate = new Date();
        
      }
      await this.tks.saveTask(this.task!);
      this.checkChange.emit();
    }
    this.history.refreshTasksDone();

  }

  writeValue(value: boolean): void {
    this.check = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  

}

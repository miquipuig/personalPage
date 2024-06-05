import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
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
  constructor(private tks: TaskServicesService,) { }



  ngOnInit() {
    this.refresh();
  }
  refresh() {
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
  }


  ngAfterViewInit(): void {
    if (this.size) {
      this.checkbox.nativeElement.style.setProperty('--size', `${this.size}px`);
    }
  }

  toggleCheck() {
    this.check = !this.check;
    if (this.formWorkMode) {
      this.onChange(this.check);
      this.checkChange.emit(this.check);
    } else {
      this.task!.isTaskDone = this.check;
      this.tks.saveTask(this.task!);
    }
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

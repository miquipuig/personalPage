import { Component, ElementRef, forwardRef, Input, ViewChild } from '@angular/core';
import { NgbAlertModule, NgbDate, NgbDatepicker, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-datapicker',
  templateUrl: './datapicker.component.html',
  styleUrls: ['./datapicker.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatapickerComponent),
      multi: true
    }
  ]
})
export class DatapickerComponent {
  @Input() label!: String;
  value: Date | undefined | null;
  onChange = (_: any) => { }
  onTouch = () => { }
  invalidDate: boolean = false; 



  model: NgbDate | undefined | null;
  // @ViewChild('d') datepicker?: NgbDatepicker;  
  // @ViewChild('dateInput', { read: ElementRef }) dateInput?: ElementRef<HTMLInputElement>;
  option: any;
  constructor() {

    this.model;

  }
  ngOnInit() {
    // this.model = this.dateToNgbDate(this.value || new Date());
    this.model = null;
  }


  dateToNgbDate(date: Date): NgbDate {
    return new NgbDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }
  ngbDateToDate(ngbDate: NgbDate): Date | null {
    let date:Date | null | undefined;
    if(ngbDate.year===undefined || ngbDate.month===undefined || ngbDate.day===undefined){
      this.invalidDate = true;
      return null;
    }
    this.invalidDate = false;
    date= new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day);
    return date;
  }
  validate() {
    if (this.model) {
        this.value = this.ngbDateToDate(this.model);
    } else {
      this.value = null;
      this.model = null;
    }
    this.onChange(this.value);
  }
  deleteData() {
    this.value = null;
    this.model = null;
    this.invalidDate = false;
    this.onChange(this.value);
  }

  writeValue(value: any): void {
    this.value = value;
    if (this.value) {
      this.model = this.dateToNgbDate(new Date(this.value));
    } else {
      this.model = null;
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;

  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
}

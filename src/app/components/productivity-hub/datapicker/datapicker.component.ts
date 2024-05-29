import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgbAlertModule, NgbDate, NgbDatepicker, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-datapicker',
  templateUrl: './datapicker.component.html',
  styleUrls: ['./datapicker.component.css'],
})
export class DatapickerComponent {
	model: NgbDateStruct;
  // @ViewChild('d') datepicker?: NgbDatepicker;  
  // @ViewChild('dateInput', { read: ElementRef }) dateInput?: ElementRef<HTMLInputElement>;
  option: any;
  constructor() {

    //
    const date: NgbDate = this.dateToNgbDate(new Date());
    this.model = date;
   
  }

  dateToNgbDate(date: Date): NgbDate {
      return new NgbDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }
  ngbDateToDate(ngbDate: NgbDate): Date {
      return new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day);
  }
  validate() {
    console.log(this.model);
  }

}

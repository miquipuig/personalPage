import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true
    }
  ]
})
export class TimePickerComponent {

  @Input() myLabel: string = '';
  counter: number = 0;
  value: string = '';
  isDisabled: boolean = false;
  onChange = (_: any) => { }
  onTouch = () => { }


  constructor() { }
  ngOnInit() {
    console.log(this.myLabel);
  }
  onInput($event: any) {
    this.counter = $event.value.length;
    this.value = $event.value;
    this.onTouch();
    this.onChange(this.value);
  }

  change(value: any) {
    this.value = value;
    this.counter = this.value.length;
    this.onChange(this.value);
  }
  writeValue(value: any): void {
    console.log("value", value);

    if (value) {
      this.value = value || '';
      this.counter = value.length;
    } else {
      this.value = '';
    }
  }

  registerOnChange(fn: any): void { 
    this.onChange = fn;

  }
  registerOnTouched(fn: any): void { 
    this.onTouch = fn;

  }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;

   }

}

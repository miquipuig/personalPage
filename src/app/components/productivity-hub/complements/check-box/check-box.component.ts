import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

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
  @Output() checkChange = new EventEmitter<boolean>();

  onChange = (_: any) => { }
  onTouch = () => { }
  // constructor() { }
  ngAfterViewInit(): void {
    if(this.size){
      console.log(this.size);
      this.checkbox.nativeElement.style.setProperty('--size', `${this.size}px`);
    }
  }
 
  toggleCheck() {
    this.check = !this.check;
    console.log(this.check);
    console.log(this.size);
    this.onChange(this.check);
    this.checkChange.emit(this.check);
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

  ngOnInit() {
    console.log(this.check);
  }
}

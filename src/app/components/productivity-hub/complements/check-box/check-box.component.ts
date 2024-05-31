import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-check-box',
  templateUrl: './check-box.component.html',
  styleUrls: ['./check-box.component.css']
})
export class CheckBoxComponent {
  @ViewChild('checkbox') checkbox!: ElementRef;
  @Input() size?: number;

  // constructor() { }
  ngAfterViewInit(): void {
    if(this.size){
      console.log(this.size);
      this.checkbox.nativeElement.style.setProperty('--size', `${this.size}px`);
    }
  }
  @Input() check: boolean = false;
  @Output() checkChange = new EventEmitter<boolean>();

  toggleCheck() {
    this.check = !this.check;
    console.log(this.check);
    console.log(this.size);
    this.checkChange.emit(this.check);
  }
  ngOnInit() {
    console.log(this.check);
  }
}

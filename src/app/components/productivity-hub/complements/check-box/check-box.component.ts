import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-check-box',
  templateUrl: './check-box.component.html',
  styleUrls: ['./check-box.component.css']
})
export class CheckBoxComponent {
  @ViewChild('checkBox') checkBox!: ElementRef;
  @Input() size?: number;

  constructor() { }
  check: boolean = false;
  ngAfterViewInit(): void {
    if(this.size){
      this.checkBox.nativeElement.style.setProperty('--size', `${this.size}px`);
    }
  }
}

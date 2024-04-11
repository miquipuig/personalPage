import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-productivity-hub',
  templateUrl: './productivity-hub.component.html',
  styleUrls: ['./productivity-hub.component.css']
})
export class ProductivityHubComponent {

  @ViewChild('hourHand') hourHand!: ElementRef;
  @ViewChild('minuteHand') minuteHand!: ElementRef;
  @ViewChild('secondHand') secondHand!: ElementRef;
  @ViewChild('dateDisplay') dateDisplay!: ElementRef;
  isSectionActive=false;
  
  constructor() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  }


  ngOnInit() {
    console.log('ProductivityHubComponent');
    // temporizador que se espera 0.5 segundos y setea la variable isSectionActive a true``
    setTimeout(() => {
      this.isSectionActive = true;
    }, 50);
  }


  totalTime = 1500;  // Total time in seconds for a full cycle
  timeLeft = 1500;   // Time left in the cycle  constructor() { }


  startTimer() {
    setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = this.totalTime; // Reset the timer
      }
    }, 1000); // Updates every second
  }

  getHandTransform() {
    const degreesPerSecond = 360 / this.totalTime;
    const angle = this.timeLeft * degreesPerSecond;
    return `rotate(${angle}deg)`;
  }

  updateClock() {
    const now = new Date();
    const seconds = now.getSeconds() * 6; // 360/60
    const minutes = now.getMinutes() * 6; // 360/60
    const hours = (now.getHours() % 12) * 30 + minutes / 12; // 360/12
    const dateString = now.getDate();

    if(this.secondHand && this.secondHand.nativeElement){
      this.secondHand.nativeElement.style.transform = `rotate(${seconds}deg)`;
    }
    if(this.minuteHand && this.minuteHand.nativeElement){
      this.minuteHand.nativeElement.style.transform = `rotate(${minutes}deg)`;
    }
    if(this.hourHand && this.hourHand.nativeElement){
      this.hourHand.nativeElement.style.transform = `rotate(${hours}deg)`;
    }
    if(this.dateDisplay && this.dateDisplay.nativeElement){
      this.dateDisplay.nativeElement.innerHTML = dateString;
    }
    // this.secondHand.nativeElement.style.transform = `rotate(${seconds}deg)`;
    // this.minuteHand.nativeElement.style.transform = `rotate(${minutes}deg)`;
    // this.hourHand.nativeElement.style.transform = `rotate(${hours}deg)`;
    // this.dateDisplay.nativeElement.innerHTML = dateString;
  }


}

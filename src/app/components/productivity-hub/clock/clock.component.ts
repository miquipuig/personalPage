import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.css']
})

export class ClockComponent  implements AfterViewInit {
  @ViewChild('hourHand') hourHand!: ElementRef;
  @ViewChild('minuteHand') minuteHand!: ElementRef;
  @ViewChild('secondHand') secondHand!: ElementRef;
  @ViewChild('dateDisplay') dateDisplay!: ElementRef;
  @ViewChild('colRef') colRef!: ElementRef;

  time: Date;
  constructor() {
    this.time = new Date();
    this.time.setHours(12, 0, 0, 0);
  }
  ngOnInit() {
    window.addEventListener('resize', this.updateDimensions.bind(this));
  }


  startClock() {
    const interval = setInterval(() => {
      const currentTime = new Date();
      // Añade un segundo cada 50 milisegundos
      this.time = new Date(this.time.getTime() + 60000);
      //obtener los segundos
      if (currentTime.getSeconds() > this.time.getSeconds()) {
        this.time.setMilliseconds(this.time.getMilliseconds() + 250);
      }
      this.updateClock(this.time);
      // Compara si la hora y minutos del tiempo simulado son iguales a la hora y minutos actuales
      if (this.time.getHours() >= currentTime.getHours() && this.time.getMinutes() >= currentTime.getMinutes()) {
        // this.clockTimer(); 
        clearInterval(interval); // Detiene el intervalo una vez alcanzada la hora actual

      }
    }, 5);
  }
  updateClock(date: Date) {
    const seconds = date.getSeconds() * 6; // 360/60
    const minutes = date.getMinutes() * 6; // 360/60
    const hours = (date.getHours() % 12) * 30 + minutes / 12; // 360/12
    const dateString = date.getDate();

    if (this.secondHand && this.secondHand.nativeElement) {
      this.secondHand.nativeElement.style.transform = `rotate(${seconds}deg)`;
    }
    if (this.minuteHand && this.minuteHand.nativeElement) {
      this.minuteHand.nativeElement.style.transform = `rotate(${minutes}deg)`;
    }
    if (this.hourHand && this.hourHand.nativeElement) {
      this.hourHand.nativeElement.style.transform = `rotate(${hours}deg)`;
    }
    if (this.dateDisplay && this.dateDisplay.nativeElement) {
      this.dateDisplay.nativeElement.innerHTML = dateString;
    }
  }

  updateDimensions() {
    const width = this.colRef.nativeElement.offsetWidth;
    // const centerHeight = this.colRef.nativeElement.offsetHeight / 2 + 0.15 * this.colRef.nativeElement.offsetHeight;
    const centerHeight = this.colRef.nativeElement.offsetHeight / 2 + 0.15 * this.colRef.nativeElement.offsetHeight;

    const radius = width * 0.23;
    const pointWide = radius * 0.07;
    //  const pointWide = radius * 0.00;
    const centerWide = radius * 0.13;
    const handWide = radius * 0.05;
    const secondWide = radius * 0.03;

    this.colRef.nativeElement.style.setProperty('--pomodoro-width', `${width}px`);
    this.colRef.nativeElement.style.setProperty('--pomodoro-centerHeight', `${centerHeight}px`);
    this.colRef.nativeElement.style.setProperty('--pomodoro-radius', `${radius}px`);
    this.colRef.nativeElement.style.setProperty('--pomodoro-centerWide', `${centerWide}px`);
    this.colRef.nativeElement.style.setProperty('--pomodoro-pointWide', `${pointWide}px`);
    this.colRef.nativeElement.style.setProperty('--pomodoro-handWide', `${handWide}px`);
    this.colRef.nativeElement.style.setProperty('--pomodoro-secondWide', `${secondWide}px`);
  }
  ngAfterViewInit() {
    this.updateDimensions();
  }
  ngOnDestroy() {
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }
}

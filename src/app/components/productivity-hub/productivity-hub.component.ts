import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-productivity-hub',
  templateUrl: './productivity-hub.component.html',
  styleUrls: ['./productivity-hub.component.css']
})
export class ProductivityHubComponent implements AfterViewInit {

  @ViewChild('hourHand') hourHand!: ElementRef;
  @ViewChild('minuteHand') minuteHand!: ElementRef;
  @ViewChild('secondHand') secondHand!: ElementRef;
  @ViewChild('dateDisplay') dateDisplay!: ElementRef;
  @ViewChild('colRef') colRef!: ElementRef;

  isSectionActive = false;

  constructor(private renderer: Renderer2, private cdRef: ChangeDetectorRef) {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

  }

  pomodoro = true;
  ngOnInit() {
    console.log('ProductivityHubComponent');
    window.addEventListener('resize', this.updateDimensions.bind(this));
    // temporizador que se espera 0.5 segundos y setea la variable isSectionActive a true``
    setTimeout(() => {
      this.isSectionActive = true;
    }, 50);

  }
  updateDimensions() {
    const width = this.colRef.nativeElement.offsetWidth;
    const centerHeight = this.colRef.nativeElement.offsetHeight / 2 + 0.15 * this.colRef.nativeElement.offsetHeight;
    const radius = width * 0.23;
    const pointWide = radius * 0.10;
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

  restTime = 300;
  totalTime = 1500;  // Total time in seconds for a full cycle
  timeLeft = 1500;   // Time left in the cycle  constructor() { }
  startTime = 0;
  endTime = 0;
  state = 'stopped';
  timerStarted = false;
  interval: any;
  isPaused = true;
  remainingTime = 0;

 

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
    // this.secondHand.nativeElement.style.transform = `rotate(${seconds}deg)`;
    // this.minuteHand.nativeElement.style.transform = `rotate(${minutes}deg)`;
    // this.hourHand.nativeElement.style.transform = `rotate(${hours}deg)`;
    // this.dateDisplay.nativeElement.innerHTML = dateString;
  }

  startTimer() {
    this.startTime = Date.now(); // Guardar el tiempo de inicio
    this.endTime = this.startTime + this.totalTime * 1000; // Calcular el tiempo de finalización
    this.timeLeft = this.totalTime - Math.floor((Date.now() - this.startTime) / 1000);
    this.state = 'pomodoro'; // Cambiar el estado a 'pomodoro'
    this.timerStarted = true; // Asegurar que el temporizador se marca como iniciado
    this.resumeTimer(); // Llama a resumeTimer para empezar el conteo
  }

  pauseTimer() {
    // this.startTime = Date.now(); // Guardar el tiempo de inicio
    if (this.timerStarted && !this.isPaused) {
      this.isPaused = true;
      clearInterval(this.interval);
      this.remainingTime = this.timeLeft; // Guardar el tiempo restante para cuando se reanude
      console.log("Timer paused.");
    }

  }

  resumeTimer() {
    if (this.timerStarted && this.isPaused) {
      this.isPaused = false;
      this.startTime = Date.now(); // Restablecer el tiempo de inicio para el cálculo del tiempo restante

      this.interval = setInterval(() => {
        const elapsed = (Date.now() - this.startTime) / 1000;
        if (elapsed >= this.remainingTime) {
          this.timeLeft = 0;
          clearInterval(this.interval);
          this.timerStarted = false;
          this.state = 'resting';
        } else {
          this.timeLeft = this.remainingTime - Math.floor(elapsed);
        }
      }, 1000);
      console.log("Timer resumed.");
    }
  }


}

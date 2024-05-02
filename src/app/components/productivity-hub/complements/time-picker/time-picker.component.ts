import { Component, forwardRef, Input, NgZone } from '@angular/core';
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
  value: number = 0;
  representation: string = '';
  shortRepresentation: string = '';
  minutes: string = '';
  hours: string = '';
  isDisabled: boolean = false;
  onChange = (_: any) => { }
  onTouch = () => { }
  timePickerOpened: boolean = false;


  constructor() { }
  ngOnInit() {
    console.log(this.value);
    this.representationOnChanged();
  }


  change(value: any) {
    this.value = value;
    this.representationOnChanged();
    this.onChange(this.value);
  }
  writeValue(value: any): void {

    this.value = value;
    this.representationOnChanged();

  }

  registerOnChange(fn: any): void {
    this.representationOnChanged();

    this.onChange = fn;

  }
  registerOnTouched(fn: any): void {
    this.representationOnChanged();

    this.onTouch = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;

  }

  openTimePicker() {
    console.log(this.value);
    this.representationOnChanged();
    this.timePickerOpened = !this.timePickerOpened;

  }
  closeTimePicker() {
    this.timePickerOpened = false;
  }

  plus15minutes() {
    let minutes = parseInt(this.minutes);
    let hours = parseInt(this.hours);

    // Ajustar al próximo múltiplo de 15 más cercano
    minutes = Math.ceil((minutes + 1) / 15) * 15;

    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes %= 60;
    }

    // Asegurar que los valores siempre tengan al menos dos dígitos
    this.minutes = minutes.toString().padStart(2, '0');
    this.hours = hours.toString().padStart(2, '0');
    this.selectableOnChanged();
  }

  minus15minutes() {
    let minutes = parseInt(this.minutes);
    let hours = parseInt(this.hours);

    // Restar para llegar al múltiplo de 15 más cercano
    minutes = Math.floor((minutes - 1) / 15) * 15;

    if (minutes < 0) {
      hours -= 1;
      minutes += 60;  // Ajustar minutos y asegurarse de que no sean negativos
    }

    // Asegurar que los valores siempre tengan al menos dos dígitos
    this.minutes = minutes.toString().padStart(2, '0');
    this.hours = hours.toString().padStart(2, '0');
    this.selectableOnChanged();
  }

  zero() {
    this.minutes = '0';
    this.hours = '0';
    this.selectableOnChanged();
  }

  selectableOnChanged() {
    // this.zone.run(() => {
    let minutes = parseInt(this.minutes);
    let hours = parseInt(this.hours);
    if (hours < 0 || hours === null || hours % 1 !== 0) {
      hours = 0;
    } else {
      hours = Math.floor(hours); // Elimina decimales si los hay
    }

    // Asegurarse de que minutes sea un entero y manejar casos especiales
    if (minutes < 0 || minutes === null || minutes % 1 !== 0) {
      minutes = 0;
    } else {
      minutes = Math.floor(minutes); // Elimina decimales si los hay
    }
    if (minutes > 59) {
      hours = hours + Math.floor(minutes / 60);
      minutes = minutes % 60;
    }

    // Calcular el valor en milisegundos

    this.value = minutes * 60 * 1000 + hours * 60 * 60 * 1000;

    this.representationOnChanged();
    this.onChange(this.value);

    // });


  }
  representationOnChanged() {
    const minutosTotales = Math.floor(this.value / 60000);  // Convertimos milisegundos a minutos
    const horas = Math.floor(minutosTotales / 60);            // Obtenemos las horas
    const minutos = minutosTotales % 60;
    this.minutes = minutos.toString().padStart(1, '0');
    this.hours = horas.toString().padStart(1, '0');
    this.representation = `${horas.toString().padStart(1, '0')} hours and ${minutos.toString().padStart(1, '0')} minutes`
    this.shortRepresentation = `${horas.toString().padStart(1, '0')} hr ${minutos.toString().padStart(1, '0')} min`
  }



}

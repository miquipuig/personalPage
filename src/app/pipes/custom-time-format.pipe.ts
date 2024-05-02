import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customTimeFormat'
})
export class CustomTimeFormatPipe implements PipeTransform {
  transform(value: any): string {
    // Comprobamos si el valor es nulo, indefinido o cero
    if (value === null || value === undefined || value === 0) {
      return '00:00';
    }

    // Asumimos que value es el tiempo en milisegundos, creamos una fecha basada en esto
    const date = new Date(value);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();

    // Si hay horas, incluimos las horas en el formato
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else if (minutes > 0 || seconds > 0) {
      // Si no hay horas pero hay minutos o segundos, mostramos solo minutos y segundos
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      // Si no hay ni horas, ni minutos, ni segundos, devolvemos "00:00"
      return '00:00';
    }
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit: number = 40, trail: string = '...'): string {
    // Agrega verificación para manejar null o undefined adecuadamente
    if (!value) { 
      return ''; 
    }

    // Comprobación si el texto excede el límite
    if (value.length > limit) {
      return value.substring(0, limit) + trail;
    }

    return value;
  }
}

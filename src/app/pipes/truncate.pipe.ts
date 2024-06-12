import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit: number = 40, trail: string = '...', spacing: number = 0): string {
    // Agrega verificación para manejar null o undefined adecuadamente
    if (!value) {
      return '';
    }

    // Comprobación si el texto excede el límite
    if (value.length > limit) {
      value = value.substring(0, limit) + trail;


    }
    if(spacing > 0){
      let spacesToAdd = spacing - value.length;
      if (spacesToAdd > 0) {
          let spaces = '&nbsp;'.repeat(spacesToAdd);
          value = value + spaces;
      }
  }

    return value;
  }
}

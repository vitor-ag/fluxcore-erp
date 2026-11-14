import { Directive } from '@angular/core';

@Directive({
  selector: 'input[appInput], select[appSelect]',
  standalone: true,
  host: {
    class: 'fc-field',
    '(focus)': 'selectInitialZero($event)',
    '(input)': 'removeLeadingZeros($event)',
  },
})
export class FieldDirective {
  selectInitialZero(event: Event): void {
    const field = event.target;
    if (field instanceof HTMLInputElement && field.type === 'number' && field.value === '0') {
      field.select();
    }
  }

  removeLeadingZeros(event: Event): void {
    const field = event.target;
    if (field instanceof HTMLInputElement && field.type === 'number') {
      const value = field.value.replace(/^(-?)0+(?=\d)/, '$1');
      if (value !== field.value) field.value = value;
    }
  }
}

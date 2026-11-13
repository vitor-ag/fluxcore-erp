import { Directive } from '@angular/core';
@Directive({
  selector: 'input[appInput], select[appSelect]',
  standalone: true,
  host: { class: 'fc-field' },
})
export class FieldDirective {}

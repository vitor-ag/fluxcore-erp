import { ChangeDetectionStrategy, Component, input } from '@angular/core';
export type IconName =
  | 'dashboard'
  | 'sales'
  | 'purchases'
  | 'stock'
  | 'finance'
  | 'clients'
  | 'menu'
  | 'brand'
  | 'incoming'
  | 'outgoing'
  | 'search'
  | 'close'
  | 'edit'
  | 'plus'
  | 'sun'
  | 'moon';
@Component({
  selector: 'app-icon',
  standalone: true,
  template:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path [attr.d]="paths[name()]" /></svg>',
  styles: [
    ':host { display:inline-flex; width:20px; height:20px; flex:none; }',
    'svg { width:100%; height:100%; }',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly name = input<IconName>('dashboard');
  readonly paths: Record<IconName, string> = {
    dashboard: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    sales: 'M3 17l6-6 4 4 8-10 M15 5h6v6',
    purchases: 'M3 3h2l3 13h11l3-9H6 M9 20h.01 M18 20h.01',
    stock: 'M12 3l9 5v9l-9 5-9-5V8z M3 8l9 5 9-5 M12 13v9 M7.5 5.5l9 5',
    finance: 'M12 2v20 M17 6H9a4 4 0 000 8h6a4 4 0 000-8 M7 18h8a4 4 0 000-8H9',
    clients:
      'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M22 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
    menu: 'M4 6h16 M4 12h16 M4 18h16',
    brand: 'M3 5h14l4 5H3z M3 14h18v5H7z',
    incoming: 'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5',
    outgoing: 'M12 15V3 M7 8l5-5 5 5 M4 16v5h16v-5',
    search: 'M10.5 3a7.5 7.5 0 110 15 7.5 7.5 0 010-15 M16 16l5 5',
    close: 'M6 6l12 12 M18 6L6 18',
    edit: 'M4 16v4h4L20 8l-4-4z M13 7l4 4',
    plus: 'M12 5v14 M5 12h14',
    sun: 'M12 8a4 4 0 100 8 4 4 0 000-8 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5L19 19 M5 19l1.5-1.5 M17.5 6.5L19 5',
    moon: 'M20 14A8 8 0 0110 4a8 8 0 1010 10z',
  };
}

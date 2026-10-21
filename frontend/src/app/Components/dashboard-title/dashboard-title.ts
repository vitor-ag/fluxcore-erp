import { Component, input } from '@angular/core';

@Component({
  selector: 'app-dashboard-title',
  templateUrl: './dashboard-title.html',
  styleUrl: './dashboard-title.css',
})
export class DashboardTitle {
  titulo = input.required<string>();
  subtitulo = input<string>();
}
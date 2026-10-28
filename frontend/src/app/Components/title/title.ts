import { Component, input } from '@angular/core';

@Component({
  selector: 'app-title',
  templateUrl: './title.html',
  styleUrl: './title.css',
})
export class Title {
  titulo = input.required<string>();
  subtitulo = input<string>();
}
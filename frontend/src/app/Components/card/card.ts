import { Component, input } from '@angular/core';
import { CardResumo } from '../../Models/dashboard-model';

@Component({
  selector: 'app-card',
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  dados = input.required<CardResumo>();
}
import { Component, input } from '@angular/core';
import { CardResumo } from '../../Models/dashboard-model/dashboard-model';

@Component({
  selector: 'app-dashboard-card',
  templateUrl: './dashboard-card.html',
  styleUrl: './dashboard-card.css',
})
export class DashboardCard {
  dados = input.required<CardResumo>();
}
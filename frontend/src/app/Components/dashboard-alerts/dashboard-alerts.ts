import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Alerta } from '../../Models/dashboard-model/dashboard-model';

@Component({
  selector: 'app-dashboard-alerts',
  imports: [RouterLink],
  templateUrl: './dashboard-alerts.html',
  styleUrl: './dashboard-alerts.css',
})
export class DashboardAlerts {
  alertas = input.required<Alerta[]>();
}
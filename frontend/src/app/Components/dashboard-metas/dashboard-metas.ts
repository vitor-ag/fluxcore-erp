import { Component, input } from '@angular/core';
import { MetasMes } from '../../Models/dashboard-model/dashboard-model';

@Component({
  selector: 'app-dashboard-metas',
  templateUrl: './dashboard-metas.html',
  styleUrl: './dashboard-metas.css',
})
export class DashboardMetas {
  dados = input.required<MetasMes>();
}
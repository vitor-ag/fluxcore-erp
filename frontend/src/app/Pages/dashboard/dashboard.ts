import { Component } from '@angular/core';
import { DashboardAlerts } from '../../Components/dashboard-alerts/dashboard-alerts';
import { Card } from '../../Components/card/card'; 
import { DashboardFluxoCaixa } from '../../Components/dashboard-fluxo-caixa/dashboard-fluxo-caixa';
import { DashboardMetas } from '../../Components/dashboard-metas/dashboard-metas';
import { DashboardProducts } from '../../Components/dashboard-products/dashboard-products';
import { ALERTAS, CARDS, PRODUTOS, METAS } from '../../Mocks/dashboard-mock'; 
import { Title } from '../../Components/title/title';

@Component({
  selector: 'app-dashboard',
  imports: [
    Title,
    Card,
    DashboardFluxoCaixa,
    DashboardMetas,
    DashboardAlerts,
    DashboardProducts,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  cards = CARDS;
  metas = METAS;
  alertas = ALERTAS;
  produtos = PRODUTOS;
}
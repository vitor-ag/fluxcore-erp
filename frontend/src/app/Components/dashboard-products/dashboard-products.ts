import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProdutoBaixo } from '../../Models/dashboard-model/dashboard-model';

@Component({
  selector: 'app-dashboard-products',
  imports: [RouterLink],
  templateUrl: './dashboard-products.html',
  styleUrl: './dashboard-products.css',
})
export class DashboardProducts {
  produtos = input.required<ProdutoBaixo[]>();
}
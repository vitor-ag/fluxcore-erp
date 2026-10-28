import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { STATUS_VENDA, TIPO_VENDA, Venda } from '../../Models/venda-model';

@Component({
  selector: 'app-table',
  imports: [DatePipe],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  vendas = input.required<Venda[]>();
  detalhes = output<Venda>();

  readonly tipoInfo = TIPO_VENDA;
  readonly statusInfo = STATUS_VENDA;

  private moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  formatarValor(valor: number): string {
    return this.moeda.format(valor);
  }
}
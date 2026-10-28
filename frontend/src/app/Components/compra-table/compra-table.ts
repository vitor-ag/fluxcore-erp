import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { CATEGORIA_COMPRA, Compra, PAGAMENTO_COMPRA } from '../../Models/compra-model';

@Component({
  selector: 'app-compra-table',
  imports: [DatePipe],
  templateUrl: './compra-table.html',
  styleUrl: './compra-table.css',
})
export class CompraTable {
  compras = input.required<Compra[]>();

  readonly categoriaInfo = CATEGORIA_COMPRA;
  readonly pagamentoInfo = PAGAMENTO_COMPRA;

  private moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  formatarValor(valor: number): string {
    return this.moeda.format(valor);
  }
}
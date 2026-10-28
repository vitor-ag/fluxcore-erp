import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import {
  CATEGORIA_DESPESA, ContaPagarView, STATUS_CONTA, TIPO_DESPESA,
} from '../../Models/conta-pagar-model';
import { moeda } from '../../Utils/moeda';

@Component({
  selector: 'app-despesa-table',
  imports: [DatePipe],
  templateUrl: './despesa-table.html',
  styleUrl: './despesa-table.css',
})
export class DespesaTable {
  contas = input.required<ContaPagarView[]>();
  marcarPago = output<number>();

  readonly tipoInfo = TIPO_DESPESA;
  readonly categoriaInfo = CATEGORIA_DESPESA;
  readonly statusInfo = STATUS_CONTA;
  readonly moeda = moeda;
}
import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import {
  ContaReceberView, STATUS_RECEBIMENTO, TIPO_TRANSACAO,
} from '../../Models/conta-receber-model';
import { moeda } from '../../Utils/moeda';

@Component({
  selector: 'app-receber-table',
  imports: [DatePipe],
  templateUrl: './receber-table.html',
  styleUrl: './receber-table.css',
})
export class ReceberTable {
  contas = input.required<ContaReceberView[]>();
  marcarRecebido = output<number>();

  readonly tipoInfo = TIPO_TRANSACAO;
  readonly statusInfo = STATUS_RECEBIMENTO;
  readonly moeda = moeda;
}
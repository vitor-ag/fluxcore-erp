import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { CATEGORIA_MOVIMENTO, Movimento, TIPO_MOVIMENTO } from '../../Models/fluxo-caixa-model';
import { moeda } from '../../Utils/moeda';

@Component({
  selector: 'app-caixa-table',
  imports: [DatePipe],
  templateUrl: './caixa-table.html',
  styleUrl: './caixa-table.css',
})
export class CaixaTable {
  movimentos = input.required<Movimento[]>();

  readonly categoriaInfo = CATEGORIA_MOVIMENTO;
  readonly tipoInfo = TIPO_MOVIMENTO;
  readonly moeda = moeda;
}
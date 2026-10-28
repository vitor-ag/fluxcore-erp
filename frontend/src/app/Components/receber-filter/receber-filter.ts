import { Component, input, model } from '@angular/core';
import { Filter } from '../filter/filter';
import {
  FiltroRecebimentos, STATUS_RECEBIMENTO, STATUS_RECEBIMENTOS, TIPO_TRANSACAO, TIPOS_TRANSACAO,
} from '../../Models/conta-receber-model';
import { PeriodoVendas } from '../../Models/venda-model';

@Component({
  selector: 'app-receber-filter',
  imports: [Filter],
  templateUrl: './receber-filter.html',
  styleUrl: './receber-filter.css',
})
export class ReceberFilter {
  total = input.required<number>();
  periodo = model.required<PeriodoVendas>();
  filtros = model.required<FiltroRecebimentos>();

  readonly tipos = TIPOS_TRANSACAO;
  readonly statusLista = STATUS_RECEBIMENTOS;
  readonly tipoInfo = TIPO_TRANSACAO;
  readonly statusInfo = STATUS_RECEBIMENTO;

  alterar(campo: keyof FiltroRecebimentos, valor: string) {
    this.filtros.update((f) => ({ ...f, [campo]: valor }));
  }
}
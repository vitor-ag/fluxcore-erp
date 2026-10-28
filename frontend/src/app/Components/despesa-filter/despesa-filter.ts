import { Component, input, model } from '@angular/core';
import { Filter } from '../filter/filter';
import {
  FiltroContas, STATUS_CONTA, STATUS_LISTA, TIPO_DESPESA, TIPOS_DESPESA,
} from '../../Models/conta-pagar-model';
import { PeriodoVendas } from '../../Models/venda-model';

@Component({
  selector: 'app-despesa-filter',
  imports: [Filter],
  templateUrl: './despesa-filter.html',
  styleUrl: './despesa-filter.css',
})
export class DespesaFilter {
  total = input.required<number>();
  periodo = model.required<PeriodoVendas>();
  filtros = model.required<FiltroContas>();

  readonly tipos = TIPOS_DESPESA;
  readonly statusLista = STATUS_LISTA;
  readonly tipoInfo = TIPO_DESPESA;
  readonly statusInfo = STATUS_CONTA;

  alterar(campo: keyof FiltroContas, valor: string) {
    this.filtros.update((f) => ({ ...f, [campo]: valor }));
  }
}
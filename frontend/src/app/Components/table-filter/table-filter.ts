import { Component, input, model } from '@angular/core';
import {
  FiltroVendas, STATUS, STATUS_VENDA, TIPO_VENDA, TIPOS,
} from '../../Models/venda-model';

@Component({
  selector: 'app-table-filter',
  templateUrl: './table-filter.html',
  styleUrl: './table-filter.css',
})
export class TableFilter {
  total = input.required<number>();
  filtros = model.required<FiltroVendas>();

  readonly tipos = TIPOS;
  readonly statusLista = STATUS;
  readonly tipoInfo = TIPO_VENDA;
  readonly statusInfo = STATUS_VENDA;

  alterar(campo: keyof FiltroVendas, valor: string) {
    this.filtros.update((f) => ({ ...f, [campo]: valor }));
  }
}
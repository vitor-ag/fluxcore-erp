import { Component, model } from '@angular/core';
import { PeriodoVendas } from '../../Models/venda-model';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.html',
  styleUrl: './filter.css',
})
export class Filter {
  periodo = model.required<PeriodoVendas>();

  alterar(campo: 'de' | 'ate', valor: string) {
    if (!valor) return; // campo limpo: mantém o valor anterior

    this.periodo.update((p) => {
      const novo = { ...p, [campo]: valor };
      // evita período invertido (De maior que Até)
      if (novo.de > novo.ate) {
        if (campo === 'de') novo.ate = novo.de;
        else novo.de = novo.ate;
      }
      return novo;
    });
  }
}
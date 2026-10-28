import { Component, computed, signal } from '@angular/core';
import { CaixaGrafico } from '../../Components/caixa-grafico/caixa-grafico';
import { CaixaResumo } from '../../Components/caixa-resumo/caixa-resumo';
import { CaixaTable } from '../../Components/caixa-table/caixa-table';
import { Title } from '../../Components/title/title';
import { HOJE } from '../../Mocks/conta-pagar-mock';
import { MOVIMENTOS, SALDO_INICIAL } from '../../Mocks/fluxo-caixa-mock';
import { CATEGORIA_MOVIMENTO, Movimento, PontoSaldo } from '../../Models/fluxo-caixa-model';
import { somarDias } from '../../Utils/data';

// Busca sem diferenciar maiúsculas e acentos
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

@Component({
  selector: 'app-fluxo-caixa',
  imports: [Title, CaixaResumo, CaixaGrafico, CaixaTable],
  templateUrl: './fluxo-caixa.html',
  styleUrl: './fluxo-caixa.css',
})
export class FluxoCaixa {
  readonly dias = 90;
  private inicio = somarDias(HOJE, -this.dias);

  private todos = signal<Movimento[]>(MOVIMENTOS);
  busca = signal('');

  // Só os últimos 90 dias, até hoje
  private noPeriodo = computed(() =>
    this.todos().filter((m) => m.data >= this.inicio && m.data <= HOJE),
  );

  entradas = computed(() =>
    this.noPeriodo().filter((m) => m.tipo === 'entrada').reduce((t, m) => t + m.valor, 0),
  );
  saidas = computed(() =>
    this.noPeriodo().filter((m) => m.tipo === 'saida').reduce((t, m) => t + m.valor, 0),
  );
  saldo = computed(() => this.entradas() - this.saidas());
  transacoes = computed(() => this.noPeriodo().length);

  // Saldo da conta dia a dia, do início do período até hoje
  serie = computed<PontoSaldo[]>(() => {
    const variacaoPorDia = new Map<string, number>();
    for (const m of this.noPeriodo()) {
      const delta = m.tipo === 'entrada' ? m.valor : -m.valor;
      variacaoPorDia.set(m.data, (variacaoPorDia.get(m.data) ?? 0) + delta);
    }

    const pontos: PontoSaldo[] = [];
    let saldo = SALDO_INICIAL;
    for (let i = 0; i <= this.dias; i++) {
      const data = somarDias(this.inicio, i);
      saldo += variacaoPorDia.get(data) ?? 0;
      pontos.push({ data, saldo });
    }
    return pontos;
  });

  // Tabela: busca por descrição ou categoria, mais recentes primeiro
  lista = computed(() => {
    const termo = normalizar(this.busca().trim());

    return this.noPeriodo()
      .filter(
        (m) =>
          !termo ||
          normalizar(m.descricao).includes(termo) ||
          normalizar(CATEGORIA_MOVIMENTO[m.categoria].rotulo).includes(termo),
      )
      .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id);
  });
}
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { AddButton } from '../../Components/add-button/add-button';
import { Card } from '../../Components/card/card';
import { ReceberFilter } from '../../Components/receber-filter/receber-filter';
import { ReceberTable } from '../../Components/receber-table/receber-table';
import { Title } from '../../Components/title/title';
import { HOJE } from '../../Mocks/conta-pagar-mock';
import {
  CONTAS_RECEBER, FILTROS_RECEBER_VAZIOS, PERIODO_RECEBER,
} from '../../Mocks/conta-receber-mock';
import { CardResumo } from '../../Models/dashboard-model';
import {
  ContaReceber, ContaReceberView, FiltroRecebimentos, NovoRecebimento,
  StatusRecebimento, TIPO_TRANSACAO, TipoTransacao, TIPOS_TRANSACAO,
} from '../../Models/conta-receber-model';
import { PeriodoVendas } from '../../Models/venda-model';
import { diaMes, hojeISO, somarDias } from '../../Utils/data';
import { moeda } from '../../Utils/moeda';

@Component({
  selector: 'app-contas-receber',
  imports: [Title, Card, AddButton, ReceberFilter, ReceberTable, ReactiveFormsModule],
  templateUrl: './contas-receber.html',
  styleUrl: './contas-receber.css',
})
export class ContasReceber {
  private contas = signal<ContaReceber[]>(CONTAS_RECEBER);
  periodo = signal<PeriodoVendas>(PERIODO_RECEBER);
  filtros = signal<FiltroRecebimentos>(FILTROS_RECEBER_VAZIOS);

  private status(c: ContaReceber): StatusRecebimento {
    if (c.recebido) return 'recebido';
    return c.vencimento && c.vencimento < HOJE ? 'atrasado' : 'pendente';
  }

  // Data usada para período e ordenação: o vencimento ou, se for à vista, a data da venda
  private chave(c: ContaReceber): string {
    return c.vencimento ?? c.dataVenda;
  }

  private todas = computed<ContaReceberView[]>(() =>
    this.contas().map((c): ContaReceberView => ({ ...c, status: this.status(c) })),
  );

  private noPeriodo = computed(() => {
    const { de, ate } = this.periodo();
    return this.todas().filter((c) => this.chave(c) >= de && this.chave(c) <= ate);
  });

  // Tabela: período + tipo e status, vencimento mais próximo primeiro
  lista = computed(() => {
    const { tipo, status } = this.filtros();
    return this.noPeriodo()
      .filter((c) => (!tipo || c.tipo === tipo) && (!status || c.status === status))
      .sort((a, b) => this.chave(a).localeCompare(this.chave(b)) || a.id - b.id);
  });

  cards = computed<CardResumo[]>(() => {
    const soma = (l: ContaReceberView[]) => l.reduce((total, c) => total + c.valor, 0);
    const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

    // Total e recebido seguem o período; atraso e "7 dias" são relativos a hoje
    const emAberto = this.noPeriodo().filter((c) => !c.recebido);
    const recebidas = this.noPeriodo().filter((c) => c.recebido);
    const atrasadas = this.todas().filter((c) => c.status === 'atrasado');
    const limite = somarDias(HOJE, 7);
    const chegando = this.todas().filter(
      (c) => c.status === 'pendente' && c.vencimento !== null && c.vencimento <= limite,
    );

    return [
      { titulo: 'Total a receber (mês)', valor: moeda(soma(emAberto)),
        subtitulo: plural(emAberto.length, 'recebimento em aberto', 'recebimentos em aberto'),
        tom: 'neutral', valorEscuro: true },
      { titulo: 'Recebendo em 7 dias', valor: moeda(soma(chegando)),
        subtitulo: `Entradas previstas até ${diaMes(limite)}`,
        tom: 'neutral', valorEscuro: true },
      { titulo: 'Em atraso', valor: moeda(soma(atrasadas)),
        subtitulo: `${plural(atrasadas.length, 'recebimento precisa', 'recebimentos precisam')} de atenção`,
        tom: 'danger', icone: 'alerta', destaque: true },
      { titulo: 'Recebido no mês', valor: moeda(soma(recebidas)),
        subtitulo: plural(recebidas.length, 'recebimento concluído', 'recebimentos concluídos'),
        tom: 'success', destaque: true },
    ];
  });

  marcarComoRecebido(id: number) {
    this.contas.update((lista) => lista.map((c) => (c.id === id ? { ...c, recebido: true } : c)));
  }

  adicionar(nova: NovoRecebimento) {
    const id = Math.max(0, ...this.contas().map((c) => c.id)) + 1;
    // Venda à vista já nasce recebida
    this.contas.update((lista) => [...lista, { ...nova, id, recebido: nova.tipo === 'avista' }]);

    // Garante que o lançamento novo apareça: amplia o período se cair fora e limpa os filtros
    const chave = nova.vencimento ?? nova.dataVenda;
    this.periodo.update((p) => ({
      de: chave < p.de ? chave : p.de,
      ate: chave > p.ate ? chave : p.ate,
    }));
    this.filtros.set(FILTROS_RECEBER_VAZIOS);
  }

  // ---------- Formulário do modal ----------
  private fb = inject(FormBuilder);
  readonly tipos = TIPOS_TRANSACAO;
  readonly tipoInfo = TIPO_TRANSACAO;

  form = this.fb.nonNullable.group({
    cliente: ['', [Validators.required, Validators.pattern(/\S/)]],
    tipo: ['avista' as TipoTransacao, Validators.required],
    detalhe: [''],
    dataVenda: [hojeISO(), Validators.required],
    vencimento: [somarDias(hojeISO(), 30)],
    valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  // O campo de vencimento só existe para vendas a prazo e serviços
  private tipoSelecionado = toSignal(
    this.form.controls.tipo.valueChanges.pipe(startWith(this.form.controls.tipo.value)),
    { requireSync: true },
  );
  comPrazo = computed(() => this.tipoSelecionado() !== 'avista');

  resetarForm() {
    this.form.reset({
      cliente: '', tipo: 'avista', detalhe: '',
      dataVenda: hojeISO(), vencimento: somarDias(hojeISO(), 30), valor: null,
    });
  }

  salvar(modal: AddButton) {
    const f = this.form.getRawValue();
    const prazo = f.tipo !== 'avista';

    if (this.form.invalid || (prazo && !f.vencimento)) {
      this.form.markAllAsTouched();
      return;
    }

    this.adicionar({
      cliente: f.cliente.trim(),
      detalhe: f.detalhe.trim() || undefined,
      tipo: f.tipo,
      dataVenda: f.dataVenda,
      vencimento: prazo ? f.vencimento : null,
      valor: f.valor!,
    });
    modal.fechar();
  }

  invalido(campo: 'cliente' | 'dataVenda' | 'valor'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && c.touched;
  }

  vencimentoInvalido(): boolean {
    const c = this.form.controls.vencimento;
    return this.comPrazo() && !c.value && c.touched;
  }
}
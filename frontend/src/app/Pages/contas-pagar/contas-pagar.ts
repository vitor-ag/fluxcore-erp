import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddButton } from '../../Components/add-button/add-button';
import { Card } from '../../Components/card/card';
import { DespesaFilter } from '../../Components/despesa-filter/despesa-filter';
import { DespesaTable } from '../../Components/despesa-table/despesa-table';
import { Title } from '../../Components/title/title';
import {
  CONTAS_PAGAR, FILTROS_PAGAR_VAZIOS, HOJE, PERIODO_PAGAR,
} from '../../Mocks/conta-pagar-mock';
import { CardResumo } from '../../Models/dashboard-model';
import {
  CATEGORIA_DESPESA, CATEGORIAS_DESPESA, CategoriaDespesa, CONTAS_BANCARIAS, ContaPagar,
  ContaPagarView, FiltroContas, NovaConta, StatusConta, TIPO_DESPESA, TipoDespesa, TIPOS_DESPESA,
} from '../../Models/conta-pagar-model';
import { PeriodoVendas } from '../../Models/venda-model';
import { hojeISO, somarDias } from '../../Utils/data';
import { moeda } from '../../Utils/moeda';

@Component({
  selector: 'app-contas-pagar',
  imports: [Title, Card, AddButton, DespesaFilter, DespesaTable, ReactiveFormsModule],
  templateUrl: './contas-pagar.html',
  styleUrl: './contas-pagar.css',
})
export class ContasPagar {
  private contas = signal<ContaPagar[]>(CONTAS_PAGAR);
  periodo = signal<PeriodoVendas>(PERIODO_PAGAR);
  filtros = signal<FiltroContas>(FILTROS_PAGAR_VAZIOS);

  private status(c: ContaPagar): StatusConta {
    if (c.pago) return 'pago';
    return c.vencimento < HOJE ? 'vencido' : 'pendente';
  }

  private todas = computed<ContaPagarView[]>(() =>
    this.contas().map((c): ContaPagarView => ({ ...c, status: this.status(c) })),
  );

  private noPeriodo = computed(() => {
    const { de, ate } = this.periodo();
    return this.todas().filter((c) => c.vencimento >= de && c.vencimento <= ate);
  });

  // Tabela: período + tipo e status, vencimento mais próximo primeiro
  lista = computed(() => {
    const { tipo, status } = this.filtros();
    return this.noPeriodo()
      .filter((c) => (!tipo || c.tipo === tipo) && (!status || c.status === status))
      .sort((a, b) => a.vencimento.localeCompare(b.vencimento) || a.id - b.id);
  });

  cards = computed<CardResumo[]>(() => {
    const soma = (l: ContaPagarView[]) => l.reduce((total, c) => total + c.valor, 0);
    const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

    // Total e pago seguem o período; atraso e "7 dias" são relativos a hoje
    const emAberto = this.noPeriodo().filter((c) => !c.pago);
    const pagas = this.noPeriodo().filter((c) => c.pago);
    const atrasadas = this.todas().filter((c) => c.status === 'vencido');
    const limite = somarDias(HOJE, 7);
    const vencendo = this.todas().filter((c) => c.status === 'pendente' && c.vencimento <= limite);

    return [
      { titulo: 'Total a pagar (mês)', valor: moeda(soma(emAberto)),
        subtitulo: plural(emAberto.length, 'conta em aberto', 'contas em aberto'),
        tom: 'neutral', valorEscuro: true },
      { titulo: 'Vencendo em 7 dias', valor: moeda(soma(vencendo)),
        subtitulo: 'Próximos compromissos', tom: 'neutral', valorEscuro: true },
      { titulo: 'Em atraso', valor: moeda(soma(atrasadas)),
        subtitulo: `${plural(atrasadas.length, 'conta precisa', 'contas precisam')} de atenção`,
        tom: 'danger', icone: 'alerta', destaque: true },
      { titulo: 'Pago no mês', valor: moeda(soma(pagas)),
        subtitulo: plural(pagas.length, 'pagamento realizado', 'pagamentos realizados'),
        tom: 'success', destaque: true },
    ];
  });

  marcarComoPago(id: number) {
    this.contas.update((lista) => lista.map((c) => (c.id === id ? { ...c, pago: true } : c)));
  }

  adicionar(nova: NovaConta) {
    const id = Math.max(0, ...this.contas().map((c) => c.id)) + 1;
    this.contas.update((lista) => [...lista, { ...nova, id, pago: false }]);

    // Garante que a conta nova apareça: amplia o período se ela cair fora e limpa os filtros
    this.periodo.update((p) => ({
      de: nova.vencimento < p.de ? nova.vencimento : p.de,
      ate: nova.vencimento > p.ate ? nova.vencimento : p.ate,
    }));
    this.filtros.set(FILTROS_PAGAR_VAZIOS);
  }

  // ---------- Formulário do modal ----------
  private fb = inject(FormBuilder);
  readonly tipos = TIPOS_DESPESA;
  readonly tipoInfo = TIPO_DESPESA;
  readonly categorias = CATEGORIAS_DESPESA;
  readonly categoriaInfo = CATEGORIA_DESPESA;
  readonly contasBancarias = CONTAS_BANCARIAS;

  form = this.fb.nonNullable.group({
    descricao: ['', [Validators.required, Validators.pattern(/\S/)]],
    conta: [CONTAS_BANCARIAS[0], Validators.required],
    tipo: ['fixa' as TipoDespesa, Validators.required],
    categoria: ['fornecedores' as CategoriaDespesa, Validators.required],
    vencimento: [hojeISO(), Validators.required],
    valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  resetarForm() {
    this.form.reset({
      descricao: '', conta: CONTAS_BANCARIAS[0], tipo: 'fixa', categoria: 'fornecedores',
      vencimento: hojeISO(), valor: null,
    });
  }

  salvar(modal: AddButton) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const f = this.form.getRawValue();
    this.adicionar({
      descricao: f.descricao.trim(),
      conta: f.conta,
      tipo: f.tipo,
      categoria: f.categoria,
      vencimento: f.vencimento,
      valor: f.valor!,
    });
    modal.fechar();
  }

  invalido(campo: 'descricao' | 'vencimento' | 'valor'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && c.touched;
  }
}
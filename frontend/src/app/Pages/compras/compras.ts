import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddButton } from '../../Components/add-button/add-button';
import { CompraTable } from '../../Components/compra-table/compra-table';
import { Title } from '../../Components/title/title';
import { COMPRAS } from '../../Mocks/compra-mock';
import {
  CATEGORIA_COMPRA, CATEGORIAS, CategoriaCompra, Compra, CONTAS,
  NovaCompra, PAGAMENTO_COMPRA, PAGAMENTOS, PagamentoCompra,
} from '../../Models/compra-model';
import { hojeISO } from '../../Utils/data';

@Component({
  selector: 'app-compras',
  imports: [Title, AddButton, CompraTable, ReactiveFormsModule],
  templateUrl: './compras.html',
  styleUrl: './compras.css',
})
export class Compras {
  private compras = signal<Compra[]>(COMPRAS);

  // Vencimento mais distante primeiro, como no Figma
  lista = computed(() =>
    [...this.compras()].sort((a, b) => b.vencimento.localeCompare(a.vencimento) || b.id - a.id),
  );

  private fb = inject(FormBuilder);
  readonly categorias = CATEGORIAS;
  readonly categoriaInfo = CATEGORIA_COMPRA;
  readonly pagamentos = PAGAMENTOS;
  readonly pagamentoInfo = PAGAMENTO_COMPRA;
  readonly contas = CONTAS;

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.pattern(/\S/)]],
    detalhe: [''],
    categoria: ['fornecedores' as CategoriaCompra, Validators.required],
    pagamento: ['vista' as PagamentoCompra, Validators.required],
    vencimento: [hojeISO(), Validators.required],
    valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
    conta: [CONTAS[0], Validators.required],
  });

  resetarForm() {
    this.form.reset({
      titulo: '', detalhe: '', categoria: 'fornecedores', pagamento: 'vista',
      vencimento: hojeISO(), valor: null, conta: CONTAS[0],
    });
  }

  salvar(modal: AddButton) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const f = this.form.getRawValue();
    const nova: NovaCompra = {
      titulo: f.titulo.trim(),
      detalhe: f.detalhe.trim() || undefined,
      categoria: f.categoria,
      pagamento: f.pagamento,
      vencimento: f.vencimento,
      valor: f.valor!,
      conta: f.conta,
    };

    const id = Math.max(0, ...this.compras().map((c) => c.id)) + 1;
    this.compras.update((lista) => [{ ...nova, id }, ...lista]);
    modal.fechar();
  }

  invalido(campo: 'titulo' | 'vencimento' | 'valor'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && c.touched;
  }
}
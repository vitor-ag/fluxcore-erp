import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  afterNextRender,
  effect,
  input,
  inject,
  output,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { FieldDirective } from '../fields/field.directive';
import { DOCUMENT } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

export interface RecordFormValue {
  id?: number;
  nome?: string;
  sku?: string;
  categoria?: string;
  preco?: number;
  quantidade?: number;
  estoqueMinimo?: number;
  documento?: string;
  email?: string;
  telefone?: string;
  descricao?: string;
  valor?: number;
  tipo?: string;
  data?: string;
  status?: string;
}
type FieldName = Exclude<keyof RecordFormValue, 'id' | 'tipo' | 'status'>;
interface Field {
  name: FieldName;
  label: string;
  type: string;
  step?: string;
}
const validDate: ValidatorFn = (control) => {
  const value: unknown = control.value;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return { date: true };
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? null
    : { date: true };
};

@Component({
  selector: 'app-record-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, FieldDirective, IconComponent],
  templateUrl: './record-form.component.html',
  styleUrl: './record-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordFormComponent implements OnDestroy {
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private opener: HTMLElement | null = null;
  readonly requiredValidator = Validators.required;
  readonly kind = input<'produto' | 'cliente' | 'lancamento'>('lancamento');
  readonly initial = input<RecordFormValue>({});
  readonly editing = input(false);
  readonly saving = input(false);
  readonly error = input('');
  readonly saved = output<RecordFormValue>();
  readonly dismissed = output<void>();
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  readonly form = new FormBuilder().nonNullable.group({
    nome: [''],
    sku: [''],
    categoria: [''],
    preco: [0],
    quantidade: [0],
    estoqueMinimo: [0],
    documento: [''],
    email: [''],
    telefone: [''],
    descricao: [''],
    valor: [0],
    tipo: ['Entrada'],
    data: [''],
    status: ['Pendente'],
  });

  constructor() {
    effect(() => {
      const initial = this.initial();
      const kind = this.kind();
      this.form.reset();
      this.form.patchValue(initial);
      if (kind === 'cliente') this.form.controls.tipo.setValue(initial.tipo ?? 'Pessoa física');
      for (const control of Object.values(this.form.controls)) control.clearValidators();
      const requiredText = [Validators.required, Validators.pattern(/.*\S.*/)];
      if (kind === 'produto') {
        this.form.controls.nome.setValidators(requiredText);
        this.form.controls.preco.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
        ]);
        for (const control of [this.form.controls.quantidade, this.form.controls.estoqueMinimo]) {
          control.setValidators([
            Validators.required,
            Validators.min(0),
            Validators.pattern(/^\d+$/),
          ]);
        }
      } else if (kind === 'cliente') {
        this.form.controls.nome.setValidators(requiredText);
        this.form.controls.email.setValidators(Validators.email);
      } else {
        this.form.controls.descricao.setValidators(requiredText);
        this.form.controls.valor.setValidators([
          Validators.required,
          Validators.min(0.01),
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
        ]);
        this.form.controls.data.setValidators([Validators.required, validDate]);
      }
      for (const control of Object.values(this.form.controls)) control.updateValueAndValidity();
    });
    afterNextRender(() => {
      this.opener =
        this.document.activeElement instanceof HTMLElement ? this.document.activeElement : null;
      this.dialog().nativeElement.showModal();
    });
  }

  get fields(): Field[] {
    if (this.kind() === 'produto')
      return [
        { name: 'nome', label: 'Nome', type: 'text' },
        { name: 'sku', label: 'SKU', type: 'text' },
        { name: 'categoria', label: 'Categoria', type: 'text' },
        { name: 'preco', label: 'Preço de venda (R$)', type: 'number', step: '0.01' },
        { name: 'quantidade', label: 'Quantidade', type: 'number', step: '1' },
        { name: 'estoqueMinimo', label: 'Estoque mínimo', type: 'number', step: '1' },
      ];
    if (this.kind() === 'cliente')
      return [
        { name: 'nome', label: 'Nome', type: 'text' },
        { name: 'telefone', label: 'Telefone', type: 'tel' },
        { name: 'documento', label: 'Documento', type: 'text' },
        { name: 'email', label: 'E-mail', type: 'email' },
      ];
    return [
      { name: 'descricao', label: 'Descrição', type: 'text' },
      { name: 'valor', label: 'Valor (R$)', type: 'number', step: '0.01' },
      { name: 'data', label: 'Data do lançamento', type: 'date' },
      { name: 'categoria', label: 'Categoria', type: 'text' },
    ];
  }

  message(name: FieldName): string {
    const control = this.form.controls[name];
    if (!control.touched || !control.invalid) return '';
    if (control.hasError('required')) return 'Preencha este campo.';
    if (control.hasError('email')) return 'Informe um e-mail válido.';
    if (control.hasError('date')) return 'Informe uma data válida.';
    if (control.hasError('pattern') && (name === 'valor' || name === 'preco'))
      return 'Use no máximo duas casas decimais.';
    if (control.hasError('min'))
      return name === 'valor'
        ? 'Informe um valor maior que zero.'
        : 'O valor não pode ser negativo.';
    if (name === 'quantidade' || name === 'estoqueMinimo') return 'Informe uma quantidade inteira.';
    return 'Informe um texto válido.';
  }

  submit(): void {
    if (this.saving()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      afterNextRender(
        () =>
          this.dialog()
            .nativeElement.querySelector<HTMLInputElement>('input[aria-invalid="true"]')
            ?.focus(),
        { injector: this.injector },
      );
      return;
    }
    const values = this.form.getRawValue();
    const initial = this.initial();
    if (this.kind() === 'produto')
      this.saved.emit({
        id: initial.id,
        nome: values.nome.trim(),
        sku: values.sku,
        categoria: values.categoria,
        preco: values.preco,
        quantidade: values.quantidade,
        estoqueMinimo: values.estoqueMinimo,
      });
    else if (this.kind() === 'cliente')
      this.saved.emit({
        id: initial.id,
        nome: values.nome.trim(),
        telefone: values.telefone,
        documento: values.documento,
        email: values.email,
        tipo: values.tipo,
      });
    else
      this.saved.emit({
        id: initial.id,
        descricao: values.descricao.trim(),
        valor: values.valor,
        data: values.data,
        categoria: values.categoria,
        tipo: values.tipo,
        status: values.status,
      });
  }

  cancel(event?: Event): void {
    event?.preventDefault();
    if (!this.saving()) this.dismissed.emit();
  }
  ngOnDestroy(): void {
    this.dialog().nativeElement.close();
    if (this.opener?.isConnected) this.opener.focus();
  }
}

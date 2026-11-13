import { TestBed } from '@angular/core/testing';
import { RecordFormComponent } from './record-form.component';

describe('RecordFormComponent', () => {
  const originalShow = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
  const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');
  beforeAll(() => {
    // jsdom não implementa o comportamento modal nativo; ele é conferido no navegador.
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.removeAttribute('open');
      },
    });
  });
  afterAll(() => {
    if (originalShow) Object.defineProperty(HTMLDialogElement.prototype, 'showModal', originalShow);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
    if (originalClose) Object.defineProperty(HTMLDialogElement.prototype, 'close', originalClose);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
  });
  it('rejeita datas inexistentes e valores com mais de duas casas decimais', async () => {
    const fixture = await create('lancamento');
    fixture.componentInstance.form.patchValue({
      descricao: 'Venda',
      valor: 0.015,
      data: '2026-02-30',
    });
    fixture.componentInstance.submit();
    expect(fixture.componentInstance.form.controls.data.hasError('date')).toBe(true);
    expect(fixture.componentInstance.form.controls.valor.hasError('pattern')).toBe(true);
  });
  async function create(kind: 'produto' | 'cliente' | 'lancamento') {
    await TestBed.configureTestingModule({ imports: [RecordFormComponent] }).compileComponents();
    const fixture = TestBed.createComponent(RecordFormComponent);
    fixture.componentRef.setInput('kind', kind);
    fixture.detectChanges();
    return fixture;
  }

  it('rejects blank descriptions and zero amounts', async () => {
    const fixture = await create('lancamento');
    const saved = vi.fn();
    fixture.componentInstance.saved.subscribe(saved);
    fixture.componentInstance.form.patchValue({ descricao: '   ', valor: 0, data: '2026-11-06' });
    fixture.componentInstance.submit();
    expect(saved).not.toHaveBeenCalled();
    expect(fixture.componentInstance.message('valor')).toContain('maior que zero');
  });

  it('rejects fractional stock quantities', async () => {
    const fixture = await create('produto');
    fixture.componentInstance.form.patchValue({ nome: 'Cimento', quantidade: 1.5 });
    fixture.componentInstance.submit();
    expect(fixture.componentInstance.form.controls.quantidade.invalid).toBe(true);
  });

  it('emits only customer fields and preserves its type', async () => {
    const fixture = await create('cliente');
    fixture.componentRef.setInput('initial', { id: 3, nome: 'Empresa', tipo: 'Pessoa jurídica' });
    fixture.detectChanges();
    const saved = vi.fn();
    fixture.componentInstance.saved.subscribe(saved);
    fixture.componentInstance.submit();
    expect(saved).toHaveBeenCalledWith({
      id: 3,
      nome: 'Empresa',
      tipo: 'Pessoa jurídica',
      email: '',
      documento: '',
      telefone: '',
    });
  });
});

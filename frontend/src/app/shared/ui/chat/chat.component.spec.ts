import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ChatApiService } from '../../../core/services/chat-api.service';
import { ChatResponse } from '../../../core/models/chat.model';
import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
  let fixture: ComponentFixture<ChatComponent>;
  let response: Subject<ChatResponse>;
  const send = vi.fn();
  let showModal: PropertyDescriptor | undefined;
  let close: PropertyDescriptor | undefined;

  function element<T extends HTMLElement>(selector: string): T {
    const result = (fixture.nativeElement as HTMLElement).querySelector<T>(selector);
    if (!result) throw new Error(`Elemento não encontrado: ${selector}`);
    return result;
  }

  beforeEach(async () => {
    response = new Subject<ChatResponse>();
    send.mockReset().mockReturnValue(response);
    showModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
    close = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');
    Object.defineProperties(HTMLDialogElement.prototype, {
      showModal: {
        configurable: true,
        value: function (this: HTMLDialogElement) {
          this.open = true;
        },
      },
      close: {
        configurable: true,
        value: function (this: HTMLDialogElement) {
          this.open = false;
        },
      },
    });
    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [{ provide: ChatApiService, useValue: { enviar: send } }],
    }).compileComponents();
    fixture = TestBed.createComponent(ChatComponent);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
  });

  afterEach(() => {
    fixture.destroy();
    for (const [name, descriptor] of [
      ['showModal', showModal],
      ['close', close],
    ] as const) {
      if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
      else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
    }
  });

  it('começa vazio com sugestões e sem consultar a API', () => {
    expect(element('.chat-empty').textContent).toContain('O que você quer consultar?');
    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.chat-suggestions button'),
    ).toHaveLength(4);
    expect(send).not.toHaveBeenCalled();
  });

  it('gerencia foco ao abrir e ao fechar com Escape', () => {
    element<HTMLButtonElement>('.chat-launcher').click();
    expect(document.activeElement).toBe(element('textarea'));
    element('dialog').dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(fixture.componentInstance.opened()).toBe(false);
    expect(document.activeElement).toBe(element('.chat-launcher'));
  });

  it('envia pergunta, bloqueia repetição e renderiza resposta somente como texto', () => {
    fixture.componentInstance.question.setValue('Qual o saldo?');
    fixture.componentInstance.send();
    fixture.componentInstance.send();
    fixture.detectChanges();
    expect(send).toHaveBeenCalledExactlyOnceWith([{ papel: 'usuario', texto: 'Qual o saldo?' }]);
    expect(element<HTMLButtonElement>('button[type=submit]').disabled).toBe(true);
    expect(element('[role=status]').textContent).toContain('Consultando');
    response.next({ resposta: '<img src=x onerror=alert(1)>\nResposta literal.' });
    response.complete();
    fixture.detectChanges();
    expect(element('ol').textContent).toContain('<img src=x');
    expect(element('ol').querySelector('img')).toBeNull();
    expect(fixture.componentInstance.sending()).toBe(false);
  });

  it('mostra erro e tenta novamente sem duplicar a pergunta', () => {
    fixture.componentInstance.question.setValue('Pendências?');
    fixture.componentInstance.send();
    response.error(new Error('Falha de conexão.'));
    fixture.detectChanges();
    expect(element('[role=alert]').textContent).toBe('Falha de conexão.');
    const retryResponse = new Subject<ChatResponse>();
    send.mockReturnValue(retryResponse);
    fixture.componentInstance.retry();
    expect(send).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.messages()).toHaveLength(1);
    retryResponse.next({ resposta: 'Resposta.' });
    retryResponse.complete();
    expect(fixture.componentInstance.messages()).toHaveLength(2);
    expect(fixture.componentInstance.error()).toBe('');
  });

  it('permite editar a pergunta que falhou', () => {
    fixture.componentInstance.question.setValue('Estoque?');
    fixture.componentInstance.send();
    response.error(new Error('Falhou.'));
    fixture.componentInstance.editQuestion();
    expect(fixture.componentInstance.question.value).toBe('Estoque?');
    expect(fixture.componentInstance.messages()).toHaveLength(0);
    expect(fixture.componentInstance.error()).toBe('');
  });

  it('Enter envia, Shift+Enter e composição preservam a digitação', () => {
    fixture.componentInstance.question.setValue('Saldo?');
    fixture.componentInstance.onKeydown(
      new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true }),
    );
    fixture.componentInstance.onKeydown(
      new KeyboardEvent('keydown', { key: 'Enter', isComposing: true }),
    );
    expect(send).not.toHaveBeenCalled();
    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('rejeita pergunta vazia ou longa e permite nova conversa', () => {
    fixture.componentInstance.question.setValue('  ');
    fixture.componentInstance.send();
    fixture.componentInstance.question.setValue('a'.repeat(2001));
    fixture.componentInstance.send();
    expect(send).not.toHaveBeenCalled();
    fixture.componentInstance.suggest('Qual o saldo?');
    response.next({ resposta: 'Resposta.' });
    response.complete();
    fixture.componentInstance.newConversation();
    expect(fixture.componentInstance.messages()).toHaveLength(0);
    expect(fixture.componentInstance.question.value).toBe('');
  });

  it('mantém a consulta ao fechar e preserva o histórico ao reabrir', () => {
    fixture.componentInstance.openChat();
    fixture.componentInstance.suggest('Saldo?');
    fixture.componentInstance.closeChat();
    response.next({ resposta: 'Resposta.' });
    response.complete();
    fixture.componentInstance.openChat();
    expect(fixture.componentInstance.messages()).toHaveLength(2);
    expect(send).toHaveBeenCalledTimes(1);
  });
});

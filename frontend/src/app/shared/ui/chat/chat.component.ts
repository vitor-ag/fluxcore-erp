import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ChatApiService } from '../../../core/services/chat-api.service';
import { chatContext, ChatMessage } from '../../../core/models/chat.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent {
  private readonly api = inject(ChatApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly launcher = viewChild.required<ElementRef<HTMLButtonElement>>('launcher');
  private readonly editor = viewChild.required<ElementRef<HTMLTextAreaElement>>('editor');
  private readonly history = viewChild.required<ElementRef<HTMLElement>>('history');
  private failedRequest: ChatMessage[] | null = null;
  readonly opened = signal(false);
  readonly sending = signal(false);
  readonly error = signal('');
  readonly messages = signal<ChatMessage[]>([]);
  readonly question = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(2000)],
  });
  readonly suggestions = [
    'Qual é meu saldo realizado?',
    'Quanto tenho a receber?',
    'Quais são as pendências a pagar?',
    'Quais produtos estão com estoque baixo?',
  ];

  openChat(): void {
    if (this.opened()) return;
    this.dialog().nativeElement.showModal();
    this.opened.set(true);
    this.editor().nativeElement.focus();
    this.scrollToLatest();
  }

  closeChat(): void {
    this.dialog().nativeElement.close();
    this.onDialogClosed();
  }

  onDialogClosed(): void {
    if (!this.opened()) return;
    this.opened.set(false);
    this.launcher().nativeElement.focus();
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.closeChat();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.send();
    }
  }

  suggest(text: string): void {
    this.question.setValue(text);
    this.send();
  }

  send(): void {
    if (this.sending() || this.error() || this.question.invalid) return;
    const text = this.question.value.trim();
    if (!text) return;
    this.messages.update((messages) => [...messages, { papel: 'usuario', texto: text }]);
    this.question.reset();
    this.request(chatContext(this.messages()));
  }

  retry(): void {
    if (this.sending() || !this.failedRequest) return;
    this.request(this.failedRequest);
  }

  editQuestion(): void {
    if (this.sending() || !this.failedRequest) return;
    const last = this.messages().at(-1);
    this.messages.update((messages) => messages.slice(0, -1));
    this.question.setValue(last?.texto ?? '');
    this.error.set('');
    this.failedRequest = null;
    this.editor().nativeElement.focus();
  }

  newConversation(): void {
    if (this.sending()) return;
    this.messages.set([]);
    this.question.reset();
    this.error.set('');
    this.failedRequest = null;
    this.editor().nativeElement.focus();
  }

  private request(context: ChatMessage[]): void {
    this.sending.set(true);
    this.error.set('');
    this.failedRequest = context;
    if (this.opened()) this.editor().nativeElement.focus();
    this.scrollToLatest();
    this.api
      .enviar(context)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.sending.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.messages.update((messages) => [
            ...messages,
            { papel: 'assistente', texto: response.resposta },
          ]);
          this.failedRequest = null;
          this.scrollToLatest();
        },
        error: (error: unknown) => {
          this.error.set(
            error instanceof Error ? error.message : 'Não foi possível consultar o assistente.',
          );
          this.scrollToLatest();
        },
      });
  }

  private scrollToLatest(): void {
    afterNextRender(
      () => {
        if (!this.opened()) return;
        const history = this.history().nativeElement;
        history.scrollTop = this.messages().length ? history.scrollHeight : 0;
      },
      { injector: this.injector },
    );
  }
}

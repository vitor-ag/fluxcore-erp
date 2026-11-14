import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { API_URL } from '../../core/api/api-url.token';

interface Account { id: number; nome: string; email: string; role: string; ativo: boolean }

@Component({
  selector: 'app-user-admin',
  imports: [FormsModule],
  template: `
    @if (email()) {
      <section class="box">
        <h2>Usuários e permissões</h2>
        @if (message()) { <p role="status">{{ message() }}</p> }
        <div class="table-scroll"><table>
          <thead><tr><th>Usuário</th><th>Perfil</th><th>Ativo</th><th>Ações</th></tr></thead>
          <tbody>
            @for (user of users(); track user.id) {
              <tr>
                <td><b>{{ user.nome }}</b><small>{{ user.email }}</small></td>
                <td><select class="fc-field" [attr.aria-label]="'Perfil de ' + user.nome" [(ngModel)]="user.role" [disabled]="busy() || email() === user.email">
                  <option value="ADMIN">Administrador</option><option value="USER">Operador</option><option value="VIEWER">Consulta</option>
                </select></td>
                <td><input type="checkbox" [attr.aria-label]="'Ativar ' + user.nome" [(ngModel)]="user.ativo" [disabled]="busy() || email() === user.email" /></td>
                <td><button type="button" class="outline" (click)="save(user)" [disabled]="busy() || email() === user.email">Salvar</button></td>
              </tr>
            }
          </tbody>
        </table></div>
      </section>
    }
  `,
})
export class UserAdmin {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_URL);
  readonly email = signal('');
  readonly users = signal<Account[]>([]);
  readonly busy = signal(false);
  readonly message = signal('');

  constructor() {
    this.http.get<{ email: string; role: string }>(this.api + '/auth/profile').subscribe({
      next: ({ email, role }) => {
        if (role !== 'ADMIN') return;
        this.email.set(email);
        this.http.get<Account[]>(this.api + '/admin/usuarios').subscribe({
          next: (users) => this.users.set(users),
          error: () => this.message.set('Não foi possível carregar os usuários.'),
        });
      },
      error: () => this.email.set(''),
    });
  }

  save(user: Account): void {
    this.busy.set(true);
    this.http.put(this.api + '/admin/usuarios/' + user.id, { role: user.role, ativo: user.ativo }).subscribe({
      next: () => { this.busy.set(false); this.message.set('Permissões atualizadas.'); },
      error: () => { this.busy.set(false); this.message.set('Não foi possível atualizar as permissões.'); },
    });
  }
}

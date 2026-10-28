import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {

  private rotasFinanceiro = ['/contasPagar', '/contasReceber', '/fluxoCaixa', '/resultado'];

  financeiroAberto = signal(
    this.rotasFinanceiro.some((rota) => window.location.pathname.startsWith(rota))
  );

  toggleFinanceiro() {
    this.financeiroAberto.update((aberto) => !aberto);
  }

}

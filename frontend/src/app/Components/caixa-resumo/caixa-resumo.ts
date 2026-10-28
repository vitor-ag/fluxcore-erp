import { Component, computed, input } from '@angular/core';
import { moeda, moedaMil } from '../../Utils/moeda';

@Component({
  selector: 'app-caixa-resumo',
  templateUrl: './caixa-resumo.html',
  styleUrl: './caixa-resumo.css',
})
export class CaixaResumo {
  saldo = input.required<number>();
  entradas = input.required<number>();
  saidas = input.required<number>();
  transacoes = input.required<number>();
  dias = input(90);

  positivo = computed(() => this.saldo() >= 0);
  saldoTexto = computed(() => `${this.positivo() ? '+' : '–'} ${moeda(Math.abs(this.saldo()))}`);
  entradasTexto = computed(() => `+ ${moedaMil(this.entradas())}`);
  saidasTexto = computed(() => `– ${moedaMil(this.saidas())}`);
}
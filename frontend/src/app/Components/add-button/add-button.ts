import { Component, ElementRef, input, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-add-button',
  templateUrl: './add-button.html',
  styleUrl: './add-button.css',
})
export class AddButton {
  rotulo = input.required<string>();    
  titulo = input.required<string>();     
  textoSalvar = input('Salvar');

  abriu = output<void>();   
  salvou = output<void>();  

  private dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  abrir() {
    this.abriu.emit();
    this.dialog().nativeElement.showModal();
  }

  fechar() {
    this.dialog().nativeElement.close();
  }

  enviar(evento: Event) {
    evento.preventDefault();
    this.salvou.emit();
  }
}
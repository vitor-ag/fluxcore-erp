import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: '<app-button (pressed)="onPress()">Salvar</app-button>',
})
class ButtonHost {
  readonly onPress = vi.fn();
}

describe('ButtonComponent', () => {
  it('renders its projected label and emits a press', async () => {
    await TestBed.configureTestingModule({ imports: [ButtonHost] }).compileComponents();
    const fixture = TestBed.createComponent(ButtonHost);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();

    expect(fixture.componentInstance.onPress).toHaveBeenCalledOnce();
  });

  it('supports a disabled state', async () => {
    await TestBed.configureTestingModule({ imports: [ButtonComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
  });
});

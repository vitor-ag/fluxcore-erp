import { chatContext, ChatMessage } from './chat.model';

describe('chatContext', () => {
  function history(count: number, text = 'Texto'): ChatMessage[] {
    return Array.from({ length: count }, (_, index) => ({
      papel: index % 2 === 0 ? 'usuario' : 'assistente',
      texto: text,
    }));
  }

  it('preserva pares completos e termina com a pergunta atual', () => {
    const result = chatContext(history(31));
    expect(result).toHaveLength(19);
    expect(result[0].papel).toBe('usuario');
    expect(result.at(-1)?.papel).toBe('usuario');
  });

  it('limita o tamanho total removendo pares antigos sem alterar o histórico exibido', () => {
    const messages = history(19, 'a'.repeat(3000));
    const result = chatContext(messages);
    expect(result.reduce((sum, item) => sum + item.texto.length, 0)).toBeLessThanOrEqual(16000);
    expect(result.every((item) => item.texto.length <= 2000)).toBe(true);
    expect(result[0].papel).toBe('usuario');
    expect(result.length % 2).toBe(1);
    expect(messages[0].texto.length).toBe(3000);
  });
});

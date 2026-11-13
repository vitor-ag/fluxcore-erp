export interface ChatMessage {
  papel: 'usuario' | 'assistente';
  texto: string;
}

export interface ChatResponse {
  resposta: string;
}

// Mantém pares completos e reserva espaço para a pergunta atual no contrato do servidor.
export function chatContext(messages: readonly ChatMessage[]): ChatMessage[] {
  const context = messages.slice(-19).map((message) => ({
    ...message,
    texto: message.texto.slice(0, 2000),
  }));
  while (context.reduce((total, message) => total + message.texto.length, 0) > 16000) {
    context.splice(0, 2);
  }
  return context;
}

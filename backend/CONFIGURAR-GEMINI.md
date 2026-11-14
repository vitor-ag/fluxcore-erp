# Assistente FluxCore com Gemini

A interface e POST `/api/chat` mantêm o contrato existente. O provedor agora é o Gemini por sua camada oficial de compatibilidade com Chat Completions. O SDK Java que já estava instalado é reutilizado apenas como cliente HTTP tipado; não há nova dependência nem chamada à OpenAI.

## Configurar

Crie uma chave do **Google AI Studio** em https://aistudio.google.com/apikey. A chave OpenAI que você já criou não serve para a API do Google. Não envie nenhuma chave pelo chat, não coloque no frontend e não publique o `.env`.

No `.env` da raiz do projeto, junto ao `docker-compose.yml`, acrescente:

```dotenv
GEMINI_API_KEY=COLE_SUA_CHAVE_DO_GOOGLE_SOMENTE_AQUI
GEMINI_MODEL=gemini-3.5-flash-lite
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
```

Preserve as variáveis do MySQL. As variáveis antigas OPENAI_* não são mais usadas por esta integração. O `.env.example` traz o modelo e a URL preenchidos, com a chave vazia. Modelo e URL têm os mesmos padrões no application.yml e podem ser substituídos por configuração; não estão fixados em código Java.

O Compose repassa GEMINI_* ao back-end. O `.env` é lido ao criar o container; editar esse arquivo e reiniciar um container existente não atualiza seu ambiente. Recrie o back-end com essas variáveis. Ao rodar Maven/Java pela IDE ou terminal, configure as variáveis no ambiente do processo; o `.env` não é carregado automaticamente.

O projeto desta máquina usa a instância local `fluxcore-calibre-api` e MySQL na porta 3307. Ela pode ser atualizada preservando sua conexão atual; não recrie o MySQL nem seus volumes apenas para configurar o chat.

Sem GEMINI_API_KEY, a API inicia e o chat responde HTTP 503 com mensagem de configuração pendente. Criar uma chave não garante disponibilidade do modelo ou cota na conta; confira os limites no AI Studio. Ao esgotar a cota, a aplicação mostra indisponibilidade e permite tentar novamente sem fazer retentativas automáticas.

## Plano gratuito

A documentação consultada lista `gemini-3.5-flash-lite` com entrada/saída gratuitas na cota Free. Não é uso ilimitado: disponibilidade e limites variam por projeto e conta. O chat pode fazer várias requisições para responder a uma pergunta, pois precisa consultar ferramentas. Não há habilitação automática de faturamento no código.

Nos serviços gratuitos, o Google informa uso de conteúdo para melhorar produtos. Para a demonstração acadêmica, use dados fictícios, especialmente em clientes e lançamentos. Não foi criado seed, apagado cadastro nem enviado dado real à API durante os testes desta adaptação.

## Implementação

- GeminiChatProvider envia prompt como mensagem system, histórico, as seis funções permitidas e limites de saída pela rota `/chat/completions` do Google.
- Respostas finais incompletas, bloqueadas ou inválidas não são apresentadas como sucesso.
- As mensagens de chamada de função são preservadas com seus metadados; o teste de duas rodadas verifica a thought signature do Gemini e o tool_call_id da resposta.
- Os cálculos em BigDecimal, filtros, ferramentas somente leitura, limites de histórico/rodadas/concorrência, timeouts e bloqueio de ferramentas desconhecidas continuam ativos.
- Chave em header, não em query string ou corpo. O código não registra conversas, respostas brutas ou credenciais.
- Os DTOs públicos, entidades, cadastros e frontend não foram alterados.

## Testar

Sem chave real nem MySQL, execute os testes do chat na pasta backend:

```powershell
.\mvnw.cmd test '-Dtest=com.fluxcore.fluxcore_erp.chat.*Test'
```

Com a conexão MySQL configurada no ambiente, gere o pacote limpo para remover classes do provedor anterior:

```powershell
.\mvnw.cmd clean package
```

O teste de contexto original precisa de MySQL. Para validar sem alterar o esquema, defina `SPRING_JPA_HIBERNATE_DDL_AUTO=validate` no processo de testes.

Depois de iniciar o back-end com a chave Gemini, abra o frontend em http://localhost:4200, clique em Assistente e pergunte pelo saldo ou estoque baixo. Esse teste real usa sua cota e envia ao Google os dados necessários à resposta. Não presuma valores: compare a resposta com os registros das telas.

Documentação oficial consultada:
- https://ai.google.dev/gemini-api/docs/openai
- https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/rate-limits

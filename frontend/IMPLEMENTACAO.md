# Implementação do FluxCore — Calibre

Entrega de 11/11/2026. A fundação visual e as seis telas foram atualizadas sobre o projeto existente. A stack, os contratos REST, os DTOs e as regras financeiras foram preservados; nenhuma biblioteca de UI ou gráficos foi instalada.

## Identidade e fundação

Calibre usa fundo cinza frio, superfícies claras, texto grafite e um acento laranja. O tema claro é o padrão; o escuro tem pares próprios de superfície/texto, controles, foco e semânticas. Tokens de cor, tipografia, espaços, bordas, raios e movimento ficam em `src/styles/_tokens.scss`. Os estilos globais estão divididos em base, controles e estruturas.

A IBM Plex Sans é servida localmente em WOFF2, com `font-display: swap`, pesos 400–600 e licença OFL em `public/fonts`. O arquivo tem 45.712 bytes e não depende de CDN. Valores, datas, documentos e SKUs recebem tratamento numérico consistente. A marca e o favicon SVG usam dois percursos complementares, representando entrada e saída.

O seletor `app-theme-toggle` oferece “Usar tema escuro” e “Usar tema claro”. `ThemeService` usa um signal somente de leitura para expor o tema e um effect para aplicar `data-theme` e `color-scheme` no documento. A chave local `fluxcore.theme` aceita apenas `light` ou `dark`. Se o navegador bloquear o armazenamento, a troca continua funcionando durante a sessão; a preferência não fica salva.

Botões mantêm variantes primary, outline, ghost e danger. Campos, tabelas, diálogo e toast usam superfícies planas, bordas de 1px e raios pequenos. Sombras ficam reservadas a sobreposições. Os status combinam texto e ponto, sem pílulas ou fundos preenchidos. As transições funcionais respeitam `prefers-reduced-motion`.

Os skeletons são estáticos: o resumo acompanha saldo dominante e valores de apoio menores; as listas usam linhas. Vazios de cadastro/ausência de dados usam um marcador simples, enquanto busca sem resultado usa lupa. Erros mostram nova tentativa e mensagens em português.

## Telas entregues

### Shell e navegação

A navegação horizontal no desktop e o menu móvel foram preservados, com marca Calibre e seletor de tema. Há skip-link, estado ativo, foco no título após navegação e fechamento por teclado. O menu móvel mantém o foco dentro dele e torna o conteúdo principal inerte durante a abertura. Ao ampliar a janela, fecha e libera o conteúdo.

### Dashboard geral

O saldo registrado é o número dominante, com receber/pagar menores ao lado. Até cinco pendências aparecem por data de lançamento crescente, com desempate por id; concluídos e cancelados ficam fora dessa lista. A reposição é secundária.

O histórico SVG considera somente lançamentos concluídos, usa escala temporal proporcional, identifica zero e oferece alternativa tabular com valores exatos. Não há metas, previsão, percentuais inventados ou uma curva decorativa sem registros.

### Financeiro

As áreas A pagar, A receber, Fluxo de caixa e Resultado mantêm o parâmetro de rota `aba`, inclusive ao recarregar e abrir links do dashboard. A seleção usa botões nativos, `aria-pressed` e relação com o conteúdo apresentado.

O resumo vem antes dos filtros, com valor dominante em cor de texto e totais de apoio menores. Negativos usam a semântica de erro/saída. O fluxo usa concluídos; o resultado por categoria inclui pendentes não cancelados e não é apresentado como lucro contábil.

### Vendas e Compras

As duas telas mantêm o cadastro de lançamentos, busca, filtros por data/status, totais do conjunto filtrado, paginação, edição, exclusão e conclusão. O total tem mais destaque que os subtotais. Ações de conclusão distinguem “Registrar recebimento” e “Registrar pagamento”; a tabela apresenta “Recebido” para entradas concluídas.

A ajuda contextual explica que o registro é financeiro e que a quantidade de produtos é ajustada no Estoque. Nenhuma baixa ou reposição automática foi inventada.

### Estoque

Cadastro, edição e exclusão de produtos; busca por nome/SKU/categoria; filtro de estoque baixo e prioridades de reposição. Quantidade atual e mínimo são dados reais do produto.

O valor exibido é quantidade × preço de venda, identificado como valor do catálogo a preço de venda. Não é custo de estoque. A atualização da quantidade é manual e não gera um histórico fictício de movimentos.

### Clientes

Cadastro, edição, exclusão, busca por nome/documento/e-mail e ordenação. O tipo de pessoa é mantido na edição. A tela mostra contatos reais; não apresenta pendência financeira por cliente sem vínculo no contrato da API.

## Formulários e acessibilidade

Os formulários de gravação usam Reactive Forms tipados e diálogo nativo compartilhado. Validam obrigatórios, e-mail, quantidades inteiras não negativas, datas de calendário e valores com no máximo duas casas decimais. Lançamentos exigem valor maior que zero; preço de produto pode ser zero.

Labels, `aria-invalid`, `aria-describedby`, bloqueio de envio repetido e mensagens de validação foram preservados. O diálogo permite Escape quando não está salvando, mantém foco, restaura-o ao cancelar e leva ao primeiro campo inválido. Após gravação concluída, o título da tela recebe foco.

Tabelas têm cabeçalhos semânticos e região de scroll por teclado. O vazio cabe em telas estreitas; tabelas preenchidas podem rolar horizontalmente. O gráfico oferece descrição e tabela exata. Foco visível, navegação por teclado, alvos confortáveis e movimento reduzido permanecem parte da fundação.

Os filtros de consulta usam controles nativos ligados a signals; os formulários de gravação usam FormGroup tipado. Componentes continuam standalone/OnPush, com rotas lazy. Não foi acrescentado tipo explícito `any` ao código da aplicação.

## Regras financeiras preservadas

- Somas e acumulações convertem valores para centavos inteiros.
- Concluídos: Pago, Recebido, Confirmado ou Confirmada, sem distinção de maiúsculas/minúsculas.
- Cancelados: Cancelado ou Cancelada; não entram em saldos, pendências ou resultados.
- Saldo realizado: entradas concluídas menos saídas concluídas, partindo de zero.
- Histórico: acumulado de concluídos no conjunto de datas selecionado, também partindo de zero.
- Resultado por categoria: registros não cancelados, inclusive pendentes, com interpretação explicada na tela.
- A data da API é a data de lançamento. Não existe data independente de vencimento ou pagamento.
- Novos lançamentos usam o calendário local, sem conversão UTC.

## Contratos REST utilizados

| Recurso | Listar | Criar | Atualizar | Excluir |
| --- | --- | --- | --- | --- |
| Lançamentos | GET /api/lancamentos | POST /api/lancamentos | PUT /api/lancamentos/{id} | DELETE /api/lancamentos/{id} |
| Produtos | GET /api/produtos | POST /api/produtos | PUT /api/produtos/{id} | DELETE /api/produtos/{id} |
| Clientes | GET /api/clientes | POST /api/clientes | PUT /api/clientes/{id} | DELETE /api/clientes/{id} |

O serviço de lançamentos mantém GET /api/lancamentos/resumo. Esse endpoint soma registros de todos os status no backend atual. Por isso as telas calculam seus resumos a partir dos lançamentos carregados, aplicando os filtros e as regras de concluídos/cancelados acima. Não foi alterado o backend para mudar esse comportamento.

Os payloads de escrita continuam restritos aos campos existentes dos DTOs. A URL é centralizada em `core/api/api-url.token.ts`: `http://localhost:8080/api` no desenvolvimento local e `/api` fora de localhost/127.0.0.1, usando o proxy nginx existente.

## Token e tratamento de erros

O interceptor acrescenta Bearer somente ao prefixo configurado da API e quando `AuthTokenService.token` contém uma credencial. O token fica em memória. Não foram inventados login, sessão, endpoint de autenticação ou chave persistente de credenciais.

O interceptor de erros traduz falhas de conexão e status HTTP para português. Cada tela apresenta o erro no contexto do carregamento ou formulário; notificações de resultado usam o serviço compartilhado do shell.

## Limitações do backend

O backend não fornece autenticação, contas bancárias/saldo inicial, metas, previsão financeira, parcelas, vencimento separado, custo, unidade de medida, vínculo lançamento–cliente, itens de venda/compra ou histórico de movimentações de estoque.

Consequências no produto:

- O saldo registrado não é apresentado como saldo bancário.
- Não há “vence hoje”, “atrasado”, forecast ou percentuais fictícios.
- Não há valor em aberto por cliente calculado sem vínculo de dados.
- Vendas/compras não movimentam estoque automaticamente.
- Quantidades são editadas manualmente, sem histórico de movimentos inventado.
- Não foram criadas telas de login ou novos endpoints.

Rótulos e ajuda contextual explicam o que afeta a interpretação de uma ação. As limitações técnicas completas ficam nesta documentação, sem cards de funcionalidades indisponíveis ocupando o dashboard.

## Ambiente local validado

A cópia completa de Downloads é a origem do projeto desta entrega. Uma outra cópia em `C:\Users\mathe\fluxcore-erp` continha somente um scaffold de backend, sem os controllers de domínio, e respondia 404 nos endpoints usados pelo frontend.

A API correta foi compilada com o Dockerfile fornecido e executada em `fluxcore-calibre-api`, reutilizando a rede e o MySQL existente. O alias de rede `backend` mantém a resolução usada pelo nginx. O MySQL não foi resetado e seus volumes foram preservados. Os scaffolds antigos `fluxcore-backend` e `fluxcore-frontend` foram parados e mantidos.

Na apresentação local, `fluxcore-mysql` e `fluxcore-calibre-api` atendem banco e API. O frontend roda com `npm start` na pasta `frontend` original de Downloads e abre em http://localhost:4200; a API está em http://localhost:8080/api. A origem CORS configurada é http://localhost:4200.

Veja no [README.md](README.md) como iniciar banco/API e executar `npm start`. O frontend Docker antigo deve permanecer parado para liberar 4200. Os comandos reutilizam os containers desta máquina; uma instalação nova precisa configurar API, banco e rede pelo procedimento do repositório principal.

Nenhum arquivo de backend, Docker Compose, Dockerfile, nginx, pipeline ou `.env` foi alterado. Credenciais não foram copiadas para esta documentação.

## Validação da entrega

~~~powershell
npm test -- --watch=false
npm run build -- --configuration production
~~~

| Verificação | Resultado |
| --- | --- |
| Vitest | 63 testes aprovados em 25 arquivos |
| Build de produção | Aprovado, sem avisos de budget |
| Inicial bruto | 312,04 kB |
| CSS global inicial | 11,77 kB |
| Transferência inicial estimada | 85,29 kB |
| Budget inicial de aviso/erro | 500 kB / 1 MB, preservado |
| Budget de estilo por componente | 4 kB / 8 kB, preservado |
| Fonte local | 45.712 bytes, recurso separado do bundle inicial |
| Integração API real CRUD/CORS | 17 verificações aprovadas |

Os testes cobrem serviços, interceptors, tema e persistência, formulários, centavos, status, filtros, paginação, ordenação, áreas do financeiro, ações de tabela e teclado/foco do menu. O jsdom não implementa `showModal`/`close`; os testes simulam apenas essas APIs de ambiente, e o comportamento real do diálogo foi conferido no navegador.

O ensaio de integração criou, editou, consultou e excluiu registros temporários identificados como teste. Conferiu CORS, persistência e deltas de resumo. A limpeza em `finally` removeu somente os IDs criados pelo ensaio e restaurou listas/totais.

No navegador, foi registrada uma venda pendente de R$ 12,34, concluída pelo comando de recebimento e conferida no dashboard: saldo de R$ 12,34, nenhuma pendência e um ponto real no histórico. O registro foi excluído após a conferência; as listas e o resumo retornaram ao estado vazio/zero. Não foi deixado seed permanente.

As evidências externas da entrega são `fluxcore-api-ambiente-calibre.md`, `fluxcore-api-integracao-calibre.json` e `fluxcore-ui-integracao-calibre.json`. Os scripts e as entradas auxiliares de QA não fazem parte da aplicação distribuída.

O backend compilou pela imagem Docker existente com `-DskipTests`; isso não representa execução de testes Java. O build estático do frontend passou, mas a imagem Docker do frontend não foi reconstruída nesta entrega; Dockerfile e nginx permanecem originais. A conferência final priorizou desktop; a revisão mobile adicional ficou para outro dia.

## Conferência manual com dados do seu ambiente

1. Inicie banco/API e abra o frontend em http://localhost:4200.
2. Alterne claro/escuro e recarregue para conferir a preferência.
3. Navegue por teclado: skip-link, menu móvel, filtros, tabela e formulário.
4. Em dados descartáveis, cadastre cliente/produto, edite e confira persistência após recarregar.
5. Registre entrada e saída pendentes; conclua-as e confira saldo e histórico.
6. Use filtros de data/status, busca, paginação e as quatro áreas do financeiro.
7. Confira cadastro vazio, busca sem resultado e erro com nova tentativa.

Essas operações gravam na API real. Use registros de teste identificados e remova apenas os que você criou ao encerrar a conferência.

# FluxCore ERP — frontend Calibre

ERP financeiro para micro e pequenas empresas, com seis telas: Dashboard geral, Financeiro, Vendas, Compras, Estoque e Clientes. O frontend existente foi evoluído com Angular 22, TypeScript 6, RxJS, SCSS e Vitest, sem novas dependências.

A identidade **Calibre** usa neutros frios, acento laranja, números tabulares e superfícies planas. O tema claro é o padrão; o botão de tema oferece a versão escura e guarda a escolha localmente.

## Abrir a apresentação local

Endereço: **[http://localhost:4200](http://localhost:4200)**. A API real está em **http://localhost:8080/api**.

O frontend roda com `npm start` na pasta `frontend` da cópia completa de Downloads. A API e o banco usam os containers locais já preparados. Com Docker Desktop aberto, inicie o banco e aguarde o estado saudável antes da API:

~~~powershell
docker start fluxcore-mysql
docker ps --filter name=fluxcore-mysql
~~~

Após o banco ficar saudável:

~~~powershell
docker start fluxcore-calibre-api
~~~

Esses comandos reutilizam os containers desta máquina; não provisionam uma instalação nova. Os antigos `fluxcore-backend` e `fluxcore-frontend` estão parados e preservados. Não inicie o frontend antigo: ele ocupa 4200. Nomes e portas da outra cópia também podem conflitar ao executar Compose.

Use **localhost:4200** no navegador. Essa é a origem permitida pelo CORS atual; `127.0.0.1:4200` não é uma origem equivalente para essa configuração.

## Abrir no Angular

Na pasta `frontend` da cópia completa do repositório:

~~~powershell
npm start
~~~

Execute `npm ci` apenas se precisar instalar as dependências do lockfile. A aplicação abre em http://localhost:4200 e atualiza ao salvar os arquivos. Se `ng serve` já estiver ativo nessa porta, use a instância aberta.

Mantenha MySQL e `fluxcore-calibre-api` ativos. Encerre o `ng serve` com Ctrl+C quando terminar.

Fora de localhost/127.0.0.1, a URL do frontend é relativa a `/api`, compatível com o proxy nginx existente. Configure a API/MySQL pelo procedimento do repositório principal ao instalar em outra máquina.

## Verificar

~~~powershell
npm test -- --watch=false
npm run build -- --configuration production
~~~

O build gera `dist/frontend/browser`. Validação desta entrega: **63 testes em 25 arquivos aprovados**, build inicial de **312,04 kB**, incluindo **11,77 kB de CSS**, sem avisos de budget. Os limites originais continuam em 500 kB/1 MB para o inicial e 4 kB/8 kB por estilo de componente.

O Dockerfile e o nginx originais foram mantidos para deploy estático. A imagem Docker do frontend não foi reconstruída nesta entrega; a apresentação local usa `ng serve`.

A API real passou por 17 verificações de integração CRUD/CORS. O fluxo de venda pendente → recebimento → saldo/gráfico também foi conferido no navegador. Os registros temporários dos ensaios foram excluídos.

## Organização

- `src/app/core`: DTOs, serviços REST, interceptors, notificações, tema e cálculos financeiros.
- `src/app/shared/layout`: shell, navegação horizontal, menu móvel e foco de navegação.
- `src/app/shared/ui`: botões, campos, tabela, gráfico SVG, formulário em diálogo nativo, status, toast, estados e seletor de tema.
- `src/app/features`: seis componentes de rota, carregados por lazy loading.
- `src/app/features/workspace/workspace-page.ts`: carregamento, filtros, paginação e CRUD compartilhados.
- `src/styles/`: tokens claros/escuros, base, controles e estruturas globais.
- `public/fonts`: IBM Plex Sans WOFF2 local, com licença OFL; arquivo de 45.712 bytes.
- `public/favicon.svg` e `public/fluxcore-mark.svg`: nova marca em dois percursos de fluxo.

O saldo representa entradas concluídas menos saídas concluídas, não saldo bancário. Pendências usam data de lançamento; a API não tem vencimento separado. Vendas e compras registram lançamentos financeiros, sem movimentação automática de estoque.

Consulte [IMPLEMENTACAO.md](IMPLEMENTACAO.md) para contratos, regras, validação e limitações do backend.

# FluxCore ERP - Backend do MVP

Este diretório contém exclusivamente o backend do FluxCore: API REST Java/Spring Boot e persistência MySQL. O frontend Angular existente fica fora do escopo desta implementação. A API e o modelo publicados aqui servem como contrato para quem desenvolver o frontend.

## Escopo de dados

O esquema inicial corresponde às 17 tabelas e aos campos do diagrama ER fornecido. A migração `src/main/resources/db/migration/V1__create_mvp_schema.sql` é a fonte executável do esquema; ela não acrescenta entidades ou campos ao diagrama. O endpoint `GET /api/model` informa tabelas, colunas e tipos realmente instalados no banco.

O diagrama não especifica comprimento de texto, precisão decimal nem os valores aceitos pelos campos `enum`. Para viabilizar o primeiro esquema MySQL, textos usam `VARCHAR` com limites explícitos na migração, decimais monetários usam `DECIMAL(15,2)` e quantidades `DECIMAL(15,3)`. Os enums estão como `VARCHAR(100)` até a equipe definir seus valores válidos. Esses detalhes estão centralizados na migração para facilitar ajustes alinhados ao diagrama.

## API disponível

Todos os recursos usam o nome exato da tabela no caminho. O JSON usa os nomes das colunas do banco em `snake_case`.

| Método | Caminho | Uso |
| --- | --- | --- |
| `GET` | `/api/model` | Lista tabelas, colunas e tipos do modelo instalado |
| `GET` | `/api/{tabela}` | Lista registros da tabela |
| `GET` | `/api/{tabela}/{id}` | Busca um registro pelo ID |
| `POST` | `/api/{tabela}` | Cria registro; envie apenas campos da tabela, sem `id` |
| `PATCH` | `/api/{tabela}/{id}` | Atualiza parcialmente; envie apenas os campos alterados |
| `DELETE` | `/api/{tabela}/{id}` | Exclui o registro |

Os recursos correspondem às 17 tabelas: `clientes`, `fornecedores`, `categorias_produto`, `produtos`, `vendas`, `venda_itens`, `compras`, `compra_itens`, `movimentacoes_estoque`, `usuarios`, `categorias_financeiras`, `contas_financeiras`, `lancamentos_financeiros`, `metas`, `empresa`, `previsoes_financeiras` e `alertas_discrepancia`. Vendas, itens de venda, compras, itens de compra e movimentações de estoque só podem ser gravados pelos fluxos dedicados abaixo. Usuários só podem ser criados pelo cadastro; leitura omite `senha_hash` e edição genérica de perfil foi bloqueada.

## Autenticação

`POST /api/auth/register` cria um usuário com perfil inicial `USER`. O nome e e-mail são obrigatórios; e-mail precisa ser válido e senha precisa ter ao menos 8 caracteres e no máximo 72 bytes em UTF-8. Senhas são armazenadas com BCrypt. E-mails duplicados retornam `409`.

```json
{ "nome": "Pessoa usuária", "email": "pessoa@empresa.com", "senha": "uma-senha-segura" }
```

`POST /api/auth/login` valida as credenciais e devolve os dados públicos do usuário. O acesso às demais rotas usa HTTP Basic: o frontend envia `Authorization: Basic <base64(email:senha)>` em cada requisição. Em produção, use HTTPS. O cadastro não recebe nem define `role` ou `senha_hash` enviados pelo cliente.

## Validação e operações transacionais

`POST /api/vendas/confirmar` espera `clienteId`, `formaPagamento`, `itens` com `produtoId` e `quantidade`, além de `desconto` opcional. O preço vem do cadastro do produto. A operação verifica cliente, produto ativo, preço e estoque; calcula os subtotais e o total; e grava venda, itens, saídas de estoque e lançamento de receita na mesma transação.

```json
{
  "clienteId": 12,
  "formaPagamento": "PIX",
  "desconto": 0,
  "dataPagamento": "2026-10-13",
  "itens": [{ "produtoId": 4, "quantidade": 2 }]
}
```

`POST /api/compras/confirmar` espera `fornecedorId`, `formaPagamento` e `itens` com `produtoId`, `quantidade` e `precoUnitario`. A operação verifica fornecedor e produtos, calcula os totais e grava compra, itens, entradas de estoque e lançamento de despesa na mesma transação.

```json
{
  "fornecedorId": 3,
  "formaPagamento": "BOLETO",
  "dataVencimento": "2026-10-20",
  "itens": [{ "produtoId": 4, "quantidade": 10, "precoUnitario": 15.50 }]
}
```

Ambos aceitam `dataVencimento` e `dataPagamento` opcionais no formato `AAAA-MM-DD`. Sem data de pagamento, o lançamento financeiro começa `PENDENTE`; com data de pagamento, começa `PAGO`. Status e tipos gravados são `CONFIRMADA`, `SAIDA`/`ENTRADA`, `RECEITA`/`DESPESA` e `PENDENTE`/`PAGO`, pois os valores dos enums não foram detalhados nos documentos de referência. Produtos não podem ter estoque alterado diretamente por CRUD; os fluxos mantêm estoque e movimentações sincronizados.

Erros de validação de requisição retornam `400` com os campos inválidos; falta de estoque ou inconsistência do fluxo retorna `422`; conflito de integridade retorna `409`.

### Exemplo para o frontend

```http
POST /api/clientes
Content-Type: application/json

{
  "nome": "Cliente exemplo",
  "cpf_cnpj": "12345678900",
  "email": "cliente@exemplo.com"
}
```

A resposta de criação contém o registro persistido, incluindo o `id` gerado. Campo desconhecido retorna `400`; recurso ou registro inexistente retorna `404`. Restrições de integridade do banco continuam valendo para chaves estrangeiras.

O campo `origem`/`origem_id` dos lançamentos preserva a referência lógica indicada pelo diagrama e não é chave estrangeira. A autenticação atual usa HTTP Basic e o perfil inicial é `USER`; uma política de permissões por perfil ainda precisa ser definida. Filtros e paginação também não fazem parte desta etapa.

## Rodar localmente

Com o MySQL do `docker-compose.yml` ativo, execute na raiz do repositório:

```bash
docker compose up mysql
```

Depois, em `backend/`:

```bash
./mvnw spring-boot:run
```

No Windows, use `mvnw.cmd spring-boot:run`. A API fica em `http://localhost:8080`; o CORS local permite `http://localhost:4200`. Flyway aplica a migração versionada ao iniciar e Hibernate valida o esquema, sem alterá-lo automaticamente.

No Docker Compose, configure `.env` conforme `.env.example` e execute `docker compose up --build` na raiz do repositório.

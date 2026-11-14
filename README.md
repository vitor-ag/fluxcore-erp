# FluxCore ERP

ERP financeiro inteligente para micro e pequenas empresas, com organizador e previsão de fluxo de caixa, controle de estoque integrado ao caixa, e (em desenvolvimento futuro) IA de recomendação estratégica. O assistente com Gemini já está integrado e pode ser configurado no backend.

Projeto desenvolvido para a matéria **Startup Project One** — curso de Análise e Desenvolvimento de Sistemas.

## Stack Tecnológica

- **Frontend:** Angular
- **Backend:** Java + Spring Boot
- **Banco de dados:** MySQL
- **Ambiente de desenvolvimento:** Docker + Docker Compose

## Pré-requisitos

Você só precisa ter instalado:

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (inclui o Docker Compose)

Não é necessário instalar Java, Node ou MySQL na sua máquina — tudo roda dentro dos containers.

> Se preferir desenvolver o frontend ou backend fora do Docker (mais comum no dia a dia, rodando só o banco no Docker), veja a seção **Desenvolvimento sem Docker completo** mais abaixo.

## Como começar (fluxo de Fork + Pull Request)

1. Clique em **Fork** no canto superior direito deste repositório no GitHub, criando uma cópia na sua conta.
2. Clone o **seu fork** (não o repositório original) na sua máquina:
   ```bash
   git clone https://github.com/SEU_USUARIO/fluxcore-erp.git
   cd fluxcore-erp
   ```
3. Adicione o repositório original como `upstream`, para conseguir puxar atualizações depois:
   ```bash
   git remote add upstream https://github.com/USUARIO_ORIGINAL/fluxcore-erp.git
   ```
4. Copie o arquivo de variáveis de ambiente de exemplo:
   ```bash
   cp .env.example .env
   ```
5. Suba o ambiente completo:
   ```bash
   docker compose up --build
   ```
6. Acesse:
   - Frontend: http://localhost:4200
   - Backend (API): http://localhost:8080
   - MySQL: localhost:3307 (usuário/senha definidos no `.env`)

## Fluxo de trabalho (Git)

Sempre trabalhe em uma branch separada, nunca direto na `main`:

```bash
git checkout -b feature/nome-da-sua-tarefa
```

Sugestão de prefixos de branch:
- `feature/` → nova funcionalidade (ex: `feature/cadastro-clientes`)
- `fix/` → correção de bug (ex: `fix/erro-login`)
- `docs/` → alterações de documentação

### Padrão de commits

Use mensagens curtas e no padrão *Conventional Commits*:

```
feat: adiciona tela de cadastro de clientes
fix: corrige cálculo do saldo no dashboard
docs: atualiza README com instruções do Docker
refactor: reorganiza serviço de lançamentos financeiros
```

### Abrindo um Pull Request

1. Suba sua branch para o **seu fork**:
   ```bash
   git push origin feature/nome-da-sua-tarefa
   ```
2. No GitHub, abra um Pull Request do seu fork para a branch `main` (ou `develop`, se o grupo decidir usar) do repositório original.
3. Descreva o que foi feito e marque outro integrante para revisar antes do merge.
4. Antes de abrir o PR, atualize sua branch com as últimas mudanças do repositório original:
   ```bash
   git fetch upstream
   git merge upstream/main
   ```

## Estrutura do projeto

```
fluxcore-erp/
├── backend/          # API Java + Spring Boot
├── frontend/          # Aplicação Angular
├── docker-compose.yml # Orquestração dos containers (mysql, backend, frontend)
├── .env.example        # Modelo de variáveis de ambiente
└── README.md
```

## Dados fictícios para apresentação

Com a API iniciada, execute na raiz do projeto usando PowerShell 7:

```powershell
$senhaDemo = Read-Host 'Senha da conta de demonstração (mínimo de 8 caracteres)' -MaskInput
./demonstracao.ps1 -Senha $senhaDemo
```

Entre em http://localhost:4200 com **apresentacao@fluxcore.example** e a senha escolhida. Para repetir a carga no mesmo banco, use a mesma senha. Se a API estiver em outro endereço, informe `-Api` com a URL base incluindo `/api`.

A carga usa a API para inserir dados fictícios da Mercearia Aurora, incluindo produtos, fornecedores, contas, histórico financeiro, metas e movimentações de estoque. Use um banco de desenvolvimento ou apresentação, pois a carga adiciona registros ao banco em uso.

## Assistente e administração de usuários

Para habilitar as respostas do assistente, preencha `GEMINI_API_KEY` no `.env` e recrie o backend com `docker compose up -d backend`. Veja [a configuração do Gemini](backend/CONFIGURAR-GEMINI.md).

Para habilitar a administração, crie uma conta pelo FluxCore, coloque seu e-mail em `FLUXCORE_ADMIN_EMAIL` no `.env` e recrie o backend. Entre nessa conta e abra **Gestão** para alterar perfis e status de usuários.

## Desenvolvimento sem Docker completo

Use Java 21, Node.js 24 e MySQL 8. Para iniciar apenas o banco, rode `docker compose up -d mysql`. O backend usa Flyway para aplicar as migrações ao iniciar.

Em PowerShell, na raiz do projeto:

```powershell
$env:SPRING_DATASOURCE_URL = 'jdbc:mysql://127.0.0.1:3307/fluxcore_db?serverTimezone=America/Sao_Paulo'
$env:SPRING_DATASOURCE_USERNAME = 'fluxcore'
$env:SPRING_DATASOURCE_PASSWORD = 'fluxcore'
Set-Location backend
./mvnw.cmd spring-boot:run
```

Ajuste o nome do banco e as credenciais de acordo com o ambiente. Em outro terminal, na raiz:

```powershell
npm --prefix frontend ci
npm --prefix frontend start
```

## Testes

- Frontend: `npm --prefix frontend test -- --watch=false`
- Build: `npm --prefix frontend run build`
- Backend: na pasta `backend`, rode `./mvnw.cmd test` (ou `sh mvnw test` no Linux/macOS) com as mesmas variáveis de conexão ao MySQL.
## Parar o ambiente

```bash
docker compose down
```

Para apagar também os dados do banco (reset completo):
```bash
docker compose down -v
```

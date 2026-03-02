# Devlup - Sistema de Controle Financeiro e Gestão

## Sobre

Sistema interno da **Devlup** para controle financeiro, gestão de projetos e organização de informações de clientes. Uso exclusivo dos 2 sócios da empresa.

**Empresa:** Devlup (desenvolvimento de software, 2 sócios)

---

## Identidade Visual

### Paleta de Cores

| Cor       | HEX       | Uso                                      |
| --------- | --------- | ---------------------------------------- |
| Laranja   | `#d76b2a` | Cor primária (botões, destaques, ações)  |
| Azul      | `#3c5cd5` | Cor secundária (links, acentos, ícones)  |
| Escuro    | `#282828` | Backgrounds escuros, textos principais   |

### Logo

- Arquivos disponíveis em `/brand/logo/`
- `devlup_logo_final.svg` — logo principal (laranja + azul sobre fundo escuro)
- `logo_branco.svg` — versão branca (para fundos escuros)
- `LOGO_PRETO_SEM_FUNDO.png` — versão preta sem fundo (para fundos claros)

### Direção Visual

- Interface escura (dark mode como padrão, usando `#282828` como base)
- Laranja `#d76b2a` para ações primárias e elementos de destaque
- Azul `#3c5cd5` para elementos secundários e informativos
- Tipografia clean e moderna

---

## Stack Tecnológica

| Camada     | Tecnologia                  |
| ---------- | --------------------------- |
| Frontend   | Next.js 15 (App Router)     |
| Estilização | Tailwind CSS               |
| ORM        | Prisma                      |
| Banco      | Neon (PostgreSQL serverless) |
| Auth       | NextAuth.js (email/senha)   |
| Deploy     | Vercel                      |

---

## Módulos do Sistema

### 1. Autenticação

- Login com email e senha
- Apenas 2 usuários (os sócios)
- Sessão protegida em todas as rotas

### 2. Dashboard

Visão completa ao entrar no sistema:

- Faturamento do mês (total recebido)
- Parcelas a receber (próximos vencimentos)
- Parcelas vencidas / clientes inadimplentes
- Despesas do mês
- Lucro líquido do mês (receita - despesas)
- Divisão entre sócios (50/50 sobre o lucro)
- Gráficos de evolução mensal (receita, despesa, lucro)

### 3. Clientes

- Cadastro de clientes (nome, empresa, email, telefone, CNPJ/CPF)
- Lista de clientes com busca e filtro
- Visualização dos projetos vinculados ao cliente
- Histórico financeiro por cliente

### 4. Projetos

Cada projeto possui as seguintes abas/seções:

#### 4.1 Visão Geral

- Nome do projeto
- Cliente vinculado
- Tipo: **avulso** (valor fechado) ou **recorrente** (mensalidade)
- Status: em negociação, em andamento, pausado, concluído, cancelado
- Valor total (avulso) ou valor mensal (recorrente)
- Data de início e prazo de entrega (avulso)
- Descrição do projeto

#### 4.2 Kanban de Tarefas

- Board com colunas: **A Fazer**, **Fazendo**, **Feito**
- Cada tarefa tem:
  - Título
  - Descrição (opcional)
  - Sócio responsável (atribuição)
  - Prioridade (baixa, média, alta)
  - Data limite (opcional)
- Drag & drop entre colunas
- Filtro por sócio responsável

#### 4.3 Acessos e Credenciais

Lista estruturada de acessos do projeto:

- Nome da plataforma (ex: Vercel, AWS, Painel do cliente)
- URL
- Login/usuário
- Senha
- Notas adicionais
- Botão de copiar em cada campo

> Senhas salvas em texto simples (uso interno confiável).

#### 4.4 Notas do Projeto

- Editor de texto livre (markdown ou rich text)
- Para documentar: instruções de deploy, decisões técnicas, observações do cliente, links úteis, qualquer informação relevante

#### 4.5 Financeiro do Projeto

- **Receitas:** parcelas recebidas e a receber
- **Despesas:** custos vinculados ao projeto (freelancers, licenças, APIs, etc.)
- **Lucro do projeto:** receita total - despesas totais

---

### 5. Financeiro

#### 5.1 Receitas (Entrada)

**Projetos avulsos:**
- Valor total do projeto parcelado em X vezes
- Cada parcela tem: número, valor, data de vencimento, status (pendente/pago/vencido)
- Marcação manual de pagamento (data que recebeu)

**Projetos recorrentes:**
- Cobrança mensal com valor variável (pode mudar mês a mês)
- Gera uma cobrança por mês com valor definido
- Mesmos status: pendente, pago, vencido

#### 5.2 Despesas (Saída)

- Despesas gerais da empresa (servidores, ferramentas, domínios, contabilidade, etc.)
- Despesas por projeto (freelancers, licenças específicas, APIs)
- Cada despesa tem: descrição, valor, data, categoria, projeto vinculado (opcional)
- Categorias configuráveis (infraestrutura, ferramentas, pessoal, impostos, outros)

#### 5.3 Lucro e Divisão

- Lucro geral: receita total - despesas totais
- Lucro por projeto: receita do projeto - despesas do projeto
- Divisão entre sócios: **50/50 fixo** sobre o lucro
- Visualização mensal do quanto cada sócio tem a receber

---

### 6. Relatórios

- Faturamento por período (mensal, trimestral, anual)
- Receita por cliente
- Receita por projeto
- Despesas por categoria
- Lucro por projeto
- Evolução financeira ao longo do tempo (gráficos)
- Projetos mais rentáveis vs menos rentáveis

---

## Estrutura de Páginas

```
/login                        → Tela de login
/dashboard                    → Dashboard principal
/clientes                     → Lista de clientes
/clientes/[id]                → Detalhes do cliente
/projetos                     → Lista de projetos
/projetos/[id]                → Projeto (visão geral)
/projetos/[id]/kanban         → Kanban de tarefas
/projetos/[id]/acessos        → Credenciais e acessos
/projetos/[id]/notas          → Notas do projeto
/projetos/[id]/financeiro     → Financeiro do projeto
/financeiro                   → Visão financeira geral
/financeiro/receitas          → Todas as receitas/parcelas
/financeiro/despesas          → Todas as despesas
/financeiro/relatorios        → Relatórios e gráficos
```

---

## Modelo de Dados (principais entidades)

```
User
├── id, name, email, password, role

Client
├── id, name, company, email, phone, document (CPF/CNPJ)

Project
├── id, name, description, type (avulso/recorrente), status
├── clientId, totalValue, monthlyValue
├── startDate, deadline
│
├── Tasks (Kanban)
│   ├── id, title, description, status (todo/doing/done)
│   ├── assigneeId (sócio), priority, dueDate, position (ordem)
│
├── Credentials
│   ├── id, platform, url, username, password, notes
│
├── Notes
│   ├── id, title, content, createdAt, updatedAt
│
├── Installments (parcelas - avulso)
│   ├── id, number, value, dueDate, status, paidAt
│
├── RecurringCharges (cobranças - recorrente)
│   ├── id, referenceMonth, value, dueDate, status, paidAt
│
├── Expenses (despesas do projeto)
│   ├── id, description, value, date, categoryId

Expense (despesas gerais)
├── id, description, value, date, categoryId, projectId (opcional)

ExpenseCategory
├── id, name (infraestrutura, ferramentas, pessoal, impostos, outros)
```

---

## Regras de Negócio

1. **Parcelas vencidas:** parcela com `dueDate` passada e status `pendente` vira automaticamente `vencido`
2. **Lucro do projeto:** soma das parcelas pagas - soma das despesas do projeto
3. **Lucro geral mensal:** total recebido no mês - total de despesas no mês
4. **Divisão sócios:** lucro geral / 2 (50% cada)
5. **Projetos recorrentes:** ao definir o valor do mês, o sistema gera a cobrança com vencimento
6. **Status do projeto:** muda manualmente (não depende de pagamento)

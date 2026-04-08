# 💰 Finanças Pessoais

> Sistema web para controle de finanças pessoais — despesas, receitas, parcelamentos e muito mais.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38BDF8?style=flat-square&logo=tailwindcss)

---

## 📸 Telas

### Dashboard — visão geral do mês
Saldo do mês, barra de comprometimento do salário, gráfico de despesas por categoria e últimos lançamentos.

```
┌─────────────────────────────────────────┐
│ 💰 Finanças          Olá, Marlon!       │
│                      [+ Adicionar]       │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Saldo do mês         R$ 1.250,00   │ │
│ │ 💵 Receitas R$ 3.000  💸 R$ 1.750  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Meu salário          R$ 3.000,00        │
│ [===========----] 72% usado             │
│ Livre: R$ 835,00                        │
│                                         │
│ 📊 Onde o dinheiro foi                  │
│  Mercado 35% · Casa 25% · Moto 20%...  │
└─────────────────────────────────────────┘
```

### Adicionar lançamento
Fluxo em 2 passos — primeiro escolhe o tipo, depois preenche os detalhes.

```
┌─────────────────────┐    ┌─────────────────────┐
│ O que registrar?    │    │ 💸 Nova despesa      │
│                     │ →  │                     │
│ [💸 Despesa      ]  │    │ Descrição: Mercado   │
│ [💵 Receita      ]  │    │ Valor: R$ 250,00     │
│                     │    │ Data: 07/04/2026     │
│                     │    │ Categoria: 🛒         │
└─────────────────────┘    └─────────────────────┘
```

### Parcelamentos
Controle total das dívidas: dívida total, compromisso mensal, barra de progresso de cada item.

```
┌─────────────────────────────────────────┐
│ 💳 Parcelamentos         [+ Novo]        │
│                                         │
│ DÍVIDA TOTAL        COMPROMISSO/MÊS     │
│ R$ 4.800,00         R$ 400,00           │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📱 Notebook                     ✅  │ │
│ │ R$ 400/mês  · 6 restantes           │ │
│ │ [========----------] 4/10 pagas     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## ✨ Funcionalidades

- **Dashboard completo** com saldo do mês, receitas, despesas e gráfico por categoria
- **Controle de salário** com barra de comprometimento percentual
- **Lançamentos** de receitas e despesas com data, categoria e forma de pagamento
- **Parcelamentos** com controle de parcelas pagas, dívida total e compromisso mensal
- **Categorias** — 21 categorias padrão já criadas (Casa, Mercado, Moto, Farmácia...) + criação personalizada
- **Formas de pagamento** — Pix, Débito, Crédito, Dinheiro, Transferência
- **Filtro por mês** com navegação entre meses
- **Gráfico de despesas** por categoria com legenda e percentuais
- **Autenticação** completa (login, cadastro, logout) via Supabase Auth
- **Dados isolados por usuário** com Row Level Security no banco
- **Responsivo** — funciona no celular (bottom nav) e desktop (sidebar)

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Estilo | Tailwind CSS 3 |
| Roteamento | React Router DOM 6 |
| Estado global | Zustand |
| Formulários | React Hook Form + Zod |
| Gráficos | Recharts |
| Backend/Auth/DB | Supabase |

---

## 🚀 Como rodar localmente

### Pré-requisitos
- [Node.js 20+](https://nodejs.org)
- Conta gratuita no [Supabase](https://supabase.com)

### 1. Clone o repositório

```bash
git clone https://github.com/MarlonVieiraBalielo/financas.git
cd financas
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e cole o conteúdo de `supabase/schema.sql`
3. Clique em **Run**

### 4. Conecte ao seu projeto

Abra `src/lib/supabase.ts` e substitua:

```ts
const SUPABASE_URL = "https://SEU_PROJETO.supabase.co";
const SUPABASE_ANON_KEY = "SUA_CHAVE_AQUI";
```

> As chaves ficam **apenas na sua máquina** — nunca suba esse arquivo com as credenciais reais para o GitHub.

### 5. Rode

```bash
npm run dev
```

Acesse **http://localhost:5173**

---

## 🗄️ Estrutura do banco

```
profiles         → salário, nome do usuário
categories       → categorias (21 padrão + personalizadas)
transactions     → receitas e despesas
installments     → parcelamentos com controle de parcelas
```

Todas as tabelas possuem **Row Level Security** — cada usuário acessa apenas seus próprios dados.

---

## 📁 Estrutura do projeto

```
src/
├── components/
│   ├── AddModal.tsx        # Modal de novo lançamento (2 passos)
│   ├── AppLayout.tsx       # Layout com sidebar/bottom nav
│   ├── BalanceCard.tsx     # Card de saldo
│   ├── ExpenseChart.tsx    # Gráfico por categoria
│   ├── Footer.tsx          # Rodapé
│   ├── MonthPicker.tsx     # Navegação entre meses
│   └── TransactionCard.tsx # Card de cada transação
├── pages/
│   ├── Dashboard.tsx       # Página inicial
│   ├── Transactions.tsx    # Lista de transações
│   ├── Installments.tsx    # Parcelamentos
│   ├── Categories.tsx      # Categorias
│   ├── Profile.tsx         # Perfil e salário
│   ├── Login.tsx
│   └── Register.tsx
├── stores/                 # Estado global (Zustand)
├── lib/supabase.ts         # Cliente Supabase
└── types/index.ts          # Tipagens TypeScript
```

---

## 🔒 Segurança

- Autenticação gerenciada pelo Supabase Auth
- Row Level Security em todas as tabelas — nenhum usuário acessa dados de outro
- Chave `anon` do Supabase é pública por design (sem segredos no frontend)
- Configure os domínios permitidos em **Supabase → Auth → URL Configuration**

---

## 👤 Autor

**Marlon Balielo**

[![GitHub](https://img.shields.io/badge/GitHub-MarlonVieiraBalielo-181717?style=flat-square&logo=github)](https://github.com/MarlonVieiraBalielo)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Marlon_Balielo-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/marlon-balielo)

---

## 📄 Licença

MIT — use à vontade.

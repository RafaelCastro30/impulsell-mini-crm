# Impulsell Mini CRM

Mini CRM para equipe comercial gerenciar leads de campanhas de marketing.

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Desenvolvimento (API + Frontend em http://localhost:3000)
npm run dev

# Build de produção
npm run build

# Testes
npm test

# Lint
npm run lint
```

## 📋 Funcionalidades

- **Listar leads** - Tabela com nome, telefone, origem, status, data de entrada
- **Buscar** - Por nome ou telefone (case-insensitive)
- **Filtrar** - Por origem (Meta Ads, Google Ads, Indicação, Orgânico) e status (Novo, Contatado, Qualificado, Perdido)
- **Detalhes** - Modal com todos os 11 campos do lead
- **Registrar contato** - Atualiza status para "Contatado" + timestamp ISO 8601
- **Estados UI** - Loading, erro, vazio, atualizando, erro de contato, sucesso

## 🔌 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/leads` | Lista leads com filtros opcionais |
| `PATCH` | `/api/leads/:id/contact` | Registra contato no lead |

### Query Parameters (GET /api/leads)

| Param | Tipo | Descrição |
|-------|------|-----------|
| `q` | string | Busca por nome ou telefone (partial, case-insensitive) |
| `source` | string | `meta_ads` \| `google_ads` \| `referral` \| `organic` |
| `status` | string | `new` \| `contacted` \| `qualified` \| `lost` |

**Exemplos:**
```
GET /api/leads
GET /api/leads?q=marina
GET /api/leads?source=meta_ads&status=new
GET /api/leads?q=costa&source=meta_ads&status=contacted
```

### PATCH /api/leads/:id/contact

```bash
curl -X PATCH http://localhost:3000/api/leads/lead_001/contact
```

**Response 200:**
```json
{
  "id": "lead_001",
  "name": "Marina Costa",
  "status": "contacted",
  "lastContactAt": "2026-08-28T04:26:50.812Z",
  ...
}
```

**Response 404:**
```json
{ "error": "Lead not found" }
```

## 🏗️ Arquitetura

```
src/
├── app/
│   ├── api/leads/
│   │   ├── route.ts              # GET /api/leads
│   │   └── [id]/contact/route.ts # PATCH /api/leads/:id/contact
│   ├── page.tsx                  # Página principal (client component)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── LeadTable.tsx
│   ├── LeadRow.tsx
│   ├── LeadDetailModal.tsx       # <dialog> nativo
│   ├── SearchBar.tsx
│   ├── FilterBar.tsx
│   ├── LoadingState.tsx
│   ├── ErrorState.tsx
│   └── EmptyState.tsx
├── hooks/
│   └── useLeads.ts               # useReducer state management
├── lib/
│   ├── leads.ts                  # Types + getLeads() com cache
│   ├── translations.ts           # SOURCE_LABELS, STATUS_LABELS, STATUS_COLORS
│   ├── date.ts                   # formatDateTime, formatDateOnly
│   ├── api.ts                    # fetchLeads, contactLead (fetch wrappers)
│   └── contact-store.ts          # In-memory mutation Map
└── tests/
    └── api/contact.test.ts       # 13 testes Vitest
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (raw utilities)
- **State**: React `useReducer` (zero deps)
- **Testing**: Vitest
- **API**: Next.js API Routes (server-side filtering)
- **Data**: `dados/leads.json` (12 leads, loaded in memory)

## 📝 Decisões Técnicas

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| API | Next.js API Routes | Single process, colocation, menos config |
| Filtros | Backend (query params) | Demonstrates API design, escalável |
| State | `useReducer` | Zero deps, encapsulado, compreensível |
| Modal | `<dialog>` nativo | Acessibilidade nativa, zero deps |
| Traduções | Object maps | 8 traduções apenas |
| Testes | Vitest (API unit) | Rápido, testa mutação core, sem browser |
| CSS | Raw Tailwind | Zero setup, controle total |

## ✅ Validação

```bash
# Todos passam
npm run build    # TypeScript + Next.js compile
npm run lint     # ESLint clean
npm test         # 13/13 Vitest passing
```

## 📄 Entrega

Ver `ENTREGA.md` para:
- Tempo dedicado (~4h)
- Detalhes do que funciona
- Decisões e suposições documentadas
- Como validei
- Uso de IA
- Próximos passos
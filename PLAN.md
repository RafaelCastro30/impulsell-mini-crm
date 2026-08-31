# PLAN — Impulsell Mini CRM

> Plano técnico de implementação. Timeboxes por fase, estrutura de arquivos, contratos de API, hierarquia de componentes, estratégia de testes, definition of done.

## 1. Technical Context

| Aspecto | Decisão | Origem |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) | CLARIFY #1 |
| Linguagem | TypeScript strict mode | CONSTITUTION §2 |
| UI Components | shadcn/ui (copy-paste em `src/components/ui/`) | CLARIFY #3 |
| Estilização | Tailwind CSS v4 | CONSTITUTION §2 |
| API | Next.js Route Handlers (`src/app/api/leads/`) | CONSTITUTION §2 |
| Dados | Leitura única de `dados/leads.json` via `fs/promises` | CONSTITUTION §2 |
| Estado em memória | `Map<string, Mutation>` em módulo (sem DB) | CONSTITUTION §2, §4 |
| State management | `useReducer` vanilla | CLARIFY #5 |
| Testes | Vitest + happy-dom | CLARIFY #6 |
| Lint | ESLint padrão Next.js | CONSTITUTION §4 |
| Build | `next build` (Turbopack) | CONSTITUTION §4 |
| HTTP client | `fetch` nativo (sem axios) | CONSTITUTION §2 (YAGNI) |

## 2. Constitution Check

Antes de planejar, verifico compliance com a Constituição:

- ✅ Princípio I (fluxo principal): US-001 a US-005 P1 cobertas
- ✅ Princípio II (YAGNI): sem auth, sem DB, sem Docker
- ✅ Princípio III (busca/filtros híbrido): backend fonte + frontend UX
- ✅ Princípio IV (memória): Map em módulo, leitura única
- ✅ Princípio V (teste crítico): FR-018 definido
- ✅ Princípio VI (decisões explícitas): CLARIFY.md registra todas
- ✅ Princípio VII (UX da Paula): US-006 estados + US-007 datas pt-BR

**Resultado**: Constituição não violada. Pode prosseguir.

## 3. Project Structure (arquivos a criar)

```
impulsell-desafio-mini-crm/
├── dados/
│   └── leads.json                          [já existe — copiado para leitura]
├── src/
│   ├── app/
│   │   ├── page.tsx                        [Frontend principal]
│   │   ├── layout.tsx                      [Layout raiz com Tailwind globals]
│   │   ├── globals.css                     [Tailwind imports + CSS vars shadcn]
│   │   └── api/
│   │       └── leads/
│   │           ├── route.ts                [GET /api/leads com query params]
│   │           └── [id]/
│   │               └── contact/
│   │                   └── route.ts        [PATCH /api/leads/:id/contact]
│   ├── components/
│   │   ├── ui/                             [shadcn copy-paste aqui]
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   └── skeleton.tsx
│   │   ├── LeadTable.tsx                   [Tabela principal]
│   │   ├── LeadRow.tsx                     [Linha da tabela]
│   │   ├── SearchBar.tsx                   [Input de busca com debounce]
│   │   ├── FilterBar.tsx                   [Dropdowns origem + status]
│   │   ├── LeadDetailModal.tsx             [Modal com 11 campos]
│   │   ├── LoadingState.tsx                [Skeleton]
│   │   ├── ErrorState.tsx                  [Alert + retry]
│   │   └── EmptyState.tsx                  [Sem resultados]
│   ├── hooks/
│   │   └── useLeads.ts                     [useReducer + effects]
│   ├── lib/
│   │   ├── leads.ts                        [getLeads(), resetLeadsCache()]
│   │   ├── contact-store.ts                [Map de mutações]
│   │   ├── translations.ts                 [SOURCE_LABELS, STATUS_LABELS]
│   │   ├── date.ts                         [formatDateTime pt-BR]
│   │   ├── api.ts                          [fetchLeads(), contactLead()]
│   │   └── utils.ts                        [cn() para shadcn]
│   └── types/
│       └── lead.ts                         [Lead, LeadSource, LeadStatus]
├── tests/
│   └── api/
│       ├── leads-get.test.ts               [FR-018: GET combinado]
│       └── contact-patch.test.ts           [FR-019 bônus: PATCH happy + 404]
├── CONSTITUTION.md                         [✅ já existe]
├── SPEC.md                                 [✅ já existe]
├── CLARIFY.md                              [✅ já existe]
├── ANALYZE.md                              [✅ já existe]
├── PLAN.md                                 [✅ este arquivo]
├── TASKS.md                                [próximo]
├── ENTREGA.md                              [existente — preencher no final]
└── README.md                               [existente — atualizar com instruções]
```

## 4. Data Model

```typescript
// src/types/lead.ts
export type LeadSource = 'meta_ads' | 'google_ads' | 'referral' | 'organic';
export type LeadStatus = 'new' | 'contacted';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: LeadSource;
  status: LeadStatus;
  campaign: string;
  interest: string;
  createdAt: string;            // ISO 8601
  lastContactAt: string | null; // ISO 8601 ou null
}

export interface LeadMutation {
  status: LeadStatus;
  lastContactAt: string;
}
```

## 5. API Contracts

### `GET /api/leads`

**Request**:
```
GET /api/leads?q=marina&source=meta_ads&status=new
```

**Query params**:
- `q` (opcional): string — busca case-insensitive por nome OU telefone (substring)
- `source` (opcional): `LeadSource` ou `all` (default `all`)
- `status` (opcional): `LeadStatus` ou `all` (default `all`)

**Response 200**:
```json
[
  {
    "id": "lead_001",
    "name": "Marina Costa",
    "phone": "+55 11 90000-0001",
    "email": "marina.costa@example.com",
    "source": "meta_ads",
    "status": "new",
    "campaign": "Feirão de seminovos",
    "interest": "Honda Civic 2021",
    "createdAt": "2026-08-19T10:15:00.000Z",
    "lastContactAt": null
  }
]
```

**Erros**: 500 apenas em falha catastrófica (não esperado em runtime normal).

### `PATCH /api/leads/:id/contact`

**Request**:
```
PATCH /api/leads/lead_001/contact
```
Sem body.

**Response 200**:
```json
{
  "id": "lead_001",
  "name": "Marina Costa",
  ...,
  "status": "contacted",
  "lastContactAt": "2026-08-30T17:30:00.000Z"
}
```

**Response 404**:
```json
{ "error": "Lead não encontrado" }
```

## 6. State Management (useReducer)

```typescript
// src/hooks/useLeads.ts
interface LeadsState {
  leads: Lead[];
  searchQuery: string;
  sourceFilter: 'all' | LeadSource;
  statusFilter: 'all' | LeadStatus;
  selectedLeadId: string | null;
  ui: {
    loading: boolean;        // carregando lista inicial
    error: string | null;    // erro ao carregar lista
    updatingId: string | null; // ID do lead sendo atualizado (PATCH)
    contactError: { id: string; message: string } | null; // erro no PATCH
  };
}

type Action =
  | { type: 'SET_LEADS'; payload: Lead[] }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_SOURCE'; payload: 'all' | LeadSource }
  | { type: 'SET_STATUS'; payload: 'all' | LeadStatus }
  | { type: 'SELECT_LEAD'; payload: string | null }
  | { type: 'START_CONTACT'; payload: string }
  | { type: 'CONTACT_SUCCESS'; payload: Lead }
  | { type: 'CONTACT_ERROR'; payload: { id: string; message: string } }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'LOADING_START' }
  | { type: 'CLEAR_CONTACT_ERROR' };
```

**Debounce**: hook separado `useDebouncedValue(value, 300)` que dispara `loadLeads()` quando search muda após 300ms.

**URL sync**: `useEffect` que escuta mudanças em `searchQuery`, `sourceFilter`, `statusFilter` e atualiza `window.history.replaceState`. Inicialização lê `URLSearchParams` da URL.

## 7. Component Hierarchy

```
page.tsx (Client Component)
├── FilterBar
│   ├── SearchBar (input)
│   ├── SourceSelect (shadcn Select)
│   └── StatusSelect (shadcn Select)
├── LeadTable
│   ├── LoadingState (Skeleton x5) — se loading
│   ├── ErrorState (Alert + retry) — se error
│   ├── EmptyState — se leads.length === 0
│   └── LeadRow × N
│       ├── Badge (status traduzido)
│       ├── Button "Ver detalhes" → abre LeadDetailModal
│       └── Button "Registrar contato" (spinner se updating)
└── LeadDetailModal (shadcn Dialog)
    └── ... 11 campos ...
    └── Button "Registrar contato" (mesma lógica)
```

## 8. Implementation Phases (Timeboxed)

| Fase | Descrição | Timebox | Acumulado |
| --- | --- | --- | --- |
| **1. Setup** | Init Next.js, shadcn, copiar leads.json, types, lib base | 30min | 30min |
| **2. API** | `GET /api/leads` com filtros, `PATCH /:id/contact`, contact-store | 45min | 1h15 |
| **3. Frontend Core** | useLeads hook, FilterBar, LeadTable, LeadRow, SearchBar | 60min | 2h15 |
| **4. UI States + Modal** | Modal detalhes, estados loading/empty/error, action contato | 45min | 3h00 |
| **5. Test + Docs** | 1 teste backend (FR-018), validar `npm run build` + curl, preencher ENTREGA.md | 45min | 3h45 |
| **Buffer** | Imprevistos + ajustes | 15min | 4h00 |

**Crítico**: se a Fase 4 demorar, cortar bônus (FR-019 segundo teste) antes da Fase 5. PATCH happy path será validado manualmente via curl.

## 9. Test Plan

### Teste obrigatório: `tests/api/leads-get.test.ts`

Cobre FR-018 (GET com busca + filtros combinados) — caso mais complexo do enunciado.

**Setup**:
```typescript
beforeEach(() => {
  resetLeadsCache();
  clearContactUpdates();
  vi.resetModules();
});
```

**Casos**:
1. `GET /api/leads` sem params retorna 12 leads
2. `GET /api/leads?q=marina` retorna 1 lead (case-insensitive)
3. `GET /api/leads?source=meta_ads` retorna leads só com source `meta_ads`
4. `GET /api/leads?status=new` retorna leads só com status `new`
5. `GET /api/leads?q=joão&source=google_ads` combina q+source (AND)
6. `GET /api/leads?source=all&status=all` retorna todos (sem filtro)

### Teste bônus (se tempo): `tests/api/contact-patch.test.ts`

Cobre FR-007, FR-008, FR-009, FR-010, FR-011.

**Casos**:
1. `PATCH /api/leads/lead_001/contact` com ID válido retorna 200 + status=contacted + lastContactAt ISO 8601
2. `PATCH /api/leads/id_inexistente/contact` retorna 404
3. Mutação persiste: 2° GET após PATCH mostra status atualizado
4. Mutação preserva outros campos (name, phone, etc.)

## 10. Definition of Done

Antes de declarar pronto:

- [ ] `npm run build` passa sem erros
- [ ] `npm run lint` passa (via build)
- [ ] `npm test` passa com pelo menos 1 teste relevante (FR-018)
- [ ] `npm run dev` inicia sem warnings críticos
- [ ] `curl http://localhost:3000/api/leads` retorna 200 com array
- [ ] `curl "http://localhost:3000/api/leads?q=joão&source=google_ads"` retorna filtro combinado
- [ ] `curl -X PATCH http://localhost:3000/api/leads/lead_001/contact` retorna 200 + lastContactAt ISO
- [ ] `curl -X PATCH http://localhost:3000/api/leads/inexistente/contact` retorna 404
- [ ] UI: listar → buscar → filtrar → ver detalhes → registrar contato → ver atualização, tudo manual OK
- [ ] Modal fecha com Esc, X, clique no backdrop
- [ ] Estados: loading inicial, erro, empty state, updating lead, falha contato — todos visíveis
- [ ] URL sincroniza com filtros (compartilhável)
- [ ] Datas em pt-BR (DD/MM/AAAA HH:mm)
- [ ] `ENTREGA.md` preenchido em todas as seções
- [ ] `README.md` atualizado com instruções de run + test

---

**Version**: 1.0.0 | **Date**: 2026-08-30 | **Próximo**: TASKS.md
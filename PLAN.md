# Implementation Plan: Impulsell Mini CRM

**Branch**: `001-mini-crm-leads` | **Date**: 2026-08-28 | **Spec**: SPEC.md

---

## Summary

Build a Mini CRM for sales team (Paula) to manage leads from marketing campaigns. Full-stack Next.js 16 application with API Routes backend and React frontend. Key features: lead listing with backend search/filter, lead details modal, contact registration via PATCH API. All 6 UI states handled. At least 1 API unit test for contact registration.

**Technical Approach**: Next.js App Router with API Routes (`src/app/api/leads`), React components with `useReducer` state management, Raw Tailwind CSS, Vitest for API testing.

---

## Technical Context

| Aspect | Decision |
|--------|----------|
| **Language/Version** | TypeScript 5.x (Next.js 16 default) |
| **Primary Dependencies** | Next.js 16.3.3, React 19.2.8, Tailwind CSS v4 |
| **Storage** | File-based (`dados/leads.json`) loaded in memory - no database |
| **Testing** | Vitest (API unit tests), optional React Testing Library |
| **Target Platform** | Localhost (Node.js 18+) |
| **Project Type** | Web application (full-stack Next.js) |
| **Performance Goals** | <200ms API response, <2s initial load, instant filter feedback |
| **Constraints** | 4-hour limit, no auth/DB/Docker/deploy, no external integrations |
| **Scale/Scope** | 12 leads, single user, local development only |

---

## Constitution Check

✅ **Passes all gates from CONSTITUTION.md**:
- Fluxo principal prioritizado (30% peso)
- Simplicidade/YAGNI - sem arquitetura sofisticada, libs extras
- Test-first para comportamento crítico (API contact registration)
- Decisões explícitas documentadas (CLARIFY.md → ENTREGA.md)
- UX da Paula - 6 estados obrigatórios implementados

---

## Project Structure

```
impulsell-crm/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── leads/
│   │   │       ├── route.ts              # GET /leads (with query params)
│   │   │       └── [id]/
│   │   │           └── contact/
│   │   │               └── route.ts      # PATCH /leads/:id/contact
│   │   ├── globals.css                   # Tailwind imports
│   │   ├── layout.tsx                    # Root layout
│   │   └── page.tsx                      # Main page (lead list + modal)
│   ├── components/
│   │   ├── LeadTable.tsx                 # Table with leads
│   │   ├── LeadRow.tsx                   # Single row + contact button
│   │   ├── SearchBar.tsx                 # Name/phone search input
│   │   ├── FilterBar.tsx                 # Source + Status dropdowns
│   │   ├── LeadDetailModal.tsx           # <dialog> with all fields
│   │   ├── LoadingState.tsx              # Skeleton/spinner
│   │   ├── ErrorState.tsx                # Error + retry button
│   │   ├── EmptyState.tsx                # No results message
│   │   └── UpdatingState.tsx             # Button spinner/disabled
│   ├── lib/
│   │   ├── leads.ts                      # Lead types, data loading, filtering logic
│   │   ├── translations.ts               # SOURCE_LABELS, STATUS_LABELS maps
│   │   └── api.ts                        # Frontend API client (fetch wrappers)
│   └── hooks/
│       └── useLeads.ts                   # useReducer for leads state
├── dados/
│   └── leads.json                        # Source data (copied from root)
├── tests/
│   └── api/
│       └── contact.test.ts               # Vitest: PATCH /leads/:id/contact
├── SPEC.md
├── CLARIFY.md
├── CONSTITUTION.md
├── PLAN.md (this file)
├── package.json
├── tsconfig.json
├── next.config.ts
└── vitest.config.ts
```

**Structure Decision**: Single Next.js project (Option 2 adapted) - frontend and API Routes in same repo, shared types in `src/lib/`.

---

## Data Model

### Lead Type (`src/lib/leads.ts`)

```typescript
interface Lead {
  id: string;                    // "lead_001"
  name: string;                  // "Marina Costa"
  phone: string;                 // "+55 11 90000-0001"
  email: string;                 // "marina.costa@example.com"
  source: LeadSource;            // "meta_ads" | "google_ads" | "referral" | "organic"
  status: LeadStatus;            // "new" | "contacted" | "qualified" | "lost"
  campaign: string;              // "Feirão de seminovos"
  interest: string;              // "Honda Civic 2021"
  createdAt: string;             // ISO 8601 "2026-08-19T10:15:00.000Z"
  lastContactAt: string | null;  // ISO 8601 or null
}

type LeadSource = 'meta_ads' | 'google_ads' | 'referral' | 'organic';
type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost';
```

### API Contracts

**GET /leads**
- Query params: `q` (search), `source`, `status`
- Response: `Lead[]`
- Filtering: server-side (case-insensitive name/phone contains, exact source/status match)

**PATCH /leads/:id/contact**
- No body required
- Success (200): Updated `Lead` with `status: "contacted"`, `lastContactAt: new Date().toISOString()`
- Not found (404): `{ error: "Lead not found" }`

---

## Component Hierarchy

```
page.tsx (Server Component)
└── LeadManager (Client Component) ← useReducer state
    ├── SearchBar
    ├── FilterBar
    ├── LoadingState / ErrorState / EmptyState
    ├── LeadTable
    │   └── LeadRow (xN)
    │       └── ContactButton → triggers PATCH
    └── LeadDetailModal (<dialog>)
        ├── All 11 fields displayed
        └── Close button
```

### State Shape (`useReducer` in `useLeads.ts`)

```typescript
interface LeadsState {
  leads: Lead[];              // Filtered results from API
  allLeads: Lead[];           // All leads (for reference)
  searchQuery: string;        // "marina"
  sourceFilter: LeadSource | 'all';
  statusFilter: LeadStatus | 'all';
  selectedLead: Lead | null;  // For modal
  ui: {
    loading: boolean;
    error: string | null;
    updatingId: string | null; // Lead ID being contacted
    contactError: string | null;
  };
}
```

---

## API Implementation Details

### `src/app/api/leads/route.ts` (GET)

```typescript
// Load leads.json once at module level (cached in memory)
let leadsCache: Lead[] | null = null;

async function getLeads(): Promise<Lead[]> {
  if (!leadsCache) {
    const file = await fs.readFile(path.join(process.cwd(), 'dados/leads.json'), 'utf-8');
    leadsCache = JSON.parse(file);
  }
  return leadsCache;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase() || '';
  const source = searchParams.get('source');
  const status = searchParams.get('status');

  const allLeads = await getLeads();

  let filtered = allLeads;

  if (q) {
    filtered = filtered.filter(lead =>
      lead.name.toLowerCase().includes(q) ||
      lead.phone.includes(q)
    );
  }

  if (source && source !== 'all') {
    filtered = filtered.filter(lead => lead.source === source);
  }

  if (status && status !== 'all') {
    filtered = filtered.filter(lead => lead.status === status);
  }

  return NextResponse.json(filtered);
}
```

### `src/app/api/leads/[id]/contact/route.ts` (PATCH)

```typescript
// In-memory mutation store (resets on server restart)
const contactUpdates = new Map<string, { status: LeadStatus; lastContactAt: string }>();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const allLeads = await getLeads();
  const leadIndex = allLeads.findIndex(l => l.id === id);

  if (leadIndex === -1) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  const updatedLead = {
    ...allLeads[leadIndex],
    status: 'contacted' as LeadStatus,
    lastContactAt: new Date().toISOString()
  };

  // Store mutation in memory (affects subsequent GETs)
  contactUpdates.set(id, { status: 'contacted', lastContactAt: updatedLead.lastContactAt });

  return NextResponse.json(updatedLead);
}

// GET /leads should merge contactUpdates into leadsCache before filtering
```

---

## Frontend Implementation Details

### `useLeads.ts` - State Management

Actions:
- `SET_LEADS(leads)` - Initial load
- `SET_SEARCH(query)` - Debounced? No, instant for 12 leads
- `SET_SOURCE_FILTER(source)`
- `SET_STATUS_FILTER(status)`
- `SELECT_LEAD(lead | null)`
- `SET_LOADING(boolean)`
- `SET_ERROR(message | null)`
- `SET_UPDATING(id | null)`
- `SET_CONTACT_ERROR(message | null)`
- `UPDATE_LEAD_CONTACTED(id, updatedLead)` - Optimistic or post-response

Effect: On search/filter change → call API → `SET_LEADS(filteredResults)`

### API Client (`src/lib/api.ts`)

```typescript
const API_BASE = '/api/leads';

export async function fetchLeads(params: { q?: string; source?: string; status?: string }) {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set('q', params.q);
  if (params.source && params.source !== 'all') searchParams.set('source', params.source);
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  
  const res = await fetch(`${API_BASE}?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Falha ao carregar leads');
  return res.json() as Promise<Lead[]>;
}

export async function contactLead(id: string) {
  const res = await fetch(`${API_BASE}/${id}/contact`, { method: 'PATCH' });
  if (res.status === 404) throw new Error('Lead não encontrado');
  if (!res.ok) throw new Error('Falha ao registrar contato');
  return res.json() as Promise<Lead>;
}
```

---

## UI Components Spec

### Translations (`src/lib/translations.ts`)

```typescript
export const SOURCE_LABELS: Record<LeadSource, string> = {
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  referral: 'Indicação',
  organic: 'Orgânico',
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Novo',
  contacted: 'Contatado',
  qualified: 'Qualificado',
  lost: 'Perdido',
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-green-100 text-green-800',
  qualified: 'bg-purple-100 text-purple-800',
  lost: 'bg-red-100 text-red-800',
};
```

### LeadDetailModal - Fields Display Order

1. Nome
2. Telefone
3. Email
4. Origem (traduzida)
5. Status (badge colorido)
6. Campanha
7. Interesse
8. Data de entrada (formatada DD/MM/YYYY HH:mm)
9. Último contato (formatada ou "Nunca contatado")

---

## Test Plan

### `tests/api/contact.test.ts` (Vitest)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PATCH } from '@/app/api/leads/[id]/contact/route';

// Mock NextResponse, file system, etc.

describe('PATCH /leads/:id/contact', () => {
  beforeEach(() => {
    // Reset in-memory store
    vi.resetModules();
  });

  it('should update status to contacted and set lastContactAt', async () => {
    const res = await PATCH(new Request('http://test'), { params: Promise.resolve({ id: 'lead_001' }) });
    expect(res.status).toBe(200);
    const lead = await res.json();
    expect(lead.status).toBe('contacted');
    expect(lead.lastContactAt).toBeDefined();
    expect(new Date(lead.lastContactAt).toISOString()).toBe(lead.lastContactAt); // Valid ISO
  });

  it('should return 404 for non-existent ID', async () => {
    const res = await PATCH(new Request('http://test'), { params: Promise.resolve({ id: 'lead_999' }) });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Lead not found');
  });

  it('should persist update in memory for subsequent GET', async () => {
    await PATCH(new Request('http://test'), { params: Promise.resolve({ id: 'lead_001' }) });
    const getRes = await GET(new Request('http://test/leads'));
    const leads = await getRes.json();
    const updated = leads.find((l: Lead) => l.id === 'lead_001');
    expect(updated?.status).toBe('contacted');
  });
});
```

---

## Implementation Phases

### Phase 1: Setup & API (45 min)
1. Copy `dados/leads.json` to `impulsell-crm/dados/`
2. Create `src/lib/leads.ts` (types, loader, filtering logic)
3. Create `src/app/api/leads/route.ts` (GET with query params)
4. Create `src/app/api/leads/[id]/contact/route.ts` (PATCH)
5. Test API manually with curl

### Phase 2: Frontend Core (60 min)
6. Create `src/lib/translations.ts` (SOURCE_LABELS, STATUS_LABELS)
7. Create `src/lib/api.ts` (fetchLeads, contactLead)
8. Create `src/hooks/useLeads.ts` (useReducer + effects)
9. Create `src/components/SearchBar.tsx`, `FilterBar.tsx`
10. Create `src/components/LeadTable.tsx`, `LeadRow.tsx`
11. Create `src/components/LeadDetailModal.tsx` (`<dialog>`)
12. Wire everything in `src/app/page.tsx`

### Phase 3: UI States & Polish (45 min)
13. Create `LoadingState`, `ErrorState`, `EmptyState`, `UpdatingState`
14. Integrate all 6 UI states in page.tsx
15. Add debounce? (Not needed for 12 leads)
16. Format dates (DD/MM/YYYY HH:mm)
16. Style with Raw Tailwind (table, badges, modal, buttons)

### Phase 4: Testing & Validation (30 min)
17. Install Vitest (`npm i -D vitest @types/node`)
18. Create `vitest.config.ts`
19. Write `tests/api/contact.test.ts`
20. Run `npm test` → verify pass
21. Run `npm run build` → verify pass
22. Manual E2E test: list → search → filter → detail → contact → verify

### Phase 5: Documentation (15 min)
23. Fill `ENTREGA.md` completely
24. Document all 7 decisions from CLARIFY.md
25. Record time spent, what works, what's incomplete

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Time overrun | Strict phase timeboxes; stop at 4h, document incomplete |
| API caching issues | Module-level cache + mutation Map; test persistence |
| Modal accessibility | Use native `<dialog>`, focus trap, ESC to close |
| Search/filter UX | Debounce not needed; instant backend response |
| Build failures | Run `npm run build` after each phase |

---

## Definition of Done

- [ ] `GET /leads?q=&source=&status=` returns filtered JSON
- [ ] `PATCH /leads/:id/contact` updates in-memory, returns 200/404
- [ ] Frontend loads leads, shows search + 2 filters (combined)
- [ ] Lead details modal shows all 11 fields translated
- [ ] Contact button works, shows updating state, updates UI
- [ ] All 6 UI states visible (loading, error, empty, updating, contact error, success)
- [ ] At least 1 Vitest test passes (`npm test`)
- [ ] `npm run build` passes (TypeScript + ESLint clean)
- [ ] `ENTREGA.md` filled completely

---

**Version**: 1.0.0 | **Created**: 2026-08-28 | **Status**: Ready for `/speckit-tasks`
# Clarification Session - Impulsell Mini CRM

**Date**: 2026-08-28  
**Spec**: SPEC.md  
**Purpose**: De-risk ambiguous technical decisions before planning (/speckit-plan)

---

## Questions Requiring Clarification

### 1. API Architecture: Next.js API Routes vs Node.js Separate Server

**Context**: The challenge allows "backend em Node.js, com o framework que preferir". Next.js 16 App Router supports API Routes natively.

**Options**:
- **A) Next.js API Routes** (`src/app/api/leads/route.ts`) - Simpler, colocation, single process, single port
- **B) Separate Node.js server** (Express/Fastify/Hono on different port) - More explicit separation, closer to "real" backend experience

**Impact**: Affects folder structure, dev workflow (single vs two terminals), deployment mental model.

**Recommendation**: **Option A (Next.js API Routes)** - Simpler for 4-hour challenge, single `npm run dev`, less config, meets all requirements.

**Decision needed**: Confirm Option A or choose B with framework preference.

---

### 2. Search/Filter Implementation: Frontend vs Backend

**Context**: Requirements say "Você decide se a busca e os filtros serão feitos no frontend, no backend ou nos dois. Explique sua decisão na entrega."

**Options**:
- **A) Frontend only** - Load all 12 leads once, filter in React state. Simpler, instant response, zero API complexity.
- **B) Backend only** - API accepts query params (`GET /leads?q=marina&source=meta_ads&status=new`), returns filtered. Demonstrates API design, scalable.
- **C) Hybrid** - Initial load from API, then frontend filter. Best of both but more code.

**Impact**: Affects API design, frontend state management, what gets tested.

**Recommendation**: **Option B (Backend only)** - **USER DECISION**: Demonstrates API design capability, scalable pattern, meets requirement to explain decision in ENTREGA.md. API will accept `q` (search), `source`, `status` query parameters and return filtered results.

**Decision needed**: **CONFIRMED - Option B (Backend)**

---

### 3. State Management: React Built-in vs Library

**Context**: Need to manage leads list, search term, filters, selected lead, loading/error states, contact mutation state.

**Options**:
- **A) React built-in** (`useState`, `useReducer`, `useEffect`) - Zero deps, sufficient for this scope
- **B) Zustand** - Lightweight, simple API, good devtools
- **C) TanStack Query (React Query)** - Excellent for server state, caching, mutations - but overkill for 12 leads
- **D) Redux Toolkit** - Overkill

**Impact**: Bundle size, learning curve, boilerplate.

**Recommendation**: **Option A (React built-in)** - With `useReducer` for complex state (leads + filters + search + selected + UI states), zero dependencies, fully understandable in 30 seconds.

**Decision needed**: Confirm A or choose B with justification.

---

### 4. Lead Details UI: Modal vs Side Panel vs Separate Page

**Context**: "Você pode usar uma página, modal, painel lateral, expansão da linha ou outra solução que considerar adequada."

**Options**:
- **A) Modal/Dialog** - Focused, overlays list, easy to close, good for "quick view"
- **B) Side Panel/Drawer** - Persistent context, can see list while viewing details, modern feel
- **C) Separate Page** (`/leads/:id`) - Deep linkable, browser history, SEO-friendly (not needed here)
- **D) Inline Row Expansion** - Compact, no navigation, but limited space for 11 fields

**Impact**: Component structure, routing (if page), accessibility patterns.

**Recommendation**: **Option A (Modal)** - Simplest with `dialog` element or shadcn/ui Dialog (if installing), good UX for "view details then close", minimal routing complexity.

**Decision needed**: Confirm A, B, C, or D.

---

### 5. Translation Layer: Simple Map vs i18n Library

**Context**: "Os valores técnicos podem ser traduzidos na interface. Por exemplo, `meta_ads` pode aparecer como 'Meta Ads' e `new` como 'Novo'."

**Options**:
- **A) Simple JS object maps** - `const SOURCE_LABELS = { meta_ads: 'Meta Ads', ... }` - Zero deps, trivial
- **B) i18n library** (next-intl, react-i18next) - Overkill for 8 translations

**Impact**: Bundle size, complexity.

**Recommendation**: **Option A (Simple maps)** - Only 4 sources + 4 statuses = 8 translations. Two const objects, zero dependencies.

**Decision needed**: Confirm A.

---

### 6. Test Strategy: What and How to Test

**Context**: "Escreva pelo menos um teste para um comportamento importante. Algumas possibilidades: registrar o contato de um lead válido; rejeitar um identificador inexistente; combinar pesquisa e filtros; atualizar a interface depois do contato."

**Options**:
- **A) API Unit Test** - Test `PATCH /leads/:id/contact` logic (happy path + 404) with Vitest/Jest
- **B) Frontend Integration Test** - Test search+filter combo with React Testing Library
- **C) E2E Test** - Playwright/Cypress full flow (overkill for 4h)
- **D) API + Frontend Unit** - Two small tests (more than minimum)

**Impact**: Test setup time, what gets validated, CI readiness.

**Recommendation**: **Option A (API Unit Test for contact registration)** - Tests the core mutation logic (FR-002, FR-003), runs fast, no browser needed, demonstrates TDD understanding. Can add one frontend test if time permits.

**Decision needed**: Confirm A, B, or specify exact test scenario.

---

### 7. Additional: Styling Approach - Raw Tailwind vs Component Library

**Context**: Tailwind CSS v4 is configured. No component library mandated.

**Options**:
- **A) Raw Tailwind** - Write utility classes directly, full control, zero deps
- **B) shadcn/ui** - Copy-paste components (Dialog, Table, Select, Button, Input) - modern, accessible, but adds install step
- **C) Headless UI** - Unstyled accessible components + Tailwind

**Impact**: Development speed, accessibility, bundle size.

**Recommendation**: **Option A (Raw Tailwind)** - Build simple Table, Select, Input, Button, Modal with Tailwind utilities. 4 hours = no time for component library setup. Accessibility: use semantic HTML + ARIA attributes manually.

**Decision needed**: Confirm A or B (if willing to `npx shadcn@latest add dialog table select button input`).

---

## Summary of Recommendations

| # | Decision | Recommended | Rationale |
|---|----------|-------------|-----------|
| 1 | API Architecture | **Next.js API Routes** | Single process, simpler, meets requirements |
| 2 | Search/Filter | **Backend only** | **USER CONFIRMED** - Demonstrates API design, scalable |
| 3 | State Management | **React useReducer** | Zero deps, sufficient complexity |
| 4 | Lead Details UI | **Modal (dialog)** | Simple, focused, no routing |
| 5 | Translation | **Simple object maps** | 8 translations only |
| 6 | Test Strategy | **API unit test (contact)** | Core mutation, fast, no browser |
| 7 | Styling | **Raw Tailwind** | No setup time, full control |

---

## Next Steps

Once decisions confirmed:
1. Run `/speckit-plan` with confirmed choices
2. Generate implementation plan with folder structure, file list, component hierarchy
3. Run `/speckit-tasks` for granular actionable tasks
4. Run `/speckit-implement` to build

---

**Please confirm or override each recommendation above.** Each decision will be documented in `ENTREGA.md` as required.
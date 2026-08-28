# Tasks: Impulsell Mini CRM

**Input**: SPEC.md, PLAN.md, CLARIFY.md, CONSTITUTION.md, ANALYZE.md  
**Prerequisites**: plan.md (required), spec.md (required)  
**Tests**: Required - at least 1 automated test for contact registration (FR-017)

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story reference (US1-US6 from SPEC.md)
- Exact file paths included

---

## Phase 1: Setup & Data Foundation (Shared Infrastructure)

**Purpose**: Project initialization, data copy, types, and core utilities

- [ ] T001 [P] Copy `dados/leads.json` to `impulsell-crm/dados/leads.json`
- [ ] T002 [P] Create `src/lib/leads.ts` with Lead interface, LeadSource/LeadStatus types, and `getLeads()` loader with module-level cache
- [ ] T003 [P] Create `src/lib/translations.ts` with SOURCE_LABELS, STATUS_LABELS, STATUS_COLORS maps
- [ ] T004 [P] Create `src/lib/date.ts` with `formatDateTime(isoString)` → "DD/MM/YYYY HH:mm" and `formatDateOnly(isoString)` → "DD/MM/YYYY"
- [ ] T005 Install Vitest: `npm i -D vitest @types/node @vitest/coverage-v8` and create `vitest.config.ts`
- [ ] T006 [P] Create `src/lib/api.ts` with `fetchLeads(params)` and `contactLead(id)` fetch wrappers

**Checkpoint**: Types, data loading, translations, API client ready. API implementation can begin.

---

## Phase 2: API Implementation (Foundational - Blocks All UI Stories)

**Purpose**: Backend endpoints with server-side filtering and in-memory mutation

### US1 - Visualizar Lista de Leads (P1) - API Part

- [ ] T010 [US1] Create `src/app/api/leads/route.ts` - GET handler with query params (q, source, status), server-side filtering, case-insensitive name/phone search, returns Lead[]
- [ ] T011 [US1] Integrate `getLeads()` from `src/lib/leads.ts` and apply filtering logic in GET /leads

### US2 - Buscar Leads (P1) - API Part

- [ ] T012 [US2] Implement query param parsing in GET /leads: `q` (search), `source`, `status` with exact match for filters

### US3 - Filtrar Leads (P1) - API Part

- [ ] T013 [US3] Verify combined filtering (AND logic): search + source + status all applied together

### US5 - Registrar Contato (P1) - API Part

- [ ] T014 [US5] Create `src/app/api/leads/[id]/contact/route.ts` - PATCH handler: finds lead by id, returns 404 if not found, updates status to "contacted", sets lastContactAt to new Date().toISOString(), stores in memory Map, returns updated Lead
- [ ] T015 [US5] Modify GET /leads to merge `contactUpdates` Map into cached leads before filtering (so mutations persist across requests)

**Checkpoint**: API fully functional. Test manually with curl:
- `GET /api/leads` → 12 leads
- `GET /api/leads?q=marina` → 1 lead
- `GET /api/leads?source=meta_ads` → 4 leads
- `GET /api/leads?status=new` → 5 leads
- `PATCH /api/leads/lead_001/contact` → 200 with updated lead
- `PATCH /api/leads/lead_999/contact` → 404

---

## Phase 3: Frontend Core - State & Components

**Purpose**: React state management, API integration, core UI components

### US1 - Visualizar Lista de Leads (P1) - Frontend

- [ ] T020 [US1] Create `src/hooks/useLeads.ts` with useReducer managing: leads, allLeads, searchQuery, sourceFilter, statusFilter, selectedLead, ui (loading, error, updatingId, contactError)
- [ ] T021 [US1] Implement `loadLeads()` effect in useLeads: calls fetchLeads with current filters, handles loading/error states
- [ ] T022 [US1] Create `src/components/LeadTable.tsx` - renders table with headers: Nome, Telefone, Origem, Status, Data de Entrada
- [ ] T023 [US1] Create `src/components/LeadRow.tsx` - renders single lead row with translated source/status badges (using STATUS_COLORS), "Ver detalhes" button, "Registrar contato" button

### US2 - Buscar Leads (P1) - Frontend

- [ ] T024 [US2] Create `src/components/SearchBar.tsx` - input with placeholder "Buscar por nome ou telefone...", onChange dispatches SET_SEARCH

### US3 - Filtrar Leads (P1) - Frontend

- [ ] T025 [US3] Create `src/components/FilterBar.tsx` - two Select dropdowns: Origem (Todas, Meta Ads, Google Ads, Indicação, Orgânico) and Status (Todos, Novo, Contatado, Qualificado, Perdido), onChange dispatches SET_SOURCE_FILTER/SET_STATUS_FILTER

### US4 - Ver Detalhes do Lead (P1) - Frontend

- [ ] T026 [US4] Create `src/components/LeadDetailModal.tsx` - native `<dialog>` with all 11 fields displayed in order: Nome, Telefone, Email, Origem, Status (badge), Campanha, Interesse, Data de Entrada, Último Contato (or "Nunca contatado"), Close button, ESC to close, focus trap

### US5 - Registrar Contato (P1) - Frontend

- [ ] T027 [US5] Add `contactLead(id)` action in useLeads: sets updatingId, calls contactLead API, on success updates lead in state (status/contacted, lastContactAt), clears updatingId, on error sets contactError
- [ ] T028 [US5] Wire "Registrar contato" button in LeadRow to dispatch contactLead action

**Checkpoint**: Frontend core functional. Test in browser:
- Page loads → shows 12 leads in table
- Search works → filters instantly
- Source/Status filters work → combine with search
- Click "Ver detalhes" → modal opens with all fields
- Click "Registrar contato" → status changes to "Contatado", badge green, lastContactAt filled

---

## Phase 4: UI States & Polish

**Purpose**: All 6 required UI states, accessibility, styling refinements

### US6 - Estados da Interface (P2)

- [ ] T030 [US6] Create `src/components/LoadingState.tsx` - skeleton rows (3-4) with Tailwind animate-pulse
- [ ] T031 [US6] Create `src/components/ErrorState.tsx` - red alert box with message + "Tentar novamente" button (dispatches loadLeads)
- [ ] T032 [US6] Create `src/components/EmptyState.tsx` - centered "Nenhum lead encontrado para os critérios selecionados" with filter clear hint
- [ ] T033 [US6] Create `src/components/UpdatingState.tsx` - spinner overlay for button (or integrate into LeadRow button disabled + spinner)
- [ ] T034 [US6] Integrate all states in `src/app/page.tsx`: conditional rendering based on ui.loading, ui.error, leads.length === 0, ui.updatingId, ui.contactError
- [ ] T035 [US6] Add contact error toast/alert: when ui.contactError shows, render dismissible alert with "Falha ao registrar contato. Tente novamente."
- [ ] T036 [P] Style refinements: responsive table (horizontal scroll on mobile), badge colors, modal backdrop, focus styles, button hover/disabled states

**Checkpoint**: All 6 UI states demonstrable. Test each:
1. Loading: throttle network in DevTools
2. Error: stop API server, refresh
3. Empty: search "xyz"
4. Updating: click contact, watch button
5. Contact error: mock API failure
6. Success: normal flow works

---

## Phase 5: Testing & Validation

**Purpose**: Automated tests, build verification, manual E2E

### Test Implementation (FR-017)

- [ ] T040 [P] [US5] Create `tests/api/contact.test.ts` - Vitest test suite for PATCH /leads/:id/contact:
  - Test 1: valid ID → 200, status="contacted", lastContactAt valid ISO 8601
  - Test 2: invalid ID → 404, error message
  - Test 3: persistence → after PATCH, GET returns updated lead
- [ ] T041 Run tests: `npm test` → all pass

### Build & Quality

- [ ] T042 Run `npm run build` → passes (TypeScript + ESLint clean)
- [ ] T043 Run `npm run lint` → passes

### Manual E2E Validation

- [ ] T044 Full flow test: Load page → Search "costa" → Filter source="meta_ads" → Click Marina → View all 11 fields → Close → Click "Registrar contato" on another lead → Verify status badge changes → Verify lastContactAt appears

### Documentation

- [ ] T045 Fill `ENTREGA.md` completely:
  - Tempo dedicado
  - O que está funcionando
  - O que ficou incompleto
  - Decisões e suposições (all 7 from CLARIFY.md)
  - Como validei a solução
  - Uso de inteligência artificial
  - Se eu tivesse mais tempo

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) 
    → Phase 2 (API) 
        → Phase 3 (Frontend Core) 
            → Phase 4 (UI States) 
                → Phase 5 (Tests & Docs)
```

### Within Phases - Parallel Opportunities

**Phase 1**: T001, T002, T003, T004, T006 all [P] - can do together  
**Phase 2**: T010-T013 (US1-US3 API) can parallel after T002; T014-T015 (US5 API) after T002  
**Phase 3**: T022, T023, T024, T025, T026 all [P] after T020-T021; T027-T028 after T020-T021  
**Phase 4**: T030-T035 all [P] after Phase 3 checkpoint  
**Phase 5**: T040 [P] after Phase 2; T042-T043 after all implementation

### User Story Independence

Each user story (US1-US6) is independently testable after its API + Frontend tasks complete:
- **US1**: API T010-T011 + Frontend T020-T023 → list works
- **US2**: API T012 + Frontend T024 → search works
- **US3**: API T013 + Frontend T025 → filters work
- **US4**: Frontend T026 → modal works (depends on US1 data)
- **US5**: API T014-T015 + Frontend T027-T028 → contact works
- **US6**: Frontend T030-T036 → states work (depends on all above)

---

## Timeboxing (from PLAN.md)

| Phase | Tasks | Est. Time |
|-------|-------|-----------|
| 1: Setup & Data | T001-T006 | 45 min |
| 2: API | T010-T015 | 45 min |
| 3: Frontend Core | T020-T028 | 60 min |
| 4: UI States | T030-T036 | 45 min |
| 5: Tests & Docs | T040-T045 | 45 min |
| **Total** | **40 tasks** | **~4 hours** |

---

## Notes

- Write tests FIRST (T040) - ensure they fail before implementing T014-T015
- Commit after each logical group (per phase or per story)
- Stop at 4 hours - document incomplete items in ENTREGA.md
- All decisions from CLARIFY.md must be reflected in ENTREGA.md

---

**Version**: 1.0.0 | **Created**: 2026-08-28 | **Status**: Ready for implementation
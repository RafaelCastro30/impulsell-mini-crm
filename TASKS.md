# TASKS — Impulsell Mini CRM

> Tarefas granulares e acionáveis, organizadas por fase. Cada tarefa tem ID, marcador de paralelismo `[P]`, mapeamento para User Story `[Story]`, caminho de arquivo e checkpoint de validação. Ordem de execução reflete dependências.

## Legenda

- `[P]` = pode ser executada em paralelo com outras tarefas `[P]` da mesma fase
- `[Story]` = user story mapeada em SPEC.md (US-001 a US-007)
- `[Checkpoint]` = validação que deve passar antes de avançar para próxima fase

---

## Fase 1: Setup & Data Foundation (~30 min)

### T001 [P] [Setup] — Inicializar projeto Next.js
**Ação**: Criar projeto Next.js 15 + TypeScript + Tailwind + App Router em pasta separada `impulsell-crm/`
**Comando**:
```bash
cd C:/Users/Rafa/Projects/impulsell-desafio-mini-crm
npx create-next-app@latest impulsell-crm --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```
**Checkpoint**: `cd impulsell-crm && npm run build` passa

### T002 [P] [Setup] — Copiar dados/leads.json para dentro do projeto
**Ação**: Mover/copiar `../dados/leads.json` → `impulsell-crm/dados/leads.json`
**Comando**: `cp ../dados/leads.json dados/`
**Checkpoint**: arquivo existe e tem 12 leads

### T003 [Setup] — Configurar shadcn/ui
**Ação**: Rodar `npx shadcn@latest init`, depois adicionar componentes necessários
**Comandos**:
```bash
cd impulsell-crm
npx shadcn@latest init -d
npx shadcn@latest add button dialog input select badge skeleton alert
```
**Checkpoint**: `src/components/ui/` tem os 6 arquivos

### T004 [Setup] — Criar src/types/lead.ts
**Arquivo**: `src/types/lead.ts`
**Conteúdo**: `Lead` interface, `LeadSource`, `LeadStatus` types
**Checkpoint**: TypeScript compila sem erros

### T005 [P] [Setup] — Criar src/lib/leads.ts (carregamento + cache)
**Arquivo**: `src/lib/leads.ts`
**Conteúdo**:
- `let leadsCache: Lead[] | null = null`
- `async function getLeads(): Promise<Lead[]>` — lê JSON, popula cache
- `function resetLeadsCache(): void` — para testes
**Checkpoint**: importável, type-safe

### T006 [P] [Setup] — Criar src/lib/translations.ts
**Arquivo**: `src/lib/translations.ts`
**Conteúdo**:
- `SOURCE_LABELS: Record<LeadSource, string>`
- `STATUS_LABELS: Record<LeadStatus, string>`
- `STATUS_COLORS: Record<LeadStatus, string>` (classes Tailwind)
**Checkpoint**: 4 origens + 2 status mapeados

### T007 [P] [Setup] — Criar src/lib/date.ts
**Arquivo**: `src/lib/date.ts`
**Conteúdo**:
- `formatDateTime(iso: string): string` — pt-BR
- `formatRelativeTime(iso: string | null): string` — "há 5 min" ou "Nunca contatado"
**Checkpoint**: ambos exportados

### T008 [P] [Setup] — Instalar Vitest
**Comando**: `npm install -D vitest @vitest/ui happy-dom @testing-library/react @testing-library/jest-dom`
**Arquivo**: `vitest.config.ts` com environment `happy-dom`
**Checkpoint**: `npm test` roda (mesmo sem testes, exit 0)

### T009 [P] [Setup] — Criar src/lib/api.ts (client wrappers)
**Arquivo**: `src/lib/api.ts`
**Conteúdo**:
- `fetchLeads(params: { q?, source?, status? }): Promise<Lead[]>`
- `contactLead(id: string): Promise<Lead>`
**Checkpoint**: type-safe, retorna Promises

**Checkpoint da Fase 1**: `npm run build` ✅

---

## Fase 2: API Implementation (~45 min) — [US-001, US-002, US-003, US-005]

### T010 [API] [US-001, US-002, US-003] — src/lib/contact-store.ts
**Arquivo**: `src/lib/contact-store.ts`
**Conteúdo**:
- `Map<string, LeadMutation>` (módulo)
- `applyContactMutations(leads: Lead[]): Lead[]` — merge mutações sobre JSON
- `recordContact(id: string): LeadMutation` — registra e retorna
- `clearContactUpdates(): void` — para testes
**Checkpoint**: lógica testável

### T011 [API] [US-001, US-002, US-003] — src/app/api/leads/route.ts (GET)
**Arquivo**: `src/app/api/leads/route.ts`
**Conteúdo**:
- `export async function GET(request: NextRequest)`
- Extrai `q`, `source`, `status` de `searchParams`
- `source=all` ou `status=all` = sem filtro
- Aplica filtros com AND
- Aplica `applyContactMutations` antes de retornar
**Checkpoint**: `curl /api/leads?q=marina&source=meta_ads` retorna filtro correto

### T012 [API] [US-005] — src/app/api/leads/[id]/contact/route.ts (PATCH)
**Arquivo**: `src/app/api/leads/[id]/contact/route.ts`
**Conteúdo**:
- `export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> })`
- Valida ID contra `getLeads()`
- Se não existe: `return NextResponse.json({ error }, { status: 404 })`
- Se existe: chama `recordContact(id)`, retorna lead mutado 200
**Checkpoint**: `curl PATCH /api/leads/lead_001/contact` retorna 200 + ISO timestamp

### T013 [API] [Validação manual] — Testar API com curl
**Comandos**:
```bash
npm run dev &
sleep 3
curl http://localhost:3000/api/leads | head -c 200
curl "http://localhost:3000/api/leads?q=marina&source=meta_ads"
curl -X PATCH http://localhost:3000/api/leads/lead_001/contact
curl -X PATCH http://localhost:3000/api/leads/inexistente/contact -w "\n%{http_code}\n"
```
**Checkpoint**: 200 OK com array; filtros funcionam; PATCH muta; 404 funciona

**Checkpoint da Fase 2**: `npm run build` ✅ + API funcional via curl

---

## Fase 3: Frontend Core (~60 min) — [US-001, US-002, US-003]

### T020 [P] [Frontend] [US-001] — src/hooks/useLeads.ts (reducer)
**Arquivo**: `src/hooks/useLeads.ts`
**Conteúdo**:
- `LeadsState` interface
- `Action` discriminated union
- `leadsReducer(state, action): LeadsState`
- `useLeads(): { state, dispatch }` — usa `useReducer` + `useEffect` para `loadLeads`
- `useDebouncedValue<T>(value, delay)` helper interno
**Checkpoint**: hook exporta state + dispatch

### T021 [P] [Frontend] [US-001] — src/components/LoadingState.tsx
**Conteúdo**: Skeleton x5 usando `<Skeleton>` do shadcn
**Checkpoint**: renderiza linhas placeholder

### T022 [P] [Frontend] [US-001] — src/components/ErrorState.tsx
**Conteúdo**: `<Alert>` shadcn com mensagem + botão "Tentar novamente" (callback via prop)
**Checkpoint**: visível quando `state.ui.error`

### T023 [P] [Frontend] [US-001] — src/components/EmptyState.tsx
**Conteúdo**: Texto centralizado "Nenhum lead encontrado" + botão "Limpar filtros" (quando filtros ativos)
**Checkpoint**: visível quando leads.length === 0 && !loading && !error

### T024 [Frontend] [US-002] — src/components/SearchBar.tsx
**Conteúdo**: `<Input>` shadcn controlado por `state.searchQuery`, dispara `dispatch({ type: 'SET_SEARCH' })` no `onChange`
**Checkpoint**: atualiza state; debounce dispara loadLeads 300ms depois

### T025 [Frontend] [US-003] — src/components/FilterBar.tsx
**Conteúdo**:
- `<Select>` origem (4 opções + "Todas")
- `<Select>` status (2 opções + "Todos")
- Controlado por `state.sourceFilter`, `state.statusFilter`
**Checkpoint**: muda state e dispara loadLeads imediatamente

### T026 [Frontend] [US-001] — src/components/LeadTable.tsx
**Conteúdo**:
- Cabeçalho: Nome, Telefone, Origem, Status, Data de entrada, Ações
- Decide qual componente mostrar: LoadingState, ErrorState, EmptyState, ou mapeia LeadRow
**Checkpoint**: tabela renderiza corretamente em cada estado

### T027 [Frontend] [US-001] — src/components/LeadRow.tsx
**Conteúdo**:
- 5 colunas com traduções
- Botão "Ver detalhes" → `dispatch({ type: 'SELECT_LEAD', payload: lead.id })`
- Botão "Registrar contato" → `handleContact(lead.id)` (definido em T028)
**Checkpoint**: cliques disparam actions

### T028 [Frontend] [US-005] — Lógica de contato no useLeads
**Arquivo**: editar `src/hooks/useLeads.ts`
**Adicionar**:
- `async function contactLead(id: string, dispatch)`
- Dispatch `START_CONTACT`, chama API, dispatch `CONTACT_SUCCESS` ou `CONTACT_ERROR`
- No T027, LeadRow chama essa função
**Checkpoint**: ciclo START → SUCCESS ou ERROR funciona

**Checkpoint da Fase 3**: `npm run build` ✅ + lista + busca + filtros funcionais (verificar via dev server)

---

## Fase 4: UI States + Modal + Polish (~45 min) — [US-004, US-005, US-006, US-007]

### T030 [Frontend] [US-004] — src/components/LeadDetailModal.tsx
**Conteúdo**:
- `<Dialog>` shadcn com `<DialogContent>`, `<DialogHeader>`, `<DialogTitle>`
- 11 campos do lead em grid 2 colunas
- Foco trap, Esc fecha (built-in `<dialog>`)
- Backdrop click fecha
- Botão "Registrar contato" no rodapé (reusa lógica de T028)
**Checkpoint**: modal abre, mostra todos os campos, fecha por 3 meios

### T031 [Frontend] [US-005] — Atualizar UI em tempo real após contato
**Arquivo**: editar `src/hooks/useLeads.ts` + `LeadRow.tsx`
**Ação**: Após `CONTACT_SUCCESS`, a lead já está no state com status atualizado; row rerenderiza automaticamente
**Checkpoint**: clicar contato → linha mostra "Contatado" sem reload

### T032 [Frontend] [US-006] — Loading inline durante contato
**Arquivo**: editar `LeadRow.tsx` + `LeadDetailModal.tsx`
**Ação**:
- Se `state.ui.updatingId === lead.id`, botão fica `<Loader2>` spinner + "Registrando..." + disabled
**Checkpoint**: feedback visual durante request

### T033 [Frontend] [US-006] — Erro inline no contato
**Ação**:
- Se `state.ui.contactError?.id === lead.id`, mostra `<Alert>` abaixo do botão com mensagem
- Botão "Tentar novamente" reseta o erro e re-tenta
**Checkpoint**: erro visível, retry funciona

### T034 [Frontend] [US-007] — Formatação pt-BR de datas
**Verificação**: usar `formatDateTime` em LeadRow (data de entrada) e LeadDetailModal (createdAt + lastContactAt)
**Checkpoint**: Datas aparecem como `19/08/2026 10:15`

### T035 [Frontend] [US-002, US-003] — Sincronização URL ↔ state
**Arquivo**: editar `src/hooks/useLeads.ts` ou `src/app/page.tsx`
**Ação**:
- Em cada mudança de search/source/status: `window.history.replaceState(null, '', '?' + params)`
- Em mount: ler `URLSearchParams` e popular state inicial
**Checkpoint**: copiar URL e colar em nova aba reproduz filtros

### T036 [Frontend] [Validação manual] — Testar fluxo completo end-to-end
**Fluxo**:
1. Abrir `http://localhost:3000`
2. Ver lista de 12 leads
3. Digitar "marina" → ver só 1 lead
4. Selecionar filtro origem Meta Ads → ver interseção
5. Limpar tudo
6. Clicar "Ver detalhes" → modal abre
7. Fechar modal com Esc
8. Clicar "Registrar contato" na linha → loading → status muda
9. Clicar "Ver detalhes" de novo → modal mostra `lastContactAt` preenchido
**Checkpoint**: fluxo inteiro sem reload manual

**Checkpoint da Fase 4**: `npm run build` ✅ + fluxo principal manual validado

---

## Fase 5: Testes + Docs + Validação Final (~45 min)

### T040 [Test] — tests/api/leads-get.test.ts (FR-018 obrigatório)
**Arquivo**: `tests/api/leads-get.test.ts`
**Conteúdo** (6 casos):
1. GET sem params → 12 leads
2. GET ?q=marina → 1 lead (case-insensitive)
3. GET ?source=meta_ads → só meta_ads
4. GET ?status=new → só new
5. GET ?q=joão&source=google_ads → combinação
6. GET ?source=all&status=all → todos
**Checkpoint**: `npm test` passa 6/6

### T041 [Test, bônus se tempo] — tests/api/contact-patch.test.ts (FR-019)
**Arquivo**: `tests/api/contact-patch.test.ts`
**Conteúdo** (4 casos):
1. PATCH /lead_001/contact → 200 + status=contacted + lastContactAt ISO
2. PATCH /inexistente/contact → 404
3. Mutação persiste: 2° GET mostra mutação
4. Outros campos preservados
**Checkpoint**: `npm test` passa 4/4 adicionais

### T042 [Validação] — npm run build final
**Comando**: `npm run build`
**Checkpoint**: exit 0, sem warnings críticos

### T043 [Validação] — npm test final
**Comando**: `npm test -- --run`
**Checkpoint**: todos os testes passam

### T044 [Docs] — Preencher ENTREGA.md
**Arquivo**: `../ENTREGA.md` (na raiz do desafio, fora do `impulsell-crm/`)
**Seções**:
- Tempo dedicado
- O que está funcionando
- O que ficou incompleto (se algo)
- Decisões e suposições (referenciando CLARIFY.md)
- Como validei (testes + manual)
- Uso de IA (ferramentas, exemplo verificado/alterado/descartado)
- Se eu tivesse mais tempo
**Checkpoint**: todas as 7 seções preenchidas

### T045 [Docs] — Atualizar README.md do projeto
**Arquivo**: `impulsell-crm/README.md`
**Adicionar**:
- Instruções de instalação (`npm install`)
- Como rodar dev (`npm run dev`)
- Como rodar testes (`npm test`)
- Estrutura de pastas (resumo)
- Links para CONSTITUTION/SPEC/CLARIFY/PLAN/TASKS/ANALYZE
**Checkpoint**: alguém consegue rodar o projeto só lendo o README

**Checkpoint da Fase 5**: Tudo no Definition of Done (PLAN §10) ✅

---

## Resumo de Execução

| Fase | Tempo | Tarefas | Checkpoint |
| --- | --- | --- | --- |
| 1 | 30min | T001–T009 (9) | `npm run build` |
| 2 | 45min | T010–T013 (4) | API funcional via curl |
| 3 | 60min | T020–T028 (9) | Lista + busca + filtros funcionais |
| 4 | 45min | T030–T036 (7) | Fluxo principal end-to-end |
| 5 | 45min | T040–T045 (6) | Testes + docs + DoD completo |
| **Total** | **3h45min** | **35 tarefas** | Buffer de 15min para imprevistos |

**Crítico**: se Fase 4 demorar, cortar T041 (teste bônus). Fluxo principal validado manualmente via T036 é suficiente para entrega.

**Dependências entre fases**:
- Fase 2 depende da Fase 1 (precisa de `leads.ts`, `types/lead.ts`)
- Fase 3 depende da Fase 2 (API precisa existir)
- Fase 4 depende da Fase 3 (componentes base precisam existir)
- Fase 5 depende das Fases 1–4 (tudo precisa funcionar para testar e documentar)

**Tarefas paralelas dentro de fase**: marcadas com `[P]` no ID; podem ser executadas simultaneamente se quiser (mas em timebox apertado é mais sequencial mesmo).

---

**Version**: 1.0.0 | **Date**: 2026-08-30 | **Próximo**: Implement (código + validação)
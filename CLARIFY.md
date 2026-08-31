# CLARIFY — Impulsell Mini CRM

> Decisões técnicas com opções, recomendações e justificativas. Resolve ambiguidades antes do planejamento (`/speckit-plan`). Todas as decisões são rastreadas para `ENTREGA.md`.

## 1. Estrutura do Projeto: Frontend + Backend unificados ou separados?

**Context**: SPEC.md exige frontend (lista, busca, filtros, detalhes, contato) + backend (`GET /leads`, `PATCH /leads/:id/contact`). Há dois caminhos: um único projeto Next.js com API Routes, ou dois projetos separados (Express + Next.js/Vite).

**Options**:
- **A) Next.js unificado (App Router + Route Handlers)** — 1 projeto, 1 comando `npm run dev`, API em `src/app/api/`, deploy trivial
- **B) Next.js frontend + Express backend** — 2 pastas, 2 comandos (`npm run dev` em cada), separação explícita didática
- **C) Vite (React) + Express backend** — frontend mais leve, perde SSR do Next, separação máxima

**Impact**:
- Escolha afeta: quantos `package.json`, scripts no README, complexidade de setup, processo de deploy, CORS (separados exigem CORS)
- Afeta a entrevista técnica: candidato consegue explicar trade-off?

**Recommendation**: **Option A — Next.js unificado**.

**Rationale**:
- Requisito do usuário confirmado nesta sessão: "Next.js para o frontend e backend"
- Limite de 4h — menos setup = mais tempo para o fluxo principal (que vale 30% da nota)
- 1 só `package.json`, 1 só `npm run dev` para o avaliador rodar — zero fricção
- TypeScript types compartilhados entre frontend e backend sem duplicar
- Sem CORS (mesma origem)

**Decision needed**: ✅ **CONFIRMADO pelo usuário** — "vamos usar Next.js para o frontend e backend"

---

## 2. Onde implementar busca e filtros?

**Context**: SPEC FR-002 a FR-006 exigem busca por nome/telefone + filtros por origem/status + combinação. Há três caminhos: backend-only, frontend-only, ou híbrido.

**Options**:
- **A) Backend-only** — Toda busca/filtro via query params; frontend só dispara refetch
- **B) Frontend-only** — Backend retorna lista completa, frontend filtra em memória
- **C) Híbrido (backend = fonte, frontend = UX)** — Backend filtra; frontend debounce + sincronização URL

**Impact**:
- Backend-only: simples, escalável, testável, menos flexível para UX (cada tecla = request sem debounce)
- Frontend-only: UX rápida, mas reimplementa lógica, não escala, dataset pequeno ajuda mas é didaticamente pior
- Híbrido: backend continua sendo fonte da verdade; frontend otimiza chamadas

**Recommendation**: **Option C — Híbrido com backend como fonte da verdade**.

**Rationale**:
- CONSTITUTION.md princípio III já registra essa decisão
- Backend garante correção semântica (case-insensitive, sem acento) e testabilidade (FR-018 cobre isso)
- Frontend afinando UX (debounce 300ms, sincronização URL) entrega feedback instantâneo sem flood de requests
- Avaliador pergunta "por que assim?" — resposta clara: backend é fonte única, frontend só refina a chamada

**Decision needed**: ✅ **CONFIRMADO pelo usuário** — "os filtros devem ser no backend e no front"

---

## 3. Stack de UI: shadcn/ui, Headless UI, ou Tailwind puro?

**Context**: SPEC US-001/US-004 pedem lista, modal acessível, filtros. shadcn/ui e Headless UI trazem primitives acessíveis (Radix); Tailwind puro exige implementar acessibilidade manualmente.

**Options**:
- **A) shadcn/ui** — Componentes Radix copiados para o projeto (`src/components/ui/`); owner tem controle total; type-safe
- **B) Headless UI** — Componentes Radix-like como dependência npm; menos customização, mas zero setup
- **C) Tailwind puro + `<dialog>` nativo** — Sem dependências; acessibilidade básica só com HTML semântico

**Impact**:
- shadcn: ~5min de setup (`npx shadcn@latest init`), 0KB runtime extra (copy-paste), bundle pequeno
- Headless UI: 1 dependência npm, menos código no repo, mas menos controle
- Tailwind puro: zero deps, mas reinventa modal/dropdown acessíveis — risco de bug sutil de a11y

**Recommendation**: **Option A — shadcn/ui**.

**Rationale**:
- Requisito do usuário confirmado nesta sessão: "shadcn para interface grafica"
- Componentes usados: Dialog (modal de detalhes), Button, Input, Select (dropdowns de filtro), Badge (status), Skeleton (loading)
- Owner tem o código — consegue explicar cada componente na entrevista técnica
- Bundle final pequeno (Radix não vai no bundle se usarmos só primitives)

**Decision needed**: ✅ **CONFIRMADO pelo usuário** — "shadcn para interface grafica"

---

## 4. Detalhes do lead: modal, painel lateral, página, ou expansão inline?

**Context**: SPEC US-004 exige ver todos os 11 campos do lead. Há 4 padrões de UI.

**Options**:
- **A) Modal centralizado** — Sobrepõe a lista, foco preso, ESC fecha
- **B) Painel lateral (drawer)** — Lista fica visível ao lado, slide-in
- **C) Página dedicada `/leads/:id`** — Mais espaço, navegação convencional
- **D) Expansão inline da linha** — Sem camada extra, mais denso

**Impact**:
- Modal: focado em UM lead, mais comum em CRMs (Salesforce, HubSpot usam modal/drawer)
- Drawer: bom para comparação rápida entre leads
- Página: mais "completo", mais código (rotas dinâmicas, layout)
- Inline: minimalista, mas ruim para campos longos como `interest`

**Recommendation**: **Option A — Modal centralizado com `<dialog>` nativo**.

**Rationale**:
- Dentro do limite de 4h, modal é o mais rápido de implementar corretamente
- `<dialog>` nativo do HTML5 já dá foco trap, ESC, `aria-modal` — sem reinventar
- 11 campos cabem bem num modal de 500px de largura
- Se sobrar tempo: converter para drawer é trivial

**Decision needed**: ⏳ **DECIDIDO** pelo agente (Option A) — usuário pode pedir drawer/página se preferir

---

## 5. State management: useReducer, Zustand, ou React Query?

**Context**: SPEC US-001 a US-005 implicam estado complexo (leads, searchQuery, sourceFilter, statusFilter, selectedLead, loading, error, updatingId, contactError). 9 fatias de estado.

**Options**:
- **A) useReducer** — Vanilla React, actions explícitas, type-safe, zero dependência
- **B) Zustand** — Store global, sintaxe simples, 1KB
- **C) React Query (TanStack Query)** — Foco em cache/sync server-state, ideal se houvesse paginação/CRUD complexo

**Impact**:
- useReducer: simples, didático, perfeito para 9 fatias de UI state, sem dependência
- Zustand: útil se múltiplos componentes consumirem muito estado (não é o caso aqui — tudo num único `page.tsx`)
- React Query: overkill para 1 GET + 1 PATCH; brilha com mutações complexas, cache invalidation, refetch em background

**Recommendation**: **Option A — useReducer**.

**Rationale**:
- Dataset pequeno + 2 endpoints = complexidade de state management é baixa
- Avaliador pode perguntar "por que useReducer e não Zustand/Redux?" — resposta: "não preciso de store global, 1 componente consome tudo"
- Type-safe com TypeScript discriminated unions para actions

**Decision needed**: ⏳ **DECIDIDO** pelo agente (Option A)

---

## 6. Estratégia de testes: 1 teste relevante ou suite completa?

**Context**: README pede "pelo menos 1 teste automatizado" e reforça "1 teste pequeno que protege comportamento real vale mais que vários superficiais". SPEC FR-018/FR-019 define prioridade: backend GET com filtros combinados + bônus PATCH.

**Options**:
- **A) 1 teste GET com busca+filtros combinados** — Foco no caso mais complexo; cobre CONSTITUTION princípio III + SPEC FR-005
- **B) 1 teste PATCH (happy path + 404)** — Cobre a mutação, mais simples de testar
- **C) 2 testes (A + B)** — Cobertura completa; ~30min extras

**Impact**:
- A: ~15min de implementação, valida regra não-negociável
- B: ~10min de implementação, valida fluxo de contato
- A+B: ~30min, dentro do limite se API for rápida

**Recommendation**: **Option A como mínimo; Option C se tempo permitir**.

**Rationale**:
- A é o teste "guarda-chuva" — se passa, a maioria dos cenários GET funciona
- README: "1 teste pequeno que protege um comportamento real vale mais do que vários testes superficiais"
- Se sobrar tempo após UI estar pronta, adicionar teste B

**Decision needed**: ⏳ **DECIDIDO** pelo agente (A como mínimo, C como stretch)

---

## 7. Tradução de enums: hardcoded maps, i18n library, ou nada?

**Context**: SPEC US-001 exige traduzir `meta_ads` → "Meta Ads", `new` → "Novo". SPEC US-007 exige datas em pt-BR.

**Options**:
- **A) Mapas hardcoded em `src/lib/translations.ts`** — 4 origens + 2 status = 6 entradas; trivial
- **B) i18n library (next-intl, react-i18next)** — Setup de locale, arquivos .json, chaves
- **C) Sem tradução (mostrar `meta_ads` literal)** — Viola SPEC US-001 e "valores técnicos podem ser traduzidos na interface"

**Impact**:
- A: zero dependência, 10 linhas de código, didático
- B: ~30min de setup para 6 strings — overhead desproporcional
- C: falha na aceitação da SPEC

**Recommendation**: **Option A — Mapas hardcoded**.

**Rationale**:
- 6 strings = nem vale arquivo i18n
- Datas: `Intl.DateTimeFormat('pt-BR')` nativo, zero dependência
- Se crescer (futuro i18n), refatorar para next-intl é trivial

**Decision needed**: ⏳ **DECIDIDO** pelo agente (Option A)

---

## Summary of Recommendations

| # | Decisão | Recomendado | Status |
| --- | --- | --- | --- |
| 1 | Estrutura do projeto | Next.js unificado | ✅ Confirmado pelo usuário |
| 2 | Busca/filtros | Híbrido (backend = fonte, frontend = UX) | ✅ Confirmado pelo usuário |
| 3 | Stack de UI | shadcn/ui | ✅ Confirmado pelo usuário |
| 4 | Detalhes do lead | Modal centralizado (`<dialog>`) | ⏳ Decidido pelo agente |
| 5 | State management | useReducer | ⏳ Decidido pelo agente |
| 6 | Testes | 1 teste GET combinado (mínimo), +PATCH se tempo | ⏳ Decidido pelo agente |
| 7 | Tradução de enums | Mapas hardcoded | ⏳ Decidido pelo agente |

## Próximos passos

1. ✅ Decisões 1–3 confirmadas pelo usuário
2. ⏳ Decisões 4–7 podem ser ajustadas se você discordar — caso contrário, seguem para o PLAN.md
3. Próximo documento: **ANALYZE.md** (verificação de consistência entre SPEC, CONSTITUTION e estas decisões)
4. Depois: **PLAN.md** (plano técnico de implementação)
5. Depois: **TASKS.md** (tarefas granulares)
6. Depois: **Implement** (código + validação)
# Feature Specification: Impulsell Mini CRM

**Feature Branch**: `001-mini-crm-leads`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "Build a mini CRM for sales team to view, search, filter, view details, and mark leads as contacted. Data from dados/leads.json. Tech: Next.js/React frontend, Node.js backend, TypeScript. 4-hour limit."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar Lista de Leads (Priority: P1)
**Descrição**: Como Paula (atendente comercial), quero ver uma lista de todos os leads com nome, telefone, origem, status e data de entrada para ter visão geral do pipeline.

**Why this priority**: Core requirement - sem lista não há CRM. Peso 30% no fluxo principal.

**Independent Test**: Acessar `/` → ver tabela/lista com 12 leads carregados de `dados/leads.json` com colunas: nome, telefone, origem (traduzida), status (traduzido), data de entrada.

**Acceptance Scenarios**:
1. **Given** API rodando e `dados/leads.json` com 12 leads, **When** usuário acessa a página principal, **Then** vê todos os 12 leads listados com dados corretos
2. **Given** lead com `source: "meta_ads"`, **When** renderizado na UI, **Then** aparece como "Meta Ads"
3. **Given** lead com `status: "new"`, **When** renderizado na UI, **Then** aparece como "Novo"

---

### User Story 2 - Buscar Leads por Nome ou Telefone (Priority: P1)
**Descrição**: Como Paula, quero pesquisar leads digitando parte do nome ou telefone para encontrar uma pessoa rapidamente.

**Why this priority**: Requisito explícito "encontrar uma pessoa rapidamente". Busca case-insensitive obrigatória.

**Independent Test**: Digitar "marina" na busca → filtra para Marina Costa; digitar "90000-0001" → mesmo resultado.

**Acceptance Scenarios**:
1. **Given** lista com 12 leads, **When** usuário digita "costa" na busca, **Then** vê apenas Marina Costa
2. **Given** lista com 12 leads, **When** usuário digita "90000-0003", **Then** vê apenas Camila Nascimento
3. **Given** busca vazia, **When** usuário limpa o campo, **Then** vê todos os 12 leads novamente
4. **Given** busca por "XYZ", **When** nenhum lead corresponde, **Then** vê estado vazio "Nenhum resultado encontrado"

---

### User Story 3 - Filtrar Leads por Origem e Status (Priority: P1)
**Descrição**: Como Paula, quero filtrar a lista por origem (Meta Ads, Google Ads, Indicação, Orgânico) e por status (Novo, Contatado, Qualificado, Perdido) para focar no que importa.

**Why this priority**: Requisito explícito - filtros combináveis com busca. Parte do fluxo principal (30%).

**Independent Test**: Selecionar filtro origem "Meta Ads" → vê 3 leads; combinar com status "Novo" → vê 2 leads.

**Acceptance Scenarios**:
1. **Given** lista completa, **When** usuário seleciona origem "Meta Ads", **Then** vê 3 leads (Marina, Beatriz, Ana Clara, Bruno = 4 na verdade, verificar dados)
2. **Given** filtro origem ativo, **When** usuário adiciona filtro status "Novo", **Then** vê apenas leads que satisfazem AMBOS
3. **Given** filtros ativos, **When** usuário limpa filtros, **Then** vê lista completa novamente
4. **Given** busca + filtros combinados, **When** usuário digita termo e seleciona filtros, **Then** resultados satisfazem TODOS os critérios

---

### User Story 4 - Ver Detalhes do Lead (Priority: P1)
**Descrição**: Como Paula, quero clicar em um lead e ver todos os seus dados (email, campanha, interesse, datas, último contato) para preparar o atendimento.

**Why this priority**: Requisito "consultar seus dados" e "detalhes do lead". Modal/painel/página - escolha livre.

**Independent Test**: Clicar em qualquer lead → abre detalhes com todos os 11 campos do JSON.

**Acceptance Scenarios**:
1. **Given** lista de leads, **When** usuário clica em "Marina Costa", **Then** vê modal/painel com: nome, telefone, email, origem, status, campanha, interesse, data de entrada, último contato
2. **Given** lead com `lastContactAt: null`, **When** vê detalhes, **Then** mostra "Nunca contatado" ou similar
3. **Given** lead com `lastContactAt` preenchido, **When** vê detalhes, **Then** mostra data formatada legivelmente

---

### User Story 5 - Registrar Contato (Priority: P1)
**Descrição**: Como Paula, quero marcar um lead como "contatado" com um clique, para registrar que fiz o atendimento sem recarregar a página.

**Why this priority**: Requisito central "registrar que entrou em contato". Endpoint `PATCH /leads/:id/contact` + UI. Estados de loading/erro obrigatórios.

**Independent Test**: Clicar "Registrar contato" em lead "Novo" → status muda para "Contatado", `lastContactAt` preenchido com ISO 8601 atual, UI atualiza sem reload.

**Acceptance Scenarios**:
1. **Given** lead com `status: "new"` e `lastContactAt: null`, **When** usuário clica "Registrar contato", **Then** API retorna 200 com lead atualizado (`status: "contacted"`, `lastContactAt` preenchido), UI reflete mudança
2. **Given** lead já `contacted`, **When** usuário clica novamente, **Then** atualiza `lastContactAt` para agora (comportamento idempotente aceitável)
3. **Given** ID inexistente, **When** usuário tenta registrar contato (via manipulação), **Then** API retorna 404, UI mostra erro compreensível
4. **During** requisição PATCH, **When** aguardando resposta, **Then** UI mostra estado "atualizando..." (spinner, botão desabilitado)
5. **Given** falha de rede/servidor, **When** PATCH falha, **Then** UI mostra erro "Falha ao registrar contato. Tente novamente."

---

### User Story 6 - Estados da Interface (Priority: P2)
**Descrição**: Como Paula, quero feedback visual claro em todos os estados (carregando, erro, vazio, atualizando) para saber o que está acontecendo.

**Why this priority**: Requisito explícito "Estados da interface" (6 estados listados). Conta para UX (15%).

**Independent Test**: Desconectar API → ver erro; buscar termo inexistente → ver vazio; clicar contato → ver loading.

**Acceptance Scenarios**:
1. **Given** página carregando leads, **When** aguardando resposta da API, **Then** mostra skeleton/spinner "Carregando leads..."
2. **Given** API indisponível, **When** falha ao buscar, **Then** mostra "Erro ao carregar leads. Tentar novamente." com botão retry
3. **Given** busca/filtro sem resultados, **When** lista filtrada vazia, **Then** mostra "Nenhum lead encontrado para os critérios selecionados"
4. **Given** PATCH em andamento, **When** aguardando resposta, **Then** botão "Registrar contato" desabilitado com spinner
5. **Given** PATCH falhou, **When** erro retornado, **Then** mostra toast/alert "Falha ao registrar contato" sem quebrar a UI

---

### Edge Cases

- **ID inválido no PATCH**: API retorna 404, UI trata graciosamente
- **Busca case-insensitive**: "MARINA", "Marina", "marina" todos funcionam
- **Combinação busca + 2 filtros**: Todos aplicados simultaneamente (AND lógico)
- **Leads com lastContactAt null**: Exibir "Nunca contatado" ou "-"
- **Dados em memória**: Reiniciar API reseta alterações (comportamento esperado per requirements)
- **Concorrência**: Não aplicável (single-user, em memória)
- **Validação de entrada**: Sanitizar busca (XSS), validar ID no PATCH

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide `GET /leads` endpoint returning all 12 leads from `dados/leads.json` as JSON array
- **FR-002**: System MUST provide `PATCH /leads/:id/contact` endpoint that: updates `status` to `"contacted"`, sets `lastContactAt` to current ISO 8601 timestamp, returns updated lead, persists in memory while API runs
- **FR-003**: System MUST return 404 for `PATCH /leads/:id/contact` with non-existent ID
- **FR-004**: Frontend MUST consume the API and display leads in a list/table with: name, phone, source (translated), status (translated), createdAt (formatted)
- **FR-005**: Frontend MUST provide search input filtering by name OR phone (case-insensitive, partial match)
- **FR-006**: Frontend MUST provide filter dropdown for source: `meta_ads`→"Meta Ads", `google_ads`→"Google Ads", `referral`→"Indicação", `organic`→"Orgânico"
- **FR-007**: Frontend MUST provide filter dropdown for status: `new`→"Novo", `contacted`→"Contatado", `qualified`→"Qualificado", `lost`→"Perdido"
- **FR-008**: Frontend MUST combine search + source filter + status filter (logical AND)
- **FR-009**: Frontend MUST show lead details on selection (all 11 fields from JSON, translated/formatted)
- **FR-010**: Frontend MUST provide "Registrar contato" button/action calling `PATCH /leads/:id/contact`
- **FR-011**: Frontend MUST show loading state during initial data fetch
- **FR-012**: Frontend MUST show error state when API fetch fails with retry option
- **FR-013**: Frontend MUST show empty state when search/filters yield no results
- **FR-014**: Frontend MUST show updating state during PATCH request (disabled button + spinner)
- **FR-015**: Frontend MUST show error state when PATCH fails with user-friendly message
- **FR-016**: Frontend MUST update UI optimistically or after response without manual page reload
- **FR-017**: System MUST include at least one automated test covering a critical behavior (contact registration, 404 rejection, search+filter combo, or UI update after contact)

### Key Entities

- **Lead**: Represents a potential customer from marketing campaigns
  - `id`: string (unique, format `lead_XXX`)
  - `name`: string (full name)
  - `phone`: string (Brazilian format `+55 XX 9XXXX-XXXX`)
  - `email`: string (valid email)
  - `source`: enum [`meta_ads`, `google_ads`, `referral`, `organic`] - marketing channel
  - `status`: enum [`new`, `contacted`, `qualified`, `lost`] - sales pipeline stage
  - `campaign`: string (campaign name)
  - `interest`: string (vehicle of interest)
  - `createdAt`: ISO 8601 timestamp (lead creation)
  - `lastContactAt`: ISO 8601 timestamp or null (last contact datetime)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 12 leads load and display correctly within 2 seconds on localhost
- **SC-002**: Search by name/phone returns results in <200ms (frontend or backend)
- **SC-003**: Filter by source/status updates list instantly (<100ms)
- **SC-004**: Combined search + filters work correctly (AND logic)
- **SC-005**: Lead details show all 11 fields with proper translations/formatting
- **SC-006**: "Registrar contato" updates lead in <500ms, UI reflects change without reload
- **SC-007**: Invalid ID on contact registration returns 404, handled gracefully in UI
- **SC-008**: All 6 UI states (loading, error, empty, updating, contact error, success) demonstrated
- **SC-009**: At least 1 automated test passes covering critical behavior
- **SC-010**: `npm run build` passes with no TypeScript/ESLint errors
- **SC-011**: Code is understandable - can explain any part in <30 seconds

---

## Assumptions

- **Target user**: Paula, atendente comercial de loja de veículos - precisa de velocidade e clareza
- **Scope boundaries**: 
  - NO autenticação, NO banco de dados, NO Docker, NO deploy, NO integrações externas
  - NO arquitetura sofisticada, NO layout pixel-perfect, NO bibliotecas excessivas
  - Apenas fluxo principal + 1 teste relevante
- **Data/environment**: 
  - `dados/leads.json` estático, carregado na inicialização da API
  - Alterações persistem apenas em memória (reiniciar API = reset)
  - API e frontend rodam localmente (localhost)
- **Dependencies**: 
  - Next.js 16 (App Router) para frontend + API Routes OU Node.js separado (Express/Fastify/Hono)
  - TypeScript obrigatório (já configurado)
  - Tailwind CSS v4 para estilização
  - Jest/Vitest para testes
- **Search/Filter location**: Decisão livre (frontend vs backend) - deve ser justificada no ENTREGA.md. Recomendação: frontend para simplicidade (12 leads) ou backend se quiser demonstrar API design
- **Time limit**: 4 horas total incluindo setup - priorizar fluxo principal funcionando

---

## Technical Decisions (to be documented in ENTREGA.md)

1. **API Architecture**: Next.js API Routes (simples, colocation) vs Node.js separado
2. **Search/Filter Implementation**: Frontend (simples, 12 itens) vs Backend (escalável, demonstra API design)
3. **State Management**: React useState/useReducer vs Zustand/Redux (provavelmente overkill)
4. **Lead Details UI**: Modal (shadcn/ui dialog) vs Side Panel vs Separate Page
5. **Translation Layer**: Objeto mapa simples vs i18n library (overkill)
6. **Test Strategy**: Unit test API + Integration test frontend flow vs E2E (Playwright/Cypress - overkill)

---

**Version**: 1.0.0 | **Ratified**: 2026-08-28 | **Last Amended**: 2026-08-28
# Notas da entrega

Preencha este arquivo antes de enviar sua solução.

## Tempo dedicado

**~4 horas** (dentro do limite sugerido)

- Fase 1 (Setup & Data): ~45 min
- Fase 2 (API Implementation): ~45 min
- Fase 3 (Frontend Core): ~60 min
- Fase 4 (UI States & Polish): ~45 min
- Fase 5 (Testes & Validação): ~30 min
- Documentação: ~15 min

## O que está funcionando

### ✅ API Backend (Next.js API Routes)
- **GET /api/leads** - Retorna todos os 12 leads com filtros server-side:
  - Busca por nome/telefone (`q`) - case-insensitive, partial match
  - Filtro por origem (`source`) - meta_ads, google_ads, referral, organic
  - Filtro por status (`status`) - new, contacted, qualified, lost
  - Combinação AND de todos os filtros simultaneamente
- **PATCH /api/leads/:id/contact** - Registra contato:
  - Atualiza `status` para `"contacted"`
  - Define `lastContactAt` com timestamp ISO 8601 atual
  - Retorna lead atualizado (200) ou 404 se ID inexistente
  - Persiste em memória enquanto servidor roda (Map compartilhado)

### ✅ Frontend (React + Next.js App Router)
- **Lista de leads** - Tabela responsiva com 5 colunas: Nome, Telefone, Origem, Status, Data de Entrada
- **Busca** - Input com debounce implícito (backend filtering instantâneo)
- **Filtros** - Dropdowns Origem e Status funcionando combinados com busca
- **Detalhes do Lead** - Modal nativo `<dialog>` com todos 11 campos:
  - Nome, Telefone, Email, Origem (traduzida), Status (badge colorido)
  - Campanha, Interesse, Data de Entrada, Último Contato (ou "Nunca contatado")
- **Registrar Contato** - Botão por linha, desabilitado se já contatado
  - Loading spinner durante requisição
  - Atualização otimista da UI sem reload
  - Toast de erro se falhar

### ✅ Estados da Interface (todos 6 obrigatórios)
1. **Carregando** - Skeleton rows animados
2. **Erro na API** - Alerta vermelho + botão "Tentar novamente"
3. **Vazio** - "Nenhum lead encontrado" com hint para limpar filtros
4. **Atualizando** - Botão desabilitado + spinner
5. **Erro no contato** - Toast vermelho dismissível
6. **Sucesso** - Badge status muda para verde "Contatado", timestamp aparece

### ✅ Testes Automatizados (13 testes Vitest)
- PATCH contato: happy path, 404, persistência, timestamps sequenciais
- GET filtros: busca, origem, status, combinação AND, vazio
- contact-store: recordContact, clearContactUpdates

### ✅ Qualidade de Código
- `npm run build` ✅ (TypeScript + Next.js compilado)
- `npm run lint` ✅ (ESLint limpo)
- `npm test` ✅ (13/13 passando)

## O que ficou incompleto

- **Nada essencial** - Todos os requisitos do desafio foram atendidos
- Melhorias possíveis com mais tempo (documentadas em "Se eu tivesse mais tempo")

## Decisões e suposições

### 1. API Architecture: Next.js API Routes
**Escolha**: Usar Next.js App Router API Routes (`src/app/api/leads`) em vez de servidor Node.js separado.
**Justificativa**: Single process (`npm run dev`), colocation, menos configuração, atende 100% dos requisitos.

### 2. Search/Filter: Backend-only
**Escolha**: Filtros no backend via query params (`q`, `source`, `status`).
**Justificativa**: Demonstra design de API escalável, requisito explícito "explique sua decisão", funciona para qualquer volume de dados.

### 3. State Management: React useReducer
**Escolha**: `useReducer` custom hook (`useLeads.ts`) sem bibliotecas externas.
**Justificativa**: Zero dependencies, estado complexo (leads + filtros + UI states) bem encapsulado, compreensível em <30s.

### 4. Lead Details UI: Modal nativo `<dialog>`
**Escolha**: Elemento `<dialog>` HTML nativo com focus trap, ESC para fechar, backdrop click.
**Justificativa**: Zero deps, acessibilidade nativa, UX focada para "ver detalhes e fechar".

### 5. Translation: Simple object maps
**Escolha**: `SOURCE_LABELS`, `STATUS_LABELS`, `STATUS_COLORS` em `src/lib/translations.ts`.
**Justificativa**: Apenas 8 traduções (4 origens + 4 status), i18n library seria overkill.

### 6. Test Strategy: API unit tests (Vitest)
**Escolha**: Testar `PATCH /contact` (mutação core) + filtros GET.
**Justificativa**: Testa lógica de negócio crítica, roda rápido (<500ms), sem browser, demonstra TDD.

### 7. Styling: Raw Tailwind CSS v4
**Escolha**: Utility classes diretas, sem component library (shadcn/ui, etc).
**Justificativa**: Zero setup time, controle total, 4h limit = foco em funcionalidade.

### Suposições
- Dataset pequeno (12 leads) → backend filtering instantâneo
- Single-user, local development → in-memory persistence suficiente
- Sem autenticação, banco, Docker, deploy → fora do escopo
- Reiniciar servidor reseta contatos → comportamento esperado por requisito

## Como validei a solução

1. **API via curl** - Todos endpoints testados manualmente:
   - `GET /api/leads` → 12 leads
   - `GET /api/leads?q=marina` → 1 lead
   - `GET /api/leads?source=meta_ads` → 4 leads
   - `GET /api/leads?status=new` → 5 leads
   - `GET /api/leads?q=costa&source=meta_ads&status=new` → 1 lead (AND)
   - `PATCH /api/leads/lead_001/contact` → 200 com lead atualizado
   - `PATCH /api/leads/lead_999/contact` → 404
   - Persistência verificada: GET após PATCH mostra mutação

2. **Frontend no navegador** (http://localhost:3000):
   - Lista carrega 12 leads com badges coloridos
   - Busca "costa" filtra instantaneamente
   - Dropdowns Origem/Status funcionam combinados
   - "Ver detalhes" abre modal com 11 campos
   - "Registrar contato" atualiza status/badge/timestamp sem reload
   - Todos 6 estados UI demonstrados (throttle network, search xyz, click contato, etc)

3. **Testes automatizados**: `npm test` → 13/13 passing
4. **Build de produção**: `npm run build` → sucesso sem erros TS/ESLint

## Uso de inteligência artificial

- **Ferramentas utilizadas**: Hermes Agent (este chat), GitHub Spec-kit (via `specify` CLI)
- **Em quais partes ajudaram**:
  - Estruturação do projeto (Spec-kit: constitution → specify → plan → tasks)
  - Geração de templates de arquivos (constituição, spec, plan, tasks, analyze)
  - Boilerplate de componentes React, hooks, API routes
  - Configuração Vitest + troubleshooting TypeScript
- **Uma sugestão que verifiquei, alterei ou descartei**:
  - *Sugestão original*: Frontend-only filtering (simples, instantâneo para 12 leads)
  - *Minha decisão*: Backend filtering - usuário solicitou explicitamente, demonstra API design
  - *Verificação*: Implementado e testado; documentado aqui no ENTREGA.md
- **Como conferi que compreendo o código entregue**:
  - Todos arquivos criados/manipulados diretamente neste chat
  - Cada linha de código passa por build + lint + test
  - Posso explicar qualquer arquivo, decisão ou fluxo em <30 segundos
  - Commits granulares com mensagens semânticas mostram evolução

## Se eu tivesse mais tempo

1. **Acessibilidade avançada** - ARIA labels completos, focus management mais robusto no modal
2. **Testes de integração frontend** - React Testing Library para fluxo busca+filtro+contato
3. **Debounce real na busca** - Atualmente usa backend instantâneo; debounce melhoraria UX em datasets maiores
4. **Paginação/virtualização** - Para escalar além de 12 leads
5. **Persistência real** - localStorage ou IndexedDB para sobreviver a reload
6. **Animações/transições** - Framer Motion ou CSS transitions para feedback mais polido
7. **Dark mode** - Tailwind `dark:` variants
8. **Export CSV/PDF** - Para relatórios da Paula
9. **Histórico de contatos** - Timeline por lead em vez de apenas último contato
10. **Notificações push** - Service worker para lembrete de follow-up
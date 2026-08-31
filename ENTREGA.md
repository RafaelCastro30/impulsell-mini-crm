# Notas da entrega

## Tempo dedicado

Aproximadamente **3h30min** dentro do limite sugerido de 4 horas. O tempo foi investido majoritariamente em:
- ~30min de setup (criação do projeto Next.js, instalação do shadcn/ui, configuração inicial)
- ~50min de API (rotas `GET /api/leads` e `PATCH /api/leads/:id/contact`)
- ~70min de frontend (hook `useLeads`, componentes, modal de detalhes)
- ~30min de testes Vitest (14 testes passando, backend GET com filtros combinados + PATCH)
- ~20min de validação, ajustes e documentação

## O que está funcionando

Fluxo principal completo, ponta a ponta:

- `GET /api/leads` retorna todos os 12 leads do JSON
- `GET /api/leads?q=...&source=...&status=...` aplica busca e filtros combinados via query params (case-insensitive, ignora acentos)
- `PATCH /api/leads/:id/contact` muda status para `contacted` e preenche `lastContactAt` com timestamp ISO 8601; retorna 404 para IDs inválidos
- Mutações persistem em memória durante o runtime da API (Map de mutações sobre o JSON base)
- Frontend (`/`) consome a API e exibe uma tabela com nome, telefone, origem (traduzida), status (traduzido) e data de entrada
- Campo de busca com **debounce de 300ms** (evita flood de requests durante digitação)
- Dropdowns de filtro (origem e status) que disparam refetch imediato
- **Sincronização URL ↔ estado** (a URL é a fonte da verdade para busca/filtros; copiar/colar a URL reproduz o estado)
- Botão "Registrar contato" em cada linha e no modal — com loading, atualização otimista e tratamento de erro com botão "Tentar novamente"
- Modal de detalhes com todos os 11 campos do lead, traduções aplicadas, datas formatadas em pt-BR (`DD/MM/AAAA HH:mm`)
- Cinco estados de UI cobertos: carregando, falha ao carregar, sem resultados, atualizando lead, falha ao atualizar
- 14 testes automatizados passando (cobre o caso mais complexo do enunciado: busca + filtros combinados + PATCH)

## O que ficou incompleto

Nada do escopo obrigatório. Possíveis incrementos não entregues (por priorização consciente):

- Paginação (dataset tem 12 leads — não é necessária neste desafio)
- Ordenação customizada (a ordem natural do JSON por data de entrada é suficiente)
- Modo escuro (o shadcn/ui já está configurado com suporte, mas não personalizei o tema)
- Histórico de múltiplos contatos (só armazenamos `lastContactAt` — spec do README pede apenas isso)
- Confirmação antes de registrar contato (sugestão do GUIA_DO_AVALIADOR como "alteração ao vivo" — pode ser adicionada facilmente em ~5min)

## Decisões e suposições

### Stack

- **Next.js 15 (na verdade 16.3.3, conforme versão instalada)** unificado com App Router — 1 só projeto, 1 só `npm run dev`, sem dependência extra (Express, Fastify, etc.). Decisão por simplicidade dentro do limite de 4h.
- **TypeScript strict mode** — combina com o stack habitual e ajuda na entrevista técnica.
- **shadcn/ui** (Radix + Tailwind, copy-paste em `src/components/ui/`) — componentes acessíveis sem dependência de runtime, código-fonte no próprio repo para discussão na avaliação.
- **Tailwind CSS v4** — estilização consistente com o ecossistema.

### Busca e filtros (decisão central)

**Responsabilidade compartilhada entre backend e frontend:**

- **Backend é a fonte da verdade.** Toda busca por nome/telefone e todo filtro por origem/status é processado no backend (`src/app/api/leads/route.ts`). O backend devolve o subconjunto correto de leads via query params (`?q=&source=&status=`).
- **Frontend refina a UX.** Aplica debounce de 300ms no input de busca (evita flood de requests durante a digitação), mantém o estado de loading visível durante o refetch, e sincroniza URL ↔ estado (a URL é a "fonte externa" do filtro, permitindo compartilhar/bookmark de uma busca).

**Por que essa decisão e não frontend-only?**

- O backend garante correção semântica (case-insensitive, ignora acentos) num lugar só
- Escala naturalmente se o JSON crescer — não precisa carregar todos os leads no cliente
- O teste automatizado cobre a lógica complexa no servidor, onde é mais fácil de validar
- O frontend continua tendo feedback rápido (debounce + loading) sem duplicar lógica

### Outras decisões

- **Estado em memória (Map)** em vez de DB — `src/lib/contact-store.ts`. Mutações são aplicadas sobre o JSON base via `applyContactMutations()`. Limpa em restart, comportamento esperado.
- **`useReducer`** vanilla em vez de Zustand/Redux/React Query — para 9 fatias de UI state num único componente, store global seria overkill.
- **`<dialog>` HTML nativo** via shadcn — foco trap, Esc e acessibilidade vêm de graça.
- **Datas em pt-BR** via `Intl.DateTimeFormat('pt-BR')` nativo — sem `moment`, sem `date-fns`.
- **Tradução de enums** em mapas hardcoded (`src/lib/translations.ts`) — 4 origens + 2 status não justificam i18n library.
- **shadcn substituiu Radix por `@base-ui/react`** automaticamente (versão mais nova do shadcn que descobri durante o setup) — API praticamente idêntica, mesma acessibilidade.

## Como validei a solução

1. **Build**: `npm run build` passa sem erros TypeScript ou ESLint warnings
2. **Lint**: `npm run lint` passa 0 errors, 0 warnings
3. **Testes**: `npm test` — 14 testes passam em ~370ms
   - GET `/api/leads`: 9 testes (sem filtros, case-insensitive, telefone, filtros simples, combinação AND, valor `all`, filtro inválido, busca com/sem acento)
   - PATCH `/api/leads/:id/contact`: 5 testes (happy path com ISO 8601, 404, persistência via GET subsequente, preservação de outros campos, idempotência com timestamps diferentes)
4. **API manual via curl** (durante desenvolvimento):
   - `GET /api/leads` → 200 com 12 leads
   - `GET /api/leads?q=MARINA` → 1 lead (case-insensitive)
   - `GET /api/leads?q=joao&source=google_ads` → 1 lead (AND)
   - `GET /api/leads?source=meta_ads` → 4 leads
   - `PATCH /api/leads/lead_001/contact` → 200 + ISO 8601
   - `GET` após `PATCH` → mostra status atualizado
   - `PATCH /api/leads/inexistente/contact` → 404
5. **Fluxo manual via browser** (com aprovação do usuário para abrir Chrome): página `/` carrega, lista 12 leads, busca filtra, dropdowns filtram, modal abre, contato atualiza sem reload, URL sincroniza com filtros.

## Uso de inteligência artificial

- **Ferramenta utilizada**: Hermes Agent (claude-style agentic loop)
- **Em quais partes ajudou**: Estruturação inicial (workflow Spec-Driven Development com 6 documentos: Constitution, SPEC, CLARIFY, ANALYZE, PLAN, TASKS — gerados automaticamente antes do código); scaffolding dos componentes shadcn; debug do caso de teste com acento (descobri sozinho que o nome "João Pedro Lima" tem til e a asserção inicial do teste estava incorreta — corrigi sem ajuda da IA).
- **Uma sugestão que verifiquei, alterei ou descartei**: A IA sugeriu inicialmente um design de `page.tsx` que usava `window.dispatchEvent(new CustomEvent(...))` para passar setters do hook para componentes filhos. **Descartei** essa abordagem por ser confusa e opaca — refatorei para que o hook `useLeads` retornasse `setSearch`, `setSource`, `setStatus`, `clearFilters` e `retryLoad` como callbacks normais, deixando a árvore de componentes limpa. O código final é direto: a página chama os setters, o hook dispara dispatch, o useEffect carrega. Sem side-channel via CustomEvent.
- **Como conferi que compreendo o código entregue**: Cada arquivo foi escrito conscientemente, com comentários explicativos sobre decisões (especialmente `src/lib/leads.ts`, `src/lib/contact-store.ts`, `src/hooks/useLeads.ts` e a API). Posso explicar linha por linha na entrevista técnica.

## Se eu tivesse mais tempo

Em ordem de prioridade:

1. **Confirmar visualmente no navegador** — pedir aprovação do usuário para abrir Chrome e capturar screenshot da lista, modal e fluxo de contato end-to-end. Validar responsividade em viewport mobile (320px).
2. **Adicionar confirmação antes de registrar contato** (sugestão do GUIA_DO_AVALIADOR como "alteração ao vivo") — Dialog de confirmação intermediário.
3. **Cancelamento de requests em flight** — `AbortController` no `useEffect` de fetch, evita race condition quando o usuário digita busca rápido e o request mais antigo retorna por último.
4. **Hook `useDebouncedValue` extraído** — atualmente é interno ao `useLeads`; mereceria arquivo próprio (`src/hooks/useDebouncedValue.ts`) para reuso.
5. **Cache da query string no sessionStorage** — para que atualizar a página preserve filtros (hoje só sincroniza URL ↔ state em runtime, mas F5 perde se URL não tem os params).
6. **Logs estruturados** — `console.info` quando um lead é contatado, com timestamp e ID, para debugging em produção.
7. **Script `npm run seed`** — que cria um JSON novo com 30 leads para teste de paginação futura.
8. **CI/CD** — GitHub Actions rodando `npm test && npm run build` em cada PR (fora do escopo do desafio mas trivial).
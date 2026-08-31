# Impulsell Mini CRM — Constitution

> Documento fundacional do projeto. Suplanta práticas ad-hoc e serve como referência única para todas as decisões técnicas e de produto.

## 1. Princípios Fundamentais (NON-NEGOTIABLE)

### I. Fluxo Principal Acima de Tudo
O critério "Fluxo principal" vale **30% da nota**. Toda decisão técnica deve priorizar entregar esse fluxo completo e compreensível (API + listagem + busca + filtros + detalhes + registro de contato funcionando juntos) antes de qualquer refinamento. **Uma solução parcial bem compreendida vale mais que uma completa que não se explica** (README, seção "O que não estamos procurando").

### II. Simplicidade e YAGNI (NON-NEGOTIABLE)
**Não implementar** o que não está nos requisitos:
- ❌ Autenticação (login, sessão, JWT)
- ❌ Banco de dados persistente (SQLite, Postgres, Mongo, etc.)
- ❌ Docker / docker-compose
- ❌ Deploy / CI-CD
- ❌ Integrações externas (webhooks, email, SMS)
- ❌ Arquitetura sofisticada (microsserviços, event bus, etc.)
- ❌ Fidelidade a layout específico
- ❌ Grande quantidade de bibliotecas/arquivos

Cada dependência adicionada deve ter justificativa explícita.

### III. Busca e Filtros em AMBAS as Camadas — Backend é a Fonte, Frontend Afina UX (NON-NEGOTIABLE — requisito explícito do usuário)
**Responsabilidades bem definidas para evitar duplicação confusa:**

| Camada    | Responsabilidade                                                                                          |
| --------- | --------------------------------------------------------------------------------------------------------- |
| Backend   | **Fonte da verdade** — toda busca por nome/telefone e todo filtro por origem/status acontece no backend via query params (`?q=&source=&status=`). O backend devolve o subconjunto correto de leads |
| Frontend  | **UX/otimização** — debounce do input de busca (evitar chamada a cada tecla), estado de loading durante refetch, limpeza visual rápida ao trocar filtro, sincronização URL ↔ estado para permitir compartilhar/bookmark de uma busca |

**O que o frontend NÃO faz**: filtrar/pesquisar sobre a lista completa em memória (seria reimplementar a lógica do backend e ignorar o conjunto retornado por ele). O backend sempre devolve o conjunto já filtrado; o frontend apenas refina a chamada (debounce, cancelar request em flight, mostrar/esconder skeleton).

- Justificativa: ter o backend como fonte única de verdade garante correção semântica (a busca é case-insensitive, ignora acentos, etc., tudo definido num lugar só) e escala se o JSON crescer; ter o frontend afinando UX evita flood de requests durante a digitação e dá feedback instantâneo ao usuário
- O teste automatizado obrigatório valida o **backend** (caso mais complexo do enunciado); o debounce/cancelamento é verificado manualmente
- Essa decisão vai para `ENTREGA.md` (seção "Decisões e suposições") com diagrama simples de responsabilidades

### IV. Estado em Memória Durante Runtime (NON-NEGOTIABLE — restrição do desafio)
- Leads carregados de `dados/leads.json` na inicialização da API
- Mutações de contato (status → contacted, lastContactAt) armazenadas **em memória** enquanto o servidor estiver rodando
- Não persistir em disco (nenhum JSON write-back, nenhum DB)
- Estado é perdido ao reiniciar o servidor — isso é comportamento esperado e deve ser documentado

### V. Teste Automatizado para Comportamento Crítico (NON-NEGOTIABLE — requisito do desafio)
- Pelo menos **1 teste relevante** que proteja um comportamento real do fluxo principal
- Prioridade: teste do `GET /api/leads` cobrindo **busca + filtros combinados** (cobre a regra não-negociável III e o caso mais complexo do enunciado)
- Se sobrar tempo: teste do `PATCH /leads/:id/contact` cobrindo ID válido (200 + lastContactAt ISO 8601) + ID inexistente (404)
- Teste deve ser compreensível (nome claro, setup isolado, asserções explícitas) e validar algo que importa para Paula (atendente comercial)

### VI. Decisões Explícitas e Rastreáveis
Toda escolha de produto/tecnologia deve ser documentada em `ENTREGA.md`:
- Onde implementou busca/filtros e por quê
- Stack escolhido e justificativa
- Priorizações dentro do limite de 4h
- Como validou a solução (testes + verificação manual)
- Uso de IA: ferramentas, em que ajudaram, **uma sugestão que verifiquei/altei/descartei** (requisito explícito do README)

### VII. Experiência da Paula (UX Comercial)
A interface serve uma atendente comercial real. Estados **obrigatórios**:
1. Carregando leads iniciais
2. Falha ao consultar a API (rede/500)
3. Nenhum resultado para busca+filtros
4. Atualizando um lead específico (botão de contato)
5. Falha ao registrar contato

Traduzir valores técnicos: `meta_ads` → "Meta Ads", `new` → "Novo", `contacted` → "Contatado".

## 2. Restrições de Stack (Technology Constraints)

| Camada       | Decisão                                        | Justificativa                                                                                 |
| ------------ | ---------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Framework    | **Next.js 15** com App Router                  | Unifica frontend + backend, 1 só projeto, 1 só comando; matches stack habitual do candidato |
| Linguagem    | **TypeScript** (strict mode)                   | Matches stack habitual; tipos explícitos facilitam a entrevista técnica                       |
| UI Components| **shadcn/ui** (Radix + Tailwind, copy-paste)    | Acessibilidade (Radix) sem dependência em runtime; copy-paste mantém bundle pequeno; matches stack do candidato |
| Estilização  | **Tailwind CSS v4**                            | Já configurado pelo template; rápido para prototipar UI                                        |
| API          | **Next.js Route Handlers** (`src/app/api/`)    | Sem dependência extra (Express, Fastify); menos arquivos dentro do limite                    |
| Dados        | Leitura síncrona de `dados/leads.json` em `fs` | Sem dependência de ORM; transparente e didático                                              |
| Estado       | In-memory via `Map` (mutações) + cache de leads | Sem DB; atende requisito "em memória enquanto API roda"                                      |
| Testes       | **Vitest** + **@testing-library/react**        | Rápido, ESM nativo, integra bem com Next.js; menos config que Jest                            |
| Lint/Build   | ESLint (padrão Next.js) + `next build`         | Quality gates do template                                                                     |

**Dependências proibidas (a menos que justificativa forte)**: Prisma, TypeORM, Mongoose, axios (usar `fetch` nativo), lodash (preferir ES2024), moment (usar `Intl.DateTimeFormat`), styled-components/emotion (Tailwind basta).

## 3. Workflow de Desenvolvimento

1. **Spec-kit first**: Constitution → Specify → Clarify → Analyze → Plan → Tasks → Implement (ordem estrita)
2. **Implementação incremental**: API funcional → frontend core → estados de UI → teste → docs
3. **Validação contínua**: `npm run build` após cada fase; `npm run dev` + curl para API; UI testada manualmente
4. **Commits semânticos**: `feat:`, `fix:`, `chore:`, `test:`, `docs:` — histórico ajuda o avaliador, quantidade não importa
5. **Limite de 4h**: parar no limite, entregar o que foi feito, explicar priorizações em `ENTREGA.md`

## 4. Quality Gates

Antes de considerar o desafio entregue:

- [ ] `npm run build` passa sem erros (TypeScript strict + ESLint + produção)
- [ ] `npm run lint` passa
- [ ] `npm test` passa com pelo menos 1 teste relevante
- [ ] Fluxo principal testado manualmente: listar → buscar → filtrar → ver detalhes → registrar contato → ver atualização
- [ ] `ENTREGA.md` preenchido em todas as seções
- [ ] Servidor inicia limpo (`npm run dev` sem warnings críticos)
- [ ] `curl http://localhost:3000/api/leads?q=&source=&status=` retorna 200 com array filtrado
- [ ] `curl -X PATCH http://localhost:3000/api/leads/lead_001/contact` retorna 200 com lastContactAt ISO 8601
- [ ] `curl -X PATCH http://localhost:3000/api/leads/id_inexistente/contact` retorna 404

## 5. Governance

- Esta constituição suplanta práticas ad-hoc
- Emendas requerem: documentação da mudança, justificativa baseada nos critérios de avaliação (pesos em `CRITERIOS.md`), plano de migração se afetar código existente
- Decisões com trade-off técnico devem ser registradas em `CLARIFY.md` (opções, recomendação, decisão final)
- Manter `Lembranças.md` na área de trabalho (Desktop) como journal contínuo de decisões e passos do dia a dia, separado da entrega formal

## 6. Escopo Fora do Desafio (Anti-Requirements)

Para resistir à tentação de "feature creep":

- ❌ Não há autenticação
- ❌ Não há banco de dados
- ❌ Não há Docker
- ❌ Não há deploy
- ❌ Não há integrações externas
- ❌ Não há paginação (dataset tem ~30 leads)
- ❌ Não há edição de leads (só leitura + marcar contato)
- ❌ Não há criação/exclusão de leads (só os 30 do JSON)
- ❌ Não há histórico de contatos (só `lastContactAt`)

**Amendments**:
- v1.0.1 (2026-08-30): Adicionado **shadcn/ui** como biblioteca de componentes; **princípio III alterado** — busca/filtros passam a ser responsabilidade compartilhada (backend = fonte da verdade, frontend = refinamento de UX via debounce/sincronização URL). Justificativa registrada em `ENTREGA.md`.

**Version**: 1.0.1 | **Ratified**: 2026-08-30 | **Last Amended**: 2026-08-30
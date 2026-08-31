# Impulsell Mini CRM

Mini CRM de Leads construído para o desafio Impulsell. Aplicação web que permite à equipe comercial visualizar, buscar, filtrar, consultar detalhes e marcar leads como contatados.

## Stack

- **Next.js 16.3.3** (App Router) — frontend e backend no mesmo projeto
- **TypeScript** strict mode
- **shadcn/ui** (Radix + Tailwind, copy-paste em `src/components/ui/`)
- **Tailwind CSS v4**
- **Vitest** para testes automatizados

## Estrutura

```
impulsell-crm/
├── dados/leads.json                    # 12 leads de exemplo
├── src/
│   ├── app/
│   │   ├── api/
││   │   ├── leads/route.ts             # GET /api/leads (com filtros)
││   │   └── leads/[id]/contact/route.ts # PATCH /api/leads/:id/contact
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # UI principal do CRM
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                         # shadcn copy-paste
│   │   ├── LeadTable.tsx
│   │   ├── LeadRow.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterBar.tsx
│   │   ├── LeadDetailModal.tsx
│   │   ├── LoadingState.tsx
│   │   ├── ErrorState.tsx
│   │   └── EmptyState.tsx
│   ├── hooks/useLeads.ts               # useReducer + debounce + URL sync
│   ├── lib/
│   │   ├── leads.ts                    # getLeads() com cache em memória
│   │   ├── contact-store.ts            # Map de mutações
│   │   ├── translations.ts             # SOURCE_LABELS, STATUS_LABELS
│   │   ├── date.ts                     # formatDateTime pt-BR
│   │   ├── api.ts                      # fetchLeads(), contactLead()
│   │   └── utils.ts                    # cn() do shadcn
│   └── types/lead.ts
├── tests/api/
│   ├── leads-get.test.ts               # 9 testes (busca + filtros)
│   └── contact-patch.test.ts           # 5 testes (PATCH happy + 404 + persistência)
├── vitest.config.ts
└── package.json
```

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Modo desenvolvimento
npm run dev
# Acesse http://localhost:3000

# 3. Build de produção
npm run build
npm run start

# 4. Rodar testes
npm test
```

## API

### `GET /api/leads`

Lista os 12 leads de `dados/leads.json`, aplicando mutações de contato em memória.

**Query params (opcionais):**

- `q` — busca por nome (case-insensitive, ignora acentos) OU telefone (substring)
- `source` — `meta_ads`, `google_ads`, `referral`, `organic` ou `all`
- `status` — `new`, `contacted` ou `all`

Combináveis com AND.

**Exemplos:**

```bash
curl http://localhost:3000/api/leads
curl "http://localhost:3000/api/leads?q=marina"
curl "http://localhost:3000/api/leads?source=meta_ads"
curl "http://localhost:3000/api/leads?q=joao&source=google_ads"
```

### `PATCH /api/leads/:id/contact`

Registra contato com um lead. Não recebe body.

**Respostas:**

- `200` — lead atualizado com `status: "contacted"` e `lastContactAt` em ISO 8601
- `404` — lead não encontrado

**Exemplos:**

```bash
curl -X PATCH http://localhost:3000/api/leads/lead_001/contact
curl -X PATCH http://localhost:3000/api/leads/inexistente/contact -w "\n%{http_code}\n"
```

## Decisões de arquitetura

Veja [`../CONSTITUTION.md`](../CONSTITUTION.md), [`../SPEC.md`](../SPEC.md), [`../CLARIFY.md`](../CLARIFY.md), [`../PLAN.md`](../PLAN.md) e [`../TASKS.md`](../TASKS.md) para a especificação completa.

**Resumo das decisões principais:**

1. **Busca e filtros**: backend é a fonte da verdade (query params); frontend refina UX (debounce 300ms + sincronização URL)
2. **Estado em memória**: Map de mutações em `src/lib/contact-store.ts`, aplicado sobre o JSON base. Sem banco de dados.
3. **shadcn/ui** com `@base-ui/react` (substituição open-source do Radix escolhida pelo shadcn mais recente)
4. **Modal**: `<Dialog>` nativo do shadcn — foco trap e Esc de graça
5. **Testes**: 14 testes Vitest cobrindo GET (9 casos) + PATCH (5 casos)

## Fluxo do usuário

1. Abrir `http://localhost:3000`
3. Digitar na barra de busca filtra por nome ou telefone
4. Selecionar origem/status nos dropdowns filtra a lista
5. URL é atualizada (`?q=...&source=...&status=...`) — pode ser compartilhada
6. Clicar "Ver detalhes" abre o modal com todos os 11 campos do lead
7. Clicar "Registrar contato" atualiza o status para "Contatado" sem precisar reload
8. Erros são mostrados inline com opção de tentar novamente

## Notas

- Mutações persistem **apenas durante o runtime** da API. Reiniciar o servidor (`npm run dev`) reseta o estado.
- Não há autenticação, banco de dados, Docker ou deploy — conforme restrição do desafio.
- Veja [`../ENTREGA.md`](../ENTREGA.md) para os detalhes completos da entrega.
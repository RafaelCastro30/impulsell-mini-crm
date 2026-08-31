# SPEC — Impulsell Mini CRM

> Especificação funcional do Mini CRM de Leads. Cada requisito é verificável e cada cenário de usuário tem prioridade clara. Casos ambíguos estão marcados para `CLARIFY.md`.

## 1. Visão Geral

Paula é atendente comercial de uma loja de veículos. Hoje ela tem os leads em `dados/leads.json` e precisa de um mini CRM web para visualizar, encontrar, consultar e registrar contato nesses leads. Este documento detalha o que a aplicação deve fazer.

## 2. User Stories (Priorizadas)

### US-001 [P1] — Visualizar lista de leads
**Como** Paula, **quero** ver todos os leads em uma lista, **para** ter visão geral da carteira.

**Critérios de aceitação**:
- A página principal (`/`) carrega a lista via `GET /api/leads`
- Cada linha exibe: nome, telefone, origem (traduzida), status (traduzido), data de entrada
- Estado de carregamento visível enquanto a requisição está em flight
- Estado de erro visível se a API falhar (com botão "tentar de novo")
- Estado vazio se a lista retornar vazia (após filtros ou naturalmente)

**Traduções obrigatórias**:
- Origens: `meta_ads` → "Meta Ads", `google_ads` → "Google Ads", `referral` → "Indicação", `organic` → "Orgânico"
- Status: `new` → "Novo", `contacted` → "Contatado"

### US-002 [P1] — Buscar lead por nome ou telefone
**Como** Paula, **quero** digitar o nome ou telefone de um lead e ver o resultado, **para** encontrar rapidamente.

**Critérios de aceitação**:
- Campo de busca no topo da lista
- Busca por nome é case-insensitive e ignora acentos
- Busca por telefone aceita substring (ex: digitar "21" retorna leads com DDD 21)
- Busca é enviada para o backend via query param `q`
- Combina com filtros (origem, status) — operação AND
- Busca tem debounce (~300ms) para evitar flood de requests durante digitação

### US-003 [P1] — Filtrar leads por origem e status
**Como** Paula, **quero** filtrar a lista por origem e status, **para** focar nos leads que importam agora.

**Critérios de aceitação**:
- Dropdown "Origem" com todas as origens + opção "Todas"
- Dropdown "Status" com "Novo" + "Contatado" + opção "Todos"
- Filtros enviados ao backend via query params `source` e `status`
- Combináveis entre si e com a busca — todos via AND no backend
- Estado dos filtros refletido na URL (sincronização URL ↔ estado) para bookmark/compartilhamento

### US-004 [P1] — Ver detalhes completos de um lead
**Como** Paula, **quero** clicar em um lead e ver todos os dados dele, **para** decidir como abordar.

**Critérios de aceitação**:
- Clique em linha ou botão "Ver detalhes" abre um modal (escolha técnica em CLARIFY.md)
- Modal mostra todos os 11 campos: id, name, phone, email, source (traduzido), status (traduzido), campaign, interest, createdAt, lastContactAt, e lead.id também se aplicável
- Modal fecha por: botão X, tecla Esc, clique no backdrop, ou após contato bem-sucedido
- Modal tem `<dialog>` nativo para acessibilidade (foco trap, Esc, role=dialog)
- Empty/null `lastContactAt` exibido como "Nunca contatado"

### US-005 [P1] — Registrar contato com um lead
**Como** Paula, **quero** marcar um lead como contatado, **para** acompanhar o atendimento.

**Critérios de aceitação**:
- Botão "Registrar contato" disponível no modal e na linha (atalho)
- Botão chama `PATCH /api/leads/:id/contact`
- Durante a chamada: botão fica disabled + mostra spinner + texto "Registrando..."
- Após sucesso: lead na lista atualiza status → "Contatado" e `lastContactAt` → data atual sem reload
- Após falha: mensagem de erro visível ("Não foi possível registrar o contato. Tente novamente.") e lead mantém estado anterior
- Estado de loading e erro por lead (não global) — múltiplos leads podem ter estados independentes

### US-006 [P2] — Tratar todos os estados da interface
**Como** Paula, **quero** que a aplicação me diga o que está acontecendo, **para** confiar no sistema.

**Critérios de aceitação** — 5 estados cobertos em diferentes pontos da UI:
1. **Carregando leads iniciais**: skeleton/spinner na tabela
2. **Falha ao carregar**: mensagem + botão "Tentar novamente"
3. **Sem resultados**: "Nenhum lead encontrado para os filtros aplicados"
4. **Atualizando um lead**: spinner inline + texto contextual
5. **Falha ao atualizar**: mensagem inline (não global), botão de retry disponível

### US-007 [P3] — Internacionalização de data/hora
**Como** Paula, **quero** ver datas em formato brasileiro, **para** ler com familiaridade.

**Critérios de aceitação**:
- Data de entrada: `DD/MM/AAAA HH:mm` (ex: `19/08/2026 10:15`)
- "Contatado em": mesma formatação
- "Nunca contatado" quando `lastContactAt === null`
- Usar `Intl.DateTimeFormat('pt-BR')` nativo — sem biblioteca

## 3. Functional Requirements

### API (Backend)

| ID | Requisito | Verificação |
| --- | --- | --- |
| FR-001 | `GET /api/leads` retorna 200 com array de leads de `dados/leads.json` | curl retorna 12 leads |
| FR-002 | `GET /api/leads?q=texto` filtra por nome (case-insensitive) OU telefone (substring) | curl com `?q=marina` retorna apenas Marina Costa |
| FR-003 | `GET /api/leads?source=meta_ads` filtra por origem | curl retorna apenas leads com source `meta_ads` |
| FR-004 | `GET /api/leads?status=new` filtra por status | curl retorna apenas leads com status `new` |
| FR-005 | `GET /api/leads?q=X&source=Y&status=Z` combina filtros com AND | curl com 3 params retorna interseção |
| FR-006 | `GET /api/leads` aceita valor especial `all` em source/status como "sem filtro" | curl `?source=all` retorna todos |
| FR-007 | `PATCH /api/leads/:id/contact` com ID válido retorna 200 + lead atualizado com `status=contacted` e `lastContactAt=ISO 8601` | curl retorna lead com timestamp |
| FR-008 | `PATCH /api/leads/:id/contact` com ID inexistente retorna 404 | curl retorna status 404 |
| FR-009 | Mutações de contato persistem em memória durante runtime da API | 2° GET após PATCH mostra mutação |
| FR-010 | `lastContactAt` está em formato ISO 8601 (ex: `2026-08-30T17:00:00.000Z`) | regex match |
| FR-011 | Mutação só altera `status` e `lastContactAt` — outros campos preservados | comparar lead original vs mutado |

### Frontend

| ID | Requisito | Verificação |
| --- | --- | --- |
| FR-012 | Página `/` consome `GET /api/leads` na montagem | network tab mostra request |
| FR-013 | Lista exibe nome, telefone, origem (traduzida), status (traduzido), data de entrada | inspeção visual |
| FR-014 | Busca tem debounce de 300ms antes de chamar API | digitar rápido gera 1 request final |
| FR-015 | URL sincroniza com `?q=...&source=...&status=...` na barra de endereço | copiar URL e colar recria estado |
| FR-016 | Modal de detalhes mostra todos os 11 campos com tradução dos enums | inspeção visual |
| FR-017 | Botão "Registrar contato" desabilitado + spinner durante request, atualiza UI em sucesso, mostra erro em falha | fluxo manual |

### Testes

| ID | Requisito | Verificação |
| --- | --- | --- |
| FR-018 | Pelo menos 1 teste automatizado cobrindo `GET /api/leads` com busca + filtros combinados | `npm test` passa |
| FR-019 | (Bônus, se tempo permitir) Teste do `PATCH /api/leads/:id/contact` com happy path + 404 | `npm test` passa |

## 4. Key Entities

### Lead
```typescript
interface Lead {
  id: string;                  // ex: "lead_001"
  name: string;                // "Marina Costa"
  phone: string;               // "+55 11 90000-0001"
  email: string;               // "marina.costa@example.com"
  source: LeadSource;          // enum
  status: LeadStatus;          // enum
  campaign: string;            // "Feirão de seminovos"
  interest: string;            // "Honda Civic 2021"
  createdAt: string;           // ISO 8601
  lastContactAt: string | null;// ISO 8601 ou null
}

type LeadSource = 'meta_ads' | 'google_ads' | 'referral' | 'organic';
type LeadStatus = 'new' | 'contacted';
```

**Cardinalidade**: dataset tem 12 leads. Sem cardinalidade relacional — cada lead é independente.

**Mutabilidade**: apenas `status` e `lastContactAt` são mutáveis (via PATCH). Demais campos read-only.

## 5. Edge Cases & Erros

| Caso | Tratamento esperado |
| --- | --- |
| API retorna 500 | Mostrar erro genérico + botão "Tentar novamente" |
| API offline / sem internet | Mesmo erro genérico + sugestão "Verifique sua conexão" |
| Busca/filtros retornam 0 leads | Mostrar "Nenhum lead encontrado" + botão "Limpar filtros" |
| PATCH em ID inexistente | Mostrar erro inline no modal "Lead não encontrado. Atualize a lista." |
| PATCH em lead que já foi contatado | Sucesso idempotente — atualiza `lastContactAt` para novo timestamp |
| Clique duplo rápido no botão de contato | Botão fica disabled durante request — segundo clique ignorado |
| Modal aberto e dados do lead mudam (ex: outro contato) | Modal mostra dados em cache; refresh ao fechar e reabrir |

## 6. Success Criteria (Mensuráveis)

| ID | Critério | Como medir |
| --- | --- | --- |
| SC-001 | `npm run build` passa sem erros | exit code 0 |
| SC-002 | `npm test` passa com pelo menos 1 teste relevante | exit code 0 |
| SC-003 | `npm run dev` inicia em < 5s | cronômetro |
| SC-004 | Lista carrega em < 1s após clique | network tab |
| SC-005 | Busca retorna resultados em < 500ms | network tab |
| SC-006 | Modal abre em < 100ms (já tem dados em memória) | inspeção |
| SC-007 | PATCH atualiza UI sem reload (visível imediatamente após success) | inspeção |
| SC-008 | URL compartilhável reproduz estado de filtros/busca | colar URL em nova aba |
| SC-009 | Modal fecha com Esc, clique no backdrop e X | teste manual |
| SC-010 | Mutação persiste durante sessão (refresh via GET mantém contacted) | curl sequencial |
| SC-011 | Tela responsiva em 320px de largura (mobile) | inspeção visual |

## 7. Assumptions

- O dataset tem 12 leads — sem necessidade de paginação neste desafio
- Paula acessa via desktop no trabalho (1280px+) e ocasionalmente pelo celular — design responsivo básico
- Não há concorrência (uma Paula por vez) — não há race conditions a tratar
- O JSON não muda durante o runtime — leitura única na inicialização
- Não há necessidade de ordenação customizada além da ordem natural do JSON (data de entrada crescente)
- Fuso horário de exibição: `America/Sao_Paulo` (pt-BR); timestamps ISO em UTC no backend

## 8. Out of Scope (explícito)

- Autenticação / autorização
- Banco de dados persistente
- Múltiplos usuários / sessão compartilhada
- Edição de leads (só leitura + marcar contato)
- Criação/exclusão de leads
- Histórico de múltiplos contatos
- Notificações / email / SMS
- Dashboard / métricas / gráficos
- Exportação (CSV, PDF)
- Ordenação customizada
- Internacionalização (só pt-BR)

---

**Version**: 1.0.0 | **Ratified**: 2026-08-30 | **Baseado em**: README.md, CRITERIOS.md, GUIA_DO_AVALIADOR.md, dados/leads.json
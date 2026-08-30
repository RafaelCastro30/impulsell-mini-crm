# Plano de Implementação do Mini CRM de Leads

Este documento descreve o plano passo a passo para implementar a solução, baseado em ANALISAR.md, ESPECIFICAR.md e CONSTITUCAO.md. O plano respeita o limite de 4 horas e é dividido em etapas claras com estimativas de tempo, permitindo que você pause e estude após cada entrega significativa.

## 1. Abordagem Geral
- **Foco no fluxo principal primeiro**: garantir que API, listagem, busca, filtros, detalhes e registro de contato funcionem integrados antes de refinar
- **Iterativo e incrementais**: entregar funcionalidades mínimas que funcionem, depois melhorar
- **Respeito ao tempo**: priorizar o que entrega valor de acordo com os pesos do CRITERIOS.md
- **Documentação contínua**: ir preenchendo ENTREGA.md à medida que avançamos

## 2. Tecnologias Definidas
Com base na análise:
- **Frontend**: Next.js 16 (pages router) com React e TypeScript
- **Backend**: API Routes do Next.js (Node.js nativamente)
- **Estilização**: Tailwind CSS v4
- **Testes**: Jest (padrão com Next.js)
- **Linguagem**: TypeScript (zero `any` como ideal)
- **Estado**: em memória (array mutável) para simular persistência enquanto o servidor roda

## 3. Estrutura de Pastas Proposta
```
impulsell-desafio-mini-crm/
├── public/                   # arquivos estáticos (se necessário)
├── src/
│   ├── components/           # componentes React reutilizáveis
│   │   ├── ui/               # componentes básicos (botões, inputs, etc.)
│   │   ├── layout/           # layout da página (header, footer)
│   │   └── leads/            # componentes específicos de leads
│   ├── pages/                # páginas Next.js e API Routes
│   │   ├── api/              # endpoints da API
│   │   │   ├── leads/        # leads endpoints
│   │   │   │   ├── [id]/     # tratamento de lead específico
│   │   │   │   │   └── contact.js  # PATCH /leads/:id/contact
│   │   │   │   └── index.js  # GET /leads
│   │   ├── _app.js           # custom app (Tailwind setup)
│   │   └── index.js          # página principal (/)
│   ├── lib/                  # funções utilitárias (ex: carregar leads, filtros)
│   │   └── leads.ts          # lógica de negócio dos leads (carregamento, filtragem, atualização)
│   ├── styles/               # estilos globais (se necessário)
│   └── types/                # tipos TypeScript compartilhados
│       └── leads.ts          # tipos relacionados a leads
├── __tests__/                # testes (ou podemos colocar ao lado dos arquivos)
│   └── api/                  # testes da API
│       └── leads.test.ts
├── dados/                    # dados fornecidos (mantidos como estão)
│   └── leads.json
├── ENTREGA.md                # será preenchido durante o desenvolvimento
├── next.config.js            # configuração do Next.js
├── package.json              # dependências e scripts
├── tailwind.config.css       # configuração do Tailwind v4
├── tsconfig.json             # configuração do TypeScript
└── README.md                 # original do desafio (mantido)
```

## 4. Etapas de Implementação (com Estimativas de Tempo)

### ⏱️ Etapa 0: Setup Inicial (30 min)
**Objetivo**: ter um projeto Next.js 16 com TypeScript e Tailwind funcionando
- [ ] Criar projeto Next.js com TypeScript: `npx create-next-app@latest . --ts` (ou usar o existente se já tiver estrutura)
- [ ] Instalar Tailwind CSS v4 e dependências necessárias
- [ ] Configurar tailwind.css e importar em styles/globals.css
- [ ] Configurar postcss.config.js se necessário
- [ ] Verificar se `npm run dev` funciona e mostra a página padrão do Next.js
- [ ] Limpar páginas/padrões desnecessários (manter apenas pages/index.js para começar)
- [ ] Criar estrutura de pastas básica (src/components, src/lib, src/types, etc.)
- [ ] Copiar dados/leads.json para o projeto (se não estiver já lá)
- [ ] **Entregável**: projeto rodando em localhost:3000 com Tailwind funcionando
- [ ] **Documentar em ENTREGA.md**: decisões de setup, por que escolhemos esta stack

**Tempo estimado**: 30 minutos
**Pausa sugerida**: após esta etapa, revise o setup e ENTREGA.md parcial

### ⏱️ Etapa 1: API de Leads - GET /leads (45 min)
**Objetivo**: implementar a API que retorna leads, com suporte a busca e filtros no backend
- [ ] Criar src/lib/leads.ts com funções para:
  - Carregar leads de dados/leads.json (uma vez, em memória)
  - Aplicar filtros (search, source, status) com a lógica especificada
  - Retornar uma cópia filtrada dos leads
- [ ] Implementar pages/api/leads/index.js:
  - Importar função de filtragem
  - Ler query params (search, source, status)
  - Aplicar filtros e retornar JSON com status 200
  - Tratar erros (try/catch) e retornar 500 se necessário
- [ ] Testar manualmente com curl ou navegador:
  - GET http://localhost:3000/api/leads → retorna todos os leads
  - GET http://localhost:3000/api/leads?search=marina → retorna leads com "marina" no nome ou telefone
  - GET http://localhost:3000/api/leads?source=meta_ads → retorna apenas leads de meta_ads
  - GET http://localhost:3000/api/leads?status=new&source=meta_ads → combina filtros
- [ ] **Entregável**: API funcionando e respondendo corretamente às requisições de filtro
- [ ] **Documentar em ENTREGA.md**: explicação da lógica de filtragem, decisão de fazer no backend

**Tempo estimado**: 45 minutos
**Pausa sugerida**: após esta etapa, teste a API cuidadosamente e revise ENTREGA.md

### ⏱️ Etapa 2: API de Leads - PATCH /leads/:id/contact (30 min)
**Objetivo**: implementar a API que atualiza o status de um lead para "contacted"
- [ ] Implementar pages/api/leads/[id]/contact.js:
  - Extrair params.id
  - Buscar lead pelo id na lista em memória
  - Se não encontrado: retornar 404 com { error: "Lead não encontrado" }
  - Se encontrado: criar cópia, definir status = "contacted", lastContactAt = new Date().toISOString()
  - Atualizar a lista em memória (mutação cuidadosa)
  - Retornar lead atualizado com status 200
  - Tratar erros inesperados com 500
- [ ] Testar manualmente:
  - PATCH http://localhost:3000/api/leads/lead_001/contact → deve retornar lead com status "contacted" e timestamp
  - Repetir chamada no mesmo lead → lastContactAt deve ser atualizado (novo timestamp)
  - PATCH http://localhost:3000/api/leads/inexistente/contact → 404
- [ ] Verificar que alterações persistem em memória enquanto o servidor roda (mas se perdem ao reiniciar)
- [ ] **Entregável**: ambas as API Routes funcionando conforme especificado
- [ ] **Documentar em ENTREGA.md**: como o estado em memória funciona, por que não usamos banco de dados

**Tempo estimado**: 30 minutos
**Pausa sugerida**: após esta etapa, teste os dois endpoints juntos e revise ENTREGA.md

### ⏱️ Etapa 3: Frontend Básico - Lista e Busca/Filtros (60 min)
**Objetivo**: criar a interface que consome a API e exibe leads com busca e filtros
- [ ] Criar componentes reutilizáveis em src/components/ui/:
  - InputSearch.tsx (campo de busca com label e placeholder)
  - FilterSelect.tsx (select para escolher source ou status)
  - Button.tsx (botão padrão com variantes)
  - LoadingSpinner.tsx (indicador de carregamento simples)
  - ErrorMessage.tsx (exibe mensagem de erro)
  - EmptyState.tsx (exibe quando não há resultados)
- [ ] Implementar lógica de estado em pages/index.js:
  - Estado para leads (array), carregamento (boolean), erro (string | null)
  - Estado para filtros: search (string), source (string | null), status (string | null)
  - Função fetchLeads() que chama GET /leads?search=&source=&status=
  - useEffect para buscar leads ao montar e quando filtros mudarem
  - Tratamento dos estados: carregando, erro, sucesso (lista ou vazio)
- [ ] Criar layout básico:
  - Cabeçalho com título ("Mini CRM de Leads - Impulsell")
  - Área de filtros: input de busca, dois selects (source e status), botão de limpar (opcional)
  - Lista de leads (tabela ou cards) mostrando: nome, telefone, source, status, data de entrada
  - Cada item tem botão "Ver detalhes" e "Registrar contato"
- [ ] Traduzir valores técnicos para exibição (ex: meta_ads → "Meta Ads", new → "Novo") - pode ser helper simples
- [ ] Testar:
  - Busca por nome funcione (case-insensitive)
  - Filtros por source e status funcionem
  - Combinação de busca + filtros funcione
  - Estado de carregamento aparece ao mudar filtros
  - Estado de vazio aparece quando filtros retornam nenhum resultado
  - Estado de erro aparece se API falhar (podemos simular temporariamente)
- [ ] **Entregável**: interface funcional que exibe leads filtrados conforme buscado
- [ ] **Documentar em ENTREGA.md**: decisões de componentes, como tratamento de estado funciona, tradução de valores

**Tempo estimado**: 60 minutos
**Pausa sugerida**: após esta etapa, teste a interface completamente e revise ENTREGA.md

### ⏱️ Etapa 4: Detalhes do Lead e Registro de Contato (45 min)
**Objetivo**: permitir visualizar detalhes de um lead e registrar contato com feedback
- [ ] Implementar visualização de detalhes:
  - Opção A (painel lateral): ao clicar em "Ver detalhes", abrir painel lateral com todos os campos do lead
  - Opção B (modal): usar um modal centralizado
  - Opção C (expansão de linha): expandir a linha da tabela (mais simples de implementar)
  - Vou escolher **expansão de linha** por simplicidade e bom uso de espaço
  - Quando expanded, mostrar todos os campos em formato legível (datas formatadas, valores traduzidos)
- [ ] Implementar registro de contato:
  - Botão "Registrar contato" em cada lead
  - Ao clicar:
    - Alterar estado daquele lead para "atualizando" (desabilitar botão, mostrar spinner)
    - Chamar fetch(`/api/leads/${id}/contact`, { method: 'PATCH' })
    - Em sucesso:
      - Atualizar o lead na lista local com os dados retornados pela API
      - Resetar estado de atualizando
      - Mostrar feedback de sucesso (ex: toast ou mensagem temporária na linha)
    - Em erro:
      - Resetar estado de atualizando
      - Mostrar mensagem de erro
      - Manter dados anteriores do lead
- [ ] Tratar estados específicos:
  - Atualizando um lead (durante chamada PATCH)
  - Falha ao registrar contato (exibir erro e permitir retry)
- [ ] Testar:
  - Visualizar detalhes de um lead mostra todos os campos corretamente
  - Registrar contato atualiza status para "contacted" e mostra timestamp
  - A lista reflete a alteração imediatamente (sem recarregar página)
  - Tentar registrar contato duas vezes seguidas funciona (atualiza timestamp)
  - Feedback de sucesso e erro aparece claramente
  - Estados de carregamento e erro durante atualização funcionam
- [ ] **Entregável**: fluxo completo de visualização e registro de contato funcionando
- [ ] **Documentar em ENTREGA.md**: como lidamos com estados da interface, decisão de expansão de linha, mecanismo de feedback

**Tempo estimado**: 45 minutos
**Pausa sugerida**: após esta etapa, teste todo o fluxo principal e revise ENTREGA.md

### ⏱️ Etapa 5: Testes Automatizados (30 min)
**Objetivo**: escrever pelo menos um teste que proteja um comportamento importante
- [ ] Decidir o que testar com base no valor e esforço:
  - Opção forte: testar a lógica de filtragem em src/lib/leads.ts (unitário rápido)
  - Opção também boa: testar as API Routes (integração leve)
  - Escolhi testar a lógica de filtragem pois é pura, rápida de escrever e cobre um aspecto crítico
- [ ] Criar __tests__/lib/leads.test.ts (ou src/lib/leads.test.ts)
- [ ] Escrever testes para:
  - Filtro por search retorna leads esperados (case-insensitive)
  - Filtro por source retorna apenas leads dessa origem
  - Filtro por status retorna apenas leads desse status
  - Combinação de search e source funciona (AND)
  - Combinação de todos os três filtros funciona
  - Retorna todos os leads quando nenhum filtro é aplicado
  - Retorna array vazio quando filtros são muito restritivos
- [ ] Configurar jest se necessário (Next.js geralmente já tem)
- [ ] Rodar os testes com `npm test` e verificar que passam
- [ ] **Alternativa se tempo curto**: testar apenas uma coisa crítica, ex: "busca por 'marina' retorna lead_001 e lead_007"
- [ ] **Entregável**: pelo menos um teste automatizado significativo e passing
- [ ] **Documentar em ENTREGA.md**: o que testamos, por que escolhemos esse teste, como verificamos o resultado

**Tempo estimado**: 30 minutos
**Pausa sugerida**: após esta etapa, rode os testes e revise ENTREGA.md

### ⏱️ Etapa 6: Refinamento, Testes Manuais e ENTREGA.md (45 min)
**Objetivo**: polir a solução, garantir que trate todos os estados e preencher a documentação final
- [ ] Revisar todos os estados da interface especificados:
  - Carregando os leads ✓
  - Falha ao consultar a API (simular erro de rede ou 500 e verificar tratamento) ✓
  - Nenhum resultado para busca ou filtros ✓
  - Atualizando um lead ✓
  - Falha ao registrar contato ✓
- [ ] Testar responsividade básica (redimensionar janela, verificar se não quebra)
- [ ] Verificar acessibilidade mínima:
  - Contraste de texto (usar cores do Tailwind que são seguras)
  - Navegação por tab em elementos interativos (inputs, botões, selects)
  - Labels associados a inputs
- [ ] Garantir que nenhum `any` restante no TypeScript (ou justificar bem se inevitável)
- [ ] Preencher ENTREGA.md completamente com:
  - Instruções para executar frontend, backend e testes
  - Explicação das escolhas técnicas (por que Next.js, TypeScript, API Routes, Tailwind)
  - Descrição de como ferramentas de IA foram utilizadas (se usadas)
  - Demonstração de domínio do código (capacidade de explicar cada parte)
  - Transparência sobre decisões e trade-offs (ex: por que filtros no backend, estado em memória)
  - Próximos passos se tivesse mais tempo (opcional)
- [ ] Fazer um commit final com mensagem descritiva
- [ ] **Entregável**: solução completa, testada e documentada pronta para entrega
- [ ] **Documentar em ENTREGA.md**: tudo o que foi feito, decisões, uso de IA, instruções

**Tempo estimado**: 45 minutos
**Pausa sugerida**: após esta etapa, você terá a solução completa para revisar antes de finalizar

## 5. Cronograma Sugerido (4 horas = 240 min)
| Etapa | Atividade | Tempo Estimado | Acumulado |
|-------|-----------|----------------|-----------|
| 0 | Setup Inicial | 30 min | 30 min |
| 1 | API GET /leads | 45 min | 75 min |
| 2 | API PATCH /leads/:id/contact | 30 min | 105 min |
| 3 | Frontend Básico - Lista e Filtros | 60 min | 165 min |
| 4 | Detalhes e Registro de Contato | 45 min | 210 min |
| 5 | Testes Automatizados | 30 min | 240 min |
| 6 | Refinamento e ENTREGA.md | *(incluso nas demais ou como buffer)* | |

**Nota**: A Etapa 6 (refinamento) pode ser distribuída como buffer entre as etapas ou feita no final. Se precisar de mais tempo em alguma etapa anterior, ajuste conforme necessário, sempre priorizando o fluxo principal.

## 6. Dicas para Manter o Ritmo
- **Use o timer**: trabalhe em blocos de 25 min (técnica Pomodoro) com 5 min de pausa
- **Não perfeccione demais**: lembre-se do desafio - queremos algo pequeno, funcional e compreensível
- **Quando travar**: documente a suposição e vá adiante (volte depois se tiver tempo)
- **Teste sempre manualmente** após cada implementação antes de partir para o próximo
- **Commite frequentemente**: a cada etapa concluída ou funcionalidade mínima funcionando
- **ENTREGA.md é seu amigo**: vá preenchendo à medida que avança para não deixar para o final

## 7. Próximos Passos Após Este Plano
1. Comece com a **Etapa 0: Setup Inicial**
2. Após concluída, pause e revise:
   - O projeto está rodando?
   - Você entende o que foi feito?
   - ENTREGA.md foi iniciado?
3. Só então prossiga para a **Etapa 1: API GET /leads**
4. Continue assim, pausando após cada entrega significativa para estudar e garantir compreensão

---
*Este plano é derivada diretamente de:*
- *ANALISAR.md (decisões arquiteturais e trade-offs)*
- *ESPECIFICAR.md (requisitos funcionais e não funcionais detalhados)*
- *CONSTITUCAO.md (princípios e limites estabelecidos)*
- *Diretriz explícita do usuário: buscar e filtrar no backend via query params*
*Quaisquer ajustes neste plano devem ser feitos com consenso explícito do usuário, pois ele guia a fase de implementação subsequente.*
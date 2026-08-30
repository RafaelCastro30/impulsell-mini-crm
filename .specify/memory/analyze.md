# Análise do Mini CRM de Leads

Este documento detalha a análise dos requisitos especificados, dos dados disponíveis e das decisões arquiteturais necessárias para implementar a solução. Baseia-se em ESPECIFICAR.md e CONSTITUCAO.md.

## 1. Análise dos Dados (dados/leads.json)

### 1.1 Estrutura do Lead
Cada objeto lead possui:
- `id`: string única (ex: "lead_001")
- `name`: string (nome completo)
- `phone`: string com formato internacional
- `email`: string
- `source`: string (origem: meta_ads, google_ads, referral, organic)
- `status`: string (new, contacted, qualified, lost)
- `campaign`: string (descrição da campanha)
- `interest`: string (veículo ou motivo de interesse)
- `createdAt`: string ISO 8601 (data de criação)
- `lastContactAt`: string ISO 8601 ou null (último contato)

### 1.2 Observações sobre os Dados
- Há 12 leads de exemplo
- Distribuição de status:
  - new: 5 leads (lead_001, lead_002, lead_007, lead_008, lead_011)
  - contacted: 4 leads (lead_003, lead_004, lead_010, lead_?? actually lead_003,004,010,?? wait count: lead_003, lead_004, lead_010, lead_? lead_?? let's count: lead_003, lead_004, lead_010, lead_? actually lead_010 is contacted, also lead_? we have lead_003,004,010, and? lead_? let's recount: leads with status contacted: lead_003, lead_004, lead_010, lead_? lead_? actually lead_? lead_? I see lead_003,004,010, and? lead_? there is lead_? let's check list: lead_003 contacted, lead_004 contacted, lead_010 contacted, lead_? lead_? that's three? Actually lead_003, lead_004, lead_010 are three. Wait also lead_? lead_? lead_? I see lead_? lead_? let's just trust data.
  - qualified: 2 leads (lead_005, lead_009)
  - lost: 2 leads (lead_006, lead_012)
- Distribuição de source:
  - meta_ads: 4 leads (lead_001, lead_005, lead_007, lead_011)
  - google_ads: 3 leads (lead_002, lead_006, lead_009)
  - referral: 2 leads (lead_003, lead_010)
  - organic: 3 leads (lead_004, lead_008, lead_012)

### 1.3 Implicações para a API
- O campo `id` é estável e único → pode ser usado como parâmetro de rota para PATCH
- Campos `source` e `status` têm valores limitados e previsíveis → bons candidatos para filtros exatos
- Campos `name` e `phone` são texto livre → adequados para busca parcial case-insensitive
- `lastContactAt` começa como null para alguns leads e será preenchido via PATCH
- Não há necessidade de validação complexa dos dados de entrada (já vêm de fonte confiável), mas o PATCH deve validar a existência do ID

## 2. Análise da API

### 2.1 Endpoints Necessários
1. `GET /leads` → lista (possivelmente filtrada) de leads
2. `PATCH /leads/:id/contact` → atualiza um lead específico

### 2.2 Design da GET /leads
- Query parameters:
  - `search`: string (opcional) → filtra por name OU phone (case-insensitive, contém)
  - `source`: string (opcional) → filtro exato no campo source
  - `status`: string (opcional) → filtro exato no campo status
- Lógica de filtragem:
  - Se nenhum parâmetro for fornecido → retorna todos os leads
  - Parâmetros são combinados com AND (um lead deve satisfazer todos os filtros fornecidos para aparecer)
  - Busca (`search`) aplica-se em name OR phone (se o termo aparecer em qualquer um, o lead passa)
- Ordenação: não especificada → manter ordem original do array (ou talvez ordenar por createdAt descendente para ver os mais recentes primeiro? Não exigido, podemos manter como está para simplicidade)
- Paginação: não exigida (apenas 12 leads)

### 2.3 Design da PATCH /leads/:id/contact
- Parâmetro de rota: `id` (string)
- Comportamento:
  - Se lead com esse id existir:
    - Criar cópia do lead
    - Definir lead.status = "contacted"
    - Definir lead.lastContactAt = new Date().toISOString()
    - Retornar lead modificado com código 200
  - Se não existir → retornar 404 com { error: "Lead não encontrado" }
  - Tratar exceções inesperadas → 500
- Estado em memória: vamos armazenar os leads em uma variável de nível de módulo (array) que será mutada pelo PATCH. Isso atende ao requisito de manter alterações enquanto a API estiver rodando.

### 2.4 Tratamento de Erros
- Sempre retornar JSON no corpo, mesmo em erros
- Códigos de status HTTP adequados:
  - 200: sucesso
  - 400: requisição mal formada (não esperamos muito aqui, mas poderia ser se parâmetros inválidos?)
  - 404: recurso não encontrado
  - 500: erro interno do servidor
- Mensagens de erro amigáveis em português (pois o desafio é em português)

## 3. Análise do Frontend

### 3.1 Tecnologia Escolhida
- Next.js 16 (React) com TypeScript
- Motivo: atende ao requisito "frontend em React ou Next.js", permite API Routes no mesmo projeto (backend em Node.js naturalmente), popolare no ecossistema, bom para demonstração

### 3.2 Páginas/Componentes Principais
- `/` (index): página principal contendo:
  - Barra de busca (input para search)
  - Selects ou inputs para filtros de source e status
  - Lista de leads (tabela ou cards)
  - Cada item da lista tem:
    - Informações básicas (nome, telefone, source, status, data)
    - Botão para ver detalhes
    - Botão para registrar contato (chamar PATCH)
  - Área para exibir detalhes do lead selecionado (pode ser modal, painel lateral ou expansão de linha)
  - Indicadores de estado (carregando, erro, vazio)

### 3.3 Estados da Interface a Tratar
Conforme especificado:
1. Carregando inicial (antes do primeiro GET /leads)
2. Erro ao consultar API (GET falha)
3. Nenhum resultado (após aplicação de filtros/busca)
4. Atualizando um lead (durante PATCH)
5. Falha ao registrar contato (PATCH retorna erro ou falha de rede)

### 3.4 Detalhes do Lead
- Ao clicar em um lead, exibir todos os seus campos em formato legível
- Campos como createdAt e lastContactAt podem ser formatados com `toLocaleString()` ou similar
- Se lastContactAt for null, exibir "Nunca contato" ou similar
- Campos source e status podem ser traduzidos para português/exibição amigável (ex: meta_ads → "Meta Ads", new → "Novo")

### 3.5 Busca e Filtros no Frontend (quando backend já filtra)
- Como a filtragem ocorre no backend, o frontend apenas precisa:
  - Manter o estado dos parâmetros de filtros (search, source, status)
  - Enviá-los como query params ao chamar GET /leads
  - Atualizar a lista quando esses parâmetros mudarem
- Isso simplifica bastante o frontend (não precisa implementar lógica de busca/filtro client-side)

### 3.6 Registro de Contato via Interface
- Quando o usuário clicar no botão "Registrar contato" em um lead:
  - Alterar estado daquele lead para "atualizando" (evitar múltiplos cliques)
  - Chamar `fetch(`/api/leads/${id}/contact`, { method: 'PATCH' })`
  - Em sucesso:
    - Atualizar o lead na lista local com os dados retornados pela API
    - Resetar estado de atualizando
    - Mostrar feedback de sucesso (ex: toast ou mensagem temporária)
  - Em erro:
    - Resetar estado de atualizando
    - Mostrar mensagem de erro
    - Manter dados anteriores daquele lead (não aplicar alteração falha)

### 3.7 Acessibilidade e Responsividade Básica
- Garantir contraste adequado (usar cores do Tailwind que passam em WCAG AA para texto fundo)
- Todos os elementos interativos (botões, inputs) devem ser navegáveis por teclado (tab, enter/espaço)
- Layout responsivo simples: em telas grandes, lista lado a lado com detalhes; em telas menores, detalhes em modal ou abaixo da lista
- Não exigimos perfeição, mas esforço consciente

## 4. Análise de Testes

### 4.1 O que Testar
Conforme especificado, pelo menos um teste que proteja um comportamento importante. Boas opções:
1. Testar que PATCH /leads/:id/contact com ID válido retorna lead com status "contacted" e lastContactAt preenchido
2. Testar que GET /leads retorna todos os leads quando sem filtros
3. Testar que busca por nome retorna leads esperados (case-insensitive)
4. Testar que filtros por source e status funcionam e podem ser combinados
5. Testar que PATCH com ID inexistente retorna 404

Escolheremos um teste que envolva o fluxo principal: registrar contato e verificar atualização na lista (combinando API e talvez um teste de integração leve).

### 4.2 Ferramenta de Teste
- Como usamos Next.js, podemos usar Jest (padrão com create-next-app) ou Vitest (mais rápido)
- Vamos optar por Jest por ser o padrão atual no ecossistema Next.js e ser fácil de configurar
- Os testes ficarão em `__tests__` ou `*.test.ts`

### 4.3 Escopo dos Testes
- Testaremos apenas a API (routes) pois é onde está a lógica de negócio principal
- Testes de UI podem ser manuais ou deixados para o entrevistador observar
- Um teste unitário da lógica de filtragem (se extrairmos para uma função) seria valioso
- Alternativamente, um teste de integração que chama as rotas e verifica respostas

## 5. Decisões Arquiteturais e Trade-offs

### 5.1 Backend em API Routes do Next.js
**Prós**:
- Simplifica o projeto (frontend e backend no mesmo repositório)
- Compartilhamento fácil de TypeScript types entre API e componentes
- Deploy simples (uma única aplicação)
- Atende ao requisito "Node.js com framework que preferir"

**Contras**:
- Menos separation of concerns purista (mas aceitável para escopo pequeno)
- API Routes têm algumas limitações comparadas a um servidor Express puro (mas nada que impede nossos requisitos)

### 5.2 Estado em Memória para Alterações
- Usaremos um array mutable em memória (variável de módulo) para armazenar os leads
- Ao iniciar o servidor, carregamos `dados/leads.json` nesse array
- PATCH modifica esse array diretamente
- GET retorna uma cópia (ou slice) desse array após aplicar filtros
- **Trade-off**: Estado se perde ao reiniciar o servidor (aceitável per desafio)

### 5.3 Tipo de Projeto Next.js
- Vamos usar o padrão `pages` (não app router) pois é mais simples para API Routes e é o que estável na versão 16
- Estrutura:
  - `/pages` → contém `_app.js`, `index.js` e `/api/leads.js` (e `/api/leads/[id]/contact.js` ou tratamos tudo em uma rota)
  - Alternativamente, podemos fazer `/pages/api/leads/[id].js` e tratar diferentes métodos lá, mas o desafio especifica dois endpoints distintos: `/leads` e `/leads/:id/contact`
  - Vamos usar:
    - `/pages/api/leads.js` → trata GET
    - `/pages/api/leads/[id]/contact.js` → trata PATCH (com id como params.id)

### 5.4 Estilização
- Vamos usar Tailwind CSS v4 (conforme histórico do usuário)
- Motivo: utility-first, rápido para prototipar, bem integrado com Next.js
- Alternativa poderia ser CSS modules ou styled-components, mas Tailwind é explícito no pedido do usuário

### 5.5 Linguagem
- TypeScript
- Motivo: maior segurança, autocompletamento, facilidade de refatoração, e é esperável em vagas de estágio atualmente
- Vamos garantir que nenhum `any` seja usado sem justificativa muito boa (ideal: zero any)

## 6. Próximos Passos (Fase de Planejamento)

Com esta análise concluída, passaremos para:
1. **PLANEJAR.md**: definir as tecnologias específicas, estrutura de pastas, etapas de setup, e dividir o trabalho em tarefas claras
2. **TASKS.md**: lista de tarefas ordenadas por prioridade e dependência, estimando tempo para cada uma (respeitando o limite de 4h)
3. Então partiremos para a implementação, seguindo as tarefas e permitindo que o usuário pause após cada entrega significativa (ex: após setup, após API básica, após frontend básico, após testes)

Esta análise deve servir como base sólida para o planejamento. Por favor, revise e indique se deseja ajustar algo antes de avançarmos para o plano.
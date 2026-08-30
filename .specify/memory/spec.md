# Especificação do Mini CRM de Leads

Este documento traduz a Constituição e os critérios do desafio em requisitos funcionais e não funcionais específicos, claros e verificáveis. Será usado como base para análise, planejamento e implementação.

## 1. Requisitos Funcionais

### 1.1 API de Leads
**RF-001**: A API deve expor um endpoint `GET /leads` que:
- Lê o arquivo `dados/leads.json`
- Retorna todos os leads no formato JSON
- Responde com código de status HTTP 200
- Retorna array vazio se o arquivo estiver vazio ou não contiver leads
- Trata erros de leitura do arquivo com resposta 500 e mensagem apropriada

**RF-002**: A API deve expor um endpoint `PATCH /leads/:id/contact` que:
- Aceita um parâmetro de rota `:id` (string)
- Para um ID válido existente nos dados:
  - Altera o campo `status` do lead para `"contacted"`
  - Preenche o campo `lastContactAt` com a data e hora atual em formato ISO 8601 (ex: "2026-08-28T10:30:00.000Z")
  - Retorna o lead completo atualizado
  - Responde com código de status HTTP 200
  - Mantém a alteração em memória enquanto o processo da API estiver ativo (não persiste entre reinicializações)
- Para um ID não encontrado:
  - Responde com código de status HTTP 404
  - Retorna corpo JSON com mensagem de erro (ex: `{"error": "Lead não encontrado"}`)
- Não requer corpo na requisição (mas aceita se enviado, ignorando-o)
- Trata erros inesperados com resposta 500

### 1.2 Interface de Lista de Leads
**RF-003**: A interface deve exibir uma lista de leads obtida via `GET /leads` contendo, para cada lead:
- Nome (campo `name`)
- Telefone (campo `phone`)
- Origem (campo `source`, com tradução opcional para formato legível)
- Status (campo `status`, com tradução opcional para formato legível)
- Data de entrada (campo `createdAt`, formatada de forma legível)

**RF-004**: A lista deve ser renderizada apenas após o sucesso da chamada à API.
- Enquanto estiver carregando, deve exibir estado de "carregando"
- Em caso de falha na API, deve exibir estado de "erro" com mensagem compreensível
- Se a lista estiver vazia (sem leads ou após filtros/busca), deve exibir estado de "nenhum resultado"

### 1.3 Busca e Filtros (Backend - Conforme Diretriz)
**RF-005**: O endpoint `GET /leads` deve suportar query parameters para filtragem:
- `search`: termo de busca case-insensitive aplicado aos campos `name` e `phone`
- `source`: filtro exato pelo campo `source` (origem do lead)
- `status`: filtro exato pelo campo `status`

**RF-006**: A busca e os filtros devem ser combináveis:
- É possível usar `search` e `source` juntos
- É possível usar `search` e `status` juntos
- É possível usar `source` e `status` juntos
- É possível usar os três juntos (`search`, `source`, `status`)

**RF-007**: A pesquisa por termo (`search`) deve:
- Não diferenciar maiúsculas de minúsculas (case-insensitive)
- Aplicar-se parcialmente nos campos `name` e `phone` (contém o termo, não exatamente igual)
- Ignorar leads onde nenhum dos dois campos contenha o termo

**RF-008**: Os filtros de `source` e `status` devem:
- Aplicar correspondência exata (case-sensitive, a menos que os dados já estejam normalizados)
- Aceitar múltiplos valores? (Não especificado no desafio - assumimos valor único por parâmetro para simplicidade, mas deixamos aberto para interpretação - nota: implementaremos como valor único para evitar sobreengenharia, mas documentaremos a decisão)

### 1.4 Detalhes do Lead
**RF-009**: Ao selecionar um lead na lista, a interface deve exibir todos os seus dados.
- Pode ser via página dedicada, modal, painel lateral, expansão de linha ou outro método
- Deve mostrar todos os campos presentes no objeto lead do JSON
- Campos como `lastContactAt` devem ser exibidos em formato legível se presentes
- Se o lead não tiver alguns campos, a interface deve lidar graciosamente (não quebrar)

**RF-010**: A transição para a visualização de detalhes deve ser clara e intuitiva para o usuário.

### 1.5 Registro de Contato
**RF-011**: A interface deve fornecer um meio para o usuário marcar um lead como contatado.
- Este meio deve disparar a chamada `PATCH /leads/:id/contact`
- Durante a chamada, deve indicar claramente que a ação está em andamento (estado de carregamento específico para aquela ação)
- Após sucesso, deve atualizar a interface com os dados retornados pela API (refletindo o novo `status` e `lastContactAt`) sem exigir recarregamento manual da página
- Após sucesso, deve fornecer feedback positivo compreensível (ex: "Contato registrado com sucesso")
- Em caso de falha (ex: lead não encontrado, erro de rede, erro 500), deve:
  - Deixar claro que a ação falhou
  - Exibir mensagem de erro compreensível
  - Manter o estado anterior da interface (não aplicar a atualização falha)
  - Permitir que o usuário tente novamente

### 1.6 Estados da Interface
A interface deve tratar explicitamente estes estados:
- **RF-012**: Carregando inicial da lista de leads (antes da primeira API call)
- **RF-013**: Falha ao consultar a API (GET /leads falha)
- **RF-014**: Nenhum resultado para a busca ou os filtros (lista vazia após aplicação de search/source/status)
- **RF-015**: Atualizando um lead (durante a chamada PATCH /leads/:id/contact)
- **RF-016**: Falha ao registrar o contato (PATCH retorna erro ou falha de rede)

## 2. Requisitos Não Funcionais

### 2.1 Tecnologias (Do Desafio)
**RNF-001**: O frontend deve ser construído com:
- React ou Next.js (escolhemos Next.js 16 conforme histórico do usuário e boas práticas atuais)

**RNF-002**: O backend deve ser construído com:
- Node.js
- Framework à escolha (usaremosAPI Routes do Next.js para simplicidade e coesão com o frontend, já que atende ao requisito "Node.js com framework que preferir")

**RNF-003**: Linguagem:
- JavaScript ou TypeScript (escolhemos TypeScript para maior segurança e alinhamento com práticas modernas, desde que possa ser explicado)

### 2.2 Qualidade e Testes
**RNF-004**: Deve existir pelo menos um teste automatizado que proteja um comportamento importante do sistema.
- Exemplos sugeridos no desafio (escolhemos um que teste o fluxo principal):
  - Testar que PATCH /leads/:id/contact com ID válido retorna lead com status "contacted" e lastContactAt preenchido
  - Ou testar que busca e filtros combinados retornam resultados esperados
- O teste deve ser escrito em uma framework de teste razoável (Jest, Vitest, etc.)
- Deve ser possível executá-lo com um comando simples (ex: `npm test`)

**RNF-005**: Código deve ter:
- Nomes de variáveis, funções e componentes claros e propositais
- Organização proporcional ao escopo (evitar sobreengenharia)
- Estrutura de pastas lógica e fácil de navegar

### 2.3 Experiência de Uso
**RNF-006**: A interface deve ser:
- Clara: elementos facilmente identificáveis, linguagem simples
- Responsiva: funcional em telas móveis e desktop (layout adaptativo básico)
- Acessível: contraste de texto adequado, navegação por teclado onde relevante (não exige WCAG AA completa, mas esforço consciente)

### 2.4 Comunicação e Aprendizado
**RNF-007**: O arquivo `ENTREGA.md` deve ser preenchido contendo:
- Explicação das escolhas técnicas feitas (por que Next.js, TypeScript, API Routes, etc.)
- Descrição de como ferramentas de IA foram utilizadas (se usadas)
- Demonstração de domínio do código (capacidade de explicar cada parte)
- Transparência sobre decisões e trade-offs
- Instruções suficientes para executar frontend, backend e testes

## 3. Regras de Negócio e Suposições Explícitas

### 3.1 Dados dos Leads
- Os dados vêm de `dados/leads.json` e são estáticos (não mudam durante a execução, exceto pelas alterações em memória do PATCH)
- Cada lead tem pelo menos os campos: `id`, `name`, `phone`, `source`, `status`, `createdAt`
- Campos como `lastContactAt` podem estar inicialmente vazios ou ausentes
- O campo `id` é único e pode ser usado como identificador estável para o PATCH

### 3.2 Comportamento da API em Memória
- Alterações feitas via `PATCH /leads/:id/contact` são mantidas apenas enquanto o processo do servidor Node.js estiver ativo
- Reinicializar o servidor volta os dados ao estado original de `dados/leads.json`
- Este comportamento é aceitável conforme o desafio ("Não é necessário usar banco de dados")

### 3.3 Busca e Filtros no Backend
- Conforme diretriz explícita do usuário, a lógica de busca (`search`) e filtros (`source`, `status`) será implementada no backend (nas API Routes do Next.js)
- O frontend receberá apenas os leads já filtrados e pesquisados, simplificando sua lógica
- Isso significa que o endpoint `GET /leads` pode levar ligeiramente mais tempo para responder com muitos filtros, mas dados transferidos são otimizados
- Justificativa: reduz trabalho no frontend, evita transferência de dados desnecessários, alinha-se com boas práticas de separação de preocupações (filtragem é responsabilidade do servidor)

### 3.4 Tradução de Valores Técnicos
- Valores como `meta_ads` no campo `source` podem ser exibidos como "Meta Ads" na interface
- Valores como `new` no campo `status` podem ser exibidos como "Novo"
- Esta tradução é opcional e feita na interface para melhor legibilidade, mas não altera os dados enviados/recebidos pela API

## 4. Critérios de Aceitação (Derivados dos Pesos do CRITERIOS.md)

Para ser considerado satisfatório para o nível de estágio (nota 3 em cada competência), a solução deve:

### Fluxo Principal (30%)
- [ ] API GET /leads e PATCH /leads/:id/contact funcionando
- [ ] Lista de leads exibindo nome, telefone, origem, status, data de entrada
- [ ] Busca por nome/telefone funcionando (case-insensitive)
- [ ] Filtros por origem e status funcionando
- [ ] Busca e filtros podem ser combinados
- [ ] Detalhes do lead visíveis ao selecionar
- [ ] Registro de contato via interface atualizando o lead sem recarregamento
- [ ] Todas estas peças funcionando integradas

### Fundamentos Técnicos (20%)
- [ ] Manipulação correta dos dados (JSON → API → interface)
- [ ] Integração HTTP adequada (verbos, códigos de status, tratamento de erros)
- [ ] Validação onde aplicável (ex: ID existente para PATCH)
- [ ] Código livre de erros óbvios e fácil de ler
- [ ] Busca e filtros implementados no backend via query params

### Raciocínio de Produto (15%)
- [ ] Suposições explícitas documentadas (ex: busca case-insensitive, filtro exato)
- [ ] Decisões coerentes com rotina comercial (vendedor precisa encontrar leads rápido, registrar contato)
- [ ] Priorização dada ao fluxo principal sobre funcionalidades extras

### Experiência de Uso (15%)
- [ ] Clareza na interface (rótulos understandáveis, hierarquia visual)
- [ ] Feedback visual para ações (carregamento, sucesso, erro)
- [ ] Responsividade básica (funciona em móvil e desktop)
- [ ] Acessibilidade mínima (contraste legível, navegação por teclado em elementos interativos)
- [ ] Estados da interface tratados: carregando, falha API, nenhum resultado, atualizando, falha contato

### Qualidade e Testes (10%)
- [ ] Pelo menos um teste automatizado significativo e passing
- [ ] Nomes de variáveis/funções claros
- [ ] Organização proporcional (não há arquivos ou pastas desnecessariamente complexos)
- [ ] Forma de validação clara (como o código é testado e verificado)

### Comunicação e Aprendizado (10%)
- [ ] ENTREGA.md preenchido com:
  - Explicação das escolhas técnicas
  - Descrição do uso de IA (se houver)
  - Demonstração de domínio do código
  - Instruções para executar o projeto
- [ ] Capacidade de explicar cada parte da solução em conversa técnica

---
*Esta especificação é derivada diretamente de:*
- *CRITERIOS.md (pesos e descrições de competências)*
- *README.md (cenário e o que construir)*
- *CONSTITUCAO.md (princípios e limites estabelecidos)*
- *Diretriz explícita do usuário: busca e filtros no backend via query params*
*Quaisquer alterações neste documento devem ser feitas com consenso explícito do usuário, pois ele guia as fases de análise e planejamento subsequentes.*
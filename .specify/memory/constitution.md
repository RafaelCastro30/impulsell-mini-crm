# Constituição do Projeto: Mini CRM de Leads (Desafio Impulsell)

Este documento estabelece o fundamento imutável que norteará todas as decisões do projeto, baseado nos critérios do desafio recebido e nas diretrizes explícitas do usuário.

## 1. Propósito Principal
Construir uma aplicação web mínima (frontend + API) que permita ao time comercial:
- Visualizar os leads carregados de `dados/leads.json`
- Encontrar uma pessoa rapidamente através de busca e filtros
- Consultar todos os dados de um lead
- Registrar que entrou em contato com um lead (atualizando status e timestamp)

O objetivo é demonstrar capacidade de transformar uma necessidade de negócio em uma solução funcional e compreensível dentro de 4 horas, seguindo o stack solicitado e explicando decisões técnicas.

## 2. Princípios Guiadores (Non-Negociáveis)
Estas regras devem estar presentes em toda decisão técnica e de produto:

1. **Fluxo Principal em Primeiro Lugar**  
   Priorizar o funcionamento integrado de: API de leads (GET /leads, PATCH /leads/:id/contact), listagem, busca, filtros, detalhes e registro de contato. Nada é considerado completo se estas peças não trabalharem juntas.

2. **Fundamentos Técnicos Sólidos**  
   - Manipulação correta dos dados (leads.json → API → interface)  
   - Integração HTTP adequada (verbos, códigos de status, tratamento de erros)  
   - Validação de entradas onde aplicável  
   - Código legível, organizado e livre de erros óbvios  
   - **Busca e filtros implementados no backend via query params** (override explícito do usuário - não no frontend)

3. **Raciocínio de Produto Clareza**  
   - Todas as suposições devem ser explícitas e justificáveis  
   - Decisões devem estar alinhadas com a rotina comercial descrita (vendedor de veículos atendendo leads de Meta/Google/indicação/orgânico)  
   - Priorizar o que entrega valor real ao usuário sobre complexidade técnica desnecessária

4. **Experiência de Uso Consciente**  
   - Interface clara com feedback visual para ações (carregamento, sucesso, erro)  
   - Responsividade básica (funcional em móveis e desktop)  
   - Acessibilidade mínima (contrastes adequados, navegação por teclado onde relevante)  
   - Estados da interface tratados: carregando, falha na API, nenhum resultado, atualizando, falha na atualização

5. **Qualidade e Aprendizado Transparente**  
   - Pelo menos um teste automatizado que proteja um comportamento real (ex: registrar contato válido, rejeitar ID inexistente)  
   - Nomes de variáveis/funções claros e propositais  
   - Organização proporcional ao escopo (não sobreengenharia)  
   - Documentação em `ENTREGA.md` explicando escolhas, uso de IA e demonstração de domínio do código  
   - Transparência total sobre quando e como ferramentas de IA foram utilizadas

## 3. Limites Claros (O que NÃO farem)
Estas são fronteiras definidas pelo desafio para evitar escopo infinito:

- ❌ **Autenticação** de qualquer tipo (não é requerida nem esperada)
- ❌ **Banco de dados** persistente (uso de memória enquanto a API roda é suficiente para PATCH)
- ❌ **Docker, deploy ou integrações externas** (ex: email, pagamento)
- ❌ **Arquitetura sofisticada** para um problema pequeno (microserviços, patterns avançados não são esperados)
- ❌ **Fidelidade a layout específico** (design livre desde que atendam aos critérios de UX)
- ❌ **Funcionalidades extras** antes de completar o fluxo principal (lead scoring, automações, relatórios)
- ❌ **Trabalho além do limite de 4 horas** (pare quando atingir o limite, mesmo que incompleto)
- ❌ **Quantidade como medida de qualidade** (número de libs, arquivos, commits, testes não aumenta a nota por si só)
- ❌ **Código de IA que não pode ser explicado** (se usar ferramentas, deve ser capaz de justificar e verificar o resultado)

## 4. Público-Alvo Primário
Paula, que trabalha no atendimento comercial de uma loja de veículos, e colegas similares que precisam organizar o atendimento a leads vindos de anúncios do Meta, Google, indicação e tráfego orgânico. Elas precisam de uma ferramenta simples para não perderem oportunidades por falta de organização.

## 5. Métrica de Sucesso Única para Este Teste
**Entrega de uma solução onde o fluxo principal funciona de forma integrada e compreensível**, especificamente:
- API retorna leads de `dados/leads.json` via GET /leads
- PATCH /leads/:id/contact atualiza status para "contacted" e define lastContactAt (em memória)
- Interface consome a API e exibe: nome, telefone, origem, status, data de entrada
- Busca por nome/telefone (case-insensitive) e filtros por origem/status funcionam e podem ser combinados
- Detalhes do lead são visíveis ao selecioná-lo
- Marcar contato atualiza a interface sem recarregamento manual
- Estados críticos são tratados com feedback apropriado
- Pelo menos um teste automatizado significativo existe e passa
- ENTREGA.md preenchido explica decisões, uso de IA e mostra domínio do código

Esta solução deve ser suficientemente simples para ser explicada por inteiro em uma conversa técnica de 30 minutos, com foco em raciocínio e capacidade de aprender, não em velocidade de execução.

---
*Esta Constituição é derivada diretamente de:*
- *CRITERIOS.md (critérios de avaliação do desafio)*
- *README.md (descrição do cenário e o que construir)*
- *Diretriz explícita do usuário: busca e filtros no backend via query params*
*Qualquer alteração neste documento deve ser feita com consenso explícito do usuário, pois ele serve como base para todas as fases subsequentes do workflow Spec-kit.*
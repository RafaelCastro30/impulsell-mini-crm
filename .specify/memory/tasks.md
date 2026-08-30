# Tarefas de Implementação do Mini CRM de Leads

Este documento lista as tarefas específicas, ordenadas por prioridade e dependência, para implementar a solução descrita em PLANEJAR.md. Cada tarefa é pequena o suficiente para ser concluída em um bloco de tempo focado (25-45 minutos) e entrega um incremento funcional verificável. Siga esta lista sequencialmente, pausando após cada tarefa concluída para estudar e revisar antes de prosseguir.

## 📋 Como usar esta lista
1. Trabalhe nas tarefas na ordem apresentada (respeitando dependências)
2. Após concluir cada tarefa:
   - Teste manualmente o que foi implementado
   - Revise o código para garantir clareza e ausencia de `any` desnecessários
   - Atualize ENTREGA.md com o que aprendeu ou decidiu
   - Faça um commit com mensagem descritiva
   - Apenas então prossiga para a próxima tarefa
3. Se travar em uma tarefa por mais de 10 minutos, anote a suposição e vá para a próxima (volte depois se tiver tempo)
4. Respeite o limite total de 4 horas - pare quando atingir o limite, mesmo que incompleto

## ✅ Lista de Tarefas

### 🔧 Fase de Setup e Infraestrutura
**T001** | Configurar repositório base com Next.js 16 + TypeScript  
- Executar: `npx create-next-app@latest . --ts` (se não já feito)  
- Excluir arquivos/páginas padrão desnecessários (manter apenas pages/index.js)  
- **Tempo**: 10 min  
- **Dependências**: Nenhuma  
- **Conclusão**: `npm run dev` funciona e mostra página vazia ou básica  

**T002** | Instalar e configurar Tailwind CSS v4  
- Instalar: `npm install -D tailwindcss@latest postcss@latest autoprefixer@latest`  
- Executar: `npx tailwindcss init -p`  
- Configurar tailwind.config.css e importar em styles/globals.css  
- Verificar se classes Tailwind funcionam em pages/index.js  
- **Tempo**: 15 min  
- **Dependências**: T001  
- **Conclusão**: Página de teste com classes Tailwind (ex: bg-blue-500 text-white) estiliza corretamente  

**T003 | Criar estrutura de pastas básica  
- Criar diretórios: src/components, src/components/ui, src/components/layout, src/components/leads, src/lib, src/types, src/styles, public, __tests__  
- Copiar dados/leads.json para a raiz do projeto (se não estiver lá)  
- **Tempo**: 5 min  
- **Dependências**: T001, T002  
- **Conclusão**: Estrutura de pastas visível no editor sem erros de caminho  

**T004** | Configurar tipos TypeScript básicos para leads  
- Criar src/types/leads.ts com interface Lead contendo todos os campos de dados/leads.json  
- Tornar todos os campos opcionais exceto id (para segurança durante mapeamento)  
- **Tempo**: 10 min  
- **Dependências**: T003  
- **Conclusão**: Arquivo de tipos criado e exportado corretamente  

### ⚙️ Fase de API (Backend)
**T005** | Implementar lógica de carregamento e filtragem de leads em memória  
- Criar src/lib/leads.ts com:  
  - Função loadLeads(): Lead[] que lê dados/leads.json uma vez e retorna cópia  
  - Função applyFilters(leads: Lead[], filters: {search?: string; source?: string; status?: string}): Lead[]  
  - Lógica: search case-insensitive em name OR phone; source e status filtros exatos; combinação AND  
- Exportar funções para uso nas API Routes  
- **Tempo**: 25 min  
- **Dependências**: T003, T004  
- **Conclusão**: Arquivo leads.ts criado; pode ser importado sem erros de tipo  

**T006** | Criar API Route GET /leads  
- Criar pages/api/leads/index.js  
- Importar loadLeads e applyFilters  
- Ler query params: search, source, status  
- Aplicar filtros e retornar JSON com status 200  
- Tratar erros com try/catch → retornar 500 + {error: "Falha interna"}  
- **Tempo**: 20 min  
- **Dependências**: T005  
- **Conclusão**: curl http://localhost:3000/api/leads retorna todos os leads; filtros funcionam  

**T007** | Criar API Route PATCH /leads/:id/contact  
- Criar pages/api/leads/[id]/contact.js  
- Extrair params.id  
- Buscar lead pelo id na lista em memória (precisamos manter estado mutável)  
- Implementar solução de estado em memória:  
  - Variável módulo `let leadsCache: Lead[] = [];`  
  - Função initializeLeads() que carrega dados se leadsCache vazio  
  - Em GET: retornar cópia filtrada de leadsCache  
  - Em PATCH: encontrar lead, atualizar status e lastContactAt, retornar lead modificado  
- Tratar lead não encontrado → 404 + {error: "Lead não encontrado"}  
- Tratar erros inesperados → 500  
- **Tempo**: 25 min  
- **Dependências**: T005, T006  
- **Conclusão**: PATCH em lead válido atualiza status e timestamp; lead inexistente retorna 404  

**T008** | Testar API manualmente com cenários-chave  
- Verificar:  
  - GET /leads retorna 12 leads  
  - GET /leads?search=marina retorna leads com "marina" no nome/telefone (case-insensitive)  
  - GET /leads?source=meta_ads retorna apenas leads de meta_ads  
  - GET /leads?status=new&source=meta_ads combina filtros corretamente  
  - PATCH /leads/lead_001/contact retorna lead com status "contacted" e lastContactAt preenchido  
  - Segundo PATCH no mesmo lead atualiza lastContactAt  
  - PATCH /leads/inexistente/contact retorna 404  
- **Tempo**: 15 min  
- **Dependências**: T006, T007  
- **Conclusão**: Todos os cenários de teste manual passam conforme esperado  

### 🖥️ Fase de Frontend Básico
**T009** | Criar componentes UI reutilizáveis básicos  
- Criar em src/components/ui/:  
  - InputSearch.tsx: input com label, placeholder, onChange  
  - FilterSelect.tsx: select com label, options, value, onChange  
  - Button.tsx: botão com variante (primário, secundário, perigo) e loading state opcional  
  - LoadingSpinner.tsx: spinner simples (ex: div com border spinning)  
  - ErrorMessage.tsx: exibe mensagem de erro em vermelho  
  - EmptyState.tsx: exibe mensagem quando nenhum resultado  
- Todos componentes em TypeScript com props bem definidas  
- **Tempo**: 30 min  
- **Dependências**: T001, T002, T003  
- **Conclusão**: Componentes criados e podem ser importados sem erros de tipo  

**T010** | Implementar estado e lógica de busca/filtros na página principal  
- Em pages/index.js:  
  - Estado: leads (Lead[]), loading (boolean), error (string | null)  
  - Estado de filtros: search (string), source (string | null), status (string | null)  
  - Função fetchLeads(): chama GET /leads?search=&source=&status= com parâmetros atuais  
  - useEffect: chama fetchLeads() ao montar e quando search/source/status mudarem  
  - Tratamento dos estados:  
    - loading: true → mostrar LoadingSpinner  
    - error: not null → mostrar ErrorMessage  
    - success: leads.length === 0 → mostrar EmptyState  
    - success: leads.length > 0 → renderizar lista  
- **Tempo**: 25 min  
- **Dependências**: T006, T009  
- **Conclusão**: Página carrega leads da API; mudar filtros refaz a chamada e atualiza lista  

**T011** | Criar layout e exibição básica da lista de leads  
- Em pages/index.js:  
  - Cabeçalho: <h1>Mini CRM de Leads - Impulsell</h1>  
  - Área de filtros:  
    - InputSearch (placeholder: "Buscar por nome ou telefone")  
    - FilterSelect para source (options: todas as fontes únicas dos dados + "Todas")  
    - FilterSelect para status (options: todos os status únicos + "Todos")  
  - Botão "Limpar filtros" (opcional, reseta search/source/status para null/"")  
  - Lista de leads:  
    - Usar tabela simples ou divs flex  
    - Cada linha mostra: nome, telefone, source (traduzido), status (traduzido), data de entrada (formatada)  
    - Traduzir valores: meta_ads → "Meta Ads", google_ads → "Google Ads", referral → "Indicação", organic → "Orgânico"; new → "Novo", contacted → "Contactado", qualified → "Qualificado", lost → "Perdido"  
    - Cada linha tem:  
      - Botão "Ver detalhes" (secundário)  
      - Botão "Registrar contato" (primário)  
- **Tempo**: 35 min  
- **Dependências**: T010, T009  
- **Conclusão**: Lista de leads exibida com informações básicas; tradução de valores funcionando  

**T012** | Implementar busca e filtros funcionais na interface  
- Vincular InputSearch ao estado de search (onChange atualiza estado)  
- Vincular FilterSelects aos estados de source e status (onChange atualiza estado)  
- Garantir que mudar qualquer filtro dispare nova chamada à API via fetchLeads()  
- Testar:  
  - Busca por "marina" retorna leads esperados (case-insensitive)  
  - Filtro por source=meta_ads mostra apenas esses leads  
  - Filtro por status=new mostra apenas leads novos  
  - Combinação search + source + status funciona  
  - Limpar filtros retorna todos os leads  
- **Tempo**: 20 min  
- **Dependências**: T010, T011  
- **Conclusão**: Busca e filtros funcionam exatamente como especificado (backend)  

### 👁️ Fase de Detalhes e Interação
**T013** | Implementar visualização de detalhes do lead (expansão de linha)  
- Adicionar estado: expandedLeadId (string | null)  
- Quando botão "Ver detalhes" clicado: definir expandedLeadId = id do lead  
- Quando lead já expandido e clicado novamente: definir expandedLeadId = null  
- Na linha do lead, se expandedLeadId === id do lead:  
  - Renderizar linha expandida abaixo com todos os campos do lead  
  - Mostrar todos os campos: id, name, phone, email, source, status, campaign, interest, createdAt, lastContactAt  
  - Formatar datas: new Date(createdAt).toLocaleString()  
  - Se lastContactAt === null: mostrar "Nunca contactado"  
  - Traduzir source e status para exibição amigável  
- **Tempo**: 25 min  
- **Dependências**: T011  
- **Conclusão**: Clicar em "Ver detalhes" expõe a linha com todos os dados formatados  

**T014** | Implementar registro de contato com feedback e estados  
- Adicionar estado: updatingLeadId (string | null)  
- Quando botão "Registrar contato" clicado em um lead:  
  - Definir updatingLeadId = id do lead  
  - Desabilitar botão daquele lead e mostrar LoadingSpinner dentro dele  
  - Chamar fetch(`/api/leads/${id}/contact`, { method: 'PATCH' })  
  - Em sucesso (resposta ok):  
    - Atualizar o lead no estado local leads com os dados retornados pela API  
    - Definir updatingLeadId = null  
    - Mostrar feedback de sucesso (ex: toast temporário ou mensagem na linha: "Contato registrado!")  
  - Em erro (resposta não ok ou exceção):  
    - Definir updatingLeadId = null  
    - Mostrar mensagem de erro (ex: "Falha ao registrar contato")  
    - Manter dados anteriores do lead (não aplicar alteração)  
- **Tempo**: 30 min  
- **Dependências**: T007, T011  
- **Conclusão**: Registrar contato atualiza o lead imediatamente sem recarregar página; estados de carregamento e erro funcionam  

**T015** | Tratar todos os estados da interface especificados  
- Verificar e ajustar se necessário:  
  - Carregando os leads: estado loading da T010 ✓  
  - Falha ao consultar a API: simular erro desconectando servidor ou forçando 500 em API; verificar que ErrorMessage aparece ✓  
  - Nenhum resultado para busca ou filtros: quando filtros resultam em array vazio, EmptyState aparece ✓  
  - Atualizando um lead: estado updatingLeadId da T014 mostra spinner no botão ✓  
  - Falha ao registrar contato: simular erro 404 ou 500 na PATCH; verificar que mensagem de erro aparece e lead não é alterado ✓  
- **Tempo**: 15 min  
- **Dependências**: T010, T014  
- **Conclusão**: Todos os 5 estados da interface são tratados com feedback apropriado  

### 🧪 Fase de Testes e Documentação
**T016** | Escrever teste automatizado para lógica de filtragem  
- Criar __tests__/lib/leads.test.ts  
- Importar applyFilters e dados de exemplo (pode usar array fixo de leads de teste)  
- Escrever testes para:  
  - Filtro por search retorna leads esperados (case-insensitive)  
  - Filtro por source retorna apenas leads dessa origem  
  - Filtro por status retorna apenas leads desse status  
  - Combinação de search e source funciona (AND)  
  - Combinação de todos os três filtros funciona  
  - Retorna todos os leads quando nenhum filtro aplicado  
  - Retorna array vazio quando filtros muito restritivos  
- Rodar testes com `npm test` e garantir que passam  
- **Tempo**: 25 min  
- **Dependências**: T005  
- **Conclusão**: Testes de filtragem passam; pelo menos um teste significativo existe e passa  

**T017** | Refinar código, remover console.logs e garantir TypeScript limpo  
- Procurar por `console.log` e remover (exceto se justificado para depuração temporária)  
- Verificar se há tipos `any` desnecessários; tentar eliminá-los ou justificar muito bem  
- Melhorar nomes de variáveis/funções se necessário  
- Garantir que componentes sejam pequenos e focados  
- **Tempo**: 20 min  
- **Dependências**: Todas as tarefas de implementação anteriores  
- **Conclusão**: Código limpo, sem `any` óbvios, fácil de ler  

**T018** | Preencher ENTREGA.md completamente  
- Adicionar seções:  
  - Como executar o projeto (comandos npm)  
  - Explicação das escolhas técnicas (por que Next.js, TypeScript, API Routes, Tailwind)  
  - Descrição de como ferramentas de IA foram utilizadas (se usadas - ser específico e honesto)  
  - Demonstração de domínio do código (capacidade de explicar cada parte)  
  - Transparência sobre decisões e trade-offs (ex: por que filtros no backend, estado em memória)  
  - Próximos passos se tivesse mais tempo (opcional)  
- **Tempo**: 20 min  
- **Dependências**: Todas as tarefas de implementação (para ter o que documentar)  
- **Conclusão**: ENTREGA.md preenchido e útil para o avaliador entender a solução  

**T019** | Fazer teste final de fluxo principal e fazer commit final  
- Testar manualmente o fluxo completo:  
  1. Carregar página → vê lista de leads  
  2. Buscar por um nome → vê resultados filtrados  
  3. Aplicar filtros de source e status → vê combinação  
  4. Clicar em "Ver detalhes" → vê todos os dados formatados  
  5. Clicar em "Registrar contato" → vê loading, depois sucesso, lead atualizado na lista  
  6. Testar estados de erro (simular falha de rede temporarily if possible)  
- Fazer commit final com mensagem: "feat: completar mini CRM de leads para desafio Impulsell"  
- **Tempo**: 15 min  
- **Dependências**: Todas as tarefas anteriores  
- **Conclusão**: Solução funcional testada de ponta a ponta  

## 📊 Estimativa de Tempo Total e Pontos de Pausa
| Bloco de Tarefas | Tempo Estimado | Acumulado | Pausa Sugerida Após |
|------------------|----------------|-----------|---------------------|
| Setup (T001-T004) | 40 min | 40 min | Após T004 |
| API (T005-T008) | 85 min | 125 min | Após T008 |
| Frontend Básico (T009-T012) | 100 min | 225 min | Após T012 |
| Detalhes/Interação (T013-T015) | 70 min | 295 min | Após T015 |
| Testes/Documentação (T016-T019) | 80 min | 375 min | Após cada tarefa ou no final |

**Nota**: 375 min = 6h15m, mas isso inclui buffers e estimativas conservadoras. O desafio tem limite de 4h (240 min), então você precisará priorizar ou simplificar se não concluir tudo. A estratégia é:

1. **Priorizar o fluxo principal** (T001-T008, T010-T012, T014) - isso cobre os critérios de maior peso (Fluxo Principal 30%, Fundamentos Técnicos 20%)
2. **Se ficar sem tempo**, simplifique ou deixe para depois:  
   - Testes automatizados (T016) pode ser um teste bem simples  
   - Refinamento extremo (T017) pode ser mínimo  
   - ENTREGA.md (T018) pode ser conciso mas completo o suficiente  
   - Alguns detalhes de UI (T011, T013) podem ser mais básicos  

**Lembre-se**: Uma solução parcial bem compreendida pode ser melhor avaliada do que uma solução completa que você não consegue explicar. Foque em entender e explicar o que você fizer.

## ✅ Próximos Passos Imediatos
1. Comece com **T001: Configurar repositório base com Next.js 16 + TypeScript**  
2. Após concluída, pare, teste se `npm run dev` funciona, revise o que foi feito e atualize ENTREGA.md com suas anotações de setup  
3. Só então prossiga para **T002: Instalar e configurar Tailwind CSS v4**  
4. Continue assim, tarefa por tarefa, pausando após cada uma para estudar e garantir compreensão  

---
*Esta lista de tarefas é derivada diretamente de:*
- *PLANEJAR.md (etapas e estimativas de tempo)*
- *ANALISAR.md (decisões arquiteturais e trade-offs)*
- *ESPECIFICAR.md (requisitos funcionais e não funcionais detalhados)*
- *CONSTITUCAO.md (princípios e limites estabelecidos)*
- *CRITERIOS.md e README.md do repositório fornecido*
*Quaisquer ajustes nesta lista devem ser feitos com consenso explícito do usuário, pois ela guia a fase de implementação subsequente.*
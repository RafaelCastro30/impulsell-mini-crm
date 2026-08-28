# Impulsell Mini CRM Constitution

## Core Principles

### I. Fluxo Principal Acima de Tudo
O desafio é avaliado primariamente pelo **fluxo principal funcionar em conjunto** (30% da nota): API, listagem, busca, filtros, detalhes e registro de contato. Toda decisão técnica deve priorizar entregar esse fluxo completo e compreensível antes de adicionar complexidade. Uma solução parcial bem compreendida vale mais que uma completa que não se explica.

### II. Simplicidade e YAGNI (You Aren't Gonna Need It)
**Não implemente** o que não está nos requisitos: autenticação, banco de dados, Docker, deploy, integrações externas, arquitetura sofisticada, fidelidade a layout específico, grande quantidade de bibliotecas/arquivos, funcionalidades extras antes do fluxo principal. Use o mínimo de dependências necessárias e consiga explicar cada escolha.

### III. Test-First para Comportamentos Críticos (NON-NEGOTIABLE)
Escreva **pelo menos um teste automatizado relevante** que proteja um comportamento real do fluxo principal (ex: registrar contato de lead válido, rejeitar ID inexistente, combinar busca+filtros, atualização de UI pós-contato). TDD não é obrigatório para tudo, mas o teste obrigatório deve existir, ser compreensível e validar algo que importa para o usuário final (Paula, atendente comercial).

### IV. Decisões Explícitas e Rastreáveis
Toda escolha de produto e tecnologia deve ser documentada no `ENTREGA.md`: onde implementou busca/filtros (frontend/backend/ambos) e por quê, priorizações, suposições, como validou. O avaliador vai perguntar "por que fez assim?" — a resposta deve estar no código e na entrega. Transparência no uso de IA é obrigatória.

### V. Experiência da Paula (UX Comercial)
A interface serve uma atendente comercial real. Estados obrigatórios: carregando, falha na API, nenhum resultado, atualizando lead, falha ao registrar contato. Feedback visual claro durante ações assíncronas. Traduza valores técnicos (`meta_ads` → "Meta Ads", `new` → "Novo"). Clareza, responsividade e acessibilidade básica contam 15% da nota.

## Technology Stack Constraints

- **Frontend**: React ou Next.js (App Router) com TypeScript
- **Backend**: Node.js com framework de escolha (Express, Fastify, Hono, ou Next.js API Routes)
- **Linguagem**: TypeScript (preferido) ou JavaScript
- **Estilização**: Tailwind CSS (já configurado)
- **Testes**: Jest, Vitest, ou similar — pelo menos 1 teste relevante
- **Dados**: `dados/leads.json` carregado em memória (sem banco de dados)
- **Persistência**: Em memória enquanto a API roda (requisito explícito)

## Development Workflow

1. **Spec-kit first**: Use `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` antes de codificar
2. **Implementação incremental**: Entregue fluxo principal funcional, depois refine
3. **Validação contínua**: `npm run build` e `npm run dev` a cada etapa
4. **Commits semânticos**: Histórico ajuda a entender o processo (quantidade não importa)
5. **Limite de 4h**: Pare no limite, entregue o que fez, explique priorizações

## Quality Gates

- `npm run build` passa sem erros
- `npm run lint` passa (ESLint configurado)
- Pelo menos 1 teste automatizado passando (`npm test` ou similar)
- Fluxo principal testado manualmente: listar → buscar → filtrar → ver detalhes → registrar contato → ver atualização
- `ENTREGA.md` preenchido completamente

## Governance

- Esta constituição suplanta práticas ad-hoc
- Emendas requerem: documentação da mudança, justificativa baseada nos critérios de avaliação, plano de migração se afetar código existente
- Complexidade deve ser justificada pelo peso nos critérios (30% fluxo principal, 20% fundamentos, 15% produto, 15% UX, 10% qualidade, 10% comunicação)
- Use `Lembranças.md` (Desktop) para registro contínuo de decisões e passos

**Version**: 1.0.0 | **Ratified**: 2026-08-28 | **Last Amended**: 2026-08-28